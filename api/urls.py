"""
URL configuration for the API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProjectViewSet,
    TeamViewSet,
    EmployeeViewSet,
    PlanningViewSet,
    PlanningCreateView,
    TeamEmployeesView,
)

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'planning', PlanningViewSet, basename='planning')

app_name = 'api'

urlpatterns = [
    # Router URLs for standard CRUD endpoints
    path('', include(router.urls)),
    
    # Custom endpoints
    # GET /api/teams/{team_id}/employees/
    path('teams/<int:team_id>/employees/', TeamEmployeesView.as_view(), name='team-employees'),
    
    # POST /api/planning/ (alternative explicit path)
    path('planning/', PlanningCreateView.as_view(), name='planning-create'),
]

