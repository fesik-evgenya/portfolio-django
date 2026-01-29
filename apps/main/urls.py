from django.urls import path
from .views import (
    HomeView, AboutView, ContactsView,
    PrivacyView, TermsView, SitemapView,
    MaintenanceView
)

app_name = 'main'

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('about/', AboutView.as_view(), name='about'),
    path('contacts/', ContactsView.as_view(), name='contacts'),
    path('privacy/', PrivacyView.as_view(), name='privacy'),
    path('terms/', TermsView.as_view(), name='terms'),
    path('sitemap/', SitemapView.as_view(), name='sitemap'),
    path('maintenance/', MaintenanceView.as_view(), name='maintenance'),
]