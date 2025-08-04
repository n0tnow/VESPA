from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    VespaModel, PartCategory, Part, ModelPart, Customer, 
    Service, ServicePart, StockMovement, UserProfile
)
from .serializers import (
    VespaModelSerializer, PartCategorySerializer, PartSerializer, ModelPartSerializer,
    CustomerSerializer, ServiceSerializer, ServicePartSerializer, StockMovementSerializer,
    UserProfileSerializer, DashboardStatsSerializer, PartStockSerializer,
    CustomerSummarySerializer, ServiceSummarySerializer
)


class VespaModelViewSet(viewsets.ModelViewSet):
    queryset = VespaModel.objects.all()
    serializer_class = VespaModelSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = VespaModel.objects.all()
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset


class PartCategoryViewSet(viewsets.ModelViewSet):
    queryset = PartCategory.objects.all()
    serializer_class = PartCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = PartCategory.objects.all()
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset


class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Part.objects.all()
        category = self.request.query_params.get('category', None)
        supplier = self.request.query_params.get('supplier', None)
        stock_status = self.request.query_params.get('stock_status', None)
        
        if category:
            queryset = queryset.filter(category__name__icontains=category)
        if supplier:
            queryset = queryset.filter(supplier__icontains=supplier)
        if stock_status:
            if stock_status == 'critical':
                queryset = queryset.filter(current_stock__lte=models.F('min_stock'))
            elif stock_status == 'low':
                queryset = queryset.filter(
                    current_stock__gt=models.F('min_stock'),
                    current_stock__lte=models.F('min_stock') * 1.5
                )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Düşük stoklu parçaları listele"""
        parts = Part.objects.filter(current_stock__lte=models.F('min_stock'))
        serializer = PartStockSerializer(parts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        """Stok düzeltme"""
        part = self.get_object()
        quantity = request.data.get('quantity', 0)
        reason = request.data.get('reason', '')
        movement_type = request.data.get('movement_type', 'adjustment')
        
        previous_stock = part.current_stock
        
        if movement_type == 'in':
            part.current_stock += quantity
        elif movement_type == 'out':
            part.current_stock -= quantity
        else:  # adjustment
            part.current_stock = quantity
        
        part.save()
        
        # Stok hareketi kaydet
        StockMovement.objects.create(
            part=part,
            movement_type=movement_type,
            quantity=quantity,
            previous_stock=previous_stock,
            new_stock=part.current_stock,
            reason=reason,
            user=request.user
        )
        
        serializer = self.get_serializer(part)
        return Response(serializer.data)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Customer.objects.all()
        status = self.request.query_params.get('status', None)
        vespa_model = self.request.query_params.get('vespa_model', None)
        
        if status:
            queryset = queryset.filter(status=status)
        if vespa_model:
            queryset = queryset.filter(vespa_model__name__icontains=vespa_model)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Müşteri özeti"""
        customers = Customer.objects.all()
        serializer = CustomerSummarySerializer(customers, many=True)
        return Response(serializer.data)


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Service.objects.all()
        status = self.request.query_params.get('status', None)
        service_type = self.request.query_params.get('service_type', None)
        customer = self.request.query_params.get('customer', None)
        
        if status:
            queryset = queryset.filter(status=status)
        if service_type:
            queryset = queryset.filter(service_type=service_type)
        if customer:
            queryset = queryset.filter(customer__name__icontains=customer)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Bekleyen servisler"""
        services = Service.objects.filter(status='pending')
        serializer = ServiceSummarySerializer(services, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def in_progress(self, request):
        """Devam eden servisler"""
        services = Service.objects.filter(status='in_progress')
        serializer = ServiceSummarySerializer(services, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Servisi tamamla"""
        service = self.get_object()
        actual_cost = request.data.get('actual_cost', service.estimated_cost)
        
        service.status = 'completed'
        service.actual_cost = actual_cost
        service.end_date = timezone.now()
        service.save()
        
        serializer = self.get_serializer(service)
        return Response(serializer.data)


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = StockMovement.objects.all()
        part = self.request.query_params.get('part', None)
        movement_type = self.request.query_params.get('movement_type', None)
        
        if part:
            queryset = queryset.filter(part__name__icontains=part)
        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)
        
        return queryset


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Dashboard istatistikleri"""
        # Toplam sayılar
        total_customers = Customer.objects.count()
        total_parts = Part.objects.count()
        total_services = Service.objects.count()
        
        # Düşük stoklu parçalar
        low_stock_parts = Part.objects.filter(
            current_stock__lte=models.F('min_stock')
        ).count()
        
        # Bekleyen servisler
        pending_services = Service.objects.filter(status='pending').count()
        
        # Aylık gelir (son 30 gün)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        monthly_revenue = Service.objects.filter(
            status='completed',
            end_date__gte=thirty_days_ago
        ).aggregate(
            total=Sum('actual_cost')
        )['total'] or 0
        
        data = {
            'total_customers': total_customers,
            'total_parts': total_parts,
            'total_services': total_services,
            'low_stock_parts': low_stock_parts,
            'pending_services': pending_services,
            'monthly_revenue': monthly_revenue,
        }
        
        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent_services(self, request):
        """Son servisler"""
        services = Service.objects.order_by('-start_date')[:10]
        serializer = ServiceSummarySerializer(services, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stock_alerts(self, request):
        """Stok uyarıları"""
        parts = Part.objects.filter(
            current_stock__lte=models.F('min_stock')
        ).order_by('current_stock')[:10]
        serializer = PartStockSerializer(parts, many=True)
        return Response(serializer.data)
