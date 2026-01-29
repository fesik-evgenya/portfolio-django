from django.apps import AppConfig


class MainConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.main'
    verbose_name = 'Основное приложение'

    def ready(self):
        """Выполняется при запуске приложения"""
        # Импортируем сигналы (если они будут)
        try:
            import apps.main.signals
        except ImportError:
            pass