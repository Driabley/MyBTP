"""
URL configuration for btp_platform project.
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Frontend pages
    path('login/', views.login_view, name='login'),
    path('', views.dashboard, name='dashboard'),
    path('planning/', views.planning, name='planning'),
    path('planning/create/', views.create_planning_slot, name='create_planning_slot'),
    path('chantiers/', views.chantiers, name='chantiers'),
    path('team/', views.team, name='team'),
    path('team/<int:id>/', views.employee_detail, name='employee_detail'),
    path('pistes/', views.pistes, name='pistes'),
    path('map/', views.map_view, name='map'),
    path('fleet/', views.fleet, name='fleet'),
    path('fleet/<int:id>/', views.fleet_item_detail, name='fleet_item_detail'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
