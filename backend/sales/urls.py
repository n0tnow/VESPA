from django.urls import path
from . import views

urlpatterns = [
    path('', views.SalesView.as_view(), name='sales'),
    path('<int:sale_id>/', views.SaleDetailView.as_view(), name='sale-detail'),
    path('parts/', views.SalesPartsSearchView.as_view(), name='sales-parts-search'),
]


