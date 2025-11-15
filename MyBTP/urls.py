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

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication
    path('login/', views.login_view, name='login'),
    
    # Main views
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

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

