"""
URL configuration for the chat app
"""
from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('chatbot/', views.ChatbotPageView.as_view(), name='chatbot'),
    path('api/chatbot/send/', views.chatbot_send_message, name='chatbot_send_message'),
]

