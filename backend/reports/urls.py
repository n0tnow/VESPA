from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.ComprehensiveDashboardView.as_view(), name='comprehensive-dashboard'),
    path('customers/', views.CustomerSummaryReportView.as_view(), name='customer-summary-report'),
    path('inventory/', views.InventorySummaryReportView.as_view(), name='inventory-summary-report'),
    path('services/', views.ServicePerformanceReportView.as_view(), name='service-performance-report'),
]