"""
Django REST Framework viewsets and views for the API
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.http import Http404

from projects.models import Chantiers
from teams.models import Equipe
from accounts.models import User
from planning.models import Planning

from .serializers import (
    ProjectSerializer,
    TeamSerializer,
    EmployeeSerializer,
    PlanningSerializer,
)
from .permissions import IsPublicOrAPIKey, IsAPIKeyAuthenticated


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Projects (Chantiers)
    
    Endpoints:
    - GET /api/projects/ -> list all projects (PUBLIC)
    - GET /api/projects/{id}/ -> get one project (AUTH required)
    - POST /api/projects/ -> create a project (AUTH required)
    """
    queryset = Chantiers.objects.all()
    serializer_class = ProjectSerializer
    authentication_classes = []  # APIKeyAuthentication will be added globally
    permission_classes = [IsPublicOrAPIKey]
    
    def get_permissions(self):
        """
        Override get_permissions to use different permissions for different actions
        """
        if self.action == 'list':
            # Public access for list
            return [permissions.AllowAny()]
        else:
            # API key required for retrieve and create
            return [IsAPIKeyAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        """List all projects - PUBLIC"""
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """Get one project - AUTH required"""
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """Create a project - AUTH required"""
        return super().create(request, *args, **kwargs)


class TeamViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Teams (Equipe)
    
    Endpoints:
    - GET /api/teams/ -> list all teams (PUBLIC)
    - GET /api/teams/{id}/ -> get one team (AUTH required)
    - POST /api/teams/ -> create a team (AUTH required)
    """
    queryset = Equipe.objects.all()
    serializer_class = TeamSerializer
    authentication_classes = []
    permission_classes = [IsPublicOrAPIKey]
    
    def get_permissions(self):
        """Override get_permissions for different actions"""
        if self.action == 'list':
            return [permissions.AllowAny()]
        else:
            return [IsAPIKeyAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        """List all teams - PUBLIC"""
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """Get one team - AUTH required"""
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """Create a team - AUTH required"""
        return super().create(request, *args, **kwargs)


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Employees (User)
    
    Endpoints:
    - GET /api/employees/{id}/ -> get one employee (AUTH required)
    - POST /api/employees/ -> create an employee (AUTH required)
    """
    queryset = User.objects.all()
    serializer_class = EmployeeSerializer
    authentication_classes = []
    permission_classes = [IsAPIKeyAuthenticated]
    
    def retrieve(self, request, *args, **kwargs):
        """Get one employee - AUTH required"""
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """Create an employee - AUTH required"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class TeamEmployeesView(APIView):
    """
    Custom view for GET /api/teams/{team_id}/employees/
    List employees of a specific team (AUTH required)
    """
    authentication_classes = []
    permission_classes = [IsAPIKeyAuthenticated]
    
    def get(self, request, team_id):
        """Get employees for a team"""
        team = get_object_or_404(Equipe, pk=team_id)
        
        # Get employees in this team (via the equipe ForeignKey)
        employees = User.objects.filter(equipe=team)
        
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)


class PlanningViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Planning (time slots)
    
    Endpoints:
    - POST /api/planning/ -> create a planning entry (AUTH required)
    """
    queryset = Planning.objects.all()
    serializer_class = PlanningSerializer
    authentication_classes = []
    permission_classes = [IsAPIKeyAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Create a planning entry - AUTH required"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class PlanningCreateView(APIView):
    """
    Custom view for POST /api/planning/
    Create a planning entry (AUTH required)
    """
    authentication_classes = []
    permission_classes = [IsAPIKeyAuthenticated]
    
    def post(self, request):
        """Create a planning entry"""
        serializer = PlanningSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

