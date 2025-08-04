"""
Customer SQL Service - Raw SQL operations for customers module
Uses DATABASE.txt tables: customers, customer_vespas, vespa_models
"""
from typing import List, Dict, Any, Optional
from core.base_service import BaseSQLService


class CustomerSQLService(BaseSQLService):
    """Customer management using raw SQL"""
    
    @staticmethod
    def get_all_customers(limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Get all customers with pagination"""
        query = """
        SELECT 
            c.id,
            c.customer_code,
            c.first_name,
            c.last_name,
            c.first_name + ' ' + c.last_name as full_name,
            c.email,
            c.phone,
            c.address,
            c.city,
            c.district,
            c.status,
            c.customer_type,
            c.notes,
            c.created_date,
            c.updated_date,
            COUNT(cv.id) as vespa_count
        FROM customers c
        LEFT JOIN customer_vespas cv ON c.id = cv.customer_id AND cv.is_active = 1
        WHERE c.status = 'ACTIVE'
        GROUP BY c.id, c.customer_code, c.first_name, c.last_name, c.email, c.phone, 
                 c.address, c.city, c.district, c.status, c.customer_type, c.notes, 
                 c.created_date, c.updated_date
        ORDER BY c.first_name, c.last_name
        OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        """
        
        return CustomerSQLService.execute_query(query, (offset, limit))
    
    @staticmethod
    def get_customer_by_id(customer_id: int) -> Optional[Dict[str, Any]]:
        """Get customer details with related data"""
        query = """
        SELECT 
            c.*,
            c.first_name + ' ' + c.last_name as full_name
        FROM customers c
        WHERE c.id = ?
        """
        
        customers = CustomerSQLService.execute_query(query, (customer_id,))
        return customers[0] if customers else None
    
    @staticmethod
    def get_customer_vespas(customer_id: int) -> List[Dict[str, Any]]:
        """Get customer's Vespa motorcycles"""
        query = """
        SELECT 
            cv.id,
            cv.license_plate,
            cv.chassis_number,
            cv.purchase_date,
            cv.current_mileage,
            cv.last_service_date,
            cv.next_service_date,
            cv.service_interval_km,
            cv.notes,
            vm.model_code,
            vm.model_name,
            vm.model_year,
            vm.engine_size,
            vm.category
        FROM customer_vespas cv
        INNER JOIN vespa_models vm ON cv.vespa_model_id = vm.id
        WHERE cv.customer_id = ? AND cv.is_active = 1
        ORDER BY cv.purchase_date DESC
        """
        
        return CustomerSQLService.execute_query(query, (customer_id,))
    
    @staticmethod
    def search_customers(search_term: str) -> List[Dict[str, Any]]:
        """Search customers by name, phone, or license plate"""
        query = """
        SELECT DISTINCT
            c.id,
            c.customer_code,
            c.first_name,
            c.last_name,
            c.first_name + ' ' + c.last_name as full_name,
            c.email,
            c.phone,
            c.status
        FROM customers c
        LEFT JOIN customer_vespas cv ON c.id = cv.customer_id
        WHERE (
            c.first_name LIKE ? OR 
            c.last_name LIKE ? OR 
            c.phone LIKE ? OR
            c.email LIKE ? OR
            cv.license_plate LIKE ?
        ) AND c.status = 'ACTIVE'
        ORDER BY c.first_name, c.last_name
        """
        
        search_pattern = f"%{search_term}%"
        params = (search_pattern, search_pattern, search_pattern, search_pattern, search_pattern)
        
        return CustomerSQLService.execute_query(query, params)
    
    @staticmethod
    def create_customer(data: Dict[str, Any]) -> int:
        """Create new customer"""
        # Generate customer code
        customer_code = CustomerSQLService._generate_customer_code()
        
        customer_data = {
            'customer_code': customer_code,
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'email': data.get('email', ''),
            'phone': data['phone'],
            'address': data.get('address', ''),
            'city': data.get('city', ''),
            'district': data.get('district', ''),
            'tax_number': data.get('tax_number', ''),
            'status': 'ACTIVE',
            'customer_type': data.get('customer_type', 'INDIVIDUAL'),
            'notes': data.get('notes', '')
        }
        
        return CustomerSQLService.insert('customers', customer_data)
    
    @staticmethod
    def update_customer(customer_id: int, data: Dict[str, Any]) -> bool:
        """Update customer information"""
        # Remove fields that shouldn't be updated
        update_data = {k: v for k, v in data.items() 
                      if k not in ['id', 'customer_code', 'created_date']}
        
        affected_rows = CustomerSQLService.update('customers', customer_id, update_data)
        return affected_rows > 0
    
    @staticmethod
    def add_customer_vespa(customer_id: int, vespa_data: Dict[str, Any]) -> int:
        """Add Vespa motorcycle to customer"""
        data = {
            'customer_id': customer_id,
            'vespa_model_id': vespa_data['vespa_model_id'],
            'license_plate': vespa_data['license_plate'],
            'chassis_number': vespa_data.get('chassis_number', ''),
            'purchase_date': vespa_data.get('purchase_date'),
            'current_mileage': vespa_data.get('current_mileage', 0),
            'service_interval_km': vespa_data.get('service_interval_km', 5000),
            'notes': vespa_data.get('notes', ''),
            'is_active': 1
        }
        
        return CustomerSQLService.insert('customer_vespas', data)
    
    @staticmethod
    def _generate_customer_code() -> str:
        """Generate unique customer code"""
        query = """
        SELECT 'MUS' + FORMAT(ISNULL(MAX(CAST(SUBSTRING(customer_code, 4, 10) AS INT)), 0) + 1, '000000') as new_code
        FROM customers 
        WHERE customer_code LIKE 'MUS%'
        """
        
        result = CustomerSQLService.execute_scalar(query)
        return result or 'MUS000001'


class VespaModelSQLService(BaseSQLService):
    """Vespa model operations using raw SQL"""
    
    @staticmethod
    def get_all_models() -> List[Dict[str, Any]]:
        """Get all active Vespa models"""
        query = """
        SELECT 
            id,
            model_code,
            model_name,
            model_year,
            engine_size,
            category,
            image_path
        FROM vespa_models 
        WHERE is_active = 1
        ORDER BY category, model_name
        """
        
        return VespaModelSQLService.execute_query(query)
    
    @staticmethod
    def get_model_by_id(model_id: int) -> Optional[Dict[str, Any]]:
        """Get Vespa model by ID"""
        return VespaModelSQLService.get_by_id('vespa_models', model_id)