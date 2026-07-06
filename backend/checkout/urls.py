from django.urls import path, include
from rest_framework.routers import DefaultRouter
from checkout.views import (
    ShippingAddressViewSet,
    PaymentMethodViewSet,
    OrderViewSet,
    CheckoutSummaryViewSet,
)

router = DefaultRouter()
router.register(r'addresses', ShippingAddressViewSet, basename='address')
router.register(r'payment-methods', PaymentMethodViewSet, basename='payment-method')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    path('summary/', CheckoutSummaryViewSet.as_view({'post': 'create'}), name='checkout-summary'),
]