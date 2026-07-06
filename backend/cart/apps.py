"""
ASSEY Atelier - Cart App
Manages the shopping cart in the session.
"""
from django.apps import AppConfig


class CartConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'cart'