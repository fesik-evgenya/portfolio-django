from django.urls import path
from . import views

app_name = 'solutions'

urlpatterns = [
    # Основные страницы
    path('', views.SolutionListView.as_view(), name='solution_list'),
    path('<slug:slug>/', views.SolutionDetailView.as_view(), name='solution_detail'),
    path('category/<slug:category_slug>/', views.SolutionCategoryView.as_view(), name='solution_category'),

    # Заказы
    path('order/<int:pk>/', views.SolutionOrderView.as_view(), name='solution_order'),
    path('order/confirmation/<uuid:uuid>/', views.solution_order_confirmation, name='order_confirmation'),
    path('orders/my/', views.solution_order_list, name='order_list'),

    # API endpoints для компонентов
    path('api/search/', views.SolutionSearchAPIView.as_view(), name='solution_search_api'),
    path('api/compare/', views.SolutionCompareAPIView.as_view(), name='solution_compare_api'),
    path('api/images/<int:solution_id>/', views.SolutionImagesAPIView.as_view(), name='solution_images_api'),
    path('api/faq/<int:solution_id>/', views.SolutionFAQAPIView.as_view(), name='solution_faq_api'),
    path('api/packages/comparison/', views.PackageComparisonAPIView.as_view(), name='package_comparison_api'),
    path('api/categories/', views.SolutionCategoriesAPIView.as_view(), name='categories_api'),

    # Корзина
    path('ajax/add-to-cart/', views.add_to_cart_ajax, name='add_to_cart_ajax'),
    path('ajax/cart-count/', views.get_cart_count, name='cart_count'),
]