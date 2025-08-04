"""
Database connection helper for reports module
"""
import pyodbc
from django.conf import settings


def get_db_connection():
    """Get raw database connection using Windows Authentication"""
    connection_string = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={settings.DATABASES['default']['HOST']};"
        f"DATABASE={settings.DATABASES['default']['NAME']};"
        f"Trusted_Connection=yes;"
    )
    return pyodbc.connect(connection_string)


def execute_query(query, params=None):
    """Execute SQL query and return results"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(query, params or ())
        
        if query.strip().upper().startswith("SELECT"):
            columns = [column[0] for column in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.commit()
        return cursor.rowcount
        
    except pyodbc.Error as ex:
        sqlstate = ex.args[0] if ex.args else 'Unknown'
        if sqlstate == '23000':
            raise ValueError("Database integrity error: Duplicate entry or foreign key violation.")
        raise Exception(f"Database error: {str(ex)}")
    finally:
        if conn:
            conn.close()