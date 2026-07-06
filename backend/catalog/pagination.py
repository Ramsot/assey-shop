from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status

class StrictPageNumberPagination(PageNumberPagination):
    page_size_query_param = 'page_size'
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        try:
            page_size = self.get_page_size(request)
            if page_size is not None and page_size <= 0:
                return None
        except (ValueError, TypeError):
            return None
        return super().paginate_queryset(queryset, request, view)