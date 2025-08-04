#!/usr/bin/env python3
"""
Load sample paint data into database
"""

import sys
import os
import django

# Add backend to path
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'motoetiler_api.settings')

try:
    django.setup()
    from django.db import connection
    
    print("🚀 Loading sample paint data...")
    
    # Read sample data SQL
    with open('backend/sample_paint_data.sql', 'r', encoding='utf-8') as file:
        sql_content = file.read()
    
    # Split into individual statements
    statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip() and not stmt.strip().startswith('--')]
    
    cursor = connection.cursor()
    
    for i, statement in enumerate(statements):
        if statement:
            try:
                print(f"Executing statement {i+1}/{len(statements)}")
                cursor.execute(statement)
                print(f"✅ Success: {statement[:50]}...")
            except Exception as e:
                print(f"❌ Error in statement {i+1}: {str(e)}")
                print(f"Statement: {statement[:100]}...")
    
    connection.commit()
    print("🎉 Sample data loaded successfully!")
    
    # Test query
    cursor.execute("SELECT COUNT(*) FROM paint_templates")
    template_count = cursor.fetchone()[0]
    print(f"📊 Paint templates in database: {template_count}")
    
    cursor.execute("SELECT COUNT(*) FROM paint_template_parts")
    parts_count = cursor.fetchone()[0]
    print(f"📊 Paint template parts in database: {parts_count}")
    
    cursor.execute("SELECT COUNT(*) FROM vespa_models WHERE is_active = 1")
    models_count = cursor.fetchone()[0]
    print(f"📊 Active Vespa models in database: {models_count}")
    
    cursor.close()
    
except Exception as e:
    print(f"💥 Error: {str(e)}")
    print("Make sure Django is properly configured and database is accessible.")