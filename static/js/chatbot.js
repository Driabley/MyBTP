/**
 * Chatbot functionality for BTP Platform
 */

(function() {
    'use strict';

    const messagesContainer = document.getElementById('chatbot-messages');
    const inputElement = document.getElementById('chatbot-input');
    const sendButton = document.getElementById('chatbot-send-btn');
    const emptyState = document.getElementById('chatbot-empty-state');

    // Auto-resize textarea
    if (inputElement) {
        inputElement.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        // Send on Enter (Shift+Enter for new line)
        inputElement.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Send button click
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    function sendMessage() {
        const message = inputElement.value.trim();
        
        if (!message) {
            return;
        }

        // Disable input and button
        inputElement.disabled = true;
        sendButton.disabled = true;

        // Hide empty state
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        // Add user message to chat
        addMessage(message, 'user');

        // Clear input
        inputElement.value = '';
        inputElement.style.height = 'auto';

        // Show loading message
        const loadingMessageId = addLoadingMessage();

        // Send to backend
        fetch('/api/chatbot/send/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            credentials: 'include',
            body: JSON.stringify({ message: message })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.detail || 'Une erreur est survenue');
                });
            }
            return response.json();
        })
        .then(data => {
            // Remove loading message
            removeMessage(loadingMessageId);

            // Add bot response
            if (data.reply) {
                addMessage(data.reply, 'bot');
            } else {
                addMessage('Désolé, je n\'ai pas pu générer de réponse.', 'bot');
            }
        })
        .catch(error => {
            // Remove loading message
            removeMessage(loadingMessageId);

            // Show error message
            addMessage(
                `Erreur: ${error.message || 'Impossible de communiquer avec l\'assistant. Veuillez réessayer.'}`,
                'bot'
            );
        })
        .finally(() => {
            // Re-enable input and button
            inputElement.disabled = false;
            sendButton.disabled = false;
            inputElement.focus();
        });
    }

    function addMessage(text, type) {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message chatbot-message--${type}`;
        messageDiv.setAttribute('data-message-id', Date.now().toString());

        // Create avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'chatbot-message__avatar';
        if (type === 'user') {
            avatarDiv.textContent = 'U';
        } else {
            avatarDiv.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>';
        }

        // Create content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'chatbot-message__content';

        const textDiv = document.createElement('div');
        textDiv.className = 'chatbot-message__text';
        
        // Format text (simple line breaks to <br>)
        const formattedText = text.split('\n').map(line => {
            const p = document.createElement('p');
            p.textContent = line;
            return p.outerHTML;
        }).join('');
        
        textDiv.innerHTML = formattedText;
        contentDiv.appendChild(textDiv);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        // Add to container
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        scrollToBottom();

        return messageDiv.getAttribute('data-message-id');
    }

    function addLoadingMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message chatbot-message--bot chatbot-message--loading';
        messageDiv.setAttribute('data-message-id', 'loading-' + Date.now().toString());

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'chatbot-message__avatar';
        avatarDiv.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'chatbot-message__content';

        const textDiv = document.createElement('div');
        textDiv.className = 'chatbot-message__text';
        
        const loadingDots = document.createElement('div');
        loadingDots.className = 'chatbot-loading-dots';
        loadingDots.innerHTML = '<span></span><span></span><span></span>';
        
        textDiv.appendChild(loadingDots);
        contentDiv.appendChild(textDiv);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();

        return messageDiv.getAttribute('data-message-id');
    }

    function removeMessage(messageId) {
        const messageElement = messagesContainer.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.remove();
        }
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function getCSRFToken() {
        const tokenElement = document.querySelector('meta[name="csrf-token"]');
        return tokenElement ? tokenElement.getAttribute('content') : '';
    }

})();

