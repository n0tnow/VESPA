"""
Complex inventory management functions using raw SQL
Implements DATABASE.txt inventory system with:
- Multi-location stock (warehouse/store with rack system)
- Part categories with hierarchy
- Multi-currency pricing
- Compatibility with Vespa models
- Stock movements tracking
"""
from datetime import datetime
from decimal import Decimal
from .database import get_db_connection


# ===== STORAGE LOCATIONS =====

def get_all_storage_locations():
    """Get all storage locations with warehouse/store structure"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        id, location_code, location_name, location_type,
        shelf_code, rack_number, level_number, description, is_active
    FROM storage_locations 
    WHERE is_active = 1
    ORDER BY location_type, shelf_code, rack_number, level_number
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    connection.close()
    
    locations = []
    for row in rows:
        locations.append({
            'id': row[0],
            'location_code': row[1],
            'location_name': row[2],
            'location_type': row[3],  # STORE or WAREHOUSE
            'shelf_code': row[4],
            'rack_number': row[5],
            'level_number': row[6],
            'description': row[7],
            'is_active': row[8]
        })
    
    return locations


def get_warehouse_structure():
    """Get warehouse structure organized by shelves and racks"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        shelf_code,
        rack_number,
        level_number,
        COUNT(*) as location_count,
        STRING_AGG(location_code, ', ') as location_codes
    FROM storage_locations 
    WHERE location_type = 'WAREHOUSE' AND is_active = 1
    GROUP BY shelf_code, rack_number, level_number
    ORDER BY shelf_code, rack_number, level_number
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    connection.close()
    
    structure = []
    for row in rows:
        structure.append({
            'shelf_code': row[0],
            'rack_number': row[1],
            'level_number': row[2],
            'location_count': row[3],
            'location_codes': row[4]
        })
    
    return structure


# ===== SUPPLIERS =====

def get_all_suppliers():
    """Get all active suppliers"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        id, supplier_name, contact_person, phone, email, 
        address, tax_number, is_active, created_date
    FROM suppliers 
    WHERE is_active = 1
    ORDER BY supplier_name
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    connection.close()
    
    suppliers = []
    for row in rows:
        suppliers.append({
            'id': row[0],
            'supplier_name': row[1],
            'contact_person': row[2],
            'phone': row[3],
            'email': row[4],
            'address': row[5],
            'tax_number': row[6],
            'is_active': row[7],
            'created_date': row[8]
        })
    
    return suppliers


def create_supplier(data):
    """Create new supplier"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    INSERT INTO suppliers (
        supplier_name, contact_person, phone, email, 
        address, tax_number, is_active
    ) 
    OUTPUT INSERTED.id
    VALUES (?, ?, ?, ?, ?, ?, 1)
    """
    
    cursor.execute(query, (
        data['supplier_name'],
        data.get('contact_person', ''),
        data.get('phone', ''),
        data.get('email', ''),
        data.get('address', ''),
        data.get('tax_number', '')
    ))
    
    supplier_id = cursor.fetchone()[0]
    connection.commit()
    connection.close()
    
    return supplier_id


# ===== PART CATEGORIES =====

def get_part_categories_tree():
    """Get part categories in hierarchical structure"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    WITH CategoryHierarchy AS (
        -- Root categories
        SELECT 
            id, category_name, parent_category_id, category_type, 
            sort_order, 0 as level,
            CAST(category_name AS NVARCHAR(MAX)) as hierarchy_path
        FROM part_categories 
        WHERE parent_category_id IS NULL AND is_active = 1
        
        UNION ALL
        
        -- Child categories
        SELECT 
            c.id, c.category_name, c.parent_category_id, c.category_type,
            c.sort_order, ch.level + 1,
            ch.hierarchy_path + ' > ' + c.category_name
        FROM part_categories c
        INNER JOIN CategoryHierarchy ch ON c.parent_category_id = ch.id
        WHERE c.is_active = 1
    )
    SELECT 
        id, category_name, parent_category_id, category_type, 
        sort_order, level, hierarchy_path
    FROM CategoryHierarchy
    ORDER BY level, sort_order, category_name
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    connection.close()
    
    categories = []
    for row in rows:
        categories.append({
            'id': row[0],
            'category_name': row[1],
            'parent_category_id': row[2],
            'category_type': row[3],  # PART or ACCESSORY
            'sort_order': row[4],
            'level': row[5],
            'hierarchy_path': row[6]
        })
    
    return categories


def get_categories_by_type(category_type):
    """Get categories by type (PART or ACCESSORY)"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        id, category_name, parent_category_id, sort_order
    FROM part_categories 
    WHERE category_type = ? AND is_active = 1
    ORDER BY sort_order, category_name
    """
    
    cursor.execute(query, (category_type,))
    rows = cursor.fetchall()
    connection.close()
    
    categories = []
    for row in rows:
        categories.append({
            'id': row[0],
            'category_name': row[1],
            'parent_category_id': row[2],
            'sort_order': row[3]
        })
    
    return categories


# ===== PARTS =====

def get_all_parts_with_stock():
    """Get all parts with total stock from all locations and price information"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        p.id, p.part_code, p.part_name, p.part_type,
        p.category_id, pc.category_name, p.description,
        p.min_stock_level, p.max_stock_level,
        p.brand, p.model, p.color, p.size, p.image_path,
        ISNULL(stock_summary.total_stock, 0) as total_stock,
        ISNULL(stock_summary.total_reserved, 0) as total_reserved,
        ISNULL(stock_summary.available_stock, 0) as available_stock,
        CASE 
            WHEN ISNULL(stock_summary.total_stock, 0) <= 0 THEN 'CRITICAL'
            WHEN ISNULL(stock_summary.total_stock, 0) <= p.min_stock_level THEN 'LOW'
            ELSE 'NORMAL'
        END as stock_status,
        -- Price information
        ISNULL(pp.purchase_price, 0) as purchase_price,
        ISNULL(pp.sale_price, 0) as sale_price,
        ISNULL(pp.currency_type, 'TRY') as currency_type,
        pp.effective_date,
        pp.supplier_id as supplier_id,
        s.supplier_name,
        -- Current exchange rates (latest)
        (SELECT TOP 1 sell_rate FROM currency_rates WHERE currency_code = 'EUR' ORDER BY rate_date DESC) as eur_try_today,
        (SELECT TOP 1 sell_rate FROM currency_rates WHERE currency_code = 'USD' ORDER BY rate_date DESC) as usd_try_today,
        -- Exchange rates on purchase date
        (SELECT TOP 1 sell_rate FROM currency_rates WHERE currency_code = 'EUR' AND rate_date <= pp.effective_date ORDER BY rate_date DESC) as eur_try_on_purchase,
        (SELECT TOP 1 sell_rate FROM currency_rates WHERE currency_code = 'USD' AND rate_date <= pp.effective_date ORDER BY rate_date DESC) as usd_try_on_purchase,
        p.is_active, p.created_date, p.updated_date
    FROM parts p
    INNER JOIN part_categories pc ON p.category_id = pc.id
    LEFT JOIN (
        SELECT 
            part_id,
            SUM(current_stock) as total_stock,
            SUM(reserved_stock) as total_reserved,
            SUM(current_stock - reserved_stock) as available_stock
        FROM part_stock_locations
        GROUP BY part_id
    ) stock_summary ON p.id = stock_summary.part_id
    LEFT JOIN part_prices pp ON p.id = pp.part_id AND pp.is_current = 1
    LEFT JOIN suppliers s ON pp.supplier_id = s.id
    WHERE p.is_active = 1
    ORDER BY p.part_name
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    connection.close()
    
    parts = []
    for row in rows:
        # Extract values (keep indices in sync with SELECT)
        purchase_price = float(row[18]) if row[18] else 0
        sale_price = float(row[19]) if row[19] else 0
        currency_type = row[20] or 'TRY'
        effective_date = row[21]
        supplier_id = row[22]
        supplier_name = row[23]
        eur_try_today = float(row[24]) if row[24] else 35.0
        usd_try_today = float(row[25]) if row[25] else 32.0
        eur_try_on_purchase = float(row[26]) if row[26] else 35.0
        usd_try_on_purchase = float(row[27]) if row[27] else 32.0

        # Calculate TRY prices
        if currency_type == 'EUR':
            purchase_price_try_at_purchase = purchase_price * eur_try_on_purchase
            sale_price_try_today = sale_price * eur_try_today
        elif currency_type == 'USD':
            purchase_price_try_at_purchase = purchase_price * usd_try_on_purchase
            sale_price_try_today = sale_price * usd_try_today
        else:
            # TRY currency
            purchase_price_try_at_purchase = purchase_price
            sale_price_try_today = sale_price

        parts.append({
            'id': row[0],
            'part_code': row[1],
            'part_name': row[2],
            'part_type': row[3],
            'category_id': row[4],
            'category_name': row[5],
            'description': row[6],
            'min_stock_level': row[7],
            'max_stock_level': row[8],
            'brand': row[9],
            'model': row[10],
            'color': row[11],
            'size': row[12],
            'image_path': row[13],
            'total_stock': row[14],
            'total_reserved': row[15],
            'available_stock': row[16],
            'stock_status': row[17],
            'purchase_price': purchase_price,
            'sale_price': sale_price,
            'currency_type': currency_type,
            'effective_date': effective_date,
            'supplier_id': supplier_id,
            'supplier_name': supplier_name,
            # Calculated TRY prices
            'purchase_price_try_at_purchase': round(purchase_price_try_at_purchase, 2),
            'sale_price_try_today': round(sale_price_try_today, 2),
            'eur_try_today': eur_try_today,
            'usd_try_today': usd_try_today,
            'eur_try_on_purchase': eur_try_on_purchase,
            'usd_try_on_purchase': usd_try_on_purchase,
            'is_active': row[28],
            'created_date': row[29],
            'updated_date': row[30]
        })
    
    return parts


def get_parts_by_model_with_stock(vespa_model_id, search_term=None):
    """Get parts compatible with a specific Vespa model (PART type only), including stock and price info.
    Optional search by part name/code/category.
    """
    connection = get_db_connection()
    cursor = connection.cursor()

    where_search = ""
    params = [vespa_model_id]
    if search_term:
        where_search = " AND (p.part_name LIKE ? OR p.part_code LIKE ? OR pc.category_name LIKE ?)"
        like = f"%{search_term}%"
        params.extend([like, like, like])

    query = f"""
    SELECT 
        p.id, p.part_code, p.part_name, p.part_type,
        pc.category_name, p.description,
        ISNULL(stock_summary.total_stock, 0) as total_stock,
        ISNULL(stock_summary.available_stock, 0) as available_stock,
        ISNULL(price_info.sale_price_tl, 0) as sale_price_tl,
        p.image_path
    FROM parts p
    INNER JOIN part_categories pc ON p.category_id = pc.id
    INNER JOIN part_model_compatibility pmc ON pmc.part_id = p.id AND pmc.vespa_model_id = ?
    LEFT JOIN (
        SELECT 
            part_id,
            SUM(current_stock) as total_stock,
            SUM(current_stock - reserved_stock) as available_stock
        FROM part_stock_locations
        GROUP BY part_id
    ) stock_summary ON p.id = stock_summary.part_id
    LEFT JOIN (
        SELECT 
            pp.part_id,
            CASE 
                WHEN pp.currency_type = 'EUR' THEN 
                    pp.sale_price * ISNULL(cr.sell_rate, 34.50)
                WHEN pp.currency_type = 'USD' THEN 
                    pp.sale_price * ISNULL(cr2.sell_rate, 32.00)
                ELSE pp.sale_price 
            END as sale_price_tl
        FROM part_prices pp
        LEFT JOIN currency_rates cr ON pp.currency_type = 'EUR' 
            AND cr.rate_date = (SELECT MAX(rate_date) FROM currency_rates WHERE currency_code = 'EUR')
        LEFT JOIN currency_rates cr2 ON pp.currency_type = 'USD' 
            AND cr2.rate_date = (SELECT MAX(rate_date) FROM currency_rates WHERE currency_code = 'USD')
        WHERE pp.is_current = 1
    ) price_info ON p.id = price_info.part_id
    WHERE p.is_active = 1 AND p.part_type = 'PART' {where_search}
    ORDER BY p.part_name
    """

    cursor.execute(query, params)
    rows = cursor.fetchall()
    connection.close()

    parts = []
    for row in rows:
        parts.append({
            'id': row[0],
            'part_code': row[1],
            'part_name': row[2],
            'part_type': row[3],
            'category_name': row[4],
            'description': row[5],
            'total_stock': row[6],
            'available_stock': row[7],
            'sale_price_tl': float(row[8]) if row[8] else 0.0,
            'image_path': row[9] or ''
        })

    return parts

def get_part_stock_by_location(part_id):
    """Get part stock details by location"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        sl.location_code, sl.location_name, sl.location_type,
        sl.shelf_code, sl.rack_number, sl.level_number,
        psl.current_stock, psl.reserved_stock,
        (psl.current_stock - psl.reserved_stock) as available_stock,
        psl.updated_date
    FROM part_stock_locations psl
    INNER JOIN storage_locations sl ON psl.storage_location_id = sl.id
    WHERE psl.part_id = ? AND sl.is_active = 1
    ORDER BY sl.location_type, sl.shelf_code, sl.rack_number, sl.level_number
    """
    
    cursor.execute(query, (part_id,))
    rows = cursor.fetchall()
    connection.close()
    
    locations = []
    for row in rows:
        locations.append({
            'location_code': row[0],
            'location_name': row[1],
            'location_type': row[2],
            'shelf_code': row[3],
            'rack_number': row[4],
            'level_number': row[5],
            'current_stock': row[6],
            'reserved_stock': row[7],
            'available_stock': row[8],
            'updated_date': row[9]
        })
    
    return locations


def get_low_stock_parts():
    """Get parts with low or critical stock levels"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        p.id, p.part_code, p.part_name, p.part_type,
        pc.category_name, p.min_stock_level,
        ISNULL(stock_summary.total_stock, 0) as total_stock,
        CASE 
            WHEN ISNULL(stock_summary.total_stock, 0) <= p.min_stock_level * 0.5 THEN 'CRITICAL'
            WHEN ISNULL(stock_summary.total_stock, 0) <= p.min_stock_level THEN 'LOW'
        END as stock_status,
        s.supplier_name
    FROM parts p
    INNER JOIN part_categories pc ON p.category_id = pc.id
    LEFT JOIN (
        SELECT part_id, SUM(current_stock) as total_stock
        FROM part_stock_locations
        GROUP BY part_id
    ) stock_summary ON p.id = stock_summary.part_id
    LEFT JOIN part_prices pp ON p.id = pp.part_id AND pp.is_current = 1
    LEFT JOIN suppliers s ON pp.supplier_id = s.id
    WHERE p.is_active = 1 
    AND ISNULL(stock_summary.total_stock, 0) <= p.min_stock_level
    ORDER BY 
        CASE 
            WHEN ISNULL(stock_summary.total_stock, 0) <= p.min_stock_level * 0.5 THEN 1
            ELSE 2
        END,
        p.part_name
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    connection.close()
    
    parts = []
    for row in rows:
        parts.append({
            'id': row[0],
            'part_code': row[1],
            'part_name': row[2],
            'part_type': row[3],
            'category_name': row[4],
            'min_stock_level': row[5],
            'total_stock': row[6],
            'stock_status': row[7],
            'supplier_name': row[8]
        })
    
    return parts


def search_parts(search_term, part_type=None, category_id=None):
    """Advanced part search with filters"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    where_conditions = ["p.is_active = 1"]
    params = []
    
    # Search term
    if search_term:
        where_conditions.append("""
        (p.part_code LIKE ? OR p.part_name LIKE ? OR 
         p.description LIKE ? OR p.brand LIKE ? OR p.model LIKE ?)
        """)
        search_pattern = f"%{search_term}%"
        params.extend([search_pattern] * 5)
    
    # Part type filter
    if part_type:
        where_conditions.append("p.part_type = ?")
        params.append(part_type)
    
    # Category filter
    if category_id:
        where_conditions.append("p.category_id = ?")
        params.append(category_id)
    
    where_clause = " AND ".join(where_conditions)
    
    query = f"""
    SELECT 
        p.id, p.part_code, p.part_name, p.part_type,
        pc.category_name, p.brand, p.model, p.color, p.size,
        ISNULL(stock_summary.total_stock, 0) as total_stock,
        ISNULL(price_info.sale_price_tl, 0) as sale_price_tl,
        s.supplier_name
    FROM parts p
    INNER JOIN part_categories pc ON p.category_id = pc.id
    LEFT JOIN (
        SELECT part_id, SUM(current_stock) as total_stock
        FROM part_stock_locations
        GROUP BY part_id
    ) stock_summary ON p.id = stock_summary.part_id
    LEFT JOIN (
        SELECT 
            pp.part_id,
            CASE 
                WHEN pp.currency_type = 'EUR' THEN 
                    pp.sale_price * ISNULL(cr.sell_rate, 34.50)
                ELSE pp.sale_price 
            END as sale_price_tl
        FROM part_prices pp
        LEFT JOIN currency_rates cr ON pp.currency_type = cr.currency_code 
            AND cr.rate_date = (SELECT MAX(rate_date) FROM currency_rates WHERE currency_code = pp.currency_type)
        WHERE pp.is_current = 1
    ) price_info ON p.id = price_info.part_id
    LEFT JOIN part_prices pp2 ON p.id = pp2.part_id AND pp2.is_current = 1
    LEFT JOIN suppliers s ON pp2.supplier_id = s.id
    WHERE {where_clause}
    ORDER BY p.part_name
    """
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    connection.close()
    
    parts = []
    for row in rows:
        parts.append({
            'id': row[0],
            'part_code': row[1],
            'part_name': row[2],
            'part_type': row[3],
            'category_name': row[4],
            'brand': row[5],
            'model': row[6],
            'color': row[7],
            'size': row[8],
            'total_stock': row[9],
            'sale_price_tl': float(row[10]) if row[10] else 0,
            'supplier_name': row[11]
        })
    
    return parts


# ===== STOCK MOVEMENTS =====

def create_stock_movement(part_id, location_id, movement_type, quantity, reference_type=None, reference_id=None, notes='', user_id=1):
    """Create stock movement and update stock levels"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # Get current stock
        cursor.execute("""
            SELECT current_stock FROM part_stock_locations 
            WHERE part_id = ? AND storage_location_id = ?
        """, (part_id, location_id))
        
        stock_row = cursor.fetchone()
        current_stock = stock_row[0] if stock_row else 0
        
        # Calculate new stock
        if movement_type == 'IN':
            new_stock = current_stock + quantity
        elif movement_type == 'OUT':
            new_stock = current_stock - quantity
            if new_stock < 0:
                raise ValueError("Insufficient stock")
        else:
            new_stock = current_stock
        
        # Insert stock movement record
        cursor.execute("""
            INSERT INTO stock_movements (
                part_id, storage_location_id, movement_type, quantity,
                reference_type, reference_id, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (part_id, location_id, movement_type, quantity, reference_type, reference_id, notes, user_id))
        
        # Update or insert stock location
        cursor.execute("""
            MERGE part_stock_locations AS target
            USING (SELECT ? as part_id, ? as storage_location_id, ? as new_stock) AS source
            ON target.part_id = source.part_id AND target.storage_location_id = source.storage_location_id
            WHEN MATCHED THEN
                UPDATE SET current_stock = source.new_stock, updated_date = GETDATE()
            WHEN NOT MATCHED THEN
                INSERT (part_id, storage_location_id, current_stock, reserved_stock) 
                VALUES (source.part_id, source.storage_location_id, source.new_stock, 0);
        """, (part_id, location_id, new_stock))
        
        connection.commit()
        return True
        
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()


def get_stock_movements_history(part_id=None, location_id=None, limit=100):
    """Get stock movements history with filters"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    where_conditions = []
    params = []
    
    if part_id:
        where_conditions.append("sm.part_id = ?")
        params.append(part_id)
    
    if location_id:
        where_conditions.append("sm.storage_location_id = ?")
        params.append(location_id)
    
    where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
    
    query = f"""
    SELECT TOP {limit}
        sm.id, p.part_code, p.part_name,
        sl.location_code, sl.location_name,
        sm.movement_type, sm.quantity,
        sm.reference_type, sm.reference_id,
        sm.notes, sm.created_date,
        u.full_name as created_by_name
    FROM stock_movements sm
    INNER JOIN parts p ON sm.part_id = p.id
    INNER JOIN storage_locations sl ON sm.storage_location_id = sl.id
    LEFT JOIN users u ON sm.created_by = u.id
    {where_clause}
    ORDER BY sm.created_date DESC
    """
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    connection.close()
    
    movements = []
    for row in rows:
        movements.append({
            'id': row[0],
            'part_code': row[1],
            'part_name': row[2],
            'location_code': row[3],
            'location_name': row[4],
            'movement_type': row[5],
            'quantity': row[6],
            'reference_type': row[7],
            'reference_id': row[8],
            'notes': row[9],
            'created_date': row[10],
            'created_by_name': row[11]
        })
    
    return movements


# ===== PART PRICES =====

def get_part_current_prices(part_id):
    """Get current prices for a part in all currencies"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        pp.currency_type, pp.purchase_price, pp.sale_price,
        s.supplier_name, pp.supplier_part_code,
        CASE 
            WHEN pp.currency_type = 'EUR' THEN 
                pp.sale_price * ISNULL(cr.sell_rate, 34.50)
            ELSE pp.sale_price 
        END as sale_price_tl,
        pp.effective_date
    FROM part_prices pp
    INNER JOIN suppliers s ON pp.supplier_id = s.id
    LEFT JOIN currency_rates cr ON pp.currency_type = cr.currency_code 
        AND cr.rate_date = (SELECT MAX(rate_date) FROM currency_rates WHERE currency_code = pp.currency_type)
    WHERE pp.part_id = ? AND pp.is_current = 1
    ORDER BY pp.currency_type
    """
    
    cursor.execute(query, (part_id,))
    rows = cursor.fetchall()
    connection.close()
    
    prices = []
    for row in rows:
        prices.append({
            'currency_type': row[0],
            'purchase_price': float(row[1]),
            'sale_price': float(row[2]),
            'supplier_name': row[3],
            'supplier_part_code': row[4],
            'sale_price_tl': float(row[5]) if row[5] else 0,
            'effective_date': row[6]
        })
    
    return prices


def get_currency_rates():
    """Get latest currency rates"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        cr.currency_code, cr.buy_rate, cr.sell_rate, cr.rate_date
    FROM currency_rates cr
    INNER JOIN (
        SELECT currency_code, MAX(rate_date) as max_date
        FROM currency_rates
        GROUP BY currency_code
    ) latest ON cr.currency_code = latest.currency_code AND cr.rate_date = latest.max_date
    ORDER BY cr.currency_code
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    connection.close()
    
    rates = []
    for row in rows:
        rates.append({
            'currency_code': row[0],
            'buy_rate': float(row[1]),
            'sell_rate': float(row[2]),
            'rate_date': row[3]
        })
    
    return rates


def update_currency_rates_auto():
    """Auto-update currency rates if needed (called when creating products)"""
    from datetime import date, timedelta
    import requests
    
    connection = get_db_connection()
    cursor = connection.cursor()
    today = date.today()
    
    try:
        # Check if we have today's rates
        cursor.execute("""
            SELECT COUNT(*) FROM currency_rates 
            WHERE rate_date = ? AND currency_code IN ('EUR', 'USD')
        """, (today,))
        
        existing_count = cursor.fetchone()[0]
        
        # If we already have today's rates, skip
        if existing_count >= 2:
            connection.close()
            return True
        
        # Fetch new rates
        eur_rate = None
        usd_rate = None
        
        try:
            # Try to get EUR rate
            eur_response = requests.get('https://api.exchangerate.host/latest?base=EUR&symbols=TRY', timeout=5)
            if eur_response.status_code == 200:
                eur_data = eur_response.json()
                if 'rates' in eur_data and 'TRY' in eur_data['rates']:
                    eur_rate = float(eur_data['rates']['TRY'])
            
            # Try to get USD rate
            usd_response = requests.get('https://api.exchangerate.host/latest?base=USD&symbols=TRY', timeout=5)
            if usd_response.status_code == 200:
                usd_data = usd_response.json()
                if 'rates' in usd_data and 'TRY' in usd_data['rates']:
                    usd_rate = float(usd_data['rates']['TRY'])
        except:
            pass
        
        # Fallback to previous day's rates with small adjustment
        if not eur_rate or not usd_rate:
            cursor.execute("""
                SELECT currency_code, sell_rate 
                FROM currency_rates 
                WHERE currency_code IN ('EUR', 'USD') 
                AND rate_date = (SELECT MAX(rate_date) FROM currency_rates WHERE currency_code = currency_rates.currency_code)
            """)
            previous_rates = cursor.fetchall()
            for rate_row in previous_rates:
                if rate_row[0] == 'EUR' and not eur_rate:
                    eur_rate = float(rate_row[1])
                elif rate_row[0] == 'USD' and not usd_rate:
                    usd_rate = float(rate_row[1])
        
        # Default fallback
        if not eur_rate:
            eur_rate = 35.0
        if not usd_rate:
            usd_rate = 32.0
        
        # Insert today's rates
        if eur_rate:
            cursor.execute("""
                MERGE currency_rates AS t
                USING (SELECT ? AS currency_code, ? AS rate_date) AS s
                ON t.currency_code = s.currency_code AND t.rate_date = s.rate_date
                WHEN MATCHED THEN UPDATE SET buy_rate = ?, sell_rate = ?
                WHEN NOT MATCHED THEN INSERT (currency_code, rate_date, buy_rate, sell_rate) VALUES (?, ?, ?, ?);
            """, ('EUR', today, eur_rate, eur_rate, 'EUR', today, eur_rate, eur_rate))
        
        if usd_rate:
            cursor.execute("""
                MERGE currency_rates AS t
                USING (SELECT ? AS currency_code, ? AS rate_date) AS s
                ON t.currency_code = s.currency_code AND t.rate_date = s.rate_date
                WHEN MATCHED THEN UPDATE SET buy_rate = ?, sell_rate = ?
                WHEN NOT MATCHED THEN INSERT (currency_code, rate_date, buy_rate, sell_rate) VALUES (?, ?, ?, ?);
            """, ('USD', today, usd_rate, usd_rate, 'USD', today, usd_rate, usd_rate))
        
        connection.commit()
        connection.close()
        return True
        
    except Exception as e:
        connection.close()
        print(f"Auto currency update failed: {e}")
        return False


# ===== INVENTORY ANALYTICS =====

def get_inventory_summary():
    """Get comprehensive inventory summary"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        COUNT(DISTINCT p.id) as total_parts,
        COUNT(DISTINCT CASE WHEN p.part_type = 'PART' THEN p.id END) as parts_count,
        COUNT(DISTINCT CASE WHEN p.part_type = 'ACCESSORY' THEN p.id END) as accessories_count,
        COUNT(DISTINCT pc.id) as categories_count,
        COUNT(DISTINCT s.id) as suppliers_count,
        SUM(ISNULL(stock_summary.total_stock, 0)) as total_stock_items,
        COUNT(DISTINCT CASE WHEN ISNULL(stock_summary.total_stock, 0) <= p.min_stock_level * 0.5 THEN p.id END) as critical_stock_count,
        COUNT(DISTINCT CASE WHEN ISNULL(stock_summary.total_stock, 0) <= p.min_stock_level THEN p.id END) as low_stock_count
    FROM parts p
    INNER JOIN part_categories pc ON p.category_id = pc.id
    LEFT JOIN part_prices pp ON p.id = pp.part_id AND pp.is_current = 1
    LEFT JOIN suppliers s ON pp.supplier_id = s.id
    LEFT JOIN (
        SELECT part_id, SUM(current_stock) as total_stock
        FROM part_stock_locations
        GROUP BY part_id
    ) stock_summary ON p.id = stock_summary.part_id
    WHERE p.is_active = 1
    """
    
    cursor.execute(query)
    row = cursor.fetchone()
    connection.close()
    
    return {
        'total_parts': row[0],
        'parts_count': row[1],
        'accessories_count': row[2],
        'categories_count': row[3],
        'suppliers_count': row[4],
        'total_stock_items': row[5],
        'critical_stock_count': row[6],
        'low_stock_count': row[7]
    }