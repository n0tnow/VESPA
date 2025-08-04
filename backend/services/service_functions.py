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


# ===== SERVICE RECORDS =====

def get_all_service_records(limit=100, offset=0, status_filter=None):
    """Get service records with customer and vespa info"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    where_conditions = []
    params = []
    
    if status_filter:
        where_conditions.append("sr.status = ?")
        params.append(status_filter)
    
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
        (sr.labor_cost + ISNULL(parts_total.total_parts_cost, 0)) as total_cost
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
            'total_cost': float(row[18]) if row[18] else 0
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
        sp.id, sp.quantity, sp.unit_price, sp.currency_type,
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
    
    total_parts_cost = 0
    for part_row in parts_rows:
        part_total = part_row[1] * part_row[2]  # quantity * unit_price
        total_parts_cost += part_total
        
        service['parts'].append({
            'id': part_row[0],
            'quantity': part_row[1],
            'unit_price': float(part_row[2]),
            'currency_type': part_row[3],
            'part_code': part_row[4],
            'part_name': part_row[5],
            'part_type': part_row[6],
            'category_name': part_row[7],
            'total_price': float(part_total)
        })
    
    service['parts_cost'] = total_parts_cost
    service['total_cost'] = service['labor_cost'] + total_parts_cost
    
    return service


def create_service_record(data):
    """Create new service record"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
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
        data.get('labor_cost', 0),
        data.get('start_date', datetime.now())
    ))
    
    service_id = cursor.fetchone()[0]
    connection.commit()
    connection.close()
    
    return service_id


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