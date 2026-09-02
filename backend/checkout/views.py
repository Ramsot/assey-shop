"""
ASSEY Atelier - Checkout App API
Handles order creation, address management, and confirmation.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from django.db import transaction
from decimal import Decimal
from .models import ShippingAddress, PaymentMethod, Order, OrderItem
from .serializers import (
    ShippingAddressSerializer,
    PaymentMethodSerializer,
    OrderSerializer,
)
from catalog.models import Product

SHIPPING_RATES = {
    'standard': Decimal('0'),
    'priority': Decimal('14.00'),
    'express': Decimal('28.00'),
}
TAX_RATE = Decimal('0.07')


# ---- Utilities ----

def calculate_order_totals(items_data, shipping_method):
    """Centralized, authoritative financial calculation from DB prices.
    Uses a single bulk query to avoid N+1 per item.
    """
    skus = [item.get('sku') for item in items_data if item.get('sku')]
    if not skus:
        raise ValueError('No valid SKUs provided')

    products_map = {
        p.sku: p for p in Product.objects.filter(sku__in=skus, is_active=True)
    }

    missing = [s for s in skus if s not in products_map]
    if missing:
        raise Product.DoesNotExist(f"Products not found: {', '.join(missing)}")

    subtotal = Decimal('0.00')
    items_to_process = []

    for item_data in items_data:
        sku = item_data.get('sku')
        qty = int(item_data.get('quantity', 1))
        product = products_map[sku]
        subtotal += product.price * qty
        items_to_process.append({'product': product, 'quantity': qty})

    shipping_cost = SHIPPING_RATES.get(shipping_method, Decimal('0'))
    tax = (subtotal * TAX_RATE).quantize(Decimal('0.01'))
    total = subtotal + shipping_cost + tax

    return subtotal, shipping_cost, tax, total, items_to_process


# ---- ViewSets ----

class ShippingAddressViewSet(viewsets.ModelViewSet):
    """
    Create and manage shipping addresses.
    POST /api/checkout/addresses/   — create (guest checkout allowed)
    GET  /api/checkout/addresses/   — list (authenticated only; PII)
    """
    queryset = ShippingAddress.objects.all().order_by('-created_at')
    serializer_class = ShippingAddressSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAuthenticated()]


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """
    Create and manage payment methods.
    POST /api/checkout/payment-methods/   — create (guest checkout allowed)
    GET  /api/checkout/payment-methods/   — list (authenticated only; PII)
    """
    queryset = PaymentMethod.objects.all().order_by('-created_at')
    serializer_class = PaymentMethodSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAuthenticated()]


class OrderViewSet(viewsets.ModelViewSet):
    """
    Create and manage orders.
    POST /api/checkout/orders/
    GET  /api/checkout/orders/:order_number/
    """
    queryset = Order.objects.all().select_related('shipping_address')
    serializer_class = OrderSerializer
    lookup_field = 'order_number'

    def get_permissions(self):
        if self.action in ("create", "retrieve"):
            return [AllowAny()]
        if self.action == "list":
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def create(self, request):
        """
        Create a new order.
        Body: {
          "email": "...",
          "shipping_address_id": 1,
          "shipping_method": "standard",
          "items": [{"sku": "PRL-001", "color": "Champagne", "quantity": 1}]
        }
        """
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            validated = serializer.validated_data

            address_id = validated.get('shipping_address_id')
            try:
                address = ShippingAddress.objects.get(pk=address_id)
            except ShippingAddress.DoesNotExist:
                return Response(
                    {'error': 'Shipping address not found'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            items_data = request.data.get('items', [])
            if not items_data:
                return Response(
                    {'error': 'No items in the order'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                subtotal, shipping_cost, tax, total, processed_items = calculate_order_totals(
                    items_data,
                    validated.get('shipping_method', 'standard'),
                )
            except Product.DoesNotExist as exc:
                return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

            order = Order(
                email=validated.get('email', ''),
                shipping_address=address,
                shipping_method=validated.get('shipping_method', 'standard'),
                subtotal=subtotal,
                shipping_cost=shipping_cost,
                tax=tax,
                total=total,
                payment_status='pending',
                status='pending',
                notes=validated.get('notes', ''),
            )
            order.save()

            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    product_sku=p_item['product'].sku,
                    product_name=p_item['product'].name,
                    product_price=p_item['product'].price,
                    quantity=p_item['quantity'],
                    color=next(
                        (i.get('color', '') for i in items_data if i.get('sku') == p_item['product'].sku),
                        '',
                    ),
                )
                for p_item in processed_items
            ])

            response_serializer = self.get_serializer(order)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='confirm')
    def confirm(self, request):
        """
        Retrieve an order by order_number for the confirmation page.
        GET /api/checkout/orders/confirm/?order_number=AS-XXXX
        """
        order_number = request.query_params.get('order_number')
        try:
            order = (
                Order.objects
                .select_related('shipping_address')
                .prefetch_related('items')
                .get(order_number=order_number)
            )
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='recent-sales')
    @permission_classes([IsAuthenticated])
    def recent_sales(self, request):
        """Latest 5 orders for the admin dashboard live feed."""
        orders = Order.objects.select_related('shipping_address').order_by('-created_at')[:5]
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)


class CheckoutSummaryViewSet(viewsets.ViewSet):
    """
    Quick checkout summary calculation (does not create an order).
    POST /api/checkout/summary/
    Body: {"items": [...], "shipping_method": "standard"}
    """

    def create(self, request):
        items = request.data.get('items', [])
        shipping_method = request.data.get('shipping_method', 'standard')

        try:
            subtotal, shipping_cost, tax, total, _ = calculate_order_totals(items, shipping_method)
        except Product.DoesNotExist as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'subtotal': subtotal,
            'shipping_cost': shipping_cost,
            'tax': tax,
            'total': total,
        })
