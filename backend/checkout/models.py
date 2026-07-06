"""
ASSEY Atelier - Checkout App
Handles order address and payment processing
"""

import uuid
from django.db import models
from django.core.validators import MinValueValidator


class ShippingAddress(models.Model):
    """Customer shipping address"""
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    email = models.EmailField()
    address1 = models.CharField(max_length=256)
    address2 = models.CharField(max_length=256, blank=True, default="")
    city = models.CharField(max_length=128)
    postal_code = models.CharField(max_length=32)
    country = models.CharField(max_length=128)
    phone = models.CharField(max_length=32, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Shipping Addresses"

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.city}, {self.country}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class PaymentMethod(models.Model):
    """Stored payment method (cards)"""
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    card_number_last4 = models.CharField(max_length=4)
    expiry_month = models.IntegerField()
    expiry_year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Payment Methods"

    def __str__(self):
        return f"****{self.card_number_last4} (exp {self.expiry_month}/{self.expiry_year})"


class Order(models.Model):
    """Customer order"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    SHIPPING_CHOICES = [
        ('standard', 'Standard (3-5 days, Free)'),
        ('priority', 'Priority (2-3 days, $14)'),
        ('express', 'Express (Next day, $28)'),
    ]

    order_number = models.CharField(max_length=32, unique=True)
    email = models.EmailField()
    shipping_address = models.ForeignKey(ShippingAddress, on_delete=models.CASCADE, related_name='orders')
    shipping_method = models.CharField(max_length=32, choices=SHIPPING_CHOICES, default='standard')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tracking_number = models.CharField(max_length=100, blank=True, default="", help_text="Shipping carrier tracking number")
    tracking_url = models.URLField(blank=True, default="", help_text="URL to the shipping carrier's tracking page")
    payment_status = models.CharField(max_length=32, choices=[('pending', 'Pending'), ('paid', 'Paid'), ('failed', 'Failed')], default='pending')
    payment_token = models.CharField(max_length=255, blank=True, null=True, help_text="Token from payment gateway")
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order {self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"AS-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Individual item within an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_sku = models.CharField(max_length=32)
    product_name = models.CharField(max_length=128)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    color = models.CharField(max_length=64, blank=True, default="")
    quantity = models.IntegerField(default=1)

    class Meta:
        verbose_name_plural = "Order Items"

    def __str__(self):
        return f"{self.product_name} x{self.quantity} ({self.color})"

    @property
    def line_total(self):
        return self.product_price * self.quantity


class Payment(models.Model):
    """Records a payment transaction for an order."""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    payment_token = models.CharField(max_length=255, help_text="Token from payment gateway or internal reference")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=8, default="USD")
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=32, choices=[('pending', 'Pending'), ('succeeded', 'Succeeded'), ('failed', 'Failed'), ('refunded', 'Refunded')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Payments"

    def __str__(self):
        return f"Payment for Order {self.order.order_number} - {self.status}"