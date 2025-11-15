/**
 * Planning Page JavaScript
 */

let planningData = [];
let currentView = 'workers'; // 'workers' or 'sites'
let currentDateRange = 'week';

document.addEventListener('DOMContentLoaded', function() {
    setupDateRange();
    loadPlanning();
    setupEventListeners();
});

function setupDateRange() {
    const { start, end } = currentDateRange === 'week' ? utils.getWeekDates() : utils.getMonthDates();
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    if (dateFrom) dateFrom.value = utils.formatDateForAPI(start);
    if (dateTo) dateTo.value = utils.formatDateForAPI(end);
}

function loadPlanning() {
    // Since we don't have API, just render empty state
    planningData = [];
    renderPlanning();
}

function renderPlanning() {
    const container = document.getElementById('planning-calendar');
    if (!container) return;

    if (currentView === 'workers') {
        renderWorkersView();
    } else {
        renderSitesView();
    }
}

function renderWorkersView() {
    const container = document.getElementById('planning-calendar');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--muted);">
            <p>Vue Employés - Calendrier de planning</p>
            <p style="font-size: 12px; margin-top: 8px;">Utilisez le bouton "Ajouter un créneau" pour créer un nouveau planning</p>
        </div>
    `;
}

function renderSitesView() {
    const container = document.getElementById('planning-calendar');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--muted);">
            <p>Vue Chantiers - Calendrier de planning</p>
            <p style="font-size: 12px; margin-top: 8px;">Utilisez le bouton "Ajouter un créneau" pour créer un nouveau planning</p>
        </div>
    `;
}

function setupEventListeners() {
    const viewToggle = document.getElementById('view-toggle');
    const dateRangeToggle = document.getElementById('date-range-toggle');
    const refreshBtn = document.getElementById('refresh-btn');
    const prevBtn = document.getElementById('prev-period');
    const nextBtn = document.getElementById('next-period');
    const addSlotBtn = document.getElementById('add-slot-btn');

    if (viewToggle) {
        viewToggle.addEventListener('click', () => {
            currentView = currentView === 'workers' ? 'sites' : 'workers';
            viewToggle.textContent = currentView === 'workers' ? 'Vue Employés' : 'Vue Chantiers';
            renderPlanning();
        });
    }

    if (dateRangeToggle) {
        dateRangeToggle.addEventListener('click', () => {
            currentDateRange = currentDateRange === 'week' ? 'month' : 'week';
            dateRangeToggle.textContent = currentDateRange === 'week' ? 'Semaine' : 'Mois';
            setupDateRange();
            loadPlanning();
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadPlanning);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            setupDateRange();
            loadPlanning();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            setupDateRange();
            loadPlanning();
        });
    }

    if (addSlotBtn) {
        addSlotBtn.addEventListener('click', showAddSlotModal);
    }
}

function showAddSlotModal() {
    // Get data from window.PLANNING_DATA set by Django template
    const users = window.PLANNING_DATA?.users || [];
    const chantiers = window.PLANNING_DATA?.chantiers || [];
    
    const content = `
        <form id="add-slot-form">
            <div class="input-group">
                <label class="input-label">Date *</label>
                <input type="date" class="input" name="date" required>
            </div>
            <div class="input-group">
                <label class="input-label">Heure de début *</label>
                <input type="time" class="input" name="start_hour" required>
            </div>
            <div class="input-group">
                <label class="input-label">Heure de fin *</label>
                <input type="time" class="input" name="end_hour" required>
            </div>
            <div class="input-group">
                <label class="input-label">Employé *</label>
                <select class="select" name="user" required>
                    <option value="">Sélectionner un employé</option>
                    ${users.map(user => `
                        <option value="${user.id}">${user.prenom} ${user.nom}</option>
                    `).join('')}
                </select>
            </div>
            <div class="input-group">
                <label class="input-label">Chantier *</label>
                <select class="select" name="chantier" required>
                    <option value="">Sélectionner un chantier</option>
                    ${chantiers.map(chantier => `
                        <option value="${chantier.id}">${chantier.name_chantier}</option>
                    `).join('')}
                </select>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 20px;">
                <button type="submit" class="btn btn--primary" style="flex: 1;">Créer</button>
                <button type="button" class="btn btn--secondary" id="cancel-slot-btn">Annuler</button>
            </div>
        </form>
    `;

    const modal = utils.createModal('Ajouter un Créneau', content);
    const form = modal.querySelector('#add-slot-form');
    const cancelBtn = modal.querySelector('#cancel-slot-btn');
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    form.querySelector('input[name="date"]').value = today;
    
    // Close modal on cancel
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/planning/create/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCSRFToken()
                },
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                modal.remove();
                loadPlanning();
                alert('Créneau créé avec succès');
            } else {
                alert('Erreur: ' + (result.error || 'Erreur lors de la création du créneau'));
            }
        } catch (error) {
            console.error('Error creating slot:', error);
            alert('Erreur lors de la création du créneau');
        }
    });
}

function getCSRFToken() {
    const name = 'csrftoken';
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
