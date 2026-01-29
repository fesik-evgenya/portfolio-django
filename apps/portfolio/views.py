from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.urls import reverse
from django.db.models import Q

# Правильные импорты с учетом структуры проекта
try:
    # Если приложения зарегистрированы как apps.main
    from apps.main.models import PortfolioItem, PortfolioCategory, PortfolioImage
except ImportError:
    try:
        # Альтернативный путь
        from main.models import PortfolioItem, PortfolioCategory, PortfolioImage
    except ImportError:
        # Если модели в корневом каталоге приложений
        from ..main.models import PortfolioItem, PortfolioCategory, PortfolioImage


def portfolio_list(request):
    """
    Представление для отображения списка проектов портфолио
    с поддержкой фильтрации, сортировки и пагинации
    """
    # Получаем параметры фильтрации из GET-запроса
    category_slug = request.GET.get('category')
    package_filter = request.GET.get('package')
    sort_by = request.GET.get('sort', '-created_at')

    # Базовый запрос с фильтрацией активных записей
    queryset = PortfolioItem.objects.filter(is_active=True).select_related('category')

    # Применяем фильтры
    if category_slug and category_slug != 'all':
        queryset = queryset.filter(category__slug=category_slug)

    if package_filter and package_filter != 'all':
        queryset = queryset.filter(package=package_filter)

    # Применяем сортировку
    valid_sort_fields = ['created_at', '-created_at', 'title', '-title', '-is_featured']
    if sort_by in valid_sort_fields:
        queryset = queryset.order_by(sort_by)
    else:
        queryset = queryset.order_by('-created_at')

    # Пагинация - 9 проектов на страницу
    paginator = Paginator(queryset, 9)
    page_number = request.GET.get('page', 1)

    try:
        page_obj = paginator.page(page_number)
    except:
        page_obj = paginator.page(1)

    # Получаем все активные категории для фильтров
    categories = PortfolioCategory.objects.filter(is_active=True).order_by('order')

    # Подсчитываем количество проектов по категориям
    category_counts = {}
    for category in categories:
        category_counts[category.slug] = PortfolioItem.objects.filter(
            category=category, is_active=True
        ).count()

    # Проверяем AJAX запрос для бесконечной прокрутки
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        context = {
            'page_obj': page_obj,
            'portfolio_items': page_obj.object_list,
        }
        return render(request, 'portfolio/components/project_cards_ajax.html', context)

    # Основной контекст для полного рендеринга страницы
    context = {
        'page_obj': page_obj,
        'categories': categories,
        'category_counts': category_counts,
        'current_category': category_slug,
        'current_package': package_filter,
        'current_sort': sort_by,
        'total_projects': paginator.count,
    }

    return render(request, 'portfolio/portfolio_list.html', context)


def portfolio_detail(request, slug):
    """
    Представление для отображения детальной страницы проекта
    с оптимизацией запросов через prefetch_related
    """
    portfolio_item = get_object_or_404(
        PortfolioItem.objects.select_related('category')
        .prefetch_related('images'),
        slug=slug,
        is_active=True
    )

    # Получаем связанные проекты из той же категории
    related_projects = PortfolioItem.objects.filter(
        category=portfolio_item.category,
        is_active=True
    ).exclude(id=portfolio_item.id).order_by('-created_at')[:4]

    context = {
        'portfolio_item': portfolio_item,
        'related_projects': related_projects,
    }

    return render(request, 'portfolio/portfolio_detail.html', context)


def ajax_project_detail(request, project_id):
    """
    AJAX endpoint для быстрого просмотра проекта в модальном окне
    """
    try:
        project = PortfolioItem.objects.select_related('category').get(
            id=project_id,
            is_active=True
        )

        # Получаем изображения проекта
        images = project.images.filter(is_active=True).order_by('order')

        # Формируем URL для детальной страницы с помощью reverse
        detail_url = reverse('portfolio:detail', kwargs={'slug': project.slug})

        # Формируем данные для JSON ответа
        data = {
            'id': project.id,
            'title': project.title,
            'slug': project.slug,
            'category': project.category.name,
            'category_slug': project.category.slug,
            'package': project.package,
            'package_display': project.get_package_display(),
            'duration': project.duration,
            'geo': project.geo,
            'client': project.client,
            'testimonial': project.testimonial,
            'description': project.description,
            'features': project.features,
            'technologies': project.technologies,
            'live_url': project.live_url,
            'github_url': project.github_url,
            'detail_url': detail_url,  # Используем reverse вместо get_absolute_url
            'is_featured': project.is_featured,
            'created_at': project.created_at.strftime('%d.%m.%Y'),
            'images': [],
            'client_logo': project.client_logo.url if project.client_logo else None,
        }

        # Добавляем изображения
        for image in images:
            if image.image:
                data['images'].append({
                    'url': image.image.url,
                    'alt': image.alt_text or project.title,
                    'is_main': image.is_main,
                    'order': image.order,
                })

        return JsonResponse({
            'success': True,
            'data': data
        })

    except PortfolioItem.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Проект не найден'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


def portfolio_categories_json(request):
    """
    API endpoint для получения категорий в формате JSON
    """
    categories = PortfolioCategory.objects.filter(is_active=True).order_by('order')

    categories_data = []
    for category in categories:
        categories_data.append({
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'description': category.description,
            'count': PortfolioItem.objects.filter(
                category=category, is_active=True
            ).count()
        })

    return JsonResponse({
        'success': True,
        'categories': categories_data
    })


def portfolio_stats(request):
    """
    Статистика портфолио для отображения в фильтрах
    """
    total_projects = PortfolioItem.objects.filter(is_active=True).count()

    # Подсчет по категориям
    categories = PortfolioCategory.objects.filter(is_active=True)
    category_stats = {}

    for category in categories:
        category_stats[category.slug] = {
            'name': category.name,
            'count': PortfolioItem.objects.filter(
                category=category, is_active=True
            ).count()
        }

    # Подсчет по пакетам
    package_stats = {}
    for package_code, package_name in PortfolioItem.PACKAGE_CHOICES:
        package_stats[package_code] = {
            'name': package_name,
            'count': PortfolioItem.objects.filter(
                package=package_code, is_active=True
            ).count()
        }

    return JsonResponse({
        'total_projects': total_projects,
        'category_stats': category_stats,
        'package_stats': package_stats
    })