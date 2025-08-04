from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VespaModelViewSet, PartCategoryViewSet, PartViewSet, 
    CustomerViewSet, ServiceViewSet, StockMovementViewSet,
    DashboardViewSet
)

router = DefaultRouter()
router.register(r'vespa-models', VespaModelViewSet)
router.register(r'part-categories', PartCategoryViewSet)
router.register(r'parts', PartViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'stock-movements', StockMovementViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
] 