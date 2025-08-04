from django.urls import path
from . import views

urlpatterns = [
    # Dashboard and Analytics
    path('dashboard/', views.AppointmentDashboardView.as_view(), name='appointment-dashboard'),
    
    # Appointment Slots
    path('slots/available/', views.AvailableSlotsView.as_view(), name='available-slots'),
    path('slots/config/', views.SlotsConfigView.as_view(), name='slots-config'),
    
    # Appointments
    path('', views.AppointmentsView.as_view(), name='appointments'),
    path('<int:appointment_id>/', views.AppointmentDetailView.as_view(), name='appointment-detail'),
    path('<int:appointment_id>/status/', views.AppointmentStatusView.as_view(), name='appointment-status'),
    path('<int:appointment_id>/reschedule/', views.AppointmentRescheduleView.as_view(), name='appointment-reschedule'),
    
    # Calendar
    path('calendar/', views.CalendarView.as_view(), name='calendar-view'),
]