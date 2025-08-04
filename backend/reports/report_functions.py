"""
Complex reporting functions using raw SQL
Uses DATABASE.txt views and creates comprehensive analytics
"""
from datetime import datetime, date, timedelta
from .database import execute_query


def get_customer_summary_report():
    """Customer analytics using DATABASE.txt views"""
    try:
        query = """
        SELECT * FROM customer_summary
        ORDER BY total_service_amount DESC
        """
        
        reports = execute_query(query)
        
        # Convert Decimal to float for JSON serialization
        for report in reports:
            for key, value in report.items():
                if hasattr(value, '__float__'):
                    report[key] = float(value)
        
        return reports
        
    except Exception as e:
        print(f"Error in get_customer_summary_report: {e}")
        return []


def get_inventory_summary_report():
    """Inventory analytics using DATABASE.txt views"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT * FROM inventory_summary
    ORDER BY total_stock_value DESC
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    
    columns = [column[0] for column in cursor.description]
    connection.close()
    
    reports = []
    for row in rows:
        report_dict = dict(zip(columns, row))
        for key, value in report_dict.items():
            if hasattr(value, '__float__'):
                report_dict[key] = float(value)
        reports.append(report_dict)
    
    return reports


def get_service_performance_report():
    """Service performance analytics"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT * FROM service_performance_summary
    ORDER BY total_revenue DESC
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    
    columns = [column[0] for column in cursor.description]
    connection.close()
    
    reports = []
    for row in rows:
        report_dict = dict(zip(columns, row))
        for key, value in report_dict.items():
            if hasattr(value, '__float__'):
                report_dict[key] = float(value)
        reports.append(report_dict)
    
    return reports


def get_comprehensive_dashboard():
    """Get all dashboard data"""
    try:
        # Get basic counts
        summary_query = """
        SELECT 
            (SELECT COUNT(*) FROM customers WHERE status = 'ACTIVE') as active_customers,
            (SELECT COUNT(*) FROM parts WHERE is_active = 1) as total_parts,
            (SELECT COUNT(*) FROM service_records WHERE status = 'PENDING') as pending_services,
            (SELECT COUNT(*) FROM appointments WHERE status = 'SCHEDULED' AND appointment_date >= CAST(GETDATE() AS DATE)) as upcoming_appointments,
            (SELECT COUNT(*) FROM invoices WHERE paid_amount < total_amount) as unpaid_invoices
        """
        
        summary_results = execute_query(summary_query)
        summary_data = summary_results[0] if summary_results else {}
        
        # Get financial summary
        financial_query = """
        SELECT 
            SUM(CASE WHEN ct.transaction_type = 'INCOME' AND ct.transaction_date >= DATEADD(month, -1, GETDATE()) THEN ct.amount ELSE 0 END) as monthly_income,
            SUM(CASE WHEN ct.transaction_type = 'EXPENSE' AND ct.transaction_date >= DATEADD(month, -1, GETDATE()) THEN ct.amount ELSE 0 END) as monthly_expenses,
            SUM(CASE WHEN i.paid_amount < i.total_amount THEN (i.total_amount - i.paid_amount) ELSE 0 END) as total_unpaid
        FROM cash_transactions ct
        FULL OUTER JOIN invoices i ON 1=1
        """
        
        financial_results = execute_query(financial_query)
        financial_data = financial_results[0] if financial_results else {}
        
        return {
            'summary': {
                'active_customers': summary_data.get('active_customers', 0),
                'total_parts': summary_data.get('total_parts', 0),
                'pending_services': summary_data.get('pending_services', 0),
                'upcoming_appointments': summary_data.get('upcoming_appointments', 0),
                'unpaid_invoices': summary_data.get('unpaid_invoices', 0)
            },
            'financial': {
                'monthly_income': float(financial_data.get('monthly_income', 0) or 0),
                'monthly_expenses': float(financial_data.get('monthly_expenses', 0) or 0),
                'monthly_profit': float(financial_data.get('monthly_income', 0) or 0) - float(financial_data.get('monthly_expenses', 0) or 0),
                'total_unpaid': float(financial_data.get('total_unpaid', 0) or 0)
            }
        }
        
    except Exception as e:
        print(f"Error in get_comprehensive_dashboard: {e}")
        return {
            'summary': {
                'active_customers': 0,
                'total_parts': 0,
                'pending_services': 0,
                'upcoming_appointments': 0,
                'unpaid_invoices': 0
            },
            'financial': {
                'monthly_income': 0,
                'monthly_expenses': 0,
                'monthly_profit': 0,
                'total_unpaid': 0
            }
        }