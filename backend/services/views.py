"""
Services API Views - Service records and paint job management
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .service_functions import (
    get_all_service_records, get_service_by_id,
    create_service_record, update_service_status, add_service_parts,
    get_paint_templates_by_model, get_paint_template_parts,
    create_paint_job, get_paint_job_details,
    get_service_summary, get_service_revenue_by_month
)
from .work_type_functions import (
    get_work_types, get_work_type_by_id, create_work_type,
    update_work_type, delete_work_type, get_work_types_by_category,
    search_work_types
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
            customer_id = request.GET.get('customer_id')
            vespa_id = request.GET.get('vespa_id')
            
            services = get_all_service_records(
                limit=limit,
                offset=offset,
                status_filter=status_filter,
                customer_id=int(customer_id) if customer_id else None,
                vespa_id=int(vespa_id) if vespa_id else None,
            )
            
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


# ===== WORK TYPES MANAGEMENT =====

class WorkTypesView(APIView):
    """Work types (İşlem Türleri) management"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get all work types or search"""
        try:
            search_term = request.GET.get('search')
            category = request.GET.get('category')
            
            if search_term:
                work_types = search_work_types(search_term)
            else:
                work_types = get_work_types()
            
            # Filter by category if provided
            if category:
                work_types = [wt for wt in work_types if wt.get('category') == category]
            
            return Response({
                'work_types': work_types,
                'count': len(work_types)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get work types: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new work type"""
        try:
            data = request.data
            name = (data.get('name') or '').strip()
            base_price = float(data.get('base_price', 0))
            description = data.get('description')
            category = data.get('category')
            estimated_duration = int(data.get('estimated_duration', 30))
            
            if not name:
                return Response({
                    'error': 'Work type name is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Prevent duplicate names (case-insensitive)
            existing_work_types = get_work_types()
            if any((wt.get('name') or '').strip().lower() == name.lower() for wt in existing_work_types):
                return Response({
                    'error': 'Work type with this name already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            work_type_id = create_work_type(
                name=name,
                base_price=base_price,
                description=description,
                category=category,
                estimated_duration=estimated_duration
            )
            
            if work_type_id:
                work_type = get_work_type_by_id(work_type_id)
                return Response({
                    'message': 'Work type created successfully',
                    'work_type': work_type
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': 'Failed to create work type'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            error_message = str(e)
            if 'UNIQUE KEY' in error_message or 'UQ__' in error_message or 'duplicate key' in error_message.lower():
                return Response({
                    'error': 'Work type with this name already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            return Response({
                'error': f'Failed to create work type: {error_message}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WorkTypeDetailView(APIView):
    """Individual work type management"""
    permission_classes = [AllowAny]
    
    def get(self, request, work_type_id):
        """Get work type by ID"""
        try:
            work_type = get_work_type_by_id(work_type_id)
            
            if work_type:
                return Response({
                    'work_type': work_type
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Work type not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get work type: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, work_type_id):
        """Update work type"""
        try:
            data = request.data
            
            # If name is being updated, ensure uniqueness (excluding this record)
            new_name = data.get('name')
            if new_name is not None:
                new_name_norm = (str(new_name) or '').strip().lower()
                existing_work_types = get_work_types()
                for wt in existing_work_types:
                    if wt.get('id') != work_type_id and (wt.get('name') or '').strip().lower() == new_name_norm:
                        return Response({
                            'error': 'Work type with this name already exists'
                        }, status=status.HTTP_400_BAD_REQUEST)
            
            success = update_work_type(
                work_type_id=work_type_id,
                name=data.get('name'),
                base_price=float(data.get('base_price')) if data.get('base_price') is not None else None,
                description=data.get('description'),
                category=data.get('category'),
                estimated_duration=int(data.get('estimated_duration')) if data.get('estimated_duration') is not None else None
            )
            
            if success:
                work_type = get_work_type_by_id(work_type_id)
                return Response({
                    'message': 'Work type updated successfully',
                    'work_type': work_type
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to update work type'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            error_message = str(e)
            if 'UNIQUE KEY' in error_message or 'UQ__' in error_message or 'duplicate key' in error_message.lower():
                return Response({
                    'error': 'Work type with this name already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            return Response({
                'error': f'Failed to update work type: {error_message}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, work_type_id):
        """Delete work type (soft delete)"""
        try:
            success = delete_work_type(work_type_id)
            
            if success:
                return Response({
                    'message': 'Work type deleted successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to delete work type'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            return Response({
                'error': f'Failed to delete work type: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WorkTypesCategoriesView(APIView):
    """Work types grouped by categories"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get work types grouped by category"""
        try:
            grouped_work_types = get_work_types_by_category()
            
            return Response({
                'categories': grouped_work_types,
                'total_categories': len(grouped_work_types)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get work types by category: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
