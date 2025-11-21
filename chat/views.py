"""
Views for the chatbot page
"""
import json
import requests
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt


@method_decorator(login_required, name='dispatch')
class ChatbotPageView(View):
    """Render the chatbot page"""
    
    def get(self, request):
        context = {
            'page_title': 'Assistant BTP Platform'
        }
        return render(request, 'chat/chatbot.html', context)


@csrf_exempt
@require_POST
def chatbot_send_message(request):
    """
    API endpoint to send a message to the chatbot and get a reply
    
    Accepts: POST with JSON body: {"message": "user message string"}
    Returns: JSON: {"reply": "<assistant answer string>"} or error JSON
    """
    try:
        # Parse JSON body
        data = json.loads(request.body)
        message = data.get('message')
        
        # Validate message
        if not message or not message.strip():
            return JsonResponse(
                {'detail': "Missing 'message'."},
                status=400
            )
        
        # Get webhook URL from settings
        webhook_url = getattr(settings, 'N8N_CHAT_WEBHOOK_URL', None)
        if not webhook_url:
            return JsonResponse(
                {'detail': 'Chatbot webhook URL not configured.'},
                status=500
            )
        
        # Prepare payload for n8n webhook
        payload = {
            'message': message.strip(),
            'source': 'btp-platform-chatbot'
        }
        
        # Call n8n webhook
        try:
            response = requests.post(
                webhook_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30  # 30 seconds timeout
            )
            response.raise_for_status()  # Raise an exception for bad status codes
            
            # Parse response from n8n
            response_data = response.json()
            
            # Extract reply (adapt if n8n returns different structure)
            reply = response_data.get('reply', '')
            
            if not reply:
                # If reply is empty or missing, try alternative keys
                reply = response_data.get('message', response_data.get('response', 'Désolé, je n\'ai pas pu générer de réponse.'))
            
            return JsonResponse({'reply': reply})
            
        except requests.exceptions.Timeout:
            return JsonResponse(
                {'detail': 'Upstream chatbot unavailable (timeout).'},
                status=502
            )
        except requests.exceptions.RequestException as e:
            # Handle connection errors, HTTP errors, etc.
            return JsonResponse(
                {'detail': 'Upstream chatbot unavailable.'},
                status=502
            )
        except (ValueError, KeyError) as e:
            # Handle JSON parsing errors or missing keys
            return JsonResponse(
                {'detail': 'Invalid response from chatbot service.'},
                status=502
            )
            
    except json.JSONDecodeError:
        return JsonResponse(
            {'detail': 'Invalid JSON in request body.'},
            status=400
        )
    except Exception as e:
        # Catch any other unexpected errors
        return JsonResponse(
            {'detail': 'An error occurred processing your request.'},
            status=500
        )

