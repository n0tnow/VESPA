"""
Simple customer functions using raw SQL
"""
from .database import execute_query, get_db_connection


def get_all_customers(limit=100, offset=0):
    """Get all customers with pagination"""
    try:
        query = """
        SELECT 
            c.id, c.customer_code, c.first_name, c.last_name,
            c.first_name + ' ' + c.last_name as full_name,
            c.email, c.phone, c.address, c.city, c.district,
            c.status, c.customer_type, c.created_date,
            COUNT(cv.id) as vespa_count
        FROM customers c
        LEFT JOIN customer_vespas cv ON c.id = cv.customer_id AND cv.is_active = 1
        WHERE c.status = 'ACTIVE'
        GROUP BY c.id, c.customer_code, c.first_name, c.last_name, c.email, c.phone, 
                 c.address, c.city, c.district, c.status, c.customer_type, c.created_date
        ORDER BY c.first_name, c.last_name
        OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        """
        
        return execute_query(query, (offset, limit))
    except Exception as e:
        print(f"Error in get_all_customers: {e}")
        return []


def get_customer_by_id(customer_id):
    """Get customer details"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        c.id, c.customer_code, c.first_name, c.last_name,
        c.email, c.phone, c.address, c.city, c.district,
        c.tax_number, c.status, c.customer_type, c.notes,
        c.created_date, c.updated_date
    FROM customers c
    WHERE c.id = ?
    """
    
    cursor.execute(query, (customer_id,))
    row = cursor.fetchone()
    connection.close()
    
    if not row:
        return None
    
    return {
        'id': row[0],
        'customer_code': row[1],
        'first_name': row[2],
        'last_name': row[3],
        'full_name': f"{row[2]} {row[3]}",
        'email': row[4],
        'phone': row[5],
        'address': row[6],
        'city': row[7],
        'district': row[8],
        'tax_number': row[9],
        'status': row[10],
        'customer_type': row[11],
        'notes': row[12],
        'created_date': row[13],
        'updated_date': row[14]
    }


def create_customer(data):
    """Create new customer"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Generate customer code
    code_query = """
    SELECT 'MUS' + FORMAT(ISNULL(MAX(CAST(SUBSTRING(customer_code, 4, 10) AS INT)), 0) + 1, '000000') as new_code
    FROM customers 
    WHERE customer_code LIKE 'MUS%'
    """
    cursor.execute(code_query)
    customer_code = cursor.fetchone()[0]
    
    # Insert customer
    insert_query = """
    INSERT INTO customers (
        customer_code, first_name, last_name, email, phone,
        address, city, district, tax_number, status, customer_type, notes
    ) 
    OUTPUT INSERTED.id
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
    """
    
    cursor.execute(insert_query, (
        customer_code,
        data['first_name'],
        data['last_name'], 
        data.get('email', ''),
        data['phone'],
        data.get('address', ''),
        data.get('city', ''),
        data.get('district', ''),
        data.get('tax_number', ''),
        data.get('customer_type', 'INDIVIDUAL'),
        data.get('notes', '')
    ))
    
    customer_id = cursor.fetchone()[0]
    connection.commit()
    connection.close()
    
    return customer_id


def update_customer(customer_id, data):
    """Update existing customer"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Update customer
    update_query = """
    UPDATE customers SET
        first_name = ?, last_name = ?, email = ?, phone = ?,
        address = ?, city = ?, district = ?, tax_number = ?, 
        status = ?, customer_type = ?, notes = ?,
        updated_date = GETDATE()
    WHERE id = ?
    """
    
    cursor.execute(update_query, (
        data['first_name'],
        data['last_name'], 
        data.get('email', ''),
        data['phone'],
        data.get('address', ''),
        data.get('city', ''),
        data.get('district', ''),
        data.get('tax_number', ''),
        data.get('status', 'ACTIVE'),
        data.get('customer_type', 'INDIVIDUAL'),
        data.get('notes', ''),
        customer_id
    ))
    
    connection.commit()
    connection.close()
    
    return customer_id


def search_customers(search_term):
    """Search customers by name, phone, or license plate"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT DISTINCT
        c.id, c.customer_code, c.first_name, c.last_name,
        c.phone, c.email, c.status
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
    cursor.execute(query, (search_pattern, search_pattern, search_pattern, search_pattern, search_pattern))
    rows = cursor.fetchall()
    connection.close()
    
    customers = []
    for row in rows:
        customers.append({
            'id': row[0],
            'customer_code': row[1],
            'first_name': row[2],
            'last_name': row[3],
            'full_name': f"{row[2]} {row[3]}",
            'phone': row[4],
            'email': row[5],
            'status': row[6]
        })
    
    return customers