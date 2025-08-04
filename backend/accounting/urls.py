from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.AccountingDashboardView.as_view(), name='accounting-dashboard'),
    path('invoices/', views.InvoicesView.as_view(), name='invoices'),
    path('invoices/<int:invoice_id>/', views.InvoiceDetailView.as_view(), name='invoice-detail'),
    path('transactions/', views.CashTransactionsView.as_view(), name='cash-transactions'),
    path('cash-summary/', views.DailyCashSummaryView.as_view(), name='daily-cash-summary'),
    path('tax-reports/', views.TaxReportsView.as_view(), name='tax-reports'),
]