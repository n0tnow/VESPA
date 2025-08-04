"""
Customer API Views - Simple raw SQL approach
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .auth_functions import authenticate_user_with_jwt, get_user_by_id
from .customer_functions import get_all_customers, get_customer_by_id, create_customer, update_customer, search_customers, get_vespa_models, create_customer_vespa, get_customer_vespas


# ===== AUTHENTICATION VIEWS =====

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
            # Test database connection first
            from .database import execute_query
            test_query = "SELECT COUNT(*) as count FROM users"
            result = execute_query(test_query)
            print(f"Database test - Users table count: {result}")
            
            auth_result = authenticate_user_with_jwt(username, password)
            if auth_result:
                return Response({
                    'message': 'Login successful',
                    'access_token': auth_result['access'],
                    'refresh_token': auth_result['refresh'],
                    'user': auth_result['user']
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            print(f"Login exception: {str(e)}")
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
    """Get current logged in user (JWT required)"""
    
    def get(self, request):
        # JWT authentication will be handled by DRF middleware
        # request.user should be available if token is valid
        
        try:
            # Get user ID from JWT token
            user_id = getattr(request.user, 'id', None)
            if not user_id:
                return Response({
                    'error': 'Not authenticated'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            user = get_user_by_id(user_id)
            if user:
                return Response({'user': user}, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            return Response({
                'error': f'Failed to get user: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== CUSTOMER VIEWS =====

class CustomersView(APIView):
    """Customer management"""
    
    def get(self, request):
        """Get all customers"""
        try:
            limit = int(request.GET.get('limit', 100))
            offset = int(request.GET.get('offset', 0))
            search = request.GET.get('search')
            
            if search:
                customers = search_customers(search)
            else:
                customers = get_all_customers(limit, offset)
            
            return Response({
                'customers': customers,
                'count': len(customers)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get customers: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new customer with optional Vespa"""
        try:
            # Create customer
            customer_id = create_customer(request.data)
            
            # If Vespa data provided, create customer vespa
            vespa_data = request.data.get('vespa')
            if vespa_data and vespa_data.get('vespa_model_id') and vespa_data.get('license_plate'):
                create_customer_vespa(customer_id, vespa_data)
            
            # Get complete customer data
            customer = get_customer_by_id(customer_id)
            
            return Response({
                'message': 'Customer created successfully',
                'customer': customer
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Failed to create customer: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CustomerDetailView(APIView):
    """Individual customer operations"""
    
    def get(self, request, customer_id):
        """Get customer details"""
        try:
            customer = get_customer_by_id(customer_id)
            if customer:
                return Response({'customer': customer}, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Customer not found'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            return Response({
                'error': f'Failed to get customer: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, customer_id):
        """Update customer"""
        try:
            # Check if customer exists
            existing_customer = get_customer_by_id(customer_id)
            if not existing_customer:
                return Response({
                    'error': 'Customer not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Update customer
            update_customer(customer_id, request.data)
            updated_customer = get_customer_by_id(customer_id)
            
            return Response({
                'message': 'Customer updated successfully',
                'customer': updated_customer
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to update customer: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== VESPA VIEWS =====

class VespaModelsView(APIView):
    """Vespa models management"""
    
    def get(self, request):
        """Get all Vespa models"""
        try:
            models = get_vespa_models()
            return Response({
                'models': models,
                'count': len(models)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get Vespa models: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CustomerVespasView(APIView):
    """Customer's Vespa motorcycles"""
    
    def get(self, request, customer_id):
        """Get customer's Vespas"""
        try:
            vespas = get_customer_vespas(customer_id)
            return Response({
                'vespas': vespas,
                'count': len(vespas)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get customer Vespas: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
