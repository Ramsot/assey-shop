from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order

@receiver(post_save, sender=Order)
def order_notification_handler(sender, instance, created, **kwargs):
    """
    Signal triggered whenever a new order is saved.
    'created' is True if this is a new record.
    """
    if created:
        # Here you could trigger external notifications (Slack, Email, SMS)
        # or log the event for the real-time admin dashboard.
        print(f"New Sales Notification: Order {instance.order_number} received for {instance.total}")