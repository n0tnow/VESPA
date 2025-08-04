"""
Services API Views - Service records and paint job management
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .service_functions import (
    get_all_service_records, get_service_by_id,
    create_service_record, update_service_status, add_service_parts,
    get_paint_templates_by_model, get_paint_template_parts,
    create_paint_job, get_paint_job_details,
    get_service_summary, get_service_revenue_by_month
)


# ===== SERVICE RECORDS =====

class ServicesView(APIView):
    """Service records management"""
    
    def get(self, request):
        """Get service records with filters"""
        try:
            limit = int(request.GET.get('limit', 100))
            offset = int(request.GET.get('offset', 0))
            status_filter = request.GET.get('status')
            
            services = get_all_service_records(limit, offset, status_filter)
            
            return Response({
                'services': services,
                'count': len(services)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get services: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new service record"""
        try:
            service_id = create_service_record(request.data)
            service = get_service_by_id(service_id)
            
            return Response({
                'message': 'Service record created successfully',
                'service': service
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Failed to create service: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ServiceDetailView(APIView):
    """Individual service operations"""
    
    def get(self, request, service_id):
        """Get detailed service record"""
        try:
            service = get_service_by_id(service_id)
            if service:
                return Response({'service': service}, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Service not found'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            return Response({
                'error': f'Failed to get service: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ServiceStatusView(APIView):
    """Update service status"""
    
    def post(self, request, service_id):
        """Update service status and completion info"""
        try:
            new_status = request.data.get('status')
            completion_date = request.data.get('completion_date')
            work_done = request.data.get('work_done', '')
            
            if not new_status:
                return Response({
                    'error': 'Status field is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success = update_service_status(service_id, new_status, completion_date, work_done)
            
            if success:
                service = get_service_by_id(service_id)
                return Response({
                    'message': 'Service status updated successfully',
                    'service': service
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to update service status'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': f'Failed to update service status: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ServicePartsView(APIView):
    """Add parts to service record"""
    
    def post(self, request, service_id):
        """Add multiple parts to service"""
        try:
            parts_list = request.data.get('parts', [])
            
            if not parts_list:
                return Response({
                    'error': 'Parts list is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success = add_service_parts(service_id, parts_list)
            
            if success:
                service = get_service_by_id(service_id)
                return Response({
                    'message': 'Parts added to service successfully',
                    'service': service
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to add parts to service'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': f'Failed to add parts: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== PAINT JOBS =====

class PaintTemplatesView(APIView):
    """Paint templates for Vespa models"""
    
    def get(self, request, vespa_model_id):
        """Get available paint templates for a Vespa model"""
        try:
            templates = get_paint_templates_by_model(vespa_model_id)
            
            return Response({
                'vespa_model_id': vespa_model_id,
                'templates': templates,
                'count': len(templates)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get paint templates: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaintTemplatePartsView(APIView):
    """Paint template parts with 2D coordinates"""
    
    def get(self, request, template_id):
        """Get template parts for 2D paint system"""
        try:
            parts = get_paint_template_parts(template_id)
            
            return Response({
                'template_id': template_id,
                'parts': parts,
                'count': len(parts)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get template parts: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaintJobsView(APIView):
    """Paint job management"""
    
    def post(self, request):
        """Create paint job with selected parts and colors"""
        try:
            service_id = request.data.get('service_id')
            template_id = request.data.get('template_id')
            selected_parts = request.data.get('selected_parts', [])
            estimated_cost = request.data.get('estimated_cost', 0)
            
            if not all([service_id, template_id, selected_parts]):
                return Response({
                    'error': 'Required fields: service_id, template_id, selected_parts'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            paint_job_id = create_paint_job(service_id, template_id, selected_parts, estimated_cost)
            paint_job = get_paint_job_details(paint_job_id)
            
            return Response({
                'message': 'Paint job created successfully',
                'paint_job': paint_job
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Failed to create paint job: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaintJobDetailView(APIView):
    """Individual paint job operations"""
    
    def get(self, request, paint_job_id):
        """Get paint job details with selected parts and colors"""
        try:
            paint_job = get_paint_job_details(paint_job_id)
            
            if paint_job:
                return Response({'paint_job': paint_job}, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Paint job not found'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            return Response({
                'error': f'Failed to get paint job: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== SERVICE ANALYTICS =====

class ServiceDashboardView(APIView):
    """Service analytics and dashboard"""
    
    def get(self, request):
        """Get service statistics and analytics"""
        try:
            summary = get_service_summary()
            
            # Revenue data for last 12 months
            revenue_data = get_service_revenue_by_month(12)
            
            return Response({
                'summary': summary,
                'revenue_by_month': revenue_data,
                'total_months': len(revenue_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get service dashboard: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ServiceRevenueView(APIView):
    """Service revenue analytics"""
    
    def get(self, request):
        """Get service revenue data"""
        try:
            months = int(request.GET.get('months', 12))
            revenue_data = get_service_revenue_by_month(months)
            
            # Calculate totals
            total_services = sum(r['service_count'] for r in revenue_data)
            total_labor_revenue = sum(r['labor_revenue'] for r in revenue_data)
            total_parts_revenue = sum(r['parts_revenue'] for r in revenue_data)
            total_revenue = sum(r['total_revenue'] for r in revenue_data)
            
            return Response({
                'revenue_by_month': revenue_data,
                'totals': {
                    'total_services': total_services,
                    'total_labor_revenue': total_labor_revenue,
                    'total_parts_revenue': total_parts_revenue,
                    'total_revenue': total_revenue
                },
                'period_months': months
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get revenue data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
