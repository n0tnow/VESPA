"""
Custom JWT Authentication Backend
Uses our custom users table instead of Django's auth_user
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth.models import AnonymousUser
from .auth_functions import get_user_by_id


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that uses our users table
    """
    
    def get_user(self, validated_token):
        """
        Get user from our custom users table instead of auth_user
        """
        try:
            user_id = validated_token.get('user_id')
            
            if user_id is None:
                return AnonymousUser()
            
            user_data = get_user_by_id(user_id)
            
            if user_data is None:
                return AnonymousUser()
            
            # Create a simple user object for DRF
            class CustomUser:
                def __init__(self, user_data):
                    self.id = user_data['id']
                    self.username = user_data['username']
                    self.email = user_data['email']
                    self.full_name = user_data['full_name']
                    self.role = user_data['role']
                    self.is_active = user_data.get('is_active', True)
                    self.is_authenticated = True
                    self.is_anonymous = False
                
                def __str__(self):
                    return self.username
            
            return CustomUser(user_data)
            
        except Exception as e:
            print(f"JWT Authentication error: {e}")
            import traceback
            traceback.print_exc()
            return AnonymousUser()