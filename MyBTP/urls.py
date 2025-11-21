"""
URL configuration for MyBTP project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views
from projects.views import create_chantier, list_chantiers, chantier_detail, map_chantiers
from accounts.views import create_employee, list_employees
from teams.views import create_team, list_teams, update_team, delete_team

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/', include('api.urls')),
    
    # Chat routes
    path('', include('chat.urls')),
    
    # Authentication - using accounts app
    path('', include('accounts.urls')),
    
    # Main views (must come after auth to avoid conflicts)
    path('', views.dashboard, name='dashboard'),
    path('planning/', views.planning, name='planning'),
    path('planning/create/', views.create_planning_slot, name='create_planning_slot'),
    path('planning/list/', views.list_planning_slots, name='list_planning_slots'),
    path('chantiers/', views.chantiers, name='chantiers'),
    path('chantiers/<int:id>/', chantier_detail, name='chantier_detail'),
    path('chantiers/list/', list_chantiers, name='list_chantiers'),
    path('chantiers/create/', create_chantier, name='create_chantier'),
    path('team/', views.team, name='team'),
    path('team/<int:id>/', views.employee_detail, name='employee_detail'),
    path('team/employees/list/', list_employees, name='list_employees'),
    path('team/employees/create/', create_employee, name='create_employee'),
    path('team/teams/list/', list_teams, name='list_teams'),
    path('team/teams/create/', create_team, name='create_team'),
    path('team/teams/<int:pk>/edit/', update_team, name='update_team'),
    path('team/teams/<int:pk>/delete/', delete_team, name='delete_team'),
    path('pistes/', views.pistes, name='pistes'),
    path('map/', map_chantiers, name='map_chantiers'),
    path('fleet/', views.fleet, name='fleet'),
    path('fleet/<int:id>/', views.fleet_item_detail, name='fleet_item_detail'),
    
    
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

