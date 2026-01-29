from django import template
from django.conf import settings

register = template.Library()

@register.simple_tag
def hero_title():
    """Возвращает заголовок для hero-секции"""
    return getattr(settings, 'MAIN_APP_CONFIG', {}).get('HERO_TITLE', 'Ваш готовый сайт за 2 недели!')

@register.simple_tag
def hero_text():
    """Возвращает текст для hero-секции"""
    return getattr(settings, 'MAIN_APP_CONFIG', {}).get('HERO_TEXT', 'Создаю современные сайты и MVP для бизнеса')

@register.filter
def add_class(field, css_class):
    """Добавляет CSS класс к полю формы"""
    return field.as_widget(attrs={"class": css_class})

@register.simple_tag
def active_page(request, url_name):
    """Возвращает 'active', если текущая страница соответствует url_name"""
    if request.resolver_match and request.resolver_match.url_name == url_name:
        return 'active'
    return ''