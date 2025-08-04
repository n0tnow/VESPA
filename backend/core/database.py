"""
Raw SQL database connection and query execution
Uses DATABASE.txt structure with Windows Authentication
"""
import pyodbc
from django.conf import settings
from typing import List, Dict, Any, Optional


class DatabaseConnection:
    """Raw SQL database connection manager"""
    
    @staticmethod
    def get_connection():
        """Get raw database connection"""
        try:
            # Windows Authentication connection string
            connection_string = (
                f"DRIVER={{ODBC Driver 17 for SQL Server}};"
                f"SERVER={settings.DATABASES['default']['HOST']};"
                f"DATABASE={settings.DATABASES['default']['NAME']};"
                f"Trusted_Connection=yes;"
            )
            return pyodbc.connect(connection_string)
        except Exception as e:
            raise Exception(f"Database connection failed: {str(e)}")

    @staticmethod
    def execute_query(query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Execute SELECT query and return results as list of dictionaries"""
        try:
            with DatabaseConnection.get_connection() as conn:
                cursor = conn.cursor()
                
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                # Get column names
                columns = [column[0] for column in cursor.description]
                
                # Fetch all rows and convert to dictionaries
                rows = cursor.fetchall()
                result = []
                for row in rows:
                    result.append(dict(zip(columns, row)))
                
                return result
                
        except Exception as e:
            raise Exception(f"Query execution failed: {str(e)}")

    @staticmethod
    def execute_command(query: str, params: Optional[tuple] = None) -> int:
        """Execute INSERT/UPDATE/DELETE query and return affected rows count"""
        try:
            with DatabaseConnection.get_connection() as conn:
                cursor = conn.cursor()
                
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                affected_rows = cursor.rowcount
                conn.commit()
                return affected_rows
                
        except Exception as e:
            raise Exception(f"Command execution failed: {str(e)}")

    @staticmethod
    def execute_scalar(query: str, params: Optional[tuple] = None) -> Any:
        """Execute query and return single value"""
        try:
            with DatabaseConnection.get_connection() as conn:
                cursor = conn.cursor()
                
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                result = cursor.fetchone()
                return result[0] if result else None
                
        except Exception as e:
            raise Exception(f"Scalar query execution failed: {str(e)}")