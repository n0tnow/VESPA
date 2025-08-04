"""
Complex appointment management functions using raw SQL
Implements DATABASE.txt appointment system with:
- Time slot management
- Calendar view
- Appointment scheduling and conflicts
- Status tracking and history
"""
from datetime import datetime, date, timedelta, time
from .database import get_db_connection


# ===== APPOINTMENT SLOTS =====

def get_available_slots(appointment_date, service_type=None):
    """Get available appointment slots for a specific date"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Get configured time slots for the day
    # Convert weekday to number (Monday=1, Tuesday=2, ..., Sunday=7)
    day_of_week_num = appointment_date.weekday() + 1  # Python weekday: Monday=0, so +1
    
    query = """
    SELECT 
        start_time, slot_duration, max_appointments, 'GENERAL' as slot_type
    FROM appointment_slots 
    WHERE day_of_week = ? AND is_active = 1
    ORDER BY start_time
    """
    
    cursor.execute(query, (day_of_week_num,))
    slot_rows = cursor.fetchall()
    
    # Get existing appointments for this date
    existing_query = """
    SELECT 
        appointment_time, COUNT(*) as appointment_count, service_type
    FROM appointments 
    WHERE CAST(appointment_date AS DATE) = ? 
    AND status NOT IN ('CANCELLED', 'NO_SHOW')
    GROUP BY appointment_time, service_type
    """
    
    cursor.execute(existing_query, (appointment_date,))
    existing_rows = cursor.fetchall()
    connection.close()
    
    # Create existing appointments lookup
    existing_appointments = {}
    for row in existing_rows:
        key = f"{row[0]}_{row[2] or 'ALL'}"
        existing_appointments[key] = row[1]
    
    # Calculate available slots
    available_slots = []
    for slot_row in slot_rows:
        slot_time = slot_row[0]
        slot_duration = slot_row[1]
        max_appointments = slot_row[2]
        slot_type = slot_row[3]
        
        # Check if service type matches (if specified)
        if service_type and slot_type != 'ALL' and slot_type != service_type:
            continue
        
        # Count existing appointments for this slot
        key = f"{slot_time}_{service_type or 'ALL'}"
        existing_count = existing_appointments.get(key, 0)
        
        # Also check general slot usage if service-specific
        if service_type:
            general_key = f"{slot_time}_ALL"
            existing_count += existing_appointments.get(general_key, 0)
        
        available_count = max_appointments - existing_count
        
        if available_count > 0:
            available_slots.append({
                'slot_time': slot_time,
                'slot_duration': slot_duration,
                'max_appointments': max_appointments,
                'existing_appointments': existing_count,
                'available_spots': available_count,
                'slot_type': slot_type
            })
    
    return available_slots


def get_appointment_slots_config():
    """Get all configured appointment slots"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        id, day_of_week, start_time, slot_duration, 
        max_appointments, 'GENERAL' as slot_type, is_active
    FROM appointment_slots 
    ORDER BY day_of_week, start_time
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    connection.close()
    
    # Day names mapping
    day_names = {
        1: 'MONDAY',
        2: 'TUESDAY', 
        3: 'WEDNESDAY',
        4: 'THURSDAY',
        5: 'FRIDAY',
        6: 'SATURDAY',
        7: 'SUNDAY'
    }
    
    slots = []
    for row in rows:
        slots.append({
            'id': row[0],
            'day_of_week': day_names.get(row[1], 'UNKNOWN'),
            'slot_time': row[2],
            'slot_duration': row[3],
            'max_appointments': row[4],
            'slot_type': row[5],
            'is_active': row[6]
        })
    
    return slots


# ===== APPOINTMENTS =====

def get_appointments_by_date_range(start_date, end_date, status_filter=None):
    """Get appointments within date range for calendar view"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check if appointments table exists
        check_table_query = """
        SELECT COUNT(*) FROM sys.tables WHERE name = 'appointments'
        """
        cursor.execute(check_table_query)
        table_exists = cursor.fetchone()[0] > 0
        
        if not table_exists:
            cursor.close()
            connection.close()
            return []  # Return empty list if table doesn't exist yet
        
        where_conditions = ["a.appointment_date >= ?", "a.appointment_date <= ?"]
        params = [start_date, end_date]
        
        if status_filter:
            where_conditions.append("a.status = ?")
            params.append(status_filter)
        
        where_clause = " AND ".join(where_conditions)
        
        query = f"""
        SELECT 
            a.id, a.appointment_date, a.appointment_time, a.estimated_duration,
            a.service_type, a.status, a.customer_notes, a.created_date,
            COALESCE(c.first_name + ' ' + c.last_name, 'Unknown Customer') as customer_name,
            COALESCE(c.phone, '') as customer_phone,
            COALESCE(c.customer_code, '') as customer_code,
            COALESCE(vm.model_name, '') as model_name
        FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN customer_vespas cv ON a.customer_vespa_id = cv.id
        LEFT JOIN vespa_models vm ON cv.vespa_model_id = vm.id
        WHERE {where_clause}
        ORDER BY a.appointment_date, a.appointment_time
        """
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        connection.close()
        
        appointments = []
        for row in rows:
            appointments.append({
                'id': row[0],
                'appointment_date': row[1],
                'appointment_time': row[2],
                'estimated_duration': row[3],
                'service_type': row[4],
                'status': row[5],
                'notes': row[6],
                'created_date': row[7],
                'customer_name': row[8],
                'customer_phone': row[9],
                'license_plate': row[10],
                'model_name': row[11]
            })
        
        return appointments
        
    except Exception as e:
        # If any error occurs, return empty list
        return []


def get_appointment_by_id(appointment_id):
    """Get detailed appointment information"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check if appointments table exists
        check_table_query = """
        SELECT COUNT(*) FROM sys.tables WHERE name = 'appointments'
        """
        cursor.execute(check_table_query)
        table_exists = cursor.fetchone()[0] > 0
        
        if not table_exists:
            cursor.close()
            connection.close()
            return None  # Return None if table doesn't exist yet
        
        query = """
        SELECT 
            a.id, a.appointment_date, a.appointment_time, a.estimated_duration,
            a.service_type, a.status, a.customer_notes, a.created_date, a.updated_date,
            c.id as customer_id, COALESCE(c.first_name + ' ' + c.last_name, 'Unknown') as customer_name,
            COALESCE(c.phone, '') as customer_phone, COALESCE(c.email, '') as customer_email,
            vm.id as vespa_id, COALESCE(cv.license_plate, '') as license_plate, '',
            COALESCE(vm.model_name, '') as model_name, COALESCE(vm.engine_size, '') as engine_size, vm.category as category
        FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN customer_vespas cv ON a.customer_vespa_id = cv.id
        LEFT JOIN vespa_models vm ON cv.vespa_model_id = vm.id
        WHERE a.id = ?
        """
        
        cursor.execute(query, (appointment_id,))
        row = cursor.fetchone()
        connection.close()
        
        if not row:
            return None
        
        return {
            'id': row[0],
            'appointment_date': row[1],
            'appointment_time': row[2],
            'estimated_duration': row[3],
            'service_type': row[4],
            'status': row[5],
            'notes': row[6],
            'created_date': row[7],
            'updated_date': row[8],
            'customer': {
                'id': row[9],
                'name': row[10],
                'phone': row[11],
                'email': row[12]
            },
            'vespa': {
                'id': row[13],
                'license_plate': row[14],
                'chassis_number': row[15],
                'model_name': row[16],
                'engine_size': row[17],
                'category': row[18]
            }
        }
        
    except Exception as e:
        # If any error occurs, return None
        return None


def create_appointment(data):
    """Create new appointment with conflict checking"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        appointment_datetime = datetime.combine(data['appointment_date'], data['appointment_time'])
        
        # Check for conflicts
        if _has_appointment_conflict(cursor, appointment_datetime, data.get('estimated_duration', 60)):
            raise ValueError("Time slot conflict detected")
        
        # Check available slots
        available_slots = get_available_slots(data['appointment_date'], data.get('service_type'))
        
        slot_available = False
        for slot in available_slots:
            if slot['slot_time'] == data['appointment_time']:
                if slot['available_spots'] > 0:
                    slot_available = True
                    break
        
        if not slot_available:
            raise ValueError("No available slots for selected time")
        
        # Create appointment
        insert_query = """
        INSERT INTO appointments (
            customer_vespa_id, appointment_date, appointment_time,
            estimated_duration, service_type, status, notes
        ) 
        OUTPUT INSERTED.id
        VALUES (?, ?, ?, ?, ?, 'SCHEDULED', ?)
        """
        
        cursor.execute(insert_query, (
            data['customer_vespa_id'],
            data['appointment_date'],
            appointment_datetime,
            data.get('estimated_duration', 60),
            data.get('service_type', 'MAINTENANCE'),
            data.get('notes', '')
        ))
        
        appointment_id = cursor.fetchone()[0]
        
        # Create status history
        cursor.execute("""
            INSERT INTO appointment_status_history (
                appointment_id, old_status, new_status, change_reason, changed_by
            ) VALUES (?, NULL, 'SCHEDULED', 'Appointment created', ?)
        """, (appointment_id, data.get('created_by', 1)))
        
        connection.commit()
        return appointment_id
        
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()


def update_appointment_status(appointment_id, new_status, change_reason='', changed_by=1):
    """Update appointment status with history tracking"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # Get current status
        cursor.execute("SELECT status FROM appointments WHERE id = ?", (appointment_id,))
        current_row = cursor.fetchone()
        
        if not current_row:
            raise ValueError("Appointment not found")
        
        old_status = current_row[0]
        
        # Update appointment
        cursor.execute("""
            UPDATE appointments 
            SET status = ?, updated_date = GETDATE() 
            WHERE id = ?
        """, (new_status, appointment_id))
        
        # Add status history
        cursor.execute("""
            INSERT INTO appointment_status_history (
                appointment_id, old_status, new_status, change_reason, changed_by
            ) VALUES (?, ?, ?, ?, ?)
        """, (appointment_id, old_status, new_status, change_reason, changed_by))
        
        connection.commit()
        return True
        
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()


def reschedule_appointment(appointment_id, new_date, new_time, reason=''):
    """Reschedule appointment to new date/time"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        new_datetime = datetime.combine(new_date, new_time)
        
        # Get current appointment
        cursor.execute("""
            SELECT appointment_date, appointment_time, estimated_duration, service_type 
            FROM appointments WHERE id = ?
        """, (appointment_id,))
        
        current_row = cursor.fetchone()
        if not current_row:
            raise ValueError("Appointment not found")
        
        # Check new time slot availability
        if _has_appointment_conflict(cursor, new_datetime, current_row[2], appointment_id):
            raise ValueError("New time slot has conflicts")
        
        available_slots = get_available_slots(new_date, current_row[3])
        slot_available = any(slot['slot_time'] == new_time and slot['available_spots'] > 0 
                           for slot in available_slots)
        
        if not slot_available:
            raise ValueError("New time slot not available")
        
        # Update appointment
        cursor.execute("""
            UPDATE appointments 
            SET appointment_date = ?, appointment_time = ?, updated_date = GETDATE()
            WHERE id = ?
        """, (new_date, new_datetime, appointment_id))
        
        # Add status history
        old_datetime = datetime.combine(current_row[0], current_row[1])
        change_reason = f"Rescheduled from {old_datetime} to {new_datetime}. {reason}".strip()
        
        cursor.execute("""
            INSERT INTO appointment_status_history (
                appointment_id, old_status, new_status, change_reason, changed_by
            ) VALUES (?, 'SCHEDULED', 'RESCHEDULED', ?, 1)
        """, (appointment_id, change_reason))
        
        connection.commit()
        return True
        
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()


def _has_appointment_conflict(cursor, appointment_datetime, duration_minutes, exclude_appointment_id=None):
    """Check for appointment time conflicts"""
    end_time = appointment_datetime + timedelta(minutes=duration_minutes)
    
    where_conditions = [
        "status NOT IN ('CANCELLED', 'NO_SHOW')",
        "appointment_time < ?",
        "DATEADD(MINUTE, estimated_duration, appointment_time) > ?"
    ]
    params = [end_time, appointment_datetime]
    
    if exclude_appointment_id:
        where_conditions.append("id != ?")
        params.append(exclude_appointment_id)
    
    where_clause = " AND ".join(where_conditions)
    
    query = f"""
    SELECT COUNT(*) FROM appointments 
    WHERE {where_clause}
    """
    
    cursor.execute(query, params)
    count = cursor.fetchone()[0]
    
    return count > 0


# ===== APPOINTMENT ANALYTICS =====

def get_appointment_summary():
    """Get appointment statistics"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check if appointments table exists
        check_table_query = """
        SELECT COUNT(*) FROM sys.tables WHERE name = 'appointments'
        """
        cursor.execute(check_table_query)
        table_exists = cursor.fetchone()[0] > 0
        
        if not table_exists:
            cursor.close()
            connection.close()
            return {
                'total_appointments': 0,
                'scheduled_count': 0,
                'confirmed_count': 0,
                'completed_count': 0,
                'cancelled_count': 0,
                'no_show_count': 0,
                'upcoming_count': 0,
                'today_count': 0
            }
        
        query = """
        SELECT 
            COUNT(*) as total_appointments,
            COUNT(CASE WHEN status = 'SCHEDULED' THEN 1 END) as scheduled_count,
            COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_count,
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_count,
            COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_count,
            COUNT(CASE WHEN status = 'NO_SHOW' THEN 1 END) as no_show_count,
            COUNT(CASE WHEN appointment_date >= CAST(GETDATE() AS DATE) THEN 1 END) as upcoming_count,
            COUNT(CASE WHEN appointment_date = CAST(GETDATE() AS DATE) THEN 1 END) as today_count
        FROM appointments
        WHERE appointment_date >= DATEADD(month, -3, GETDATE())
        """
        
        cursor.execute(query)
        row = cursor.fetchone()
        connection.close()
        
        return {
            'total_appointments': row[0],
            'scheduled_count': row[1],
            'confirmed_count': row[2],
            'completed_count': row[3],
            'cancelled_count': row[4],
            'no_show_count': row[5],
            'upcoming_count': row[6],
            'today_count': row[7]
        }
        
    except Exception as e:
        return {
            'total_appointments': 0,
            'scheduled_count': 0,
            'confirmed_count': 0,
            'completed_count': 0,
            'cancelled_count': 0,
            'no_show_count': 0,
            'upcoming_count': 0,
            'today_count': 0
        }


def get_daily_appointment_stats(days=30):
    """Get daily appointment statistics"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check if appointments table exists
        check_table_query = """
        SELECT COUNT(*) FROM sys.tables WHERE name = 'appointments'
        """
        cursor.execute(check_table_query)
        table_exists = cursor.fetchone()[0] > 0
        
        if not table_exists:
            cursor.close()
            connection.close()
            return []
        
        query = """
        SELECT 
            CAST(appointment_date AS DATE) as date,
            COUNT(*) as total_appointments,
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
            COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled,
            COUNT(CASE WHEN status = 'NO_SHOW' THEN 1 END) as no_show
        FROM appointments
        WHERE appointment_date >= DATEADD(day, -?, GETDATE())
        GROUP BY CAST(appointment_date AS DATE)
        ORDER BY date DESC
        """
        
        cursor.execute(query, (days,))
        rows = cursor.fetchall()
        connection.close()
        
        stats = []
        for row in rows:
            stats.append({
                'date': row[0],
                'total_appointments': row[1],
                'completed': row[2],
                'cancelled': row[3],
                'no_show': row[4],
                'completion_rate': (row[2] / row[1] * 100) if row[1] > 0 else 0
            })
        
        return stats
        
    except Exception as e:
        return []