"""
Core Authentication Views using Raw SQL
Custom authentication without Django's auth system
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .auth_service import AuthService


class LoginView(APIView):
    """Custom login using DATABASE.txt users table"""
    authentication_classes = []
    permission_classes = []
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = AuthService.authenticate(username, password)
            if user:
                # Store user in session
                request.session['user_id'] = user['id']
                request.session['username'] = user['username']
                request.session['role'] = user['role']
                
                return Response({
                    'message': 'Login successful',
                    'user': user
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            return Response({
                'error': f'Login failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    """Logout and clear session"""
    
    def post(self, request):
        request.session.flush()
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    """Get current logged in user"""
    
    def get(self, request):
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({
                'error': 'Not authenticated'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user = AuthService.get_user_by_id(user_id)
            if user:
                return Response({'user': user}, status=status.HTTP_200_OK)
            else:
                request.session.flush()
                return Response({
                    'error': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            return Response({
                'error': f'Failed to get user: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UsersView(APIView):
    """Get all users (admin only)"""
    
    def get(self, request):
        # Check if user is admin
        role = request.session.get('role')
        if role != 'ADMIN':
            return Response({
                'error': 'Admin access required'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            users = AuthService.get_all_users()
            return Response({'users': users}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get users: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChangePasswordView(APIView):
    """Change user password"""
    
    def post(self, request):
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({
                'error': 'Not authenticated'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({
                'error': 'New password required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            success = AuthService.change_password(user_id, new_password)
            if success:
                return Response({
                    'message': 'Password changed successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to change password'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': f'Password change failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)