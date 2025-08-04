from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    VespaModel, PartCategory, Part, ModelPart, Customer, 
    Service, ServicePart, StockMovement, UserProfile
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'


class VespaModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = VespaModel
        fields = '__all__'


class PartCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PartCategory
        fields = '__all__'


class PartSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    stock_status = serializers.CharField(read_only=True)
    
    class Meta:
        model = Part
        fields = '__all__'


class ModelPartSerializer(serializers.ModelSerializer):
    vespa_model_name = serializers.CharField(source='vespa_model.name', read_only=True)
    part_name = serializers.CharField(source='part.name', read_only=True)
    
    class Meta:
        model = ModelPart
        fields = '__all__'


class CustomerSerializer(serializers.ModelSerializer):
    vespa_model_name = serializers.CharField(source='vespa_model.name', read_only=True)
    
    class Meta:
        model = Customer
        fields = '__all__'


class ServicePartSerializer(serializers.ModelSerializer):
    part_name = serializers.CharField(source='part.name', read_only=True)
    
    class Meta:
        model = ServicePart
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    technician_name = serializers.CharField(source='technician.get_full_name', read_only=True)
    service_parts = ServicePartSerializer(many=True, read_only=True)
    
    class Meta:
        model = Service
        fields = '__all__'


class StockMovementSerializer(serializers.ModelSerializer):
    part_name = serializers.CharField(source='part.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = '__all__'


# Dashboard için özel serializers
class DashboardStatsSerializer(serializers.Serializer):
    total_customers = serializers.IntegerField()
    total_parts = serializers.IntegerField()
    total_services = serializers.IntegerField()
    low_stock_parts = serializers.IntegerField()
    pending_services = serializers.IntegerField()
    monthly_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)


class PartStockSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    stock_status = serializers.CharField(read_only=True)
    
    class Meta:
        model = Part
        fields = ['id', 'part_id', 'name', 'category_name', 'current_stock', 'min_stock', 'max_stock', 'stock_status']


class CustomerSummarySerializer(serializers.ModelSerializer):
    vespa_model_name = serializers.CharField(source='vespa_model.name', read_only=True)
    
    class Meta:
        model = Customer
        fields = ['id', 'customer_id', 'name', 'phone', 'vespa_model_name', 'total_spent', 'services_count', 'status']


class ServiceSummarySerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    technician_name = serializers.CharField(source='technician.get_full_name', read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'service_id', 'customer_name', 'service_type', 'status', 'estimated_cost', 'start_date', 'technician_name'] 