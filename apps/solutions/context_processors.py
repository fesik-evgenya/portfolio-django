def cart_context(request):
    """Добавляет данные корзины в контекст всех шаблонов"""
    cart_items = request.session.get('solutions_cart', [])

    # Можно загружать объекты решений для отображения
    from .models import Solution

    solutions_in_cart = []
    if cart_items:
        solutions_in_cart = Solution.objects.filter(
            id__in=cart_items,
            is_active=True
        ).select_related('category')

    return {
        'cart_count': len(cart_items),
        'cart_items': solutions_in_cart,
        'cart_total': sum(s.price for s in solutions_in_cart) if solutions_in_cart else 0
    }