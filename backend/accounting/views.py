"""
Accounting API Views - Invoice and financial management
"""
from datetime import datetime, date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .accounting_functions import (
    get_all_invoices, get_invoice_by_id, create_invoice,
    create_cash_transaction, get_daily_cash_summary,
    generate_monthly_tax_report, get_accounting_summary
)

class InvoicesView(APIView):
    def get(self, request):
        try:
            limit = int(request.GET.get('limit', 100))
            offset = int(request.GET.get('offset', 0))
            status_filter = request.GET.get('status')
            invoices = get_all_invoices(limit, offset, status_filter)
            return Response({'invoices': invoices, 'count': len(invoices)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to get invoices: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            customer_id = request.data.get('customer_id')
            items = request.data.get('items', [])
            currency_type = request.data.get('currency_type', 'TRY')
            due_days = request.data.get('due_days', 30)
            
            invoice_id = create_invoice(customer_id, items, currency_type, due_days)
            invoice = get_invoice_by_id(invoice_id)
            
            return Response({'message': 'Invoice created successfully', 'invoice': invoice}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to create invoice: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InvoiceDetailView(APIView):
    def get(self, request, invoice_id):
        try:
            invoice = get_invoice_by_id(invoice_id)
            if invoice:
                return Response({'invoice': invoice}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to get invoice: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CashTransactionsView(APIView):
    def post(self, request):
        try:
            transaction_id = create_cash_transaction(request.data)
            return Response({'message': 'Transaction created successfully', 'transaction_id': transaction_id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to create transaction: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DailyCashSummaryView(APIView):
    def get(self, request):
        try:
            date_str = request.GET.get('date')
            summary_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None
            summary = get_daily_cash_summary(summary_date)
            return Response({'cash_summary': summary}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to get cash summary: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TaxReportsView(APIView):
    def post(self, request):
        try:
            year = int(request.data.get('year', date.today().year))
            month = int(request.data.get('month', date.today().month))
            tax_report_id = generate_monthly_tax_report(year, month)
            return Response({'message': 'Tax report generated', 'tax_report_id': tax_report_id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to generate tax report: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AccountingDashboardView(APIView):
    def get(self, request):
        try:
            summary = get_accounting_summary()
            return Response({'summary': summary}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to get dashboard: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
