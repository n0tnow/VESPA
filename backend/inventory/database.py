"""
Database connection helper for inventory module
"""
import pyodbc
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


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
    """
    Execute a SQL query and return results as list of dictionaries
    """
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Execute query with optional parameters
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        # Get column names
        columns = [column[0] for column in cursor.description] if cursor.description else []
        
        # Fetch all rows and convert to list of dictionaries
        rows = cursor.fetchall()
        result = []
        
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value
            result.append(row_dict)
        
        cursor.close()
        connection.close()
        
        return result
        
    except Exception as e:
        logger.error(f"Database query error: {str(e)}")
        logger.error(f"Query: {query}")
        raise Exception(f"Database query failed: {str(e)}")


def execute_non_query(query, params=None):
    """
    Execute a non-query SQL command (INSERT, UPDATE, DELETE)
    Returns number of affected rows
    """
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Execute query with optional parameters
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        # Get affected row count
        affected_rows = cursor.rowcount
        
        # Commit the transaction
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return affected_rows
        
    except Exception as e:
        logger.error(f"Database non-query error: {str(e)}")
        logger.error(f"Query: {query}")
        raise Exception(f"Database operation failed: {str(e)}")