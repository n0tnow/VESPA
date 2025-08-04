"""
Inventory API Views - Complex inventory management system
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .inventory_functions import (
    get_all_storage_locations, get_warehouse_structure,
    get_all_suppliers, create_supplier,
    get_part_categories_tree, get_categories_by_type,
    get_all_parts_with_stock, get_part_stock_by_location,
    get_low_stock_parts, search_parts,
    create_stock_movement, get_stock_movements_history,
    get_part_current_prices, get_currency_rates,
    get_inventory_summary
)


# ===== STORAGE LOCATIONS =====

class StorageLocationsView(APIView):
    """Storage locations and warehouse management"""
    
    def get(self, request):
        """Get all storage locations"""
        try:
            locations = get_all_storage_locations()
            return Response({
                'storage_locations': locations,
                'count': len(locations)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get storage locations: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WarehouseStructureView(APIView):
    """Warehouse rack structure"""
    
    def get(self, request):
        """Get warehouse structure organized by shelves and racks"""
        try:
            structure = get_warehouse_structure()
            return Response({
                'warehouse_structure': structure,
                'count': len(structure)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get warehouse structure: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== SUPPLIERS =====

class SuppliersView(APIView):
    """Supplier management"""
    
    def get(self, request):
        """Get all suppliers"""
        try:
            suppliers = get_all_suppliers()
            return Response({
                'suppliers': suppliers,
                'count': len(suppliers)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get suppliers: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new supplier"""
        try:
            supplier_id = create_supplier(request.data)
            return Response({
                'message': 'Supplier created successfully',
                'supplier_id': supplier_id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Failed to create supplier: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== CATEGORIES =====

class CategoriesView(APIView):
    """Part categories management"""
    
    def get(self, request):
        """Get categories tree or by type"""
        try:
            category_type = request.GET.get('type')  # PART or ACCESSORY
            
            if category_type:
                categories = get_categories_by_type(category_type)
            else:
                categories = get_part_categories_tree()
            
            return Response({
                'categories': categories,
                'count': len(categories)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get categories: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== PARTS =====

class PartsView(APIView):
    """Parts management with advanced features"""
    
    def get(self, request):
        """Get parts with stock information"""
        try:
            search_term = request.GET.get('search')
            part_type = request.GET.get('type')  # PART or ACCESSORY
            category_id = request.GET.get('category_id')
            
            if search_term or part_type or category_id:
                # Advanced search
                parts = search_parts(search_term, part_type, 
                                   int(category_id) if category_id else None)
            else:
                # Get all parts
                parts = get_all_parts_with_stock()
            
            return Response({
                'parts': parts,
                'count': len(parts)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get parts: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PartDetailView(APIView):
    """Individual part operations"""
    
    def get(self, request, part_id):
        """Get part stock by location"""
        try:
            stock_locations = get_part_stock_by_location(part_id)
            return Response({
                'part_id': part_id,
                'stock_locations': stock_locations,
                'total_locations': len(stock_locations)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get part stock: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PartPricesView(APIView):
    """Part pricing information"""
    
    def get(self, request, part_id):
        """Get current prices for a part"""
        try:
            prices = get_part_current_prices(part_id)
            return Response({
                'part_id': part_id,
                'prices': prices,
                'count': len(prices)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get part prices: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LowStockView(APIView):
    """Low stock alerts"""
    
    def get(self, request):
        """Get parts with low or critical stock"""
        try:
            low_stock_parts = get_low_stock_parts()
            
            # Separate critical and low stock
            critical_parts = [p for p in low_stock_parts if p['stock_status'] == 'CRITICAL']
            low_parts = [p for p in low_stock_parts if p['stock_status'] == 'LOW']
            
            return Response({
                'critical_stock': critical_parts,
                'low_stock': low_parts,
                'critical_count': len(critical_parts),
                'low_count': len(low_parts),
                'total_alerts': len(low_stock_parts)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get low stock parts: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== STOCK MOVEMENTS =====

class StockMovementsView(APIView):
    """Stock movement management"""
    
    def get(self, request):
        """Get stock movements history"""
        try:
            part_id = request.GET.get('part_id')
            location_id = request.GET.get('location_id')
            limit = int(request.GET.get('limit', 100))
            
            movements = get_stock_movements_history(
                int(part_id) if part_id else None,
                int(location_id) if location_id else None,
                limit
            )
            
            return Response({
                'stock_movements': movements,
                'count': len(movements)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get stock movements: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create stock movement"""
        try:
            part_id = request.data.get('part_id')
            location_id = request.data.get('location_id')
            movement_type = request.data.get('movement_type')  # IN or OUT
            quantity = request.data.get('quantity')
            reference_type = request.data.get('reference_type')
            reference_id = request.data.get('reference_id')
            notes = request.data.get('notes', '')
            user_id = getattr(request.user, 'id', 1)  # From JWT token
            
            if not all([part_id, location_id, movement_type, quantity]):
                return Response({
                    'error': 'Required fields: part_id, location_id, movement_type, quantity'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success = create_stock_movement(
                part_id, location_id, movement_type, quantity,
                reference_type, reference_id, notes, user_id
            )
            
            if success:
                return Response({
                    'message': 'Stock movement created successfully'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': 'Failed to create stock movement'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to create stock movement: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== CURRENCY & PRICING =====

class CurrencyRatesView(APIView):
    """Currency rates information"""
    
    def get(self, request):
        """Get latest currency rates"""
        try:
            rates = get_currency_rates()
            return Response({
                'currency_rates': rates,
                'count': len(rates)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get currency rates: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== ANALYTICS =====

class InventoryDashboardView(APIView):
    """Inventory dashboard and analytics"""
    
    def get(self, request):
        """Get comprehensive inventory summary"""
        try:
            summary = get_inventory_summary()
            low_stock_parts = get_low_stock_parts()
            
            # Recent stock movements (last 10)
            recent_movements = get_stock_movements_history(limit=10)
            
            # Currency rates
            currency_rates = get_currency_rates()
            
            return Response({
                'summary': summary,
                'alerts': {
                    'critical_stock_count': summary['critical_stock_count'],
                    'low_stock_count': summary['low_stock_count'],
                    'total_alerts': len(low_stock_parts)
                },
                'recent_movements': recent_movements,
                'currency_rates': currency_rates
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get inventory dashboard: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== VESPA MODELS =====

class VespaModelsView(APIView):
    """Vespa models management"""
    
    def get(self, request):
        """Get all Vespa models"""
        try:
            from .database import execute_query
            
            query = """
            SELECT 
                vm.id,
                vm.model_name,
                vm.engine_size,
                vm.category,
                vm.model_year as year_from,
                vm.model_year as year_to,
                vm.image_path,
                'No description' as description,
                vm.is_active,
                0 as price,
                vm.created_date,
                vm.updated_date
            FROM vespa_models vm
            WHERE vm.is_active = 1
            ORDER BY vm.model_name
            """
            
            models = execute_query(query)
            
            return Response(models, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get Vespa models: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
