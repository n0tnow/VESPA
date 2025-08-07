from django.urls import path
from . import views

urlpatterns = [
    # Dashboard and Analytics
    path('dashboard/', views.ServiceDashboardView.as_view(), name='service-dashboard'),
    path('revenue/', views.ServiceRevenueView.as_view(), name='service-revenue'),
    
    # Service Records
    path('', views.ServicesView.as_view(), name='services'),
    path('<int:service_id>/', views.ServiceDetailView.as_view(), name='service-detail'),
    path('<int:service_id>/status/', views.ServiceStatusView.as_view(), name='service-status'),
    path('<int:service_id>/parts/', views.ServicePartsView.as_view(), name='service-parts'),
    
    # Paint Jobs and Templates
    path('paint/templates/<int:vespa_model_id>/', views.PaintTemplatesView.as_view(), name='paint-templates'),
    path('paint/template-parts/<int:template_id>/', views.PaintTemplatePartsView.as_view(), name='paint-template-parts'),
    path('paint/jobs/', views.PaintJobsView.as_view(), name='paint-jobs'),
    path('paint/jobs/<int:paint_job_id>/', views.PaintJobDetailView.as_view(), name='paint-job-detail'),
    
    # Work Types Management
    path('work-types/', views.WorkTypesView.as_view(), name='work-types'),
    path('work-types/<int:work_type_id>/', views.WorkTypeDetailView.as_view(), name='work-type-detail'),
    path('work-types/categories/', views.WorkTypesCategoriesView.as_view(), name='work-types-categories'),
]