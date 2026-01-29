# apps/main/views.py
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
import json
import re

from .models import (
    AboutContent, PortfolioItem, Solution, ContactInfo,
    EducationItem, WorkPhilosophySlot, TechnologyTool, ContactMessage,
    SiteSettings
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


class SitemapView(TemplateView):
    template_name = 'main/sitemap.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        projects = PortfolioItem.objects.filter(is_active=True)
        solutions = Solution.objects.filter(is_active=True)
        about_pages = AboutContent.objects.filter(is_active=True)

        context.update({
            'projects': projects,
            'solutions': solutions,
            'about_pages': about_pages,
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


# Обработчики ошибок
def handler404(request, exception):
    context = {
        'error_code': 404,
        'error_message': 'Страница не найдена',
        'error_details': 'Запрашиваемая страница не существует или была перемещена.',
    }
    return render(request, 'main/404.html', context, status=404)


def handler500(request):
    context = {
        'error_code': 500,
        'error_message': 'Внутренняя ошибка сервера',
        'error_details': 'Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.',
    }
    return render(request, 'main/500.html', context, status=500)


def handler403(request, exception):
    context = {
        'error_code': 403,
        'error_message': 'Доступ запрещен',
        'error_details': 'У вас нет прав для доступа к этой странице.',
    }
    return render(request, 'main/403.html', context, status=403)


def handler400(request, exception):
    context = {
        'error_code': 400,
        'error_message': 'Некорректный запрос',
        'error_details': 'Ваш запрос содержит ошибку или некорректные данные.',
    }
    return render(request, 'main/400.html', context, status=400)
