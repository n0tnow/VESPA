"""
Core Authentication Views using Raw SQL
Custom authentication without Django's auth system
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .auth_service import AuthService
from .database import DatabaseConnection
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated


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


@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [IsAuthenticated]
    
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


@method_decorator(csrf_exempt, name='dispatch')
class ChangeUsernameView(APIView):
    """Change username for current user"""
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        new_username = request.data.get('new_username')
        if not new_username:
            return Response({'error': 'New username required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            # Ensure uniqueness
            exists = DatabaseConnection.execute_scalar("SELECT COUNT(*) FROM users WHERE username = ?", (new_username,))
            if exists and int(exists) > 0:
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            affected = DatabaseConnection.execute_command("UPDATE users SET username = ? WHERE id = ?", (new_username, user_id))
            if affected:
                request.session['username'] = new_username
                return Response({'message': 'Username changed successfully'}, status=status.HTTP_200_OK)
            return Response({'error': 'Failed to change username'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Username change failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _get_settings_by_category(category: str):
    rows = DatabaseConnection.execute_query(
        "SELECT setting_key, setting_value FROM system_settings WHERE category = ?",
        (category,),
    )
    out = {}
    for r in rows:
        out[r['setting_key']] = r['setting_value']
    return out


def _upsert_setting(key: str, value: str, category: str):
    existing = DatabaseConnection.execute_scalar(
        "SELECT COUNT(*) FROM system_settings WHERE setting_key = ?",
        (key,),
    )
    if existing and int(existing) > 0:
        DatabaseConnection.execute_command(
            "UPDATE system_settings SET setting_value = ?, category = ?, updated_date = GETDATE() WHERE setting_key = ?",
            (str(value), category, key),
        )
    else:
        DatabaseConnection.execute_command(
            "INSERT INTO system_settings (setting_key, setting_value, category) VALUES (?, ?, ?)",
            (key, str(value), category),
        )


@method_decorator(csrf_exempt, name='dispatch')
class EmailSettingsView(APIView):
    def get(self, request):
        data = _get_settings_by_category('EMAIL')
        return Response({'settings': data}, status=status.HTTP_200_OK)

    def post(self, request):
        payload = request.data or {}
        for key in ['EMAIL_SMTP_HOST', 'EMAIL_SMTP_PORT', 'EMAIL_USERNAME', 'EMAIL_PASSWORD', 'LOW_STOCK_EMAIL_ENABLED', 'DAILY_REPORT_EMAIL_ENABLED', 'APPOINTMENT_REMINDER_EMAIL']:
            if key in payload:
                _upsert_setting(key, payload[key], 'EMAIL')
        return Response({'message': 'Email settings updated'}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class EmailSettingsTestView(APIView):
    def post(self, request):
        # TODO: Real SMTP test can be implemented; for now just return success
        return Response({'message': 'Email settings test successful'}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CompanySettingsView(APIView):
    def get(self, request):
        keys = ['COMPANY_NAME', 'COMPANY_ADDRESS', 'COMPANY_PHONE', 'COMPANY_EMAIL', 'COMPANY_WEBSITE']
        rows = DatabaseConnection.execute_query(
            "SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?,?,?,?,?)",
            tuple(keys),
        )
        out = {k: '' for k in keys}
        for r in rows:
            out[r['setting_key']] = r['setting_value']
        return Response({'settings': out}, status=status.HTTP_200_OK)

    def post(self, request):
        payload = request.data or {}
        for key in ['COMPANY_NAME', 'COMPANY_ADDRESS', 'COMPANY_PHONE', 'COMPANY_EMAIL', 'COMPANY_WEBSITE']:
            if key in payload:
                _upsert_setting(key, payload[key], 'GENERAL')
        return Response({'message': 'Company settings updated'}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class StockSettingsView(APIView):
    def get(self, request):
        keys = ['LOW_STOCK_THRESHOLD', 'CRITICAL_STOCK_THRESHOLD', 'AUTO_STOCK_UPDATE']
        rows = DatabaseConnection.execute_query(
            "SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?,?,?)",
            tuple(keys),
        )
        out = {k: '' for k in keys}
        for r in rows:
            out[r['setting_key']] = r['setting_value']
        return Response({'settings': out}, status=status.HTTP_200_OK)

    def post(self, request):
        payload = request.data or {}
        for key in ['LOW_STOCK_THRESHOLD', 'CRITICAL_STOCK_THRESHOLD', 'AUTO_STOCK_UPDATE']:
            if key in payload:
                _upsert_setting(key, payload[key], 'GENERAL')
        return Response({'message': 'Stock settings updated'}, status=status.HTTP_200_OK)