"""
Base SQL Service class for all modules
Provides common database operations using raw SQL
"""
from typing import List, Dict, Any, Optional
from .database import DatabaseConnection


class BaseSQLService:
    """Base class for all SQL services"""
    
    @staticmethod
    def execute_query(query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Execute SELECT query and return results"""
        return DatabaseConnection.execute_query(query, params)
    
    @staticmethod
    def execute_command(query: str, params: Optional[tuple] = None) -> int:
        """Execute INSERT/UPDATE/DELETE query"""
        return DatabaseConnection.execute_command(query, params)
    
    @staticmethod
    def execute_scalar(query: str, params: Optional[tuple] = None) -> Any:
        """Execute query and return single value"""
        return DatabaseConnection.execute_scalar(query, params)
    
    @staticmethod
    def get_by_id(table_name: str, id_value: int, id_column: str = 'id') -> Optional[Dict[str, Any]]:
        """Get single record by ID"""
        query = f"SELECT * FROM {table_name} WHERE {id_column} = ?"
        results = BaseSQLService.execute_query(query, (id_value,))
        return results[0] if results else None
    
    @staticmethod
    def get_all(table_name: str, where_clause: str = '', params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Get all records from table"""
        query = f"SELECT * FROM {table_name}"
        if where_clause:
            query += f" WHERE {where_clause}"
        query += " ORDER BY id"
        
        return BaseSQLService.execute_query(query, params)
    
    @staticmethod
    def insert(table_name: str, data: Dict[str, Any]) -> int:
        """Insert new record and return ID"""
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['?' for _ in data])
        values = tuple(data.values())
        
        query = f"""
        INSERT INTO {table_name} ({columns}) 
        OUTPUT INSERTED.id 
        VALUES ({placeholders})
        """
        
        return BaseSQLService.execute_scalar(query, values)
    
    @staticmethod
    def update(table_name: str, id_value: int, data: Dict[str, Any], id_column: str = 'id') -> int:
        """Update record by ID"""
        set_clause = ', '.join([f"{key} = ?" for key in data.keys()])
        values = tuple(data.values()) + (id_value,)
        
        query = f"UPDATE {table_name} SET {set_clause} WHERE {id_column} = ?"
        
        return BaseSQLService.execute_command(query, values)
    
    @staticmethod
    def delete(table_name: str, id_value: int, id_column: str = 'id') -> int:
        """Delete record by ID"""
        query = f"DELETE FROM {table_name} WHERE {id_column} = ?"
        return BaseSQLService.execute_command(query, (id_value,))
    
    @staticmethod
    def exists(table_name: str, where_clause: str, params: Optional[tuple] = None) -> bool:
        """Check if record exists"""
        query = f"SELECT COUNT(*) FROM {table_name} WHERE {where_clause}"
        count = BaseSQLService.execute_scalar(query, params)
        return count > 0