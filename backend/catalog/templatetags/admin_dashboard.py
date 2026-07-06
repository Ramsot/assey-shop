from django import template
from django.db.models import Sum, Count
from django.db.models.functions import TruncDay
from django.utils import timezone
from datetime import timedelta
from catalog.models import Product
from checkout.models import Order

register = template.Library()

@register.simple_tag
def get_admin_stats():
    """Fetches key performance indicators for the admin dashboard."""
    stats = {
        'total_revenue': Order.objects.filter(payment_status='paid').aggregate(
            revenue=Sum('total'))['revenue'] or 0,
        'orders_count': Order.objects.count(),
        'low_stock_products': Product.objects.filter(stock_qty__lt=5, is_active=True).count(),
        'pending_orders': Order.objects.filter(status='pending').count(),
    }
    return stats

@register.simple_tag
def get_revenue_chart_data():
    """Provides daily revenue for the last 7 days."""
    last_week = timezone.now() - timedelta(days=7)
    daily_revenue = (
        Order.objects.filter(payment_status='paid', created_at__gte=last_week)
        .annotate(day=TruncDay('created_at'))
        .values('day')
        .annotate(total=Sum('total'))
        .order_by('day')
    )
    
    labels = [entry['day'].strftime('%a') for entry in daily_revenue]
    values = [float(entry['total']) for entry in daily_revenue]
    
    return {'labels': labels, 'values': values}

@register.simple_tag
def get_recent_orders(limit=5):
    """Fetches the most recent orders for the live feed."""
    return Order.objects.all().order_by('-created_at')[:limit]