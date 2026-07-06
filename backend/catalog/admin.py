from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Category, Collection, Product # Import from the root catalog app

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'sort_order')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Collection) # Register Collection from root catalog app
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'key', 'sort_order', 'is_active')
    list_editable = ('sort_order', 'is_active')
    prepopulated_fields = {'key': ('name',)}

@admin.register(Product) # Register Product from root catalog app
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'display_thumbnail', 
        'name', 
        'sku', 
        'category', 
        'price', 
        'stock_qty', 
        'is_active', 
        'is_featured', 
        'created_at'
    )
    list_display_links = ('display_thumbnail', 'name')
    list_filter = ('is_active', 'is_featured', 'material', 'size', 'collections', 'category')
    search_fields = ('name', 'sku', 'description', 'slug')
    list_editable = ('price', 'stock_qty', 'is_active', 'is_featured')
    list_per_page = 20
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ('collections',) # For ManyToMany field
    
    fieldsets = (
        (None, {
            'fields': (
                'name', 'slug', 'sku', 'subtitle', 'description', 
                'price', 'stock_qty', 'material', 'size', 'is_active', 'is_featured'
            )
        }),
        ('Images', {
            'fields': ('image_file', 'image_url', 'image_prompt') # Add image_file here
        }),
        ('Categorization', {
            'fields': ('category', 'collections', 'tags', 'color_options') # category is now a ForeignKey
        }),
    )

    def display_thumbnail(self, obj):
        url = obj.display_image_url
        if url:
            return mark_safe(f'<img src="{url}" width="50" height="50" style="object-fit: cover; border-radius: 8px; border: 1px solid #eaeaea;" />')
        return "-"
    display_thumbnail.short_description = 'Preview'