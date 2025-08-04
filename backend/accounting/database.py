"""
Database connection helper for accounting module
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