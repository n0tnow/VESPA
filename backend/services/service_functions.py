"""
Complex service management functions using raw SQL
Implements DATABASE.txt service system with:
- Service records with parts tracking
- Paint job management with 2D templates
- Service cost calculations
- Service history and analytics
"""
from datetime import datetime, date
from .database import get_db_connection

# Cache flag to avoid recreating tables on every call
_SERVICE_TABLES_ENSURED = False
_DEFAULT_STORAGE_LOCATION_ID = None


def _ensure_service_work_items_table():
    """Ensure service_work_items table exists (SQL Server)."""
    global _SERVICE_TABLES_ENSURED
    if _SERVICE_TABLES_ENSURED:
        return
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
            IF NOT EXISTS (
                SELECT * FROM sys.objects 
                WHERE object_id = OBJECT_ID(N'[dbo].[service_work_items]') AND type in (N'U')
            )
            BEGIN
                CREATE TABLE [dbo].[service_work_items] (
                    [id] INT IDENTITY(1,1) PRIMARY KEY,
                    [service_record_id] INT NOT NULL,
                    [work_type_id] INT NOT NULL,
                    [quantity] INT NOT NULL DEFAULT 1,
                    [unit_price] DECIMAL(10,2) NOT NULL,
                    [line_total] DECIMAL(10,2) NOT NULL,
                    [notes] NVARCHAR(MAX) NULL,
                    [created_date] DATETIME2 DEFAULT GETDATE(),
                    CONSTRAINT FK_swi_service FOREIGN KEY ([service_record_id]) REFERENCES [dbo].[service_records]([id]) ON DELETE CASCADE,
                    CONSTRAINT FK_swi_work_type FOREIGN KEY ([work_type_id]) REFERENCES [dbo].[work_types]([id])
                )
            END
            """
        )
        connection.commit()
        _SERVICE_TABLES_ENSURED = True
    finally:
        connection.close()


def _get_default_storage_location_id():
    """Pick a default storage location id to register stock movements.
    Preference order: STORE then any available location. Cached after first lookup.
    """
    global _DEFAULT_STORAGE_LOCATION_ID
    if _DEFAULT_STORAGE_LOCATION_ID is not None:
        return _DEFAULT_STORAGE_LOCATION_ID
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            SELECT TOP 1 id FROM storage_locations 
            WHERE location_type = 'STORE' 
            ORDER BY id ASC
        """)
        row = cursor.fetchone()
        if not row:
            cursor.execute("SELECT TOP 1 id FROM storage_locations ORDER BY id ASC")
            row = cursor.fetchone()
        _DEFAULT_STORAGE_LOCATION_ID = row[0] if row else None
        return _DEFAULT_STORAGE_LOCATION_ID
    finally:
        connection.close()


# ===== SERVICE RECORDS =====

def get_all_service_records(limit=100, offset=0, status_filter=None, customer_id=None, vespa_id=None):
    """Get service records with customer and vespa info"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    where_conditions = []
    params = []
    
    if status_filter:
        where_conditions.append("sr.status = ?")
        params.append(status_filter)
    
    if customer_id:
        where_conditions.append("c.id = ?")
        params.append(customer_id)
    
    if vespa_id:
        where_conditions.append("cv.id = ?")
        params.append(vespa_id)
    
    where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
    
    query = f"""
    SELECT 
        sr.id, sr.service_number, sr.service_type, sr.service_date,
        sr.status, sr.description, sr.customer_complaints, sr.work_done,
        sr.labor_cost, sr.start_date, sr.completion_date,
        sr.technician_name, sr.mileage_at_service,
        c.first_name + ' ' + c.last_name as customer_name,
        c.phone as customer_phone,
        cv.license_plate,
        vm.model_name,
        ISNULL(parts_total.total_parts_cost, 0) as parts_cost,
        ISNULL(wi_total.total_work_items_cost, 0) as work_items_cost,
        (sr.labor_cost + ISNULL(parts_total.total_parts_cost, 0) + ISNULL(wi_total.total_work_items_cost, 0)) as total_cost,
        c.id as customer_id,
        cv.id as customer_vespa_id
    FROM service_records sr
    INNER JOIN customer_vespas cv ON sr.customer_vespa_id = cv.id
    INNER JOIN customers c ON cv.customer_id = c.id
    INNER JOIN vespa_models vm ON cv.vespa_model_id = vm.id
    LEFT JOIN (
        SELECT 
            service_record_id,
            SUM(quantity * unit_price) as total_parts_cost
        FROM service_parts 
        GROUP BY service_record_id
    ) parts_total ON sr.id = parts_total.service_record_id
    LEFT JOIN (
        SELECT 
            service_record_id,
            SUM(line_total) as total_work_items_cost
        FROM service_work_items
        GROUP BY service_record_id
    ) wi_total ON sr.id = wi_total.service_record_id
    {where_clause}
    ORDER BY sr.service_date DESC, sr.created_date DESC
    OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    """
    
    params.extend([offset, limit])
    cursor.execute(query, params)
    rows = cursor.fetchall()
    connection.close()
    
    services = []
    for row in rows:
        services.append({
            'id': row[0],
            'service_number': row[1],
            'service_type': row[2],
            'service_date': row[3],
            'status': row[4],
            'description': row[5],
            'customer_complaints': row[6],
            'work_done': row[7],
            'labor_cost': float(row[8]) if row[8] else 0,
            'start_date': row[9],
            'completion_date': row[10],
            'technician_name': row[11],
            'mileage_at_service': row[12],
            'customer_name': row[13],
            'customer_phone': row[14],
            'license_plate': row[15],
            'model_name': row[16],
            'parts_cost': float(row[17]) if row[17] else 0,
            'work_items_cost': float(row[18]) if row[18] else 0,
            'total_cost': float(row[19]) if row[19] else 0,
            'customer_id': row[20],
            'customer_vespa_id': row[21]
        })
    
    return services


def get_service_by_id(service_id):
    """Get detailed service record with parts"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Get service details
    service_query = """
    SELECT 
        sr.id, sr.service_number, sr.service_type, sr.service_date,
        sr.status, sr.description, sr.customer_complaints, sr.work_done,
        sr.labor_cost, sr.start_date, sr.completion_date,
        sr.technician_name, sr.mileage_at_service, sr.next_service_date, sr.next_service_km,
        c.id as customer_id, c.first_name + ' ' + c.last_name as customer_name,
        c.phone as customer_phone, c.email as customer_email,
        cv.id as vespa_id, cv.license_plate, cv.chassis_number, cv.current_mileage,
        vm.model_name, vm.engine_size, vm.category
    FROM service_records sr
    INNER JOIN customer_vespas cv ON sr.customer_vespa_id = cv.id
    INNER JOIN customers c ON cv.customer_id = c.id
    INNER JOIN vespa_models vm ON cv.vespa_model_id = vm.id
    WHERE sr.id = ?
    """
    
    cursor.execute(service_query, (service_id,))
    service_row = cursor.fetchone()
    
    if not service_row:
        connection.close()
        return None
    
    # Get service parts
    parts_query = """
    SELECT 
        sp.part_id, sp.quantity, sp.unit_price, sp.currency_type,
        p.part_code, p.part_name, p.part_type,
        pc.category_name
    FROM service_parts sp
    INNER JOIN parts p ON sp.part_id = p.id
    INNER JOIN part_categories pc ON p.category_id = pc.id
    WHERE sp.service_record_id = ?
    ORDER BY p.part_name
    """
    
    cursor.execute(parts_query, (service_id,))
    parts_rows = cursor.fetchall()

    # Get work items
    work_items_query = """
    IF OBJECT_ID('dbo.service_work_items', 'U') IS NOT NULL
    SELECT 
        swi.work_type_id, wt.name, wt.base_price, swi.quantity, swi.unit_price, swi.line_total
    FROM service_work_items swi
    INNER JOIN work_types wt ON swi.work_type_id = wt.id
    WHERE swi.service_record_id = ?
    ORDER BY wt.name
    ELSE
    SELECT NULL, NULL, NULL, NULL, NULL, NULL
    """
    cursor.execute(work_items_query, (service_id,))
    work_items_rows = cursor.fetchall()
    connection.close()
    
    service = {
        'id': service_row[0],
        'service_number': service_row[1],
        'service_type': service_row[2],
        'service_date': service_row[3],
        'status': service_row[4],
        'description': service_row[5],
        'customer_complaints': service_row[6],
        'work_done': service_row[7],
        'labor_cost': float(service_row[8]) if service_row[8] else 0,
        'start_date': service_row[9],
        'completion_date': service_row[10],
        'technician_name': service_row[11],
        'mileage_at_service': service_row[12],
        'next_service_date': service_row[13],
        'next_service_km': service_row[14],
        'customer': {
            'id': service_row[15],
            'name': service_row[16],
            'phone': service_row[17],
            'email': service_row[18]
        },
        'vespa': {
            'id': service_row[19],
            'license_plate': service_row[20],
            'chassis_number': service_row[21],
            'current_mileage': service_row[22],
            'model_name': service_row[23],
            'engine_size': service_row[24],
            'category': service_row[25]
        },
        'parts': []
    }
    
    total_parts_cost = 0.0
    for part_row in parts_rows:
        quantity = int(part_row[1]) if part_row[1] else 0
        unit_price = float(part_row[2]) if part_row[2] else 0.0
        part_total = quantity * unit_price
        total_parts_cost += part_total
        
        service['parts'].append({
            'part_id': part_row[0],  # This is now sp.part_id (correct!)
            'quantity': quantity,
            'unit_price': unit_price,
            'currency_type': part_row[3],
            'part_code': part_row[4],
            'part_name': part_row[5],
            'part_type': part_row[6],
            'category_name': part_row[7],
            'total_price': part_total
        })
    
    # Map work items
    work_items = []
    total_work_items_cost = 0.0
    # If table doesn't exist, rows will be a single NULL row; guard that
    if work_items_rows and not (len(work_items_rows) == 1 and all(v is None for v in work_items_rows[0])):
        for wi in work_items_rows:
            qty = int(wi[3]) if wi[3] else 0
            unit_price = float(wi[4]) if wi[4] else 0.0
            line_total = float(wi[5]) if wi[5] else qty * unit_price
            total_work_items_cost += line_total
            work_items.append({
                'work_type_id': wi[0],
                'name': wi[1],
                'base_price': float(wi[2]) if wi[2] else unit_price,
                'quantity': qty,
                'unit_price': unit_price,
                'line_total': line_total,
            })

    service['work_items'] = work_items
    service['work_items_cost'] = total_work_items_cost
    service['parts_cost'] = total_parts_cost
    service['total_cost'] = float(service['labor_cost']) + total_parts_cost + total_work_items_cost
    
    return service


def _get_all_locations_by_priority(cursor):
    """Return list of (id, location_type) ordered by priority: STORE first, then others."""
    cursor.execute("""
        SELECT id, location_type FROM storage_locations
        ORDER BY CASE WHEN location_type='STORE' THEN 0 ELSE 1 END, id
    """)
    return cursor.fetchall() or []


def _get_available_qty(cursor, part_id, location_id):
    """Compute available quantity at a location using stock_movements (IN - OUT)."""
    cursor.execute(
        """
        SELECT SUM(CASE WHEN movement_type='IN' THEN quantity
                        WHEN movement_type='OUT' THEN -quantity
                        WHEN movement_type='ADJUSTMENT' THEN quantity
                        ELSE 0 END) as qty
        FROM stock_movements WHERE part_id = ? AND storage_location_id = ?
        """,
        (part_id, location_id)
    )
    row = cursor.fetchone()
    return int(row[0]) if row and row[0] is not None else 0


def _allocate_and_register_stock_out(cursor, service_id, service_number, part_id, required_qty, warnings_accumulator):
    """Allocate stock OUT movements prioritizing STORE, then other locations. Append warnings as needed."""
    locations = _get_all_locations_by_priority(cursor)
    remaining = int(required_qty)
    total_available = 0
    store_available = 0
    for loc_id, loc_type in locations:
        avail = _get_available_qty(cursor, part_id, loc_id)
        total_available += max(0, avail)
        if loc_type == 'STORE':
            store_available = max(0, avail)

    if total_available < remaining:
        warnings_accumulator.append(f"Yetersiz stok: Parça {part_id} için ihtiyaç {remaining}, mevcut {total_available} (Mağaza {store_available}).")
        # yine de mevcut kadar düşmeyelim; servis kaydı tutarlılığı için istisna atalım
        raise Exception(f"Insufficient stock for part {part_id}: required {remaining}, available {total_available}")

    # Allocate from STORE first
    for loc_id, loc_type in locations:
        if remaining <= 0:
            break
        avail = _get_available_qty(cursor, part_id, loc_id)
        take = min(max(0, avail), remaining)
        if take > 0:
            cursor.execute(
                """
                INSERT INTO stock_movements (
                    part_id, storage_location_id, movement_type, quantity,
                    reference_type, reference_id, description
                ) VALUES (?, ?, 'OUT', ?, 'SERVICE', ?, ?)
                """,
                (
                    part_id,
                    loc_id,
                    int(take),
                    service_id,
                    f"Service #{service_number} parça tüketimi"
                )
            )
            remaining -= take

    if store_available < required_qty and total_available >= required_qty:
        warnings_accumulator.append(f"Mağazada stok yetersiz (var: {store_available}), depo kullanıldı. Parça {part_id} için toplam {required_qty} düşüldü.")


def create_service_record(data):
    """Create new service record with parts"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # Generate service number
        service_number = _generate_service_number()
        
        insert_query = """
        INSERT INTO service_records (
            service_number, customer_vespa_id, service_type, service_date,
            mileage_at_service, technician_name, status, description,
            customer_complaints, work_done, labor_cost, start_date
        ) 
        OUTPUT INSERTED.id
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)
        """
        
        cursor.execute(insert_query, (
            service_number,
            data['customer_vespa_id'],
            data['service_type'],
            data.get('service_date', date.today()),
            data.get('mileage_at_service', 0),
            data.get('technician_name', ''),
            data.get('description', ''),
            data.get('customer_complaints', ''),
            data.get('work_done', ''),
            float(data.get('labor_cost', 0)),
            data.get('start_date', datetime.now())
        ))
        
        service_id = cursor.fetchone()[0]
        
        # Ensure work items table exists (no-op if already exists)
        _ensure_service_work_items_table()

        # Add used parts if provided
        used_parts = data.get('used_parts', [])
        warnings = []
        if used_parts:
            for part_data in used_parts:
                print(f"🔧 Processing part: ID={part_data['part_id']}, Quantity={part_data['quantity']}, Cost={part_data.get('cost', 0)}")
                
                # Verify part exists
                cursor.execute("SELECT id, part_name FROM parts WHERE id = ?", (part_data['part_id'],))
                part_exists = cursor.fetchone()
                if not part_exists:
                    print(f"❌ ERROR: Part ID {part_data['part_id']} does not exist in parts table!")
                    raise Exception(f"Part ID {part_data['part_id']} not found in parts table")
                
                print(f"✅ Part exists: {part_exists[1]} (ID: {part_exists[0]})")
                
                unit_price = 0
                if part_data['quantity'] > 0:
                    cost = float(part_data.get('cost', 0))
                    unit_price = cost / part_data['quantity']
                
                cursor.execute("""
                    INSERT INTO service_parts (
                        service_record_id, part_id, quantity, unit_price, currency_type
                    ) VALUES (?, ?, ?, ?, ?)
                """, (
                    service_id,
                    part_data['part_id'],
                    part_data['quantity'],
                    float(unit_price),
                    'TRY'
                ))
                # Allocate stock OUT across locations with warnings
                _allocate_and_register_stock_out(cursor, service_id, service_number, part_data['part_id'], part_data['quantity'], warnings)
        # Add work items if provided
        work_items = data.get('work_items', [])
        if work_items:
            for wi in work_items:
                work_type_id = wi.get('work_type_id') or wi.get('id')
                quantity = int(wi.get('quantity') or 1)
                # Validate work type
                cursor.execute("SELECT id, name, base_price FROM work_types WHERE id = ?", (work_type_id,))
                wt = cursor.fetchone()
                if not wt:
                    raise Exception(f"Work type ID {work_type_id} not found in work_types table")
                base_price = float(wt[2]) if wt[2] else 0.0
                provided_cost = wi.get('cost')
                line_total = float(provided_cost) if provided_cost is not None else (base_price * quantity)
                unit_price = line_total / quantity if quantity > 0 else 0.0
                cursor.execute(
                    """
                    INSERT INTO service_work_items (
                        service_record_id, work_type_id, quantity, unit_price, line_total
                    ) VALUES (?, ?, ?, ?, ?)
                    """,
                    (service_id, work_type_id, quantity, float(unit_price), float(line_total))
                )
        connection.commit()
        # Return id and warnings for response
        return {'service_id': service_id, 'warnings': warnings}
        
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()


def update_service_record(service_id, data):
    """Update complete service record with parts"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # Update service record
        # Normalize status and completion date
        status_value = data.get('status')
        normalized_status = status_value.upper() if isinstance(status_value, str) else None
        provided_completion = data.get('completion_date')
        completion_dt = provided_completion if provided_completion else (datetime.now() if normalized_status == 'COMPLETED' else None)

        update_query = """
        UPDATE service_records SET
            service_type = ?, service_date = ?, mileage_at_service = ?,
            technician_name = ?, description = ?, customer_complaints = ?,
            work_done = ?, labor_cost = ?, status = ISNULL(?, status),
            completion_date = ?, updated_date = ?
        WHERE id = ?
        """
        
        cursor.execute(update_query, (
            data.get('service_type'),
            data.get('service_date'),
            data.get('mileage_at_service', 0),
            data.get('technician_name', ''),
            data.get('description', ''),
            data.get('customer_complaints', ''),
            data.get('work_done', ''),
            float(data.get('labor_cost', 0)),
            normalized_status,
            completion_dt,
            datetime.now(),
            service_id
        ))
        
        # Ensure work items table exists (no-op if already exists)
        _ensure_service_work_items_table()

        # Delete existing service parts
        cursor.execute("DELETE FROM service_parts WHERE service_record_id = ?", (service_id,))
        # Delete previous stock movements for this service
        cursor.execute("DELETE FROM stock_movements WHERE reference_type = 'SERVICE' AND reference_id = ?", (service_id,))
        # Delete existing work items
        cursor.execute("IF OBJECT_ID('dbo.service_work_items','U') IS NOT NULL DELETE FROM service_work_items WHERE service_record_id = ?", (service_id,))
        
        # Add updated parts if provided
        used_parts = data.get('used_parts', [])
        warnings = []
        if used_parts:
            for part_data in used_parts:
                print(f"🔧 UPDATE: Processing part: ID={part_data['part_id']}, Quantity={part_data['quantity']}, Cost={part_data.get('cost', 0)}")
                
                # Verify part exists
                cursor.execute("SELECT id, part_name FROM parts WHERE id = ?", (part_data['part_id'],))
                part_exists = cursor.fetchone()
                if not part_exists:
                    print(f"❌ UPDATE ERROR: Part ID {part_data['part_id']} does not exist in parts table!")
                    raise Exception(f"Part ID {part_data['part_id']} not found in parts table")
                
                print(f"✅ UPDATE: Part exists: {part_exists[1]} (ID: {part_exists[0]})")
                
                unit_price = 0
                if part_data['quantity'] > 0:
                    cost = float(part_data.get('cost', 0))
                    unit_price = cost / part_data['quantity']
                
                cursor.execute("""
                    INSERT INTO service_parts (
                        service_record_id, part_id, quantity, unit_price, currency_type
                    ) VALUES (?, ?, ?, ?, ?)
                """, (
                    service_id,
                    part_data['part_id'],
                    part_data['quantity'],
                    float(unit_price),
                    'TRY'
                ))
                # Register stock OUT movement
                _allocate_and_register_stock_out(cursor, service_id, f"UPDATE-{service_id}", part_data['part_id'], part_data['quantity'], warnings)
        # Add updated work items if provided
        work_items = data.get('work_items', [])
        if work_items:
            for wi in work_items:
                work_type_id = wi.get('work_type_id') or wi.get('id')
                quantity = int(wi.get('quantity') or 1)
                # Validate work type
                cursor.execute("SELECT id, name, base_price FROM work_types WHERE id = ?", (work_type_id,))
                wt = cursor.fetchone()
                if not wt:
                    raise Exception(f"Work type ID {work_type_id} not found in work_types table")
                base_price = float(wt[2]) if wt[2] else 0.0
                provided_cost = wi.get('cost')
                line_total = float(provided_cost) if provided_cost is not None else (base_price * quantity)
                unit_price = line_total / quantity if quantity > 0 else 0.0
                cursor.execute(
                    """
                    INSERT INTO service_work_items (
                        service_record_id, work_type_id, quantity, unit_price, line_total
                    ) VALUES (?, ?, ?, ?, ?)
                    """,
                    (service_id, work_type_id, quantity, float(unit_price), float(line_total))
                )
        
        connection.commit()
        return {'success': True, 'warnings': warnings}
        
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()


def update_service_status(service_id, status, completion_date=None, work_done=''):
    """Update service status and completion info"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    update_data = {
        'status': status,
        'updated_date': datetime.now()
    }
    
    if completion_date:
        update_data['completion_date'] = completion_date
    
    if work_done:
        update_data['work_done'] = work_done
    
    set_clause = ', '.join([f"{key} = ?" for key in update_data.keys()])
    values = list(update_data.values()) + [service_id]
    
    query = f"UPDATE service_records SET {set_clause} WHERE id = ?"
    
    cursor.execute(query, values)
    affected_rows = cursor.rowcount
    connection.commit()
    connection.close()
    
    return affected_rows > 0


def add_service_parts(service_id, parts_list):
    """Add multiple parts to service record"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        for part_data in parts_list:
            cursor.execute("""
                INSERT INTO service_parts (
                    service_record_id, part_id, quantity, unit_price, currency_type
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                service_id,
                part_data['part_id'],
                part_data['quantity'],
                part_data['unit_price'],
                part_data.get('currency_type', 'TRY')
            ))
        
        connection.commit()
        return True
        
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()


def _generate_service_number():
    """Generate unique service number"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 'SRV' + FORMAT(GETDATE(), 'yyyyMMdd') + 
           FORMAT(ISNULL(MAX(CAST(RIGHT(service_number, 3) AS INT)), 0) + 1, '000') as new_number
    FROM service_records 
    WHERE service_number LIKE 'SRV' + FORMAT(GETDATE(), 'yyyyMMdd') + '%'
    """
    
    cursor.execute(query)
    result = cursor.fetchone()[0]
    connection.close()
    
    return result


# ===== PAINT JOBS =====

def get_paint_templates_by_model(vespa_model_id):
    """Get available paint templates for a Vespa model"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        pt.id, pt.template_name, pt.svg_template_path,
        vm.model_name, vm.category,
        COUNT(ptp.id) as parts_count
    FROM paint_templates pt
    INNER JOIN vespa_models vm ON pt.vespa_model_id = vm.id
    LEFT JOIN paint_template_parts ptp ON pt.id = ptp.paint_template_id
    WHERE pt.vespa_model_id = ? AND pt.is_active = 1
    GROUP BY pt.id, pt.template_name, pt.svg_template_path, vm.model_name, vm.category
    ORDER BY pt.template_name
    """
    
    cursor.execute(query, (vespa_model_id,))
    rows = cursor.fetchall()
    connection.close()
    
    templates = []
    for row in rows:
        templates.append({
            'id': row[0],
            'template_name': row[1],
            'svg_template_path': row[2],
            'model_name': row[3],
            'category': row[4],
            'parts_count': row[5]
        })
    
    return templates


def get_paint_template_parts(template_id):
    """Get template parts with coordinates for 2D paint system"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        id, part_name, svg_element_id, coordinates_x, coordinates_y, sort_order
    FROM paint_template_parts 
    WHERE paint_template_id = ?
    ORDER BY sort_order, part_name
    """
    
    cursor.execute(query, (template_id,))
    rows = cursor.fetchall()
    connection.close()
    
    parts = []
    for row in rows:
        parts.append({
            'id': row[0],
            'part_name': row[1],
            'svg_element_id': row[2],
            'coordinates_x': row[3],
            'coordinates_y': row[4],
            'sort_order': row[5]
        })
    
    return parts


def create_paint_job(service_id, template_id, selected_parts, estimated_cost):
    """Create paint job with selected parts and colors"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # Create paint job
        cursor.execute("""
            INSERT INTO paint_jobs (
                service_record_id, paint_template_id, estimated_cost, status
            ) 
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, 'PLANNED')
        """, (service_id, template_id, estimated_cost))
        
        paint_job_id = cursor.fetchone()[0]
        
        # Add selected parts with colors
        for part_data in selected_parts:
            cursor.execute("""
                INSERT INTO paint_job_parts (
                    paint_job_id, paint_template_part_id, selected_color,
                    color_name, estimated_cost
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                paint_job_id,
                part_data['template_part_id'],
                part_data['color_code'],
                part_data['color_name'],
                part_data['estimated_cost']
            ))
        
        connection.commit()
        return paint_job_id
        
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()


def get_paint_job_details(paint_job_id):
    """Get paint job with selected parts and colors"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Get paint job info
    job_query = """
    SELECT 
        pj.id, pj.estimated_cost, pj.actual_cost, pj.status,
        pj.painter_name, pj.completion_date,
        pt.template_name, pt.svg_template_path,
        sr.service_number
    FROM paint_jobs pj
    INNER JOIN paint_templates pt ON pj.paint_template_id = pt.id
    INNER JOIN service_records sr ON pj.service_record_id = sr.id
    WHERE pj.id = ?
    """
    
    cursor.execute(job_query, (paint_job_id,))
    job_row = cursor.fetchone()
    
    if not job_row:
        connection.close()
        return None
    
    # Get selected parts
    parts_query = """
    SELECT 
        pjp.id, pjp.selected_color, pjp.color_name, 
        pjp.estimated_cost, pjp.actual_cost,
        ptp.part_name, ptp.svg_element_id,
        ptp.coordinates_x, ptp.coordinates_y
    FROM paint_job_parts pjp
    INNER JOIN paint_template_parts ptp ON pjp.paint_template_part_id = ptp.id
    WHERE pjp.paint_job_id = ?
    ORDER BY ptp.sort_order, ptp.part_name
    """
    
    cursor.execute(parts_query, (paint_job_id,))
    parts_rows = cursor.fetchall()
    connection.close()
    
    paint_job = {
        'id': job_row[0],
        'estimated_cost': float(job_row[1]) if job_row[1] else 0,
        'actual_cost': float(job_row[2]) if job_row[2] else 0,
        'status': job_row[3],
        'painter_name': job_row[4],
        'completion_date': job_row[5],
        'template_name': job_row[6],
        'svg_template_path': job_row[7],
        'service_number': job_row[8],
        'parts': []
    }
    
    for part_row in parts_rows:
        paint_job['parts'].append({
            'id': part_row[0],
            'selected_color': part_row[1],
            'color_name': part_row[2],
            'estimated_cost': float(part_row[3]) if part_row[3] else 0,
            'actual_cost': float(part_row[4]) if part_row[4] else 0,
            'part_name': part_row[5],
            'svg_element_id': part_row[6],
            'coordinates_x': part_row[7],
            'coordinates_y': part_row[8]
        })
    
    return paint_job


# ===== SERVICE ANALYTICS =====

def get_service_summary():
    """Get service statistics summary"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_services,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress_services,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_services,
        COUNT(CASE WHEN service_date >= DATEADD(day, -30, GETDATE()) THEN 1 END) as last_30_days,
        AVG(CASE WHEN status = 'COMPLETED' THEN labor_cost END) as avg_labor_cost,
        SUM(CASE WHEN status = 'COMPLETED' THEN labor_cost ELSE 0 END) as total_labor_revenue
    FROM service_records
    WHERE service_date >= DATEADD(month, -12, GETDATE())
    """
    
    cursor.execute(query)
    row = cursor.fetchone()
    connection.close()
    
    return {
        'total_services': row[0],
        'pending_services': row[1],
        'in_progress_services': row[2],
        'completed_services': row[3],
        'last_30_days': row[4],
        'avg_labor_cost': float(row[5]) if row[5] else 0,
        'total_labor_revenue': float(row[6]) if row[6] else 0
    }


def get_service_revenue_by_month(months=12):
    """Get service revenue grouped by month"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        YEAR(sr.service_date) as year,
        MONTH(sr.service_date) as month,
        DATENAME(month, sr.service_date) + ' ' + CAST(YEAR(sr.service_date) AS VARCHAR) as month_name,
        COUNT(*) as service_count,
        SUM(sr.labor_cost) as labor_revenue,
        SUM(ISNULL(parts_total.total_parts_cost, 0)) as parts_revenue,
        SUM(sr.labor_cost + ISNULL(parts_total.total_parts_cost, 0)) as total_revenue
    FROM service_records sr
    LEFT JOIN (
        SELECT 
            service_record_id,
            SUM(quantity * unit_price) as total_parts_cost
        FROM service_parts 
        GROUP BY service_record_id
    ) parts_total ON sr.id = parts_total.service_record_id
    WHERE sr.service_date >= DATEADD(month, -?, GETDATE())
    AND sr.status = 'COMPLETED'
    GROUP BY YEAR(sr.service_date), MONTH(sr.service_date)
    ORDER BY year DESC, month DESC
    """
    
    cursor.execute(query, (months,))
    rows = cursor.fetchall()
    connection.close()
    
    revenue_data = []
    for row in rows:
        revenue_data.append({
            'year': row[0],
            'month': row[1],
            'month_name': row[2],
            'service_count': row[3],
            'labor_revenue': float(row[4]) if row[4] else 0,
            'parts_revenue': float(row[5]) if row[5] else 0,
            'total_revenue': float(row[6]) if row[6] else 0
        })
    
    return revenue_data