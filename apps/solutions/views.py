from django.views.generic import ListView, DetailView, TemplateView
from django.db.models import Q
from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
import json
import logging
from decimal import Decimal

# Импорты для компонентов
from apps.main.models import ContactInfo, SiteSettings
from .models import Solution, SolutionCategory, SolutionOrder, SolutionImage

# Логгер
logger = logging.getLogger(__name__)


class SolutionListView(ListView):
    model = Solution
    template_name = 'solutions/solution_list.html'
    context_object_name = 'solutions'
    paginate_by = 12

    def get_queryset(self):
        queryset = Solution.objects.filter(is_active=True).select_related('category').prefetch_related('images')

        # Фильтрация по категориям
        categories = self.request.GET.getlist('category')
        if categories:
            queryset = queryset.filter(category__category_type__in=categories)

        # Поиск
        search_query = self.request.GET.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(detailed_description__icontains=search_query)
            )

        # Фильтрация по цене
        min_price = self.request.GET.get('min_price')
        max_price = self.request.GET.get('max_price')
        if min_price:
            try:
                min_price_decimal = Decimal(min_price)
                queryset = queryset.filter(price__gte=min_price_decimal)
            except (ValueError, TypeError):
                pass
        if max_price:
            try:
                max_price_decimal = Decimal(max_price)
                queryset = queryset.filter(price__lte=max_price_decimal)
            except (ValueError, TypeError):
                pass

        # Фильтрация по срокам
        delivery_days = self.request.GET.get('delivery')
        if delivery_days:
            try:
                delivery_days_int = int(delivery_days)
                queryset = queryset.filter(delivery_days__lte=delivery_days_int)
            except (ValueError, TypeError):
                pass

        # Сортировка
        sort_by = self.request.GET.get('sort', 'popular')
        if sort_by == 'new':
            queryset = queryset.order_by('-is_new', '-created_at')
        elif sort_by == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort_by == 'name':
            queryset = queryset.order_by('name')
        else:  # popular по умолчанию
            queryset = queryset.order_by('-is_popular', '-created_at')

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Получаем все категории
        context['categories'] = SolutionCategory.objects.filter(is_active=True)

        # Разделяем на пакеты и модули для отображения
        solutions = context['solutions']
        context['packages'] = solutions.filter(category__category_type='package')
        context['modules'] = solutions.filter(category__category_type='module')

        # Выбранные категории
        context['selected_categories'] = self.request.GET.getlist('category')

        # Параметры поиска для сохранения в форме
        context['search_query'] = self.request.GET.get('q', '')
        context['min_price'] = self.request.GET.get('min_price', '')
        context['max_price'] = self.request.GET.get('max_price', '')
        context['delivery_days'] = self.request.GET.get('delivery', '')
        context['sort_by'] = self.request.GET.get('sort', 'popular')

        # SEO данные из настроек или по умолчанию
        try:
            seo_settings = SiteSettings.objects.get(key='solutions_list_seo')
            seo_data = seo_settings.get_value()
            context['page_title'] = seo_data.get('title', 'Готовые решения')
            context['meta_description'] = seo_data.get('description', 'Готовые решения и дополнительные модули для вашего бизнеса')
            context['meta_keywords'] = seo_data.get('keywords', 'готовые решения, модули, разработка сайтов, пакетные решения')
        except SiteSettings.DoesNotExist:
            context['page_title'] = 'Готовые решения'
            context['meta_description'] = 'Готовые решения и дополнительные модули для вашего бизнеса. Выберите оптимальное решение для ваших задач.'
            context['meta_keywords'] = 'готовые решения, модули, разработка сайтов, пакетные решения'

        # Для пагинации с параметрами
        context['query_params'] = self.request.GET.urlencode()
        if context['query_params']:
            context['query_params'] = '&' + context['query_params']

        return context


class SolutionDetailView(DetailView):
    model = Solution
    template_name = 'solutions/solution_detail.html'
    context_object_name = 'solution'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'

    def get_queryset(self):
        return Solution.objects.filter(is_active=True).select_related('category').prefetch_related('images')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        solution = self.object

        # Похожие решения
        context['related_solutions'] = Solution.objects.filter(
            category=solution.category,
            is_active=True
        ).exclude(id=solution.id).order_by('-is_popular', '-created_at')[:4]

        # SEO данные
        context['meta_title'] = solution.meta_title or f"{solution.name} - Готовое решение"
        context['meta_description'] = solution.meta_description or solution.description[:160]
        context['meta_keywords'] = solution.meta_keywords

        # Контактная информация для формы заказа
        try:
            context['contact_info'] = ContactInfo.objects.filter(is_active=True).first()
        except ContactInfo.DoesNotExist:
            context['contact_info'] = None

        # Настройки для компонентов
        context['component_data'] = {
            'gallery': {
                'solution_id': solution.id,
                'total_images': solution.images.count(),
                'images_per_page': 10
            },
            'pricing': {
                'base_price': float(solution.price),
                'currency': 'RUB',
                'show_calculator': True
            },
            'faq': {
                'solution_id': solution.id,
                'show_search': True
            },
            'package_comparison': {
                'packages': ['basic', 'standard', 'premium'],
                'default_tab': 'standard'
            }
        }

        # Для JavaScript конфигурации
        context['solution_config'] = {
            'id': solution.id,
            'slug': solution.slug,
            'name': solution.name,
            'price': float(solution.price),
            'delivery_days': solution.delivery_days
        }

        # Путь для формы заказа
        context['order_form_action'] = f"/solutions/order/{solution.id}/"

        return context


class SolutionCategoryView(ListView):
    model = Solution
    template_name = 'solutions/solution_list.html'
    context_object_name = 'solutions'
    paginate_by = 12

    def get_queryset(self):
        category_slug = self.kwargs['category_slug']
        self.category = get_object_or_404(SolutionCategory, slug=category_slug, is_active=True)

        queryset = Solution.objects.filter(
            category=self.category,
            is_active=True
        ).select_related('category').prefetch_related('images')

        # Применяем сортировку из GET-параметров
        sort_by = self.request.GET.get('sort', 'popular')
        if sort_by == 'new':
            queryset = queryset.order_by('-is_new', '-created_at')
        elif sort_by == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort_by == 'name':
            queryset = queryset.order_by('name')
        else:
            queryset = queryset.order_by('-is_popular', '-created_at')

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = SolutionCategory.objects.filter(is_active=True)
        context['selected_category'] = self.category

        # SEO данные
        context['page_title'] = f"{self.category.name} - Готовые решения"
        context['meta_description'] = f"{self.category.description or f'Готовые решения в категории {self.category.name}'}"

        return context


class SolutionOrderView(View):
    template_name = 'solutions/solution_order.html'

    def get(self, request, pk):
        solution = get_object_or_404(Solution, pk=pk, is_active=True)
        return render(request, self.template_name, {'solution': solution})

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, pk):
        solution = get_object_or_404(Solution, pk=pk, is_active=True)

        # Для AJAX запросов
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            try:
                data = json.loads(request.body)

                # Валидация данных
                name = data.get('name', '').strip()
                email = data.get('email', '').strip()
                phone = data.get('phone', '').strip()
                message = data.get('message', '').strip()
                package_type = data.get('package_type', solution.package_type)
                total_amount = data.get('total_amount', solution.price)

                if not name or not email:
                    return JsonResponse({
                        'success': False,
                        'error': 'Заполните обязательные поля (Имя и Email)'
                    }, status=400)

                try:
                    total_amount_decimal = Decimal(str(total_amount))
                except (ValueError, TypeError):
                    total_amount_decimal = solution.price

                # Создание заказа
                order = SolutionOrder.objects.create(
                    solution=solution,
                    customer_name=name,
                    customer_email=email,
                    customer_phone=phone,
                    customer_message=message,
                    package_type=package_type,
                    total_amount=total_amount_decimal,
                    status='pending'
                )

                logger.info(f"Order created: {order.id} for solution {solution.id}")

                return JsonResponse({
                    'success': True,
                    'order_id': order.id,
                    'order_uuid': str(order.uuid),
                    'message': 'Заказ успешно создан! Мы свяжемся с вами в ближайшее время.',
                    'redirect_url': f'/solutions/order/confirmation/{order.uuid}/'
                })

            except json.JSONDecodeError:
                return JsonResponse({
                    'success': False,
                    'error': 'Некорректный формат данных'
                }, status=400)
            except Exception as e:
                logger.error(f"Order creation error: {str(e)}")
                return JsonResponse({
                    'success': False,
                    'error': f'Ошибка при создании заказа: {str(e)}'
                }, status=500)

        # Для обычных POST запросов (fallback)
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        message = request.POST.get('message')
        package_type = request.POST.get('package_type', solution.package_type)

        if not all([name, email]):
            return JsonResponse({'error': 'Заполните обязательные поля'}, status=400)

        try:
            order = SolutionOrder.objects.create(
                solution=solution,
                customer_name=name,
                customer_email=email,
                customer_phone=phone,
                customer_message=message,
                package_type=package_type,
                total_amount=solution.price
            )
            return JsonResponse({'success': True, 'order_id': order.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


class SolutionSearchAPIView(View):
    """API для живого поиска"""

    def get(self, request):
        query = request.GET.get('q', '').strip()

        if len(query) < 2:
            return JsonResponse({'results': []})

        solutions = Solution.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(detailed_description__icontains=query),
            is_active=True
        ).select_related('category')[:10]

        results = []
        for solution in solutions:
            main_image = solution.main_image
            results.append({
                'id': solution.id,
                'name': solution.name,
                'description': solution.description[:100] + '...' if len(solution.description) > 100 else solution.description,
                'price': str(solution.price),
                'url': solution.get_absolute_url(),
                'image_url': main_image.image.url if main_image and main_image.image else '/static/images/placeholder.jpg',
                'category': solution.category.name,
                'slug': solution.slug
            })

        return JsonResponse({'results': results})


class SolutionCompareAPIView(View):
    """API для сравнения решений"""

    def get(self, request):
        solution_ids = request.GET.getlist('ids[]')

        if len(solution_ids) < 2:
            return JsonResponse({'error': 'Выберите минимум 2 решения для сравнения'}, status=400)

        solutions = Solution.objects.filter(
            id__in=solution_ids,
            is_active=True
        ).select_related('category').prefetch_related('images')

        comparison_data = []
        for solution in solutions:
            comparison_data.append({
                'id': solution.id,
                'name': solution.name,
                'description': solution.description,
                'price': str(solution.price),
                'delivery_days': solution.delivery_days,
                'category': solution.category.name,
                'features': solution.features,
                'requirements': solution.requirements,
                'is_popular': solution.is_popular,
                'is_new': solution.is_new,
                'image_url': solution.main_image.image.url if solution.main_image and solution.main_image.image else '/static/images/placeholder.jpg',
                'slug': solution.slug
            })

        return JsonResponse({'solutions': comparison_data})


@require_POST
@csrf_exempt
def add_to_cart_ajax(request):
    """AJAX обработчик для добавления в корзину"""
    try:
        data = json.loads(request.body)
        solution_id = data.get('solution_id')

        if not solution_id:
            return JsonResponse({'error': 'Не указан ID решения'}, status=400)

        # Получаем решение
        solution = get_object_or_404(Solution, id=solution_id, is_active=True)

        # Логика добавления в корзину (сессия)
        cart = request.session.get('solutions_cart', [])

        if solution_id not in cart:
            cart.append(solution_id)
            request.session['solutions_cart'] = cart
            message = 'Решение добавлено в корзину'
            added = True
        else:
            cart.remove(solution_id)
            request.session['solutions_cart'] = cart
            message = 'Решение удалено из корзины'
            added = False

        return JsonResponse({
            'success': True,
            'message': message,
            'added': added,
            'cart_count': len(cart),
            'solution': {
                'id': solution.id,
                'name': solution.name,
                'price': str(solution.price),
                'image_url': solution.main_image.image.url if solution.main_image and solution.main_image.image else '/static/images/placeholder.jpg'
            }
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Некорректный JSON'}, status=400)
    except Exception as e:
        logger.error(f"Add to cart error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)


# Новые API для компонентов

class SolutionImagesAPIView(View):
    """API для получения изображений решения с пагинацией"""

    def get(self, request, solution_id):
        try:
            solution = get_object_or_404(Solution, id=solution_id, is_active=True)
            images = solution.images.filter(is_active=True).order_by('order')

            # Пагинация
            page = request.GET.get('page', 1)
            per_page = int(request.GET.get('per_page', 10))

            paginator = Paginator(images, per_page)

            try:
                page_obj = paginator.page(page)
            except PageNotAnInteger:
                page_obj = paginator.page(1)
            except EmptyPage:
                page_obj = paginator.page(paginator.num_pages)

            # Формируем данные для ответа
            images_data = []
            for image in page_obj:
                image_data = {
                    'id': image.id,
                    'alt': image.alt_text or f"Изображение {solution.name}",
                    'is_main': image.is_main,
                    'order': image.order
                }

                # Добавляем URL изображения
                if image.image:
                    image_data['url'] = image.image.url
                    # Для миниатюр используем thumbnail если есть, иначе оригинал
                    if hasattr(image, 'thumbnail') and image.thumbnail:
                        image_data['thumbnail_url'] = image.thumbnail.url
                    else:
                        image_data['thumbnail_url'] = image.image.url

                images_data.append(image_data)

            return JsonResponse({
                'success': True,
                'images': images_data,
                'pagination': {
                    'page': page_obj.number,
                    'total_pages': paginator.num_pages,
                    'total_items': paginator.count,
                    'has_next': page_obj.has_next(),
                    'has_previous': page_obj.has_previous(),
                    'per_page': per_page
                },
                'solution': {
                    'id': solution.id,
                    'name': solution.name,
                    'total_images': solution.images.count()
                }
            })

        except Solution.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Решение не найдено'
            }, status=404)
        except Exception as e:
            logger.error(f"Solution images API error: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Ошибка при загрузке изображений'
            }, status=500)


class SolutionFAQAPIView(View):
    """API для получения FAQ решения"""

    def get(self, request, solution_id):
        try:
            solution = get_object_or_404(Solution, id=solution_id, is_active=True)

            # Получаем FAQ (в реальном проекте нужно добавить модель SolutionFAQ)
            # Временные данные для примера
            faq_items = [
                {
                    'id': 1,
                    'question': 'Сколько времени занимает реализация?',
                    'answer': f'В среднем реализация занимает {solution.delivery_days} дней в зависимости от сложности проекта.',
                    'order': 1
                },
                {
                    'id': 2,
                    'question': 'Можно ли вносить изменения в готовое решение?',
                    'answer': 'Да, все наши решения можно кастомизировать под ваши потребности.',
                    'order': 2
                },
                {
                    'id': 3,
                    'question': 'Предоставляется ли техподдержка?',
                    'answer': 'Да, мы предоставляем техническую поддержку в течение 1 месяца после запуска.',
                    'order': 3
                }
            ]

            return JsonResponse({
                'success': True,
                'faq_items': faq_items,
                'solution': {
                    'id': solution.id,
                    'name': solution.name
                }
            })

        except Solution.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Решение не найдено'
            }, status=404)


class PackageComparisonAPIView(View):
    """API для получения данных сравнения пакетов"""

    def get(self, request):
        packages = [
            {
                'id': 'basic',
                'name': 'Базовый',
                'price': 15000,
                'features': [
                    'Адаптивный дизайн',
                    'До 5 страниц',
                    'Базовая SEO оптимизация',
                    'Контактная форма',
                    'Техническая поддержка 1 месяц'
                ],
                'color': '#4a90e2',
                'description': 'Идеально для стартапов и небольших проектов',
                'recommended': False
            },
            {
                'id': 'standard',
                'name': 'Стандартный',
                'price': 35000,
                'features': [
                    'Всё из Базового',
                    'Индивидуальный дизайн',
                    'До 10 страниц',
                    'Расширенная SEO оптимизация',
                    'Админ-панель',
                    'Интеграция с соц. сетями',
                    'Техническая поддержка 3 месяца'
                ],
                'color': '#8a2be2',
                'description': 'Для растущего бизнеса с расширенными требованиями',
                'recommended': True
            },
            {
                'id': 'premium',
                'name': 'Премиум',
                'price': 75000,
                'features': [
                    'Всё из Стандартного',
                    'Уникальный дизайн',
                    'Неограниченное количество страниц',
                    'Полная SEO оптимизация',
                    'Интеграция с платежными системами',
                    'Личный кабинет пользователя',
                    'Мобильное приложение (опционально)',
                    'Техническая поддержка 6 месяцев'
                ],
                'color': '#ff6b9d',
                'description': 'Комплексное решение для крупных проектов',
                'recommended': False
            }
        ]

        return JsonResponse({
            'success': True,
            'packages': packages,
            'currency': 'RUB'
        })


class SolutionCategoriesAPIView(View):
    """API для получения категорий решений"""

    def get(self, request):
        categories = SolutionCategory.objects.filter(is_active=True).order_by('order', 'name')

        categories_data = []
        for category in categories:
            categories_data.append({
                'id': category.id,
                'name': category.name,
                'slug': category.slug,
                'type': category.category_type,
                'type_display': category.get_category_type_display(),
                'description': category.description,
                'solution_count': category.solutions.filter(is_active=True).count()
            })

        return JsonResponse({
            'success': True,
            'categories': categories_data
        })


def get_cart_count(request):
    """Получить количество товаров в корзине"""
    cart = request.session.get('solutions_cart', [])
    return JsonResponse({'count': len(cart)})


# Дополнительные утилиты
def solution_order_confirmation(request, uuid):
    """Страница подтверждения заказа"""
    try:
        order = SolutionOrder.objects.get(uuid=uuid)
        return render(request, 'solutions/order_confirmation.html', {
            'order': order,
            'page_title': 'Подтверждение заказа'
        })
    except SolutionOrder.DoesNotExist:
        return render(request, 'solutions/order_error.html', {
            'error': 'Заказ не найден',
            'page_title': 'Ошибка заказа'
        }, status=404)


def solution_order_list(request):
    """Список заказов пользователя"""
    if request.user.is_authenticated:
        orders = SolutionOrder.objects.filter(customer_email=request.user.email).order_by('-created_at')
    else:
        orders = []

    return render(request, 'solutions/order_list.html', {
        'orders': orders,
        'page_title': 'Мои заказы'
    })