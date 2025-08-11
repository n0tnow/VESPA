from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/me/', views.CurrentUserView.as_view(), name='current-user'),
    path('auth/users/', views.UsersView.as_view(), name='users'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('auth/change-username/', views.ChangeUsernameView.as_view(), name='change-username'),
    # Settings endpoints
    path('settings/email/', views.EmailSettingsView.as_view(), name='email-settings'),
    path('settings/email/test/', views.EmailSettingsTestView.as_view(), name='email-settings-test'),
    path('settings/company/', views.CompanySettingsView.as_view(), name='company-settings'),
    path('settings/stock/', views.StockSettingsView.as_view(), name='stock-settings'),
]