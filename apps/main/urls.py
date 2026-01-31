from django.urls import path
from django.contrib.sitemaps.views import sitemap
from . import views
from .sitemaps import sitemaps  # Импортируем sitemaps из файла sitemaps.py

app_name = 'main'

urlpatterns = [
    # Основные страницы
    path('', views.HomeView.as_view(), name='index'),
    path('about/', views.AboutView.as_view(), name='about'),
    path('contacts/', views.ContactsView.as_view(), name='contact'),

    # Юридические страницы
    path('privacy/', views.PrivacyView.as_view(), name='privacy'),
    path('terms/', views.TermsView.as_view(), name='terms'),

    # Портфолио
    path('portfolio/', views.PortfolioListView.as_view(), name='portfolio_list'),
    path('portfolio/<slug:slug>/', views.PortfolioDetailView.as_view(), name='portfolio_detail'),

    # Готовые решения
    path('solutions/', views.SolutionsListView.as_view(), name='solutions_list'),
    path('solutions/<slug:slug>/', views.SolutionDetailView.as_view(), name='solution_detail'),

    # Карта сайта
    path('sitemap/', views.SitemapHtmlView.as_view(), name='sitemap_html'),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap_xml'),

    # Техническое обслуживание
    path('maintenance/', views.MaintenanceView.as_view(), name='maintenance'),

    # API endpoints
    path('api/contact/submit/', views.contact_submit, name='contact_submit'),
    path('api/contact/info/', views.get_contact_info, name='get_contact_info'),
    path('api/newsletter/subscribe/', views.subscribe_newsletter, name='subscribe_newsletter'),
]