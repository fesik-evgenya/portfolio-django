from django.shortcuts import render, get_object_or_404
from django.views.generic import TemplateView
from django.db.models import Prefetch, Q
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from django.contrib.sitemaps import Sitemap
from django.urls import reverse
import json
import re

from .models import (
    AboutContent, PortfolioItem, Solution, ContactInfo,
    EducationItem, WorkPhilosophySlot, TechnologyTool, ContactMessage,
    SiteSettings, PortfolioCategory, SolutionCategory, AboutMeta,
    PortfolioImage, SolutionImage, SolutionOrder, SolutionFAQ,
    AdminUser
)


class HomeView(TemplateView):
    template_name = 'main/index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Получаем активные проекты для демонстрации на главной
        featured_projects = PortfolioItem.objects.filter(
            is_active=True,
            is_featured=True
        ).prefetch_related('images').order_by('order')[:3]

        # Получаем популярные решения
        popular_solutions = Solution.objects.filter(
            is_active=True,
            is_popular=True
        ).prefetch_related('images').order_by('order')[:3]

        # Получаем контент "О нас" для секций
        about_sections = AboutContent.objects.filter(is_active=True).order_by('order')

        # Получаем настройки сайта
        hero_settings = SiteSettings.objects.filter(
            key__in=['hero_title', 'hero_text', 'hero_cta']
        )
        hero_data = {}
        for setting in hero_settings:
            hero_data[setting.key] = setting.get_value()

        context.update({
            'featured_projects': featured_projects,
            'popular_solutions': popular_solutions,
            'about_sections': about_sections,
            'hero_title': hero_data.get('hero_title', 'Ваш готовый сайт за 2 недели!'),
            'hero_text': hero_data.get('hero_text', 'Создаю современные сайты и MVP для бизнеса — быстро, качественно, с фиксированной стоимостью'),
            'hero_cta': hero_data.get('hero_cta', 'Обсудить проект'),
        })

        return context


class AboutView(TemplateView):
    template_name = 'main/about.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Получаем активные секции с префетчами для оптимизации
        biography = AboutContent.objects.filter(
            section='biography',
            is_active=True
        ).prefetch_related(
            Prefetch(
                'education_items',
                queryset=EducationItem.objects.filter(is_active=True).order_by('order')
            )
        ).first()

        philosophy = AboutContent.objects.filter(
            section='philosophy',
            is_active=True
        ).prefetch_related(
            Prefetch(
                'philosophy_slots',
                queryset=WorkPhilosophySlot.objects.filter(is_active=True).order_by('slot_number')
            )
        ).first()

        technologies = AboutContent.objects.filter(
            section='technologies',
            is_active=True
        ).first()

        # Получаем инструменты для технологий
        tools_list = None
        if technologies:
            tools_list = TechnologyTool.objects.filter(
                about_content=technologies,
                is_active=True
            ).order_by('order')

        # Резервные данные для SEO
        meta_data = {
            'title': 'О моем пути в разработке | Евгения Фесик',
            'description': 'Full-stack разработчик из Санкт-Петербурга. Специализируюсь на создании современных веб-решений для бизнеса с использованием Python и JavaScript.',
            'keywords': 'full-stack разработчик, Python разработчик, веб-разработка Санкт-Петербург, создание сайтов под ключ'
        }

        # Если есть мета-данные в базе, используем их
        if biography and biography.meta.exists():
            meta = biography.meta.first()
            if meta.meta_title:
                meta_data['title'] = meta.meta_title
            if meta.meta_description:
                meta_data['description'] = meta.meta_description
            if meta.meta_keywords:
                meta_data['keywords'] = meta.meta_keywords

        context.update({
            'biography': biography,
            'philosophy': philosophy,
            'technologies': technologies,
            'tools_list': tools_list,
            'meta_title': meta_data['title'],
            'meta_description': meta_data['description'],
            'meta_keywords': meta_data['keywords'],
        })

        return context


class ContactsView(TemplateView):
    template_name = 'main/contacts.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        contact_info = ContactInfo.objects.filter(is_active=True).first()

        # Получаем типы проектов из настроек
        project_types_setting = SiteSettings.objects.filter(key='project_types').first()
        if project_types_setting:
            project_types = project_types_setting.get_value()
        else:
            project_types = [
                {'value': 'startup-launch', 'label': 'Стартап-Лаунч'},
                {'value': 'profi-portfolio', 'label': 'Профи-Портфолио'},
                {'value': 'mini-store', 'label': 'Магазин-Мини'},
                {'value': 'clinic-salon', 'label': 'Клиника / Салон'},
                {'value': 'coffee_shop-cafe', 'label': 'Кофейня / Кафе'},
                {'value': 'agency-atelier', 'label': 'Агентство / Студия'},
                {'value': 'other', 'label': 'другое'}
            ]

        context.update({
            'contact_info': contact_info,
            'project_types': project_types,
        })
        return context


class PrivacyView(TemplateView):
    template_name = 'main/privacy.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Получаем текст политики из настроек
        privacy_text = SiteSettings.objects.filter(key='privacy_policy').first()
        context['privacy_text'] = privacy_text.get_value() if privacy_text else ''
        return context


class TermsView(TemplateView):
    template_name = 'main/terms.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Получаем текст условий из настроек
        terms_text = SiteSettings.objects.filter(key='terms_of_service').first()
        context['terms_text'] = terms_text.get_value() if terms_text else ''
        return context


class SitemapHtmlView(TemplateView):
    template_name = 'main/sitemap.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Получаем активные категории портфолио
        portfolio_categories = PortfolioCategory.objects.filter(
            is_active=True
        ).prefetch_related(
            Prefetch(
                'portfolio_items',
                queryset=PortfolioItem.objects.filter(is_active=True)
            )
        ).order_by('order')[:5]

        # Получаем активные проекты портфолио
        portfolio_items = PortfolioItem.objects.filter(
            is_active=True
        ).order_by('order')[:10]

        # Получаем активные категории решений
        solution_categories = SolutionCategory.objects.filter(
            is_active=True
        ).prefetch_related(
            Prefetch(
                'solutions',
                queryset=Solution.objects.filter(is_active=True)
            )
        ).order_by('order')[:5]

        # Получаем активные решения
        solutions = Solution.objects.filter(
            is_active=True
        ).order_by('order')[:10]

        context.update({
            'portfolio_categories': portfolio_categories,
            'portfolio_items': portfolio_items,
            'solution_categories': solution_categories,
            'solutions': solutions,
        })
        return context


class MaintenanceView(TemplateView):
    template_name = 'main/maintenance.html'

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)

        # Получаем сообщение о техобслуживании
        maintenance_msg = SiteSettings.objects.filter(key='maintenance_message').first()
        context['message'] = maintenance_msg.get_value() if maintenance_msg else 'Сайт временно на техническом обслуживании.'

        return self.render_to_response(context, status=503)


# API эндпоинты
@require_POST
@csrf_exempt
def contact_submit(request):
    """
    Обработчик формы обратной связи
    Возвращает JSON для AJAX запросов
    """
    try:
        # Получаем данные из запроса
        name = request.POST.get('name', '').strip()
        contact = request.POST.get('contact', '').strip()
        project_type = request.POST.get('project_type', '').strip()

        # Валидация
        if not name or not contact or not project_type:
            return JsonResponse({
                'success': False,
                'message': 'Все поля обязательны для заполнения'
            }, status=400)

        if len(name) > 100:
            return JsonResponse({
                'success': False,
                'message': 'Имя слишком длинное (максимум 100 символов)'
            }, status=400)

        # Валидация контакта (email или Telegram)
        email = None
        phone = None
        contact_type = 'other'

        # Проверяем, является ли контакт email
        try:
            validate_email(contact)
            email = contact
            contact_type = 'email'
        except ValidationError:
            # Проверяем, является ли контакт Telegram username
            telegram_pattern = r'^@?[a-zA-Z0-9_]{5,32}$'
            if re.match(telegram_pattern, contact.lstrip('@')):
                contact_type = 'telegram'
                phone = contact if contact.startswith('@') else f'@{contact}'
            else:
                # Предполагаем, что это телефон
                phone_pattern = r'^[\d\s\-\+\(\)]{10,20}$'
                if re.match(phone_pattern, contact):
                    contact_type = 'phone'
                    phone = contact
                else:
                    return JsonResponse({
                        'success': False,
                        'message': 'Пожалуйста, введите корректный email или Telegram (@username)'
                    }, status=400)

        # Создаем запись в базе данных
        message = ContactMessage.objects.create(
            name=name,
            email=email or '',  # Django требует email, даже если пустой
            phone=phone or '',
            subject=f'Запрос по проекту: {project_type}',
            message=f'Тип проекта: {project_type}\nКонтакт: {contact}',
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        # Здесь можно добавить отправку уведомлений:
        # 1. Отправка email администратору
        # 2. Отправка в Telegram бот
        # 3. Уведомление в админ-панель

        return JsonResponse({
            'success': True,
            'message': 'Ваш запрос успешно отправлен. Я свяжусь с вами в ближайшее время.',
            'message_id': message.id
        })

    except Exception as e:
        # Логируем ошибку
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f'Ошибка при отправке формы: {str(e)}', exc_info=True)

        return JsonResponse({
            'success': False,
            'message': 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.'
        }, status=500)


@require_GET
def get_contact_info(request):
    """
    API для получения контактной информации
    Может использоваться для динамического обновления на фронтенде
    """
    contact_info = ContactInfo.objects.filter(is_active=True).first()

    if not contact_info:
        return JsonResponse({
            'success': False,
            'message': 'Контактная информация не найдена'
        }, status=404)

    data = {
        'success': True,
        'data': {
            'email': contact_info.email,
            'phone': contact_info.phone,
            'address': contact_info.address,
            'telegram': contact_info.telegram,
            'github': contact_info.github,
            'linkedin': contact_info.linkedin,
        }
    }

    return JsonResponse(data)


@require_POST
@csrf_exempt
def subscribe_newsletter(request):
    """
    Обработчик подписки на рассылку
    """
    try:
        email = request.POST.get('email', '').strip()

        if not email:
            return JsonResponse({
                'success': False,
                'message': 'Введите email адрес'
            }, status=400)

        # Валидация email
        try:
            validate_email(email)
        except ValidationError:
            return JsonResponse({
                'success': False,
                'message': 'Введите корректный email адрес'
            }, status=400)

        # Здесь можно добавить логику подписки:
        # 1. Сохранение в базу данных
        # 2. Отправка подтверждения
        # 3. Интеграция с сервисом рассылок

        return JsonResponse({
            'success': True,
            'message': 'Вы успешно подписались на рассылку'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': 'Произошла ошибка при подписке'
        }, status=500)


# Статические страницы
class PortfolioListView(TemplateView):
    template_name = 'main/portfolio/list.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Получаем категории с активными проектами
        categories = PortfolioCategory.objects.filter(
            is_active=True
        ).prefetch_related(
            Prefetch(
                'portfolio_items',
                queryset=PortfolioItem.objects.filter(is_active=True)
            )
        ).order_by('order')

        # Получаем все активные проекты для фильтрации
        all_projects = PortfolioItem.objects.filter(is_active=True)

        context.update({
            'categories': categories,
            'all_projects': all_projects,
        })
        return context


class PortfolioDetailView(TemplateView):
    template_name = 'main/portfolio/detail.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        slug = kwargs.get('slug')

        project = get_object_or_404(
            PortfolioItem.objects.prefetch_related('images', 'category'),
            slug=slug,
            is_active=True
        )

        # Получаем похожие проекты
        similar_projects = PortfolioItem.objects.filter(
            Q(category=project.category) | Q(package=project.package),
            is_active=True
        ).exclude(id=project.id).order_by('?')[:3]

        context.update({
            'project': project,
            'similar_projects': similar_projects,
        })
        return context


class SolutionsListView(TemplateView):
    template_name = 'main/solutions/list.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Получаем категории с активными решениями
        categories = SolutionCategory.objects.filter(
            is_active=True
        ).prefetch_related(
            Prefetch(
                'solutions',
                queryset=Solution.objects.filter(is_active=True)
            )
        ).order_by('order')

        # Получаем популярные решения
        popular_solutions = Solution.objects.filter(
            is_active=True,
            is_popular=True
        ).order_by('order')[:6]

        # Получаем новые решения
        new_solutions = Solution.objects.filter(
            is_active=True,
            is_new=True
        ).order_by('-created_at')[:6]

        context.update({
            'categories': categories,
            'popular_solutions': popular_solutions,
            'new_solutions': new_solutions,
        })
        return context


class SolutionDetailView(TemplateView):
    template_name = 'main/solutions/detail.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        slug = kwargs.get('slug')

        solution = get_object_or_404(
            Solution.objects.prefetch_related(
                'images',
                'faq_items',
                'category'
            ),
            slug=slug,
            is_active=True
        )

        # Получаем похожие решения
        similar_solutions = Solution.objects.filter(
            Q(category=solution.category) | Q(package_type=solution.package_type),
            is_active=True
        ).exclude(id=solution.id).order_by('?')[:3]

        context.update({
            'solution': solution,
            'similar_solutions': similar_solutions,
        })
        return context


# Обработчики ошибок
def handler404(request, exception=None):
    """Обработка 404 ошибки"""
    return render(request, 'main/404.html', status=404)


def handler500(request):
    """Обработка 500 ошибки"""
    return render(request, 'main/500.html', status=500)


def handler403(request, exception=None):
    """Обработка 403 ошибки"""
    return render(request, 'main/403.html', status=403)


def handler400(request, exception):
    """Обработка 400 ошибки"""
    context = {
        'error_code': 400,
        'error_message': 'Некорректный запрос',
        'error_details': 'Ваш запрос содержит ошибку или некорректные данные.',
    }
    return render(request, 'main/400.html', context, status=400)


# Sitemap XML классы
class StaticViewSitemap(Sitemap):
    priority = 1.0
    changefreq = 'weekly'

    def items(self):
        return [
            'main:index',
            'main:about',
            'main:contact',
            'main:privacy',
            'main:terms',
            'main:sitemap_html',
        ]

    def location(self, item):
        return reverse(item)


class PortfolioCategorySitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.8

    def items(self):
        return PortfolioCategory.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.created_at

    def location(self, obj):
        return reverse('main:portfolio_list')  # Измените на конкретный URL если нужно


class PortfolioItemSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.9

    def items(self):
        return PortfolioItem.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return reverse('main:portfolio_detail', args=[obj.slug])


class SolutionCategorySitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.8

    def items(self):
        return SolutionCategory.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.created_at

    def location(self, obj):
        return reverse('main:solutions_list')  # Измените на конкретный URL если нужно


class SolutionSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.9

    def items(self):
        return Solution.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return reverse('main:solution_detail', args=[obj.slug])


class AboutContentSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.7

    def items(self):
        return AboutContent.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return reverse('main:about') + f'#{obj.section}'


class ContactInfoSitemap(Sitemap):
    changefreq = 'yearly'
    priority = 0.5

    def items(self):
        return ContactInfo.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return reverse('main:contact')


# Общий sitemap для использования в urls.py
sitemaps = {
    'static': StaticViewSitemap,
    'about': AboutContentSitemap,
    'portfolio_categories': PortfolioCategorySitemap,
    'portfolio_items': PortfolioItemSitemap,
    'solution_categories': SolutionCategorySitemap,
    'solutions': SolutionSitemap,
    'contact': ContactInfoSitemap,
}