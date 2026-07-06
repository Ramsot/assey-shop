from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/catalog/',  include('catalog.urls')),
    path('api/checkout/', include('checkout.urls')),
    path('api/cart/',     include('cart.urls')),

    # Frontend pages (static files served by WhiteNoise in all environments)
    path('',                    TemplateView.as_view(template_name='index.html'),              name='home'),
    path('shop/',               TemplateView.as_view(template_name='shop.html'),               name='shop'),
    path('checkout/',           TemplateView.as_view(template_name='checkout.html'),           name='checkout'),
    path('order-confirmation/', TemplateView.as_view(template_name='order-confirmation.html'), name='confirmation'),
]

# Serve user-uploaded media in development only.
# In production, delegate /media/ to Nginx or an object-storage CDN.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)