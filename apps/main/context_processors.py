from django.conf import settings
from .models import SiteSettings, ContactInfo


def site_settings(request):
    """Добавляет настройки сайта в контекст всех шаблонов"""
    # Получаем активные настройки
    settings_dict = {}
    for setting in SiteSettings.objects.filter(is_active=True):
        settings_dict[setting.key] = setting.get_value()

    # Получаем контактную информацию
    contact_info = ContactInfo.objects.filter(is_active=True).first()

    return {
        'SITE_NAME': settings_dict.get('site_name', settings.SITE_NAME),
        'SITE_DESCRIPTION': settings_dict.get('site_description', settings.SITE_DESCRIPTION),
        'SITE_URL': settings_dict.get('site_url', settings.SITE_URL),
        'CONTACT_PHONE': contact_info.phone if contact_info else settings.MAIN_APP_CONFIG.get('CONTACT_PHONE', ''),
        'CONTACT_EMAIL': contact_info.email if contact_info else settings.MAIN_APP_CONFIG.get('CONTACT_EMAIL', ''),
        'CONTACT_CITY': contact_info.address.split(',')[0] if contact_info and contact_info.address else settings.MAIN_APP_CONFIG.get('CONTACT_CITY', ''),
        'DEBUG': settings.DEBUG,
    }