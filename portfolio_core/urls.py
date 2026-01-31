from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import handler404, handler500, handler403
from apps.main.views import handler404, handler500, handler403

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.main.urls', namespace='main')),
    path('portfolio/', include('apps.portfolio.urls', namespace='portfolio')),
    path('solutions/', include('solutions.urls', namespace='solutions')),
    path('custom-admin/', include('apps.custom_admin.urls')),
    path('api/', include('apps.api.urls')),
]

# Для режима отладки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Подключение debug_toolbar
    import debug_toolbar
    urlpatterns = [
                      path('__debug__/', include(debug_toolbar.urls)),
                  ] + urlpatterns

# Настройка обработчиков ошибок
handler404 = 'apps.main.views.handler404'
handler500 = 'apps.main.views.handler500'
handler403 = 'apps.main.views.handler403'
handler400 = 'apps.main.views.handler400'