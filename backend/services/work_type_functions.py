"""
Work Types Functions - İşlem Türleri Fonksiyonları
MotoEtiler Vespa Servis Yönetim Sistemi
"""

from core.database import DatabaseConnection


def get_work_types():
    """
    Tüm aktif işlem türlerini getir
    Returns: List of work type dictionaries
    """
    try:
        query = """
        SELECT 
            id,
            name,
            base_price,
            description,
            category,
            estimated_duration,
            is_active,
            created_date,
            updated_date
        FROM work_types 
        WHERE is_active = 1
        ORDER BY category, name
        """
        
        result = DatabaseConnection.execute_query(query)
        
        work_types = []
        for row in result:
            work_types.append({
                'id': row['id'],
                'name': row['name'],
                'base_price': float(row['base_price']) if row['base_price'] else 0.0,
                'description': row['description'],
                'category': row['category'],
                'estimated_duration': row['estimated_duration'],
                'is_active': bool(row['is_active']),
                'created_date': row['created_date'].isoformat() if row['created_date'] else None,
                'updated_date': row['updated_date'].isoformat() if row['updated_date'] else None
            })
        
        return work_types
        
    except Exception as e:
        print(f"Error getting work types: {e}")
        return []


def get_work_type_by_id(work_type_id):
    """
    ID'ye göre işlem türü getir
    Args: work_type_id (int)
    Returns: Work type dictionary or None
    """
    try:
        query = """
        SELECT 
            id,
            name,
            base_price,
            description,
            category,
            estimated_duration,
            is_active,
            created_date,
            updated_date
        FROM work_types 
        WHERE id = ? AND is_active = 1
        """
        
        result = DatabaseConnection.execute_query(query, (work_type_id,))
        
        if result:
            row = result[0]
            return {
                'id': row['id'],
                'name': row['name'],
                'base_price': float(row['base_price']) if row['base_price'] else 0.0,
                'description': row['description'],
                'category': row['category'],
                'estimated_duration': row['estimated_duration'],
                'is_active': bool(row['is_active']),
                'created_date': row['created_date'].isoformat() if row['created_date'] else None,
                'updated_date': row['updated_date'].isoformat() if row['updated_date'] else None
            }
        
        return None
        
    except Exception as e:
        print(f"Error getting work type by ID {work_type_id}: {e}")
        return None


def create_work_type(name, base_price, description=None, category=None, estimated_duration=30):
    """
    Yeni işlem türü oluştur
    Args:
        name (str): İşlem adı
        base_price (float): Temel fiyat
        description (str): Açıklama
        category (str): Kategori
        estimated_duration (int): Tahmini süre (dakika)
    Returns: New work type ID or None
    """
    try:
        query = """
        INSERT INTO work_types (name, base_price, description, category, estimated_duration)
        VALUES (?, ?, ?, ?, ?)
        """
        
        affected_rows = DatabaseConnection.execute_command(query, (name, base_price, description, category, estimated_duration))
        
        if affected_rows > 0:
            # Get the newly created ID
            id_query = "SELECT SCOPE_IDENTITY()"
            id_result = DatabaseConnection.execute_scalar(id_query)
            if id_result:
                return int(id_result)
        
        return None
        
    except Exception as e:
        print(f"Error creating work type: {e}")
        return None


def update_work_type(work_type_id, name=None, base_price=None, description=None, category=None, estimated_duration=None):
    """
    İşlem türünü güncelle
    Args:
        work_type_id (int): Work type ID
        name (str): Yeni isim
        base_price (float): Yeni fiyat
        description (str): Yeni açıklama
        category (str): Yeni kategori
        estimated_duration (int): Yeni süre
    Returns: bool (success/failure)
    """
    try:
        # Build dynamic query based on provided fields
        update_fields = []
        params = []
        
        if name is not None:
            update_fields.append("name = ?")
            params.append(name)
        
        if base_price is not None:
            update_fields.append("base_price = ?")
            params.append(base_price)
        
        if description is not None:
            update_fields.append("description = ?")
            params.append(description)
        
        if category is not None:
            update_fields.append("category = ?")
            params.append(category)
        
        if estimated_duration is not None:
            update_fields.append("estimated_duration = ?")
            params.append(estimated_duration)
        
        if not update_fields:
            return False
        
        # Always update the updated_date
        update_fields.append("updated_date = GETDATE()")
        params.append(work_type_id)
        
        query = f"""
        UPDATE work_types 
        SET {', '.join(update_fields)}
        WHERE id = ? AND is_active = 1
        """
        
        affected_rows = DatabaseConnection.execute_command(query, params)
        return affected_rows > 0
        
    except Exception as e:
        print(f"Error updating work type {work_type_id}: {e}")
        return False


def delete_work_type(work_type_id):
    """
    İşlem türünü sil (soft delete - is_active = 0)
    Args: work_type_id (int)
    Returns: bool (success/failure)
    """
    try:
        query = """
        UPDATE work_types 
        SET is_active = 0, updated_date = GETDATE()
        WHERE id = ? AND is_active = 1
        """
        
        affected_rows = DatabaseConnection.execute_command(query, (work_type_id,))
        return affected_rows > 0
        
    except Exception as e:
        print(f"Error deleting work type {work_type_id}: {e}")
        return False


def get_work_types_by_category():
    """
    Kategoriye göre gruplandırılmış işlem türleri
    Returns: Dictionary grouped by category
    """
    try:
        work_types = get_work_types()
        
        grouped = {}
        for work_type in work_types:
            category = work_type['category'] or 'Diğer'
            if category not in grouped:
                grouped[category] = []
            grouped[category].append(work_type)
        
        return grouped
        
    except Exception as e:
        print(f"Error grouping work types by category: {e}")
        return {}


def search_work_types(search_term):
    """
    İşlem türlerinde arama yap
    Args: search_term (str)  
    Returns: List of matching work types
    """
    try:
        query = """
        SELECT 
            id,
            name,
            base_price,
            description,
            category,
            estimated_duration,
            is_active,
            created_date,
            updated_date
        FROM work_types 
        WHERE is_active = 1 
        AND (name LIKE ? OR description LIKE ? OR category LIKE ?)
        ORDER BY category, name
        """
        
        search_pattern = f"%{search_term}%"
        result = DatabaseConnection.execute_query(query, (search_pattern, search_pattern, search_pattern))
        
        work_types = []
        for row in result:
            work_types.append({
                'id': row['id'],
                'name': row['name'],
                'base_price': float(row['base_price']) if row['base_price'] else 0.0,
                'description': row['description'],
                'category': row['category'],
                'estimated_duration': row['estimated_duration'],
                'is_active': bool(row['is_active']),
                'created_date': row['created_date'].isoformat() if row['created_date'] else None,
                'updated_date': row['updated_date'].isoformat() if row['updated_date'] else None
            })
        
        return work_types
        
    except Exception as e:
        print(f"Error searching work types: {e}")
        return []