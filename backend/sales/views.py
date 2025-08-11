from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from .database import get_db_connection


class SalesPartsSearchView(APIView):
    def get(self, request):
        search = request.GET.get('search')
        part_type = request.GET.get('type', 'ACCESSORY')  # ACCESSORY | PART | ALL
        connection = get_db_connection()
        cursor = connection.cursor()
        try:
            conditions = ["p.is_active = 1"]
            params = []
            if search:
                conditions.append("(p.part_code LIKE ? OR p.part_name LIKE ?)")
                sp = f"%{search}%"
                params.extend([sp, sp])
            if part_type and part_type != 'ALL':
                conditions.append("p.part_type = ?")
                params.append(part_type)
            where = " AND ".join(conditions)
            cursor.execute(f"""
                SELECT TOP 100 
                    p.id, p.part_code, p.part_name, p.part_type,
                    pc.category_name,
                    p.brand, p.model, p.color, p.size,
                    p.image_path,
                    ISNULL(stock.total_stock,0) as total_stock,
                    ISNULL(pp.purchase_price,0) as purchase_price,
                    ISNULL(pp.sale_price,0) as sale_price,
                    ISNULL(pp.currency_type,'TRY') as currency,
                    pp.effective_date,
                    -- latest rates for today
                    (SELECT TOP 1 sell_rate FROM currency_rates WHERE currency_code = 'EUR' ORDER BY rate_date DESC) as eur_try_today,
                    (SELECT TOP 1 sell_rate FROM currency_rates WHERE currency_code = 'USD' ORDER BY rate_date DESC) as usd_try_today,
                    -- rate on purchase effective date
                    (SELECT TOP 1 sell_rate FROM currency_rates WHERE currency_code = 'EUR' AND rate_date <= pp.effective_date ORDER BY rate_date DESC) as eur_try_on_purchase,
                    (SELECT TOP 1 sell_rate FROM currency_rates WHERE currency_code = 'USD' AND rate_date <= pp.effective_date ORDER BY rate_date DESC) as usd_try_on_purchase
                FROM parts p
                INNER JOIN part_categories pc ON p.category_id = pc.id
                LEFT JOIN (
                    SELECT part_id, SUM(current_stock) as total_stock FROM part_stock_locations GROUP BY part_id
                ) stock ON p.id = stock.part_id
                LEFT JOIN part_prices pp ON p.id = pp.part_id AND pp.is_current = 1
                WHERE {where}
                ORDER BY CASE WHEN p.part_type = 'ACCESSORY' THEN 0 ELSE 1 END, p.part_name
            """, params)
            rows = cursor.fetchall()
            data = []
            for r in rows:
                # unpack
                (pid, pcode, pname, ptype, cat, brand, model, color, size, image_path, stock, purchase_price, sale_price, currency, effective_date, eur_try_today, usd_try_today, eur_try_on_purchase, usd_try_on_purchase) = r
                eur_try_today = float(eur_try_today) if eur_try_today else None
                usd_try_today = float(usd_try_today) if usd_try_today else None
                eur_try_on_purchase = float(eur_try_on_purchase) if eur_try_on_purchase else eur_try_today
                usd_try_on_purchase = float(usd_try_on_purchase) if usd_try_on_purchase else usd_try_today
                purchase_price = float(purchase_price or 0)
                sale_price = float(sale_price or 0)
                # compute USD and TRY at purchase date for purchase
                if currency == 'USD':
                    purchase_usd = purchase_price
                    purchase_try_at_purchase = (usd_try_on_purchase or 1.0) * purchase_price
                elif currency == 'EUR':
                    # convert EUR->USD via TRY rates at purchase date
                    if eur_try_on_purchase and usd_try_on_purchase and usd_try_on_purchase != 0:
                        purchase_usd = purchase_price * (eur_try_on_purchase / usd_try_on_purchase)
                    else:
                        purchase_usd = purchase_price
                    purchase_try_at_purchase = (eur_try_on_purchase or 1.0) * purchase_price
                else:  # TRY
                    purchase_usd = purchase_price if usd_try_on_purchase in (None, 0) else (purchase_price / (usd_try_on_purchase or 1.0))
                    purchase_try_at_purchase = purchase_price

                data.append({
                    'id': r[0],
                    'part_code': r[1],
                    'part_name': r[2],
                    'part_type': r[3],
                    'category_name': r[4],
                    'brand': r[5],
                    'model': r[6],
                    'color': r[7],
                    'size': r[8],
                    'image_path': r[9],
                    'stock': int(r[10] or 0),
                    'purchase_price': float(r[11] or 0),
                    'sale_price': float(r[12] or 0),
                    'currency': r[13] or 'TRY',
                    'purchase_price_usd': round(purchase_usd, 2),
                    'purchase_price_try_at_purchase': round(purchase_try_at_purchase, 2),
                    'purchase_effective_date': effective_date,
                })
            return Response({'parts': data}, status=status.HTTP_200_OK)
        finally:
            connection.close()


class SalesView(APIView):
    def post(self, request):
        """Create a simple retail sale: creates invoice (SALE), items, and cash transaction, decreases stock from any location with stock."""
        # Auto-update currency rates for accurate pricing
        from inventory.inventory_functions import update_currency_rates_auto
        update_currency_rates_auto()
        
        payload = request.data or {}
        customer_id = payload.get('customer_id')
        items = payload.get('items', [])  # [{part_id, quantity, unit_price}]
        payment_method = payload.get('payment_method', 'CASH')
        if not items:
            return Response({'error': 'No items provided'}, status=status.HTTP_400_BAD_REQUEST)
        connection = get_db_connection()
        cursor = connection.cursor()
        try:
            # Create invoice
            subtotal = sum(float(i['unit_price']) * int(i['quantity']) for i in items)
            tax_rate = 20.0
            tax_amount = subtotal * (tax_rate / 100)
            total_amount = subtotal + tax_amount
            cursor.execute("""
                INSERT INTO invoices (
                    invoice_number, invoice_type, customer_id, invoice_date,
                    subtotal, tax_rate, tax_amount, total_amount, status
                ) OUTPUT INSERTED.id
                VALUES (
                    'SAL' + FORMAT(GETDATE(),'yyyyMM') + RIGHT('0000' + CAST(ABS(CHECKSUM(NEWID())) % 10000 AS VARCHAR(4)), 4),
                    'SALE', ?, ?, ?, ?, ?, ?, 'PENDING'
                )
            """, (customer_id or 1, date.today(), subtotal, tax_rate, tax_amount, total_amount))
            invoice_id = cursor.fetchone()[0]

            # Insert invoice items
            for it in items:
                cursor.execute("""
                    INSERT INTO invoice_items (invoice_id, part_id, quantity, unit_price, line_total)
                    VALUES (?, ?, ?, ?, ?)
                """, (invoice_id, it['part_id'], int(it['quantity']), float(it['unit_price']), float(it['unit_price']) * int(it['quantity'])))
            
            # Create cash transaction (income)
            cursor.execute("""
                INSERT INTO cash_transactions (transaction_date, transaction_type, payment_method, amount, reference_type, reference_id, description, created_by)
                OUTPUT INSERTED.id
                VALUES (?, 'INCOME', ?, ?, 'INVOICE', ?, 'Retail sale', 1)
            """, (date.today(), payment_method, total_amount, invoice_id))

            # Decrease stock from any available location in FIFO by stock
            for it in items:
                needed = int(it['quantity'])
                cursor.execute("""
                    SELECT TOP 100 storage_location_id, current_stock
                    FROM part_stock_locations
                    WHERE part_id = ? AND current_stock > 0
                    ORDER BY current_stock DESC
                """, (it['part_id'],))
                rows = cursor.fetchall()
                for loc_id, current_stock in rows:
                    if needed <= 0:
                        break
                    take = min(needed, int(current_stock))
                    cursor.execute("""
                        UPDATE part_stock_locations
                        SET current_stock = current_stock - ?
                        WHERE part_id = ? AND storage_location_id = ?
                    """, (take, it['part_id'], loc_id))
                    needed -= take

            connection.commit()
            return Response({'message': 'Sale completed', 'invoice_id': invoice_id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            connection.rollback()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            connection.close()


class SaleDetailView(APIView):
    def get(self, request, sale_id):
        connection = get_db_connection()
        cursor = connection.cursor()
        try:
            cursor.execute("""
                SELECT i.id, i.invoice_number, i.invoice_date, i.total_amount
                FROM invoices i WHERE i.id = ? AND i.invoice_type = 'SALE'
            """, (sale_id,))
            inv = cursor.fetchone()
            if not inv:
                return Response({'error': 'Sale not found'}, status=status.HTTP_404_NOT_FOUND)
            cursor.execute("""
                SELECT ii.part_id, p.part_code, p.part_name, ii.quantity, ii.unit_price, ii.line_total
                FROM invoice_items ii INNER JOIN parts p ON ii.part_id = p.id
                WHERE ii.invoice_id = ?
            """, (sale_id,))
            items = []
            for r in cursor.fetchall():
                items.append({'part_id': r[0], 'part_code': r[1], 'part_name': r[2], 'quantity': r[3], 'unit_price': float(r[4]), 'line_total': float(r[5])})
            return Response({'sale': {'id': inv[0], 'invoice_number': inv[1], 'invoice_date': inv[2], 'total_amount': float(inv[3]), 'items': items}}, status=status.HTTP_200_OK)
        finally:
            connection.close()


