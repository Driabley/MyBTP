"""
Custom authentication classes for the API
"""
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings


class APIKeyAuthentication(authentication.BaseAuthentication):
    """
    Custom API key authentication using X-API-KEY header
    """
    
    def authenticate(self, request):
        """
        Authenticate the request using the X-API-KEY header
        Returns (user, token) tuple or None
        """
        api_key = request.META.get('HTTP_X_API_KEY') or request.META.get('X_API_KEY')
        
        if not api_key:
            return None
        
        # Get valid API keys from settings
        valid_api_keys = getattr(settings, 'API_KEYS', [])
        
        if not valid_api_keys:
            # If no API keys configured, deny access
            raise AuthenticationFailed('API keys are not configured')
        
        # Check if the provided key is valid
        if api_key not in valid_api_keys:
            raise AuthenticationFailed('Invalid or missing API key.')
        
        # API key is valid, but we don't have a user model for API key auth
        # Return None user and the API key as the token
        return (None, api_key)

