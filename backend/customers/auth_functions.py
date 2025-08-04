"""
JWT Authentication functions using raw SQL
Uses DATABASE.txt users table
"""
import hashlib
import secrets
import bcrypt
from datetime import datetime, timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import AnonymousUser
from .database import get_db_connection


class CustomUser:
    """Custom user class for JWT compatibility"""
    def __init__(self, user_data):
        self.id = user_data['id']
        self.username = user_data['username']
        self.email = user_data['email']
        self.full_name = user_data['full_name']
        self.role = user_data['role']
        self.phone = user_data.get('phone', '')
        self.is_active = user_data.get('is_active', True)
        self.last_login = user_data.get('last_login')
        self.created_date = user_data.get('created_date')
    
    def is_authenticated(self):
        return True
    
    def is_anonymous(self):
        return False


def hash_password(password):
    """Hash password with bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(password, stored_hash):
    """Verify password against bcrypt hash"""
    try:
        password_bytes = password.encode('utf-8')
        stored_hash_bytes = stored_hash.encode('utf-8')
        return bcrypt.checkpw(password_bytes, stored_hash_bytes)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False


def generate_jwt_tokens(user_data):
    """Generate JWT tokens for user"""
    custom_user = CustomUser(user_data)
    refresh = RefreshToken.for_user(custom_user)
    
    # Add custom claims
    refresh['user_id'] = user_data['id']
    refresh['username'] = user_data['username']
    refresh['role'] = user_data['role']
    refresh['full_name'] = user_data['full_name']
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': user_data
    }


def authenticate_user_with_jwt(username, password):
    """Authenticate user and return JWT tokens"""
    try:
        from .database import execute_query
        
        query = """
        SELECT id, username, email, password_hash, full_name, role, phone, is_active
        FROM users 
        WHERE username = ? AND is_active = 1
        """
        
        users = execute_query(query, (username,))
        
        if not users:
            print(f"User not found: {username}")
            return None
        
        user = users[0]  # Get first user
        
        # Debug: Log hash format
        print(f"Database hash for {username}: {user['password_hash']}")
        print(f"Hash starts with: {user['password_hash'][:10]}...")
        
        # Verify password
        if not verify_password(password, user['password_hash']):
            print(f"Password verification failed for user: {username}")
            return None
        
        # Update last login
        update_query = "UPDATE users SET last_login = GETDATE() WHERE id = ?"
        execute_query(update_query, (user['id'],))
        
        # Remove password from response
        user_clean = {k: v for k, v in user.items() if k != 'password_hash'}
        
        print(f"Authentication successful for user: {username}")
        return generate_jwt_tokens(user_clean)
        
    except Exception as e:
        print(f"Authentication error for {username}: {str(e)}")
        return None


def authenticate_user(username, password):
    """Legacy authenticate function (for backward compatibility)"""
    result = authenticate_user_with_jwt(username, password)
    return result['user'] if result else None


def get_user_by_id(user_id):
    """Get user by ID for JWT token validation"""
    try:
        from .database import execute_query
        
        query = """
        SELECT id, username, email, full_name, role, phone, is_active, last_login, created_date
        FROM users 
        WHERE id = ? AND is_active = 1
        """
        
        users = execute_query(query, (user_id,))
        
        if not users:
            return None
        
        return users[0]  # Return first user as dict
        
    except Exception as e:
        print(f"Error getting user by ID {user_id}: {e}")
        return None