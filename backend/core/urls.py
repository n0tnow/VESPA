from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/me/', views.CurrentUserView.as_view(), name='current-user'),
    path('auth/users/', views.UsersView.as_view(), name='users'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
]