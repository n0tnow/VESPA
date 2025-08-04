from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Authentication endpoints (since core module removed)
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    
    # Customer endpoints
    path('', views.CustomersView.as_view(), name='customers'),
    path('<int:customer_id>/', views.CustomerDetailView.as_view(), name='customer-detail'),
]