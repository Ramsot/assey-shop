"""
ASSEY Atelier - Product Catalog App
Provides API endpoints for fetching products filtered by collection:
- Signature
- Evening
- Workwear
"""

from django.db import models
from django.core.validators import MinValueValidator
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Collection(models.Model):
    """Product collection: Signature, Evening, Workwear"""
    key = models.CharField(max_length=32, unique=True, help_text="e.g. signature, evening, workwear")
    name = models.CharField(max_length=64)
    caption = models.CharField(max_length=64, blank=True, default="")
    title = models.CharField(max_length=128, blank=True, default="")
    image_url = models.URLField(blank=True, default="")
    description = models.TextField(blank=True, default="")
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['sort_order', 'name']
        verbose_name_plural = "Collections"

    def __str__(self):
        return self.name


class Product(models.Model):
    """Individual handbag product"""
    sku = models.CharField(max_length=32, unique=True, help_text="e.g. PRL-001")
    slug = models.SlugField(max_length=220, unique=True, blank=True) # Added from assey_store.catalog.models
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products") # Added from assey_store.catalog.models
    name = models.CharField(max_length=128)
    subtitle = models.CharField(max_length=256, blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    material = models.CharField(max_length=64)
    size = models.CharField(max_length=32)
    collections = models.ManyToManyField(Collection, related_name='products', blank=True)
    tags = models.JSONField(default=list, help_text='e.g. ["new", "best"]')
    image_file = models.ImageField(upload_to='products/', blank=True, null=True, help_text="Upload a product image") # Added from assey_store.catalog.models
    image_url = models.URLField(blank=True, default="")
    image_prompt = models.TextField(blank=True, default="", help_text="AI image generation prompt")
    color_options = models.JSONField(default=list, help_text='List of {"name": "...", "hex": "..."}')
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    stock_qty = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        ordering = ['-created_at'] # Changed to match assey_store.catalog.models
        verbose_name_plural = "Products"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.sku} - {self.name}"

    def get_display_price(self):
        return f"${int(self.price):,}"

    @property
    def display_image_url(self):
        if self.image_file:
            return self.image_file.url
        return self.image_url


class ProductImage(models.Model):
    """Additional images for a product"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField()
    alt_text = models.CharField(max_length=256, blank=True, default="")
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return f"Image for {self.product.name} ({self.pk})"