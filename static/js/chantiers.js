/**
 * Chantiers Page JavaScript
 */

let chantiers = [];
let filteredChantiers = [];

document.addEventListener('DOMContentLoaded', function() {
    loadChantiers();
    setupEventListeners();
});

function loadChantiers() {
    fetch('/chantiers/list/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                chantiers = data.chantiers;
                filteredChantiers = [...chantiers];
                renderChantiers();
                updateStats();
            } else {
                chantiers = [];
                filteredChantiers = [];
                renderChantiers();
            }
        })
        .catch(error => {
            console.error('Error loading chantiers:', error);
            chantiers = [];
            filteredChantiers = [];
            renderChantiers();
        });
}

function renderChantiers() {
    const tbody = document.getElementById('chantiers-table-body');
    if (!tbody) return;

    if (filteredChantiers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--muted);">Aucun chantier trouvé</td></tr>';
        return;
    }

    tbody.innerHTML = filteredChantiers.map(chantier => {
        const chef = chantier.chef_chantier || '-';
        const devis = chantier.devis_ht ? utils.formatCurrency(chantier.devis_ht) : '-';
        const jours = chantier.nombre_de_jours_chantier || '-';
        
        return `
            <tr>
                <td>${chantier.name_chantier || '-'}</td>
                <td>${chantier.adresse_chantier || '-'}<br><small style="color: var(--muted);">${chantier.cp_ville_chantier || ''}</small></td>
                <td>${chef}</td>
                <td>${devis}</td>
                <td>${jours}</td>
                <td>
                    <a href="/chantiers/${chantier.id}/" class="btn btn--secondary" style="padding: 4px 8px; font-size: 12px; text-decoration: none;">
                        Voir
                    </a>
                </td>
            </tr>
        `;
    }).join('');
}

function updateStats() {
    // Update stats cards
    const total = chantiers.length;
    const active = chantiers.filter(c => c.avancement_chantier < 100).length;
    const totalCost = chantiers.reduce((sum, c) => sum + (c.devis_ht || 0), 0);
    
    const statsCards = document.querySelectorAll('#stats-cards .metric__value');
    if (statsCards.length >= 3) {
        statsCards[0].textContent = total;
        statsCards[1].textContent = active;
        statsCards[2].textContent = utils.formatCurrency(totalCost);
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const filterManager = document.getElementById('filter-manager');
    const filterStatus = document.getElementById('filter-status');
    const addBtn = document.getElementById('add-chantier-btn');

    if (searchInput) {
        searchInput.addEventListener('input', utils.debounce(filterChantiers, 300));
    }

    if (filterManager) {
        filterManager.addEventListener('change', filterChantiers);
    }

    if (filterStatus) {
        filterStatus.addEventListener('change', filterChantiers);
    }

    if (addBtn) {
        addBtn.addEventListener('click', showAddChantierModal);
    }
}

function filterChantiers() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const managerFilter = document.getElementById('filter-manager')?.value || '';
    const statusFilter = document.getElementById('filter-status')?.value || '';

    filteredChantiers = chantiers.filter(chantier => {
        // Search filter
        const matchesSearch = !searchTerm || 
            (chantier.name_chantier && chantier.name_chantier.toLowerCase().includes(searchTerm)) ||
            (chantier.adresse_chantier && chantier.adresse_chantier.toLowerCase().includes(searchTerm)) ||
            (chantier.cp_ville_chantier && chantier.cp_ville_chantier.toLowerCase().includes(searchTerm));

        // Manager filter
        const matchesManager = !managerFilter || 
            (chantier.chef_chantier && chantier.chef_chantier === managerFilter);

        // Status filter (by avancement)
        let matchesStatus = true;
        if (statusFilter) {
            const progress = chantier.avancement_chantier || 0;
            if (statusFilter === '0') {
                matchesStatus = progress === 0;
            } else if (statusFilter === '50') {
                matchesStatus = progress > 0 && progress < 100;
            } else if (statusFilter === '100') {
                matchesStatus = progress === 100;
            }
        }

        return matchesSearch && matchesManager && matchesStatus;
    });

    renderChantiers();
}

function showAddChantierModal() {
    const content = `
        <form id="add-chantier-form">
            <div class="input-group">
                <label class="input-label">Adresse du chantier *</label>
                <textarea class="input" name="adresse_chantier" rows="2" placeholder="Adresse complète du chantier" required></textarea>
            </div>
            <div class="input-group">
                <label class="input-label">Code postal et ville *</label>
                <input type="text" class="input" name="cp_ville_chantier" placeholder="Code postal et ville" required>
            </div>
            <div class="input-group">
                <label class="input-label">Type de client *</label>
                <select class="select" name="client_final_type" required>
                    <option value="Particulier" selected>Particulier</option>
                    <option value="Professionnel">Professionnel</option>
                </select>
            </div>
            <div class="input-group">
                <label class="input-label">Contact</label>
                <textarea class="input" name="contact" rows="2" placeholder="Si besoin pendant le chantier..."></textarea>
            </div>
            <div class="input-group">
                <label class="input-label">Devis HT (€) *</label>
                <input type="number" class="input" name="devis_ht" step="0.01" min="0" placeholder="0.00" required>
            </div>
            <div class="input-group">
                <label class="input-label">Téléphone de contact</label>
                <input type="text" class="input" name="telephone_contact" placeholder="+33 6 12 34 56 78">
            </div>
            <div class="input-group">
                <label class="input-label">Chef de chantier</label>
                <select class="select" name="chef_chantier">
                    <option value="">Aucun</option>
                </select>
            </div>
            <div class="input-group">
                <label class="input-label">Date de rendez-vous technique</label>
                <input type="date" class="input" name="date_rdv_technique">
            </div>
            <div class="input-group">
                <label class="input-label">Date de début</label>
                <input type="date" class="input" name="date_debut_chantier">
            </div>
            <div class="input-group">
                <label class="input-label">URL du brief</label>
                <input type="url" class="input" name="brief_url" placeholder="https://...">
            </div>
            <div style="display: flex; gap: 8px; margin-top: 24px;">
                <button type="submit" class="btn btn--primary" style="flex: 1;">
                    <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Créer le chantier
                </button>
                <button type="button" class="btn btn--secondary" onclick="this.closest('.modal').remove()">Annuler</button>
            </div>
        </form>
    `;

    const modal = utils.createModal('Ajouter un Chantier', content);
    
    // Load chefs d'équipe for the dropdown
    loadChefsEquipe(modal);
    
    // Handle form submission
    const form = modal.querySelector('#add-chantier-form');
    if (form) {
        form.addEventListener('submit', handleChantierSubmit);
    }
}

function loadChefsEquipe(modal) {
    // Fetch chefs d'équipe from API or use a predefined list
    // For now, we'll leave it empty or you can populate it if you have an API endpoint
    const select = modal.querySelector('select[name="chef_chantier"]');
    // TODO: Load from API endpoint if available
}

function handleChantierSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Disable submit button and show loading
    submitButton.disabled = true;
    submitButton.innerHTML = '<span>Création en cours...</span>';
    
    // Get CSRF token
    const csrftoken = getCSRFToken();
    
    fetch('/chantiers/create/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close modal
            const modal = form.closest('.modal');
            if (modal) {
                modal.remove();
            }
            
            // Show success notification (quiet, at bottom)
            showNotification('success', '', 'Nouveau chantier bien enregistré !!', true);
            
            // Reload chantiers list
            loadChantiers();
        } else {
            // Show error notification
            let errorMessage = data.message || 'Erreur lors de la création du chantier.';
            if (data.errors) {
                const firstError = Object.values(data.errors)[0];
                if (firstError) {
                    errorMessage = firstError;
                }
            }
            showNotification('error', 'Erreur', errorMessage);
            
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('error', 'Erreur', 'Une erreur est survenue lors de la création du chantier.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    });
}

function showNotification(type, title, message, quiet = false) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const icons = {
        success: `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `,
        error: `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `,
        info: `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        `
    };
    
    const notification = document.createElement('div');
    const quietClass = quiet ? ' notification--quiet' : '';
    notification.className = `notification notification--${type}${quietClass}`;
    
    const titleHtml = title ? `<div class="notification__title">${title}</div>` : '';
    
    notification.innerHTML = `
        <div class="notification__icon">
            ${icons[type] || icons.info}
        </div>
        <div class="notification__content">
            ${titleHtml}
            <div class="notification__message">${message}</div>
        </div>
        <button class="notification__close" onclick="this.closest('.notification').remove()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds (shorter for quiet notifications)
    const timeout = quiet ? 4000 : 5000;
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('notification--closing');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, timeout);
}

// Helper function to get CSRF token
function getCSRFToken() {
    // Try to get from meta tag first
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
        return metaTag.getAttribute('content');
    }
    
    // Fall back to cookie
    return getCookie('csrftoken');
}

// Helper function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
