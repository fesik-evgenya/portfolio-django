from django.urls import path
from . import views

app_name = 'portfolio'

urlpatterns = [
    # Основной список проектов
    path('', views.portfolio_list, name='list'),

    # Детальная страница проекта
    path('project/<slug:slug>/', views.portfolio_detail, name='detail'),

    # AJAX endpoints
    path('ajax/project/<int:project_id>/', views.ajax_project_detail, name='ajax_project_detail'),
    path('ajax/categories/', views.portfolio_categories_json, name='categories_json'),
    path('ajax/stats/', views.portfolio_stats, name='stats'),
]