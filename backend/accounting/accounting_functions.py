"""
Complex accounting functions using raw SQL
Implements DATABASE.txt accounting system with:
- Invoice management and generation
- Cash transactions and daily summaries
- Account receivables/payables tracking
- Tax reports and calculations
- Financial analytics
"""
from datetime import datetime, date, timedelta
from decimal import Decimal
from .database import get_db_connection


# ===== INVOICES =====

def get_all_invoices(limit=100, offset=0, status_filter=None):
    """Get invoices with customer and totals"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    where_conditions = []
    params = []
    
    if status_filter:
        where_conditions.append("i.invoice_status = ?")
        params.append(status_filter)
    
    where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
    
    query = f"""
    SELECT 
        i.id, i.invoice_number, i.invoice_date, i.due_date,
        i.invoice_status, i.payment_status, i.currency_type,
        i.subtotal, i.tax_amount, i.total_amount, i.discount_amount,
        c.first_name + ' ' + c.last_name as customer_name,
        c.phone as customer_phone,
        ISNULL(payments.paid_amount, 0) as paid_amount,
        (i.total_amount - ISNULL(payments.paid_amount, 0)) as remaining_amount
    FROM invoices i
    INNER JOIN customers c ON i.customer_id = c.id
    LEFT JOIN (
        SELECT 
            invoice_id,
            SUM(amount) as paid_amount
        FROM cash_transactions 
        WHERE transaction_type = 'INCOME' AND reference_type = 'INVOICE'
        GROUP BY invoice_id
    ) payments ON i.id = payments.invoice_id
    {where_clause}
    ORDER BY i.invoice_date DESC, i.created_date DESC
    OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    """
    
    params.extend([offset, limit])
    cursor.execute(query, params)
    rows = cursor.fetchall()
    connection.close()
    
    invoices = []
    for row in rows:
        invoices.append({
            'id': row[0],
            'invoice_number': row[1],
            'invoice_date': row[2],
            'due_date': row[3],
            'invoice_status': row[4],
            'payment_status': row[5],
            'currency_type': row[6],
            'subtotal': float(row[7]) if row[7] else 0,
            'tax_amount': float(row[8]) if row[8] else 0,
            'total_amount': float(row[9]) if row[9] else 0,
            'discount_amount': float(row[10]) if row[10] else 0,
            'customer_name': row[11],
            'customer_phone': row[12],
            'paid_amount': float(row[13]) if row[13] else 0,
            'remaining_amount': float(row[14]) if row[14] else 0
        })
    
    return invoices


def get_invoice_by_id(invoice_id):
    """Get detailed invoice with items"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Get invoice details
    invoice_query = """
    SELECT 
        i.id, i.invoice_number, i.invoice_date, i.due_date,
        i.invoice_status, i.payment_status, i.currency_type,
        i.subtotal, i.tax_amount, i.total_amount, i.discount_amount,
        i.notes, i.created_date,
        c.id as customer_id, c.first_name + ' ' + c.last_name as customer_name,
        c.phone, c.email, c.address, c.tax_number
    FROM invoices i
    INNER JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
    """
    
    cursor.execute(invoice_query, (invoice_id,))
    invoice_row = cursor.fetchone()
    
    if not invoice_row:
        connection.close()
        return None
    
    # Get invoice items
    items_query = """
    SELECT 
        ii.id, ii.item_type, ii.item_description, ii.quantity,
        ii.unit_price, ii.total_price, ii.tax_rate,
        p.part_code, p.part_name
    FROM invoice_items ii
    LEFT JOIN parts p ON ii.part_id = p.id
    WHERE ii.invoice_id = ?
    ORDER BY ii.id
    """
    
    cursor.execute(items_query, (invoice_id,))
    items_rows = cursor.fetchall()
    
    # Get payments
    payments_query = """
    SELECT 
        ct.id, ct.transaction_date, ct.amount, ct.payment_method,
        ct.description, u.full_name as processed_by
    FROM cash_transactions ct
    LEFT JOIN users u ON ct.processed_by = u.id
    WHERE ct.reference_type = 'INVOICE' AND ct.reference_id = ?
    ORDER BY ct.transaction_date DESC
    """
    
    cursor.execute(payments_query, (invoice_id,))
    payments_rows = cursor.fetchall()
    connection.close()
    
    invoice = {
        'id': invoice_row[0],
        'invoice_number': invoice_row[1],
        'invoice_date': invoice_row[2],
        'due_date': invoice_row[3],
        'invoice_status': invoice_row[4],
        'payment_status': invoice_row[5],
        'currency_type': invoice_row[6],
        'subtotal': float(invoice_row[7]) if invoice_row[7] else 0,
        'tax_amount': float(invoice_row[8]) if invoice_row[8] else 0,
        'total_amount': float(invoice_row[9]) if invoice_row[9] else 0,
        'discount_amount': float(invoice_row[10]) if invoice_row[10] else 0,
        'notes': invoice_row[11],
        'created_date': invoice_row[12],
        'customer': {
            'id': invoice_row[13],
            'name': invoice_row[14],
            'phone': invoice_row[15],
            'email': invoice_row[16],
            'address': invoice_row[17],
            'tax_number': invoice_row[18]
        },
        'items': [],
        'payments': []
    }
    
    # Add items
    for item_row in items_rows:
        invoice['items'].append({
            'id': item_row[0],
            'item_type': item_row[1],
            'item_description': item_row[2],
            'quantity': item_row[3],
            'unit_price': float(item_row[4]),
            'total_price': float(item_row[5]),
            'tax_rate': float(item_row[6]) if item_row[6] else 0,
            'part_code': item_row[7],
            'part_name': item_row[8]
        })
    
    # Add payments
    total_paid = 0
    for payment_row in payments_rows:
        payment_amount = float(payment_row[2])
        total_paid += payment_amount
        
        invoice['payments'].append({
            'id': payment_row[0],
            'transaction_date': payment_row[1],
            'amount': payment_amount,
            'payment_method': payment_row[3],
            'description': payment_row[4],
            'processed_by': payment_row[5]
        })
    
    invoice['paid_amount'] = total_paid
    invoice['remaining_amount'] = invoice['total_amount'] - total_paid
    
    return invoice


def create_invoice(customer_id, items, currency_type='TRY', due_days=30):
    """Create invoice with items and calculate totals"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # Generate invoice number
        invoice_number = _generate_invoice_number(cursor)
        
        # Calculate totals
        subtotal = sum(item['quantity'] * item['unit_price'] for item in items)
        tax_amount = sum(item['quantity'] * item['unit_price'] * (item.get('tax_rate', 0.18) / 100) for item in items)
        total_amount = subtotal + tax_amount
        
        invoice_date = date.today()
        due_date = invoice_date + timedelta(days=due_days)
        
        # Create invoice
        cursor.execute("""
            INSERT INTO invoices (
                invoice_number, customer_id, invoice_date, due_date,
                currency_type, subtotal, tax_amount, total_amount,
                invoice_status, payment_status
            ) 
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', 'UNPAID')
        """, (invoice_number, customer_id, invoice_date, due_date, 
              currency_type, subtotal, tax_amount, total_amount))
        
        invoice_id = cursor.fetchone()[0]
        
        # Add invoice items
        for item in items:
            item_total = item['quantity'] * item['unit_price']
            
            cursor.execute("""
                INSERT INTO invoice_items (
                    invoice_id, item_type, item_description, quantity,
                    unit_price, total_price, tax_rate, part_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                invoice_id,
                item.get('item_type', 'PART'),
                item['item_description'],
                item['quantity'],
                item['unit_price'],
                item_total,
                item.get('tax_rate', 18.0),
                item.get('part_id')
            ))
        
        connection.commit()
        return invoice_id
        
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()


def _generate_invoice_number(cursor):
    """Generate unique invoice number"""
    query = """
    SELECT 'INV' + FORMAT(GETDATE(), 'yyyyMM') + 
           FORMAT(ISNULL(MAX(CAST(RIGHT(invoice_number, 4) AS INT)), 0) + 1, '0000') as new_number
    FROM invoices 
    WHERE invoice_number LIKE 'INV' + FORMAT(GETDATE(), 'yyyyMM') + '%'
    """
    
    cursor.execute(query)
    return cursor.fetchone()[0]


# ===== CASH TRANSACTIONS =====

def create_cash_transaction(data):
    """Create cash transaction (payment/expense)"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO cash_transactions (
                transaction_date, transaction_type, payment_method, amount,
                reference_type, reference_id, description, receipt_number,
                created_by
            ) 
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get('transaction_date', date.today()),
            data['transaction_type'],  # INCOME or EXPENSE
            data.get('payment_method', 'CASH'),
            data['amount'],
            data.get('reference_type'),
            data.get('reference_id'),
            data.get('description', ''),
            data.get('receipt_number', None),
            data.get('created_by', 1)
        ))
        
        transaction_id = cursor.fetchone()[0]
        
        # Update invoice paid amount if this is an invoice payment
        if data.get('reference_type') == 'INVOICE' and data.get('reference_id'):
            _update_invoice_paid_amount(cursor, data['reference_id'])
        
        connection.commit()
        return transaction_id
        
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()


def update_cash_transaction(transaction_id, data):
    """Update cash transaction by id"""
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            UPDATE cash_transactions
            SET transaction_date = ?,
                transaction_type = ?,
                payment_method = ?,
                amount = ?,
                reference_type = ?,
                reference_id = ?,
                description = ?,
                receipt_number = ?
            WHERE id = ?
            """,
            (
                data.get('transaction_date', date.today()),
                data.get('transaction_type'),
                data.get('payment_method', 'CASH'),
                data.get('amount', 0),
                data.get('reference_type'),
                data.get('reference_id'),
                data.get('description', ''),
                data.get('receipt_number', None),
                transaction_id,
            ),
        )

        # If reference is invoice, resync paid amount
        if data.get('reference_type') == 'INVOICE' and data.get('reference_id'):
            _update_invoice_paid_amount(cursor, data['reference_id'])

        connection.commit()
        return True
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()


def delete_cash_transaction(transaction_id):
    """Delete cash transaction and resync invoice paid amount if needed"""
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        # Fetch reference before delete
        cursor.execute(
            "SELECT reference_type, reference_id FROM cash_transactions WHERE id = ?",
            (transaction_id,),
        )
        row = cursor.fetchone()
        ref_type, ref_id = (row[0], row[1]) if row else (None, None)

        cursor.execute("DELETE FROM cash_transactions WHERE id = ?", (transaction_id,))

        if ref_type == 'INVOICE' and ref_id:
            _update_invoice_paid_amount(cursor, ref_id)

        connection.commit()
        return True
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()

def _update_invoice_paid_amount(cursor, invoice_id):
    """Sync invoices.paid_amount from cash_transactions (INCOME, reference_type=INVOICE)."""
    cursor.execute(
        """
        SELECT ISNULL(SUM(ct.amount), 0) as paid_amount
        FROM cash_transactions ct
        WHERE ct.reference_type = 'INVOICE' AND ct.reference_id = ? AND ct.transaction_type = 'INCOME'
        """,
        (invoice_id,),
    )
    row = cursor.fetchone()
    paid_amount = float(row[0]) if row and row[0] is not None else 0.0
    # Update invoices.paid_amount; set payment_date if fully paid
    cursor.execute(
        """
        UPDATE invoices
        SET paid_amount = ?,
            payment_date = CASE WHEN ? >= ISNULL(total_amount, 0) THEN CAST(GETDATE() AS DATE) ELSE payment_date END
        WHERE id = ?
        """,
        (paid_amount, paid_amount, invoice_id),
    )


def get_daily_cash_summary(summary_date=None):
    """Get or create daily cash summary"""
    if not summary_date:
        summary_date = date.today()
    
    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Check if summary exists
    cursor.execute("""
        SELECT * FROM daily_cash_summary WHERE summary_date = ?
    """, (summary_date,))
    
    existing = cursor.fetchone()
    
    if existing:
        connection.close()
        return {
            'summary_date': existing[1],
            'opening_balance': float(existing[2]),
            'total_income': float(existing[3]),
            'total_expenses': float(existing[4]),
            'cash_income': float(existing[5]),
            'card_income': float(existing[6]),
            'transfer_income': float(existing[7]),
            'closing_balance': float(existing[8])
        }
    
    # Calculate summary from transactions
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END) as total_expenses,
            SUM(CASE WHEN transaction_type = 'INCOME' AND payment_method = 'CASH' THEN amount ELSE 0 END) as cash_income,
            SUM(CASE WHEN transaction_type = 'INCOME' AND payment_method = 'CARD' THEN amount ELSE 0 END) as card_income,
            SUM(CASE WHEN transaction_type = 'INCOME' AND payment_method = 'TRANSFER' THEN amount ELSE 0 END) as transfer_income
        FROM cash_transactions
        WHERE CAST(transaction_date AS DATE) = ?
    """, (summary_date,))
    
    totals = cursor.fetchone()
    
    # Get previous day's closing balance as opening balance
    cursor.execute("""
        SELECT TOP 1 closing_balance 
        FROM daily_cash_summary 
        WHERE summary_date < ?
        ORDER BY summary_date DESC
    """, (summary_date,))
    
    prev_row = cursor.fetchone()
    opening_balance = float(prev_row[0]) if prev_row else 0
    
    total_income = float(totals[0]) if totals[0] else 0
    total_expenses = float(totals[1]) if totals[1] else 0
    cash_income = float(totals[2]) if totals[2] else 0
    card_income = float(totals[3]) if totals[3] else 0
    transfer_income = float(totals[4]) if totals[4] else 0
    
    closing_balance = opening_balance + total_income - total_expenses
    
    # Create summary record
    cursor.execute("""
        INSERT INTO daily_cash_summary (
            summary_date, opening_balance, total_income, total_expenses,
            cash_income, card_income, transfer_income, closing_balance
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (summary_date, opening_balance, total_income, total_expenses,
          cash_income, card_income, transfer_income, closing_balance))
    
    connection.commit()
    connection.close()
    
    return {
        'summary_date': summary_date,
        'opening_balance': opening_balance,
        'total_income': total_income,
        'total_expenses': total_expenses,
        'cash_income': cash_income,
        'card_income': card_income,
        'transfer_income': transfer_income,
        'closing_balance': closing_balance
    }


# ===== TAX REPORTS =====

def generate_monthly_tax_report(year, month):
    """Generate monthly tax report"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        # Calculate tax totals
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN ct.transaction_type = 'INCOME' THEN ct.amount ELSE 0 END) as total_income,
                SUM(CASE WHEN ct.transaction_type = 'EXPENSE' THEN ct.amount ELSE 0 END) as total_expenses,
                SUM(i.tax_amount) as total_tax_collected
            FROM cash_transactions ct
            LEFT JOIN invoices i ON ct.reference_type = 'INVOICE' AND ct.reference_id = i.id
            WHERE ct.transaction_date >= ? AND ct.transaction_date <= ?
        """, (start_date, end_date))
        
        totals = cursor.fetchone()
        
        total_income = float(totals[0]) if totals[0] else 0
        total_expenses = float(totals[1]) if totals[1] else 0
        total_tax_collected = float(totals[2]) if totals[2] else 0
        
        # Create tax report
        cursor.execute("""
            INSERT INTO tax_reports (
                report_period_start, report_period_end, report_type,
                total_income, total_expenses, tax_base, tax_amount,
                report_status
            ) 
            OUTPUT INSERTED.id
            VALUES (?, ?, 'MONTHLY', ?, ?, ?, ?, 'DRAFT')
        """, (start_date, end_date, total_income, total_expenses, 
              total_income - total_expenses, total_tax_collected))
        
        tax_report_id = cursor.fetchone()[0]
        
        # Add tax report details (simplified)
        cursor.execute("""
            INSERT INTO tax_report_details (
                tax_report_id, tax_category, tax_base, tax_rate, tax_amount
            ) VALUES (?, 'KDV', ?, 18.0, ?)
        """, (tax_report_id, total_income, total_tax_collected))
        
        connection.commit()
        return tax_report_id
        
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()


def get_accounting_summary():
    """Get accounting dashboard summary"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    SELECT 
        COUNT(DISTINCT i.id) as total_invoices,
        COUNT(DISTINCT CASE WHEN ISNULL(i.paid_amount, 0) < ISNULL(i.total_amount, 0) THEN i.id END) as unpaid_invoices,
        SUM(CASE WHEN ISNULL(i.paid_amount, 0) < ISNULL(i.total_amount, 0) THEN (ISNULL(i.total_amount, 0) - ISNULL(i.paid_amount, 0)) ELSE 0 END) as total_unpaid_amount,
        SUM(CASE WHEN ct.transaction_type = 'INCOME' AND ct.transaction_date >= DATEADD(month, -1, GETDATE()) THEN ct.amount ELSE 0 END) as monthly_income,
        SUM(CASE WHEN ct.transaction_type = 'EXPENSE' AND ct.transaction_date >= DATEADD(month, -1, GETDATE()) THEN ct.amount ELSE 0 END) as monthly_expenses
    FROM invoices i
    LEFT JOIN cash_transactions ct ON 1=1
    WHERE i.invoice_date >= DATEADD(month, -12, GETDATE())
    """
    
    cursor.execute(query)
    row = cursor.fetchone()
    connection.close()
    
    return {
        'total_invoices': row[0],
        'unpaid_invoices': row[1],
        'total_unpaid_amount': float(row[2]) if row[2] else 0,
        'monthly_income': float(row[3]) if row[3] else 0,
        'monthly_expenses': float(row[4]) if row[4] else 0,
        'monthly_profit': (float(row[3]) if row[3] else 0) - (float(row[4]) if row[4] else 0)
    }


# ===== CARİ (CASH FLOW) HELPERS =====

def get_cash_transactions_filtered(start_date=None, end_date=None, transaction_type=None,
                                   payment_method=None, limit=200, offset=0):
    """List cash transactions with optional filters"""
    connection = get_db_connection()
    cursor = connection.cursor()

    conditions = []
    params = []

    if start_date:
        conditions.append("CAST(transaction_date AS DATE) >= ?")
        params.append(start_date)
    if end_date:
        conditions.append("CAST(transaction_date AS DATE) <= ?")
        params.append(end_date)
    if transaction_type:
        conditions.append("transaction_type = ?")
        params.append(transaction_type)
    if payment_method:
        conditions.append("payment_method = ?")
        params.append(payment_method)

    where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    query = f"""
    SELECT 
        id, transaction_date, transaction_type, amount,
        payment_method, description, reference_type, reference_id
    FROM cash_transactions
    {where_clause}
    ORDER BY transaction_date DESC, id DESC
    OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    """

    params.extend([offset, limit])
    cursor.execute(query, params)
    rows = cursor.fetchall()
    connection.close()

    transactions = []
    for row in rows:
        transactions.append({
            'id': row[0],
            'transaction_date': row[1],
            'transaction_type': row[2],
            'amount': float(row[3]) if row[3] else 0,
            'payment_method': row[4],
            'description': row[5],
            'reference_type': row[6],
            'reference_id': row[7]
        })

    return transactions


def get_cash_summary_range(start_date=None, end_date=None):
    """Get cash summary totals for a date range with method breakdown and basic revenue sources."""
    connection = get_db_connection()
    cursor = connection.cursor()

    # Totals and method breakdown
    conditions = []
    params = []
    if start_date:
        conditions.append("CAST(transaction_date AS DATE) >= ?")
        params.append(start_date)
    if end_date:
        conditions.append("CAST(transaction_date AS DATE) <= ?")
        params.append(end_date)
    where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    cursor.execute(f"""
        SELECT 
            SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END) as total_expenses,
            SUM(CASE WHEN transaction_type = 'INCOME' AND payment_method = 'CASH' THEN amount ELSE 0 END) as cash_income,
            SUM(CASE WHEN transaction_type = 'INCOME' AND payment_method = 'CARD' THEN amount ELSE 0 END) as card_income,
            SUM(CASE WHEN transaction_type = 'INCOME' AND payment_method = 'TRANSFER' THEN amount ELSE 0 END) as transfer_income
        FROM cash_transactions
        {where_clause}
    """, params)
    totals = cursor.fetchone()

    total_income = float(totals[0]) if totals and totals[0] else 0
    total_expenses = float(totals[1]) if totals and totals[1] else 0
    cash_income = float(totals[2]) if totals and totals[2] else 0
    card_income = float(totals[3]) if totals and totals[3] else 0
    transfer_income = float(totals[4]) if totals and totals[4] else 0

    # Billed revenue breakdown: services vs sales, within date range
    inv_conditions = []
    inv_params = []
    if start_date:
        inv_conditions.append("invoice_date >= ?")
        inv_params.append(start_date)
    if end_date:
        inv_conditions.append("invoice_date <= ?")
        inv_params.append(end_date)
    inv_where = ("WHERE " + " AND ".join(inv_conditions)) if inv_conditions else ""

    # Sales billed (all SALE invoices, total amount)
    cursor.execute(f"""
        SELECT ISNULL(SUM(total_amount), 0)
        FROM invoices
        {inv_where} {(' AND ' if inv_where else ' WHERE ')} invoice_type = 'SALE'
    """, inv_params)
    row_sales = cursor.fetchone()
    sales_billed = float(row_sales[0]) if row_sales and row_sales[0] is not None else 0.0

    # Service billed: subtotal minus parts for non-SALE invoices
    cursor.execute(f"""
        SELECT ISNULL(SUM(subtotal), 0)
        FROM invoices i
        {inv_where} {(' AND ' if inv_where else ' WHERE ')} i.invoice_type <> 'SALE'
    """, inv_params)
    row_service_sub = cursor.fetchone()
    service_subtotal_sum = float(row_service_sub[0]) if row_service_sub and row_service_sub[0] is not None else 0.0

    cursor.execute(f"""
        SELECT ISNULL(SUM(ii.line_total), 0)
        FROM invoice_items ii
        INNER JOIN invoices i ON ii.invoice_id = i.id
        {inv_where} {(' AND ' if inv_where else ' WHERE ')} i.invoice_type <> 'SALE'
    """, inv_params)
    row_service_parts = cursor.fetchone()
    service_parts_total = float(row_service_parts[0]) if row_service_parts and row_service_parts[0] is not None else 0.0
    services_billed = max(0.0, service_subtotal_sum - service_parts_total)

    # Total parts across all invoices (optional, legacy)
    cursor.execute(f"""
        SELECT ISNULL(SUM(ii.line_total), 0)
        FROM invoice_items ii
        INNER JOIN invoices i ON ii.invoice_id = i.id
        {inv_where}
    """, inv_params)
    row_parts_all = cursor.fetchone()
    parts_billed_total = float(row_parts_all[0]) if row_parts_all and row_parts_all[0] is not None else 0.0

    connection.close()

    return {
        'total_income': total_income,
        'total_expenses': total_expenses,
        'net': total_income - total_expenses,
        'by_method': {
            'cash': cash_income,
            'card': card_income,
            'transfer': transfer_income
        },
        'billed_revenue': {
            'services': services_billed,
            'sales': sales_billed,
            'parts_total': parts_billed_total,
            # backward compatibility keys
            'service': services_billed,
            'parts': parts_billed_total
        }
    }