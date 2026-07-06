from rest_framework import serializers
from .models import Category, Collection, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name', 'slug']


class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ['key', 'name', 'caption', 'title', 'description', 'image_url']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    collections = CollectionSerializer(many=True, read_only=True)
    display_image_url = serializers.SerializerMethodField()
    colors = serializers.JSONField(source='color_options')

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'collections', 'description', 'subtitle',
            'price', 'stock_qty', 'is_active', 'is_featured',
            'image_url', 'display_image_url', 'material', 'size',
            'colors', 'tags', 'created_at', 'updated_at',
        ]

    def get_display_image_url(self, obj):
        return obj.display_image_url
