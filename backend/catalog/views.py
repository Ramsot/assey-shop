from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .pagination import StrictPageNumberPagination
from .models import Product, Collection
from .serializers import ProductSerializer, CollectionSerializer

# --- ViewSets ---

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows products to be viewed.
    GET /api/catalog/products/
    GET /api/catalog/products/{slug}/
    """
    queryset = Product.objects.filter(is_active=True).prefetch_related('collections').select_related('category').order_by('-created_at')
    serializer_class = ProductSerializer
    lookup_field = 'slug' # Use slug for detail view

    def list(self, request, *args, **kwargs):
        # Explicit validation for TestSprite's "Strict" requirement
        page = request.query_params.get('page')
        limit = request.query_params.get('limit')
        page_size = request.query_params.get('page_size')

        for val in [page, limit, page_size]:
            if val is not None:
                try:
                    if int(val) <= 0:
                        return Response({"detail": "Invalid parameter. Must be positive."}, status=400)
                except ValueError:
                    return Response({"detail": "Invalid parameter. Must be an integer."}, status=400)
        
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        category_slug  = params.get('category')
        collection_key = params.get('collection')
        is_featured    = params.get('is_featured')
        search         = params.get('q', '').strip()

        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if collection_key:
            queryset = queryset.filter(collections__key=collection_key)
        if is_featured in ('true', '1', 'yes'):
            queryset = queryset.filter(is_featured=True)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(sku__icontains=search)
                | Q(description__icontains=search)
                | Q(subtitle__icontains=search)
            )
        return queryset.distinct()

class CollectionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows collections to be viewed.
    GET /api/catalog/collections/
    GET /api/catalog/collections/{key}/
    """
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer
    lookup_field = 'key' # Use key for detail view

    @action(detail=True, methods=['get'])
    def products(self, request, key=None):
        """
        Get products belonging to a specific collection.
        GET /api/catalog/collections/{key}/products/
        """
        collection = self.get_object()
        products = collection.products.filter(is_active=True).select_related('category').prefetch_related('collections')
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)