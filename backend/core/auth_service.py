"""
Custom Authentication Service using raw SQL
Uses DATABASE.txt users table instead of Django auth
"""
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from .base_service import BaseSQLService


class AuthService(BaseSQLService):
    """Custom authentication using DATABASE.txt users table"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using SHA256"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return f"{salt}:{password_hash}"
    
    @staticmethod
    def verify_password(password: str, stored_hash: str) -> bool:
        """Verify password against stored hash"""
        try:
            salt, password_hash = stored_hash.split(':')
            computed_hash = hashlib.sha256((password + salt).encode()).hexdigest()
            return computed_hash == password_hash
        except ValueError:
            return False
    
    @staticmethod
    def authenticate(username: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with username/password"""
        query = """
        SELECT id, username, email, password_hash, full_name, role, phone, is_active, last_login
        FROM users 
        WHERE username = ? AND is_active = 1
        """
        
        users = AuthService.execute_query(query, (username,))
        if not users:
            return None
        
        user = users[0]
        
        # Verify password
        if not AuthService.verify_password(password, user['password_hash']):
            return None
        
        # Update last login
        AuthService.update_last_login(user['id'])
        
        # Remove password from response
        user.pop('password_hash', None)
        return user
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        query = """
        SELECT id, username, email, full_name, role, phone, is_active, last_login, created_date
        FROM users 
        WHERE id = ? AND is_active = 1
        """
        
        users = AuthService.execute_query(query, (user_id,))
        return users[0] if users else None
    
    @staticmethod
    def update_last_login(user_id: int):
        """Update user's last login timestamp"""
        query = "UPDATE users SET last_login = GETDATE() WHERE id = ?"
        AuthService.execute_command(query, (user_id,))
    
    @staticmethod
    def create_user(username: str, email: str, password: str, full_name: str, 
                   role: str = 'ADMIN', phone: str = '') -> int:
        """Create new user"""
        password_hash = AuthService.hash_password(password)
        
        data = {
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'full_name': full_name,
            'role': role,
            'phone': phone,
            'is_active': 1,
            'created_date': datetime.now(),
            'updated_date': datetime.now()
        }
        
        return AuthService.insert('users', data)
    
    @staticmethod
    def change_password(user_id: int, new_password: str) -> bool:
        """Change user password"""
        password_hash = AuthService.hash_password(new_password)
        
        affected_rows = AuthService.update('users', user_id, {
            'password_hash': password_hash,
            'updated_date': datetime.now()
        })
        
        return affected_rows > 0
    
    @staticmethod
    def get_all_users() -> List[Dict[str, Any]]:
        """Get all active users (without passwords)"""
        query = """
        SELECT id, username, email, full_name, role, phone, is_active, 
               last_login, created_date, updated_date
        FROM users 
        WHERE is_active = 1
        ORDER BY full_name
        """
        
        return AuthService.execute_query(query)