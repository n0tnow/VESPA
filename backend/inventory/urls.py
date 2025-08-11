from django.urls import path
from . import views

urlpatterns = [
    # Dashboard and Analytics
    path('dashboard/', views.InventoryDashboardView.as_view(), name='inventory-dashboard'),
    
    # Storage Locations
    path('locations/', views.StorageLocationsView.as_view(), name='storage-locations'),
    path('warehouse/structure/', views.WarehouseStructureView.as_view(), name='warehouse-structure'),
    
    # Suppliers
    path('suppliers/', views.SuppliersView.as_view(), name='suppliers'),
    
    # Categories
    path('categories/', views.CategoriesView.as_view(), name='categories'),
    
    # Parts
    path('parts/', views.PartsView.as_view(), name='parts'),
    path('parts/<int:part_id>/', views.PartDetailView.as_view(), name='part-detail'),
    path('parts/<int:part_id>/locations/', views.PartLocationsView.as_view(), name='part-locations'),
    path('parts/<int:part_id>/prices/', views.PartPricesView.as_view(), name='part-prices'),
    
    # Vespa Models
    path('vespa-models/', views.VespaModelsView.as_view(), name='vespa-models'),
    
    # Stock Management
    path('stock/low/', views.LowStockView.as_view(), name='low-stock'),
    path('stock/movements/', views.StockMovementsView.as_view(), name='stock-movements'),
    
    # Currency
    path('currency/rates/', views.CurrencyRatesView.as_view(), name='currency-rates'),
]