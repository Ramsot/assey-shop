from django.contrib import admin
from django.utils.html import format_html
from .models import ShippingAddress, PaymentMethod, Order, OrderItem, Payment


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_sku', 'product_name', 'product_price', 'color', 'quantity', 'line_total_display')
    fields = ('product_sku', 'product_name', 'product_price', 'color', 'quantity', 'line_total_display')
    can_delete = False

    def line_total_display(self, obj):
        return f"${obj.product_price * obj.quantity:,.2f}"
    line_total_display.short_description = 'Line Total'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'email', 'status_badge', 'payment_status_badge',
        'shipping_method', 'total_display', 'created_at',
    )
    list_filter = ('status', 'payment_status', 'shipping_method', 'created_at')
    search_fields = ('order_number', 'email', 'shipping_address__first_name', 'shipping_address__last_name')
    readonly_fields = (
        'order_number', 'subtotal', 'shipping_cost', 'tax', 'total',
        'payment_status', 'created_at', 'updated_at',
    )
    list_per_page = 25
    date_hierarchy = 'created_at'
    inlines = [OrderItemInline]

    fieldsets = (
        ('Order', {
            'fields': ('order_number', 'email', 'status', 'notes'),
        }),
        ('Shipping', {
            'fields': ('shipping_address', 'shipping_method', 'tracking_number', 'tracking_url'),
        }),
        ('Financials', {
            'fields': ('subtotal', 'shipping_cost', 'tax', 'total', 'payment_status'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def status_badge(self, obj):
        colors = {
            'pending': '#d97706',
            'processing': '#2563eb',
            'shipped': '#7c3aed',
            'delivered': '#16a34a',
            'cancelled': '#dc2626',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">{}</span>',
            color, obj.get_status_display(),
        )
    status_badge.short_description = 'Status'

    def payment_status_badge(self, obj):
        colors = {'pending': '#d97706', 'paid': '#16a34a', 'failed': '#dc2626'}
        color = colors.get(obj.payment_status, '#6b7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">{}</span>',
            color, obj.get_payment_status_display(),
        )
    payment_status_badge.short_description = 'Payment'

    def total_display(self, obj):
        return f"${obj.total:,.2f}"
    total_display.short_description = 'Total'


@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'city', 'country', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'city', 'country')
    list_filter = ('country',)
    readonly_fields = ('created_at',)

    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = 'Name'


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'masked_card', 'expiry_display', 'created_at')
    search_fields = ('first_name', 'last_name')
    readonly_fields = ('created_at',)

    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = 'Name'

    def masked_card(self, obj):
        return f"**** **** **** {obj.card_number_last4}"
    masked_card.short_description = 'Card'

    def expiry_display(self, obj):
        return f"{obj.expiry_month:02d}/{obj.expiry_year}"
    expiry_display.short_description = 'Expiry'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'amount', 'currency', 'status', 'created_at')
    list_filter = ('status', 'currency')
    search_fields = ('order__order_number', 'transaction_id')
    readonly_fields = ('created_at', 'updated_at')