"""
Unit tests for the API
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from projects.models import Chantiers
from accounts.models import User


class ProjectAPITestCase(TestCase):
    """Test cases for Project API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.api_key = 'test-api-key-12345'
        self.invalid_api_key = 'invalid-key'
        
        # Create a test project
        self.project_data = {
            'contact': 'Test Contact',
            'adresse_chantier': '123 Test Street',
            'cp_ville_chantier': '75001 Paris',
            'ville_chantier': 'Paris',
            'client_final_type': 'Particulier',
            'devis_ht': '10000.00',
        }
    
    def test_list_projects_public(self):
        """Test that GET /api/projects/ is publicly accessible"""
        # Don't send API key
        response = self.client.get('/api/projects/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_retrieve_project_with_api_key(self):
        """Test that GET /api/projects/{id}/ requires API key"""
        # Create a project first
        project = Chantiers.objects.create(**self.project_data)
        
        # Try without API key - should fail
        response = self.client.get(f'/api/projects/{project.id}/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)
        self.assertIn('Invalid or missing API key', str(response.data['detail']))
        
        # Try with valid API key - should succeed
        self.client.credentials(HTTP_X_API_KEY=self.api_key)
        response = self.client.get(f'/api/projects/{project.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], project.id)
    
    def test_retrieve_project_invalid_api_key(self):
        """Test that GET /api/projects/{id}/ rejects invalid API key"""
        project = Chantiers.objects.create(**self.project_data)
        
        # Try with invalid API key
        self.client.credentials(HTTP_X_API_KEY=self.invalid_api_key)
        response = self.client.get(f'/api/projects/{project.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Invalid or missing API key', str(response.data['detail']))
    
    def test_create_project_with_api_key(self):
        """Test that POST /api/projects/ creates a project with valid API key"""
        self.client.credentials(HTTP_X_API_KEY=self.api_key)
        
        response = self.client.post('/api/projects/', self.project_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['contact'], self.project_data['contact'])
        
        # Verify the project was created in the database
        project = Chantiers.objects.get(id=response.data['id'])
        self.assertEqual(project.contact, self.project_data['contact'])
    
    def test_create_project_without_api_key(self):
        """Test that POST /api/projects/ requires API key"""
        # Don't send API key
        response = self.client.post('/api/projects/', self.project_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Invalid or missing API key', str(response.data['detail']))
    
    def test_create_project_invalid_api_key(self):
        """Test that POST /api/projects/ rejects invalid API key"""
        self.client.credentials(HTTP_X_API_KEY=self.invalid_api_key)
        
        response = self.client.post('/api/projects/', self.project_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Invalid or missing API key', str(response.data['detail']))
    
    def test_create_project_validation(self):
        """Test that POST /api/projects/ validates required fields"""
        self.client.credentials(HTTP_X_API_KEY=self.api_key)
        
        # Try to create project without required fields
        invalid_data = {
            'contact': 'Test Contact',
            # Missing adresse_chantier, cp_ville_chantier, etc.
        }
        
        response = self.client.post('/api/projects/', invalid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data or {})


class PlanningAPITestCase(TestCase):
    """Test cases for Planning API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.api_key = 'test-api-key-12345'
        
        # Create test user (employee)
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            prenom='Test',
            nom='User',
            cout_h='25.00'
        )
        
        # Create test project (chantier)
        self.project = Chantiers.objects.create(
            contact='Test Contact',
            adresse_chantier='123 Test Street',
            cp_ville_chantier='75001 Paris',
            ville_chantier='Paris',
            client_final_type='Particulier',
        )
    
    def test_create_planning_with_api_key(self):
        """Test that POST /api/planning/ creates a planning entry with valid API key"""
        self.client.credentials(HTTP_X_API_KEY=self.api_key)
        
        planning_data = {
            'user': self.user.id,
            'chantier': self.project.id,
            'date': '2024-01-15',
            'start_hour': '08:00:00',
            'end_hour': '12:00:00',
        }
        
        response = self.client.post('/api/planning/', planning_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['user'], self.user.id)
        self.assertEqual(response.data['chantier'], self.project.id)
    
    def test_create_planning_without_api_key(self):
        """Test that POST /api/planning/ requires API key"""
        planning_data = {
            'user': self.user.id,
            'chantier': self.project.id,
            'date': '2024-01-15',
            'start_hour': '08:00:00',
            'end_hour': '12:00:00',
        }
        
        response = self.client.post('/api/planning/', planning_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Invalid or missing API key', str(response.data['detail']))

