from django.contrib import admin
from .models import (
    VespaModel, PartCategory, Part, ModelPart, Customer, 
    Service, ServicePart, StockMovement, UserProfile
)


@admin.register(VespaModel)
class VespaModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'year', 'engine_size', 'price', 'is_active']
    list_filter = ['year', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(PartCategory)
class PartCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'description']


@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ['part_id', 'name', 'category', 'price', 'current_stock', 'min_stock', 'supplier', 'stock_status']
    list_filter = ['category', 'supplier', 'is_active']
    search_fields = ['part_id', 'name', 'supplier']
    readonly_fields = ['stock_status']
    ordering = ['name']


@admin.register(ModelPart)
class ModelPartAdmin(admin.ModelAdmin):
    list_display = ['vespa_model', 'part', 'is_required']
    list_filter = ['vespa_model', 'is_required']
    search_fields = ['vespa_model__name', 'part__name']


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['customer_id', 'name', 'phone', 'vespa_model', 'plate_number', 'total_spent', 'status']
    list_filter = ['status', 'vespa_model', 'registration_date']
    search_fields = ['customer_id', 'name', 'phone', 'email', 'plate_number']
    readonly_fields = ['total_spent', 'services_count']
    ordering = ['name']


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['service_id', 'customer', 'service_type', 'status', 'estimated_cost', 'start_date', 'technician']
    list_filter = ['service_type', 'status', 'start_date', 'technician']
    search_fields = ['service_id', 'customer__name', 'description']
    readonly_fields = ['service_id']
    ordering = ['-start_date']


@admin.register(ServicePart)
class ServicePartAdmin(admin.ModelAdmin):
    list_display = ['service', 'part', 'quantity', 'unit_price', 'total_price']
    list_filter = ['service__service_type', 'service__status']
    search_fields = ['service__service_id', 'part__name']


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['part', 'movement_type', 'quantity', 'previous_stock', 'new_stock', 'user', 'created_at']
    list_filter = ['movement_type', 'created_at', 'user']
    search_fields = ['part__name', 'reason', 'reference']
    readonly_fields = ['previous_stock', 'new_stock']
    ordering = ['-created_at']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'department', 'is_technician', 'can_manage_stock']
    list_filter = ['is_technician', 'can_manage_stock', 'can_manage_customers', 'can_manage_services']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'phone']
