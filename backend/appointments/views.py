"""
Appointments API Views - Calendar and scheduling system
"""
from datetime import datetime, date, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .appointment_functions import (
    get_available_slots, get_appointment_slots_config,
    get_appointments_by_date_range, get_appointment_by_id,
    create_appointment, update_appointment_status, reschedule_appointment,
    get_appointment_summary, get_daily_appointment_stats
)


# ===== APPOINTMENT SLOTS =====

class AvailableSlotsView(APIView):
    """Get available appointment slots"""
    
    def get(self, request):
        """Get available slots for specific date"""
        try:
            date_str = request.GET.get('date')
            service_type = request.GET.get('service_type')
            
            if not date_str:
                return Response({
                    'error': 'Date parameter is required (YYYY-MM-DD)'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            slots = get_available_slots(appointment_date, service_type)
            
            return Response({
                'date': appointment_date,
                'service_type': service_type,
                'available_slots': slots,
                'count': len(slots)
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                'error': f'Invalid date format: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to get available slots: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SlotsConfigView(APIView):
    """Appointment slots configuration"""
    
    def get(self, request):
        """Get all configured appointment slots"""
        try:
            slots = get_appointment_slots_config()
            
            # Group by day of week
            slots_by_day = {}
            for slot in slots:
                day = slot['day_of_week']
                if day not in slots_by_day:
                    slots_by_day[day] = []
                slots_by_day[day].append(slot)
            
            return Response({
                'slots_config': slots,
                'slots_by_day': slots_by_day,
                'total_slots': len(slots)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get slots config: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== APPOINTMENTS =====

class AppointmentsView(APIView):
    """Appointment management"""
    
    def get(self, request):
        """Get appointments by date range"""
        try:
            start_date_str = request.GET.get('start_date')
            end_date_str = request.GET.get('end_date')
            status_filter = request.GET.get('status')
            
            # Default to current month if no dates provided
            if not start_date_str:
                start_date = date.today().replace(day=1)
            else:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            
            if not end_date_str:
                # Last day of current month
                next_month = start_date.replace(day=28) + timedelta(days=4)
                end_date = next_month - timedelta(days=next_month.day)
            else:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
            appointments = get_appointments_by_date_range(start_date, end_date, status_filter)
            
            return Response({
                'appointments': appointments,
                'date_range': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'status_filter': status_filter,
                'count': len(appointments)
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                'error': f'Invalid date format: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to get appointments: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new appointment"""
        try:
            # Convert date string to date object
            if 'appointment_date' in request.data:
                request.data['appointment_date'] = datetime.strptime(
                    request.data['appointment_date'], '%Y-%m-%d'
                ).date()
            
            # Convert time string to time object
            if 'appointment_time' in request.data:
                request.data['appointment_time'] = datetime.strptime(
                    request.data['appointment_time'], '%H:%M'
                ).time()
            
            appointment_id = create_appointment(request.data)
            appointment = get_appointment_by_id(appointment_id)
            
            return Response({
                'message': 'Appointment created successfully',
                'appointment': appointment
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to create appointment: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AppointmentDetailView(APIView):
    """Individual appointment operations"""
    
    def get(self, request, appointment_id):
        """Get appointment details"""
        try:
            appointment = get_appointment_by_id(appointment_id)
            
            if appointment:
                return Response({'appointment': appointment}, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Appointment not found'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            return Response({
                'error': f'Failed to get appointment: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AppointmentStatusView(APIView):
    """Update appointment status"""
    
    def post(self, request, appointment_id):
        """Update appointment status"""
        try:
            new_status = request.data.get('status')
            change_reason = request.data.get('reason', '')
            changed_by = getattr(request.user, 'id', 1)
            
            if not new_status:
                return Response({
                    'error': 'Status field is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success = update_appointment_status(appointment_id, new_status, change_reason, changed_by)
            
            if success:
                appointment = get_appointment_by_id(appointment_id)
                return Response({
                    'message': 'Appointment status updated successfully',
                    'appointment': appointment
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to update appointment status'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': f'Failed to update status: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AppointmentRescheduleView(APIView):
    """Reschedule appointment"""
    
    def post(self, request, appointment_id):
        """Reschedule appointment to new date/time"""
        try:
            new_date_str = request.data.get('new_date')
            new_time_str = request.data.get('new_time')
            reason = request.data.get('reason', '')
            
            if not new_date_str or not new_time_str:
                return Response({
                    'error': 'new_date and new_time are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            new_date = datetime.strptime(new_date_str, '%Y-%m-%d').date()
            new_time = datetime.strptime(new_time_str, '%H:%M').time()
            
            success = reschedule_appointment(appointment_id, new_date, new_time, reason)
            
            if success:
                appointment = get_appointment_by_id(appointment_id)
                return Response({
                    'message': 'Appointment rescheduled successfully',
                    'appointment': appointment
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to reschedule appointment'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to reschedule: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== CALENDAR VIEWS =====

class CalendarView(APIView):
    """Calendar view for appointments"""
    
    def get(self, request):
        """Get calendar view data for specific month"""
        try:
            year = int(request.GET.get('year', date.today().year))
            month = int(request.GET.get('month', date.today().month))
            
            # Calculate month date range
            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = date(year, month + 1, 1) - timedelta(days=1)
            
            appointments = get_appointments_by_date_range(start_date, end_date)
            
            # Group appointments by date
            appointments_by_date = {}
            for appointment in appointments:
                date_key = appointment['appointment_date'].strftime('%Y-%m-%d')
                if date_key not in appointments_by_date:
                    appointments_by_date[date_key] = []
                appointments_by_date[date_key].append(appointment)
            
            return Response({
                'year': year,
                'month': month,
                'start_date': start_date,
                'end_date': end_date,
                'appointments_by_date': appointments_by_date,
                'total_appointments': len(appointments)
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                'error': f'Invalid year/month: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to get calendar data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== ANALYTICS =====

class AppointmentDashboardView(APIView):
    """Appointment analytics dashboard"""
    
    def get(self, request):
        """Get appointment statistics and analytics"""
        try:
            summary = get_appointment_summary()
            daily_stats = get_daily_appointment_stats(30)
            
            return Response({
                'summary': summary,
                'daily_stats': daily_stats,
                'stats_period_days': 30
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get appointment dashboard: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
