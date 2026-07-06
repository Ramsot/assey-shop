from rest_framework import serializers
from .models import ShippingAddress, PaymentMethod, Order, OrderItem, Payment


class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = [
            'id', 'first_name', 'last_name', 'email',
            'address1', 'address2', 'city', 'postal_code', 'country', 'phone',
        ]


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'first_name', 'last_name', 'card_number_last4', 'expiry_month', 'expiry_year']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'payment_token', 'amount', 'currency', 'transaction_id', 'status', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['product_sku', 'product_name', 'product_price', 'color', 'quantity', 'line_total']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment_token = serializers.CharField(write_only=True, required=False, allow_blank=True)
    shipping_address = ShippingAddressSerializer(read_only=True)
    shipping_address_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            'order_number', 'email', 'shipping_address', 'shipping_address_id',
            'shipping_method', 'subtotal', 'shipping_cost', 'tax', 'total',
            'payment_status', 'tracking_number', 'tracking_url', 'status',
            'items', 'created_at', 'payment_token', 'notes',
        ]
        read_only_fields = [
            'order_number', 'subtotal', 'shipping_cost', 'tax', 'total', 'status', 'payment_status',
        ]
