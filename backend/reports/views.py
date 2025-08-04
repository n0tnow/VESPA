"""
Reports API Views - Analytics and database views
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .report_functions import (
    get_customer_summary_report, get_inventory_summary_report,
    get_service_performance_report, get_comprehensive_dashboard
)

class CustomerSummaryReportView(APIView):
    def get(self, request):
        try:
            report = get_customer_summary_report()
            return Response({'customer_summary': report, 'count': len(report)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to get customer report: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InventorySummaryReportView(APIView):
    def get(self, request):
        try:
            report = get_inventory_summary_report()
            return Response({'inventory_summary': report, 'count': len(report)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to get inventory report: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ServicePerformanceReportView(APIView):
    def get(self, request):
        try:
            report = get_service_performance_report()
            return Response({'service_performance': report, 'count': len(report)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to get service report: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ComprehensiveDashboardView(APIView):
    def get(self, request):
        try:
            dashboard = get_comprehensive_dashboard()
            return Response({'dashboard': dashboard}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to get dashboard: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
