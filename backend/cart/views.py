"""
Cart views - session-based cart management
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from catalog.models import Product


class CartViewSet(viewsets.ViewSet):
    """
    Session-based cart management.
    GET  /api/cart/          → get cart contents
    POST /api/cart/add/     → add item to cart
    POST /api/cart/remove/  → remove item from cart
    POST /api/cart/clear/   → clear cart
    """

    def list(self, request):
        cart = request.session.get('cart', [])
        total_qty = sum(i.get('qty', 1) for i in cart)
        total_price = sum(float(i.get('price', 0)) * i.get('qty', 1) for i in cart)
        return Response({'items': cart, 'count': total_qty, 'total_price': round(total_price, 2)})

    def create(self, request):
        return self.add_item(request)

    @action(detail=False, methods=['post'], url_path='add')
    def add_item(self, request):
        cart = request.session.get('cart', [])
        sku = request.data.get('sku')
        color = request.data.get('color', '')
        try:
            qty = int(request.data.get('qty', request.data.get('quantity', 1)))
        except (ValueError, TypeError):
            return Response({'error': 'Invalid quantity format'}, status=status.HTTP_400_BAD_REQUEST)

        if not sku or qty <= 0:
            return Response({'error': 'Invalid SKU or quantity'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Try lookup by SKU first, then by ID if SKU looks like an ID or lookup fails
            try:
                product = Product.objects.get(sku=sku)
            except Product.DoesNotExist:
                # If sku is numeric, try looking up by ID
                if str(sku).isdigit():
                    product = Product.objects.get(id=int(sku))
                else:
                    raise
            item_price = str(product.price)
            item_name = product.name
            sku = product.sku # Ensure we use the actual SKU string in the cart
        except (Product.DoesNotExist, ValueError):
            return Response({'error': f'Product with SKU {sku} not found'}, status=status.HTTP_400_BAD_REQUEST)

        new_item = {
            'sku': sku,
            'name': item_name,
            'price': item_price,
            'color': color,
            'qty': qty,
        }
        # Check if item already in cart
        for i, existing in enumerate(cart):
            if existing['sku'] == new_item['sku'] and existing['color'] == new_item['color']:
                cart[i]['qty'] += new_item['qty']
                break
        else:
            cart.append(new_item)
        request.session['cart'] = cart
        total_qty = sum(i.get('qty', 1) for i in cart)
        total_price = sum(float(i.get('price', 0)) * i.get('qty', 1) for i in cart)
        return Response({'items': cart, 'count': total_qty, 'total_price': round(total_price, 2)})

    @action(detail=False, methods=['post'], url_path='remove')
    def remove_item(self, request):
        cart = request.session.get('cart', [])
        sku = request.data.get('sku')
        color = request.data.get('color', '')
        cart = [i for i in cart if not (i['sku'] == sku and i['color'] == color)]
        request.session['cart'] = cart
        total_qty = sum(i.get('qty', 1) for i in cart)
        total_price = sum(float(i.get('price', 0)) * i.get('qty', 1) for i in cart)
        return Response({'items': cart, 'count': total_qty, 'total_price': round(total_price, 2)})

    @action(detail=False, methods=['post'], url_path='clear')
    def clear_cart(self, request):
        request.session['cart'] = []
        return Response({'items': [], 'count': 0, 'total_price': 0})