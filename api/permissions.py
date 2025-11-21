"""
Custom permission classes for the API
"""
from rest_framework import permissions


class IsPublicOrAPIKey(permissions.BasePermission):
    """
    Custom permission that allows:
    - Public access (no auth) to list endpoints only
    - API key authentication for all other actions
    """
    
    def has_permission(self, request, view):
        """
        Check if the request is allowed based on action and authentication
        """
        # Get the action (list, retrieve, create, update, destroy, etc.)
        action = getattr(view, 'action', None)
        
        # If no action is set (e.g., in APIView), check the HTTP method
        if action is None:
            action = request.method.lower()
        
        # Public endpoints: GET list actions only
        is_public_list = (
            action in ['list'] and 
            request.method == 'GET'
        )
        
        if is_public_list:
            # Public access allowed for list endpoints
            return True
        
        # All other actions require API key authentication
        # Check if the request has been authenticated (via APIKeyAuthentication)
        return request.auth is not None


class IsAPIKeyAuthenticated(permissions.BasePermission):
    """
    Permission class that requires API key authentication
    """
    
    def has_permission(self, request, view):
        """
        Check if the request has a valid API key
        """
        return request.auth is not None

