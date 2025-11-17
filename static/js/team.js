/**
 * Team Page JavaScript
 */

let employees = [];
let teams = [];

document.addEventListener('DOMContentLoaded', function() {
    loadEmployees();
    loadTeams();
    setupEventListeners();
});

function loadEmployees() {
    fetch('/team/employees/list/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                employees = data.employees;
                renderEmployees();
                updateEmployeeCount();
            } else {
                employees = [];
                renderEmployees();
                updateEmployeeCount();
            }
        })
        .catch(error => {
            console.error('Error loading employees:', error);
            employees = [];
            renderEmployees();
            updateEmployeeCount();
        });
}

function loadTeams() {
    fetch('/team/teams/list/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                teams = data.teams;
                renderTeams();
            } else {
                teams = [];
                renderTeams();
            }
        })
        .catch(error => {
            console.error('Error loading teams:', error);
            teams = [];
            renderTeams();
        });
}

function renderEmployees() {
    const tbody = document.getElementById('employees-table-body');
    if (!tbody) return;

    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 40px; color: var(--muted);">Aucun employé trouvé</td></tr>';
        return;
    }

    tbody.innerHTML = employees.map(employee => {
        const fullName = employee.full_name || `${employee.prenom || ''} ${employee.nom || ''}`.trim() || '-';
        const phone = employee.numero_telephone || '-';
        const equipe = employee.equipe || '-';
        const coutH = employee.cout_h ? `${parseFloat(employee.cout_h).toFixed(2)} €` : '-';
        const role = employee.user_type || '-';
        // Format competences as comma-separated string
        let competences = '-';
        if (employee.competences && Array.isArray(employee.competences) && employee.competences.length > 0) {
            competences = employee.competences.join(', ');
        }
        
        return `
            <tr>
                <td>${fullName}</td>
                <td>${role}</td>
                <td>${phone}</td>
                <td>${equipe}</td>
                <td>${coutH}</td>
                <td>${competences}</td>
                <td>
                    <a href="/team/${employee.id}/" class="btn btn--secondary" style="padding: 4px 8px; font-size: 12px; text-decoration: none;">
                        Voir
                    </a>
                </td>
            </tr>
        `;
    }).join('');
}

function renderTeams() {
    const container = document.getElementById('teams-list');
    if (!container) return;

    if (teams.length === 0) {
        container.innerHTML = '<div style="color: var(--muted); font-size: 14px; text-align: center; padding: 20px;">Aucune équipe</div>';
        return;
    }

    container.innerHTML = teams.map(team => {
        const chef = team.chef_equipe || 'Non défini';
        const memberCount = team.member_count || 0;
        
        return `
            <div class="card card--pad" style="margin-bottom: 12px; border-left: 3px solid ${team.color || '#6C63FF'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-strong); margin-bottom: 4px;">${team.name}</div>
                        <div style="font-size: 12px; color: var(--muted);">
                            Chef: ${chef}<br>
                            Membres: ${memberCount}
                        </div>
                    </div>
                    <div style="width: 24px; height: 24px; border-radius: 4px; background: ${team.color || '#6C63FF'};"></div>
                </div>
            </div>
        `;
    }).join('');
}

function updateEmployeeCount() {
    const countEl = document.getElementById('employee-count');
    const labelEl = document.getElementById('employee-count-label');
    const count = employees.length;
    
    if (countEl) {
        countEl.textContent = count;
    }
    
    if (labelEl) {
        labelEl.textContent = `${count} compagnon${count > 1 ? 's' : ''}`;
    }
}

function setupEventListeners() {
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    const addTeamBtn = document.getElementById('add-team-btn');

    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', showAddEmployeeModal);
    }

    if (addTeamBtn) {
        addTeamBtn.addEventListener('click', showAddTeamModal);
    }
}

function showAddEmployeeModal() {
    const content = `
        <div style="margin-bottom: 16px; color: var(--muted); font-size: 14px;">
            Créez un nouveau profil en remplissant les informations ci-dessous.
        </div>
        <form id="add-employee-form">
            <div class="input-group">
                <label class="input-label">Prénom *</label>
                <input type="text" class="input" name="prenom" placeholder="Prénom" required>
            </div>
            <div class="input-group">
                <label class="input-label">Nom *</label>
                <input type="text" class="input" name="nom" placeholder="Nom" required>
            </div>
            <div class="input-group">
                <label class="input-label">Email *</label>
                <input type="email" class="input" name="email" placeholder="email@exemple.com" required>
            </div>
            <div class="input-group">
                <label class="input-label">Mot de passe *</label>
                <input type="password" class="input" name="password" placeholder="Minimum 6 caractères" required minlength="6">
            </div>
            <div class="input-group">
                <label class="input-label">Rôle *</label>
                <select class="select" name="user_type" required>
                    <option value="Employé" selected>Employé</option>
                    <option value="Chef d'équipe">Chef d'équipe</option>
                </select>
            </div>
            <div class="input-group">
                <label class="input-label">Téléphone</label>
                <input type="text" class="input" name="numero_telephone" placeholder="0123456789">
            </div>
            <div class="input-group">
                <label class="input-label">Coût horaire (€)</label>
                <input type="number" class="input" name="cout_h" step="0.01" min="0" placeholder="0.00">
            </div>
            <div style="display: flex; gap: 8px; margin-top: 24px; justify-content: flex-end;">
                <button type="button" class="btn btn--secondary" onclick="this.closest('.modal').remove()">Annuler</button>
                <button type="submit" class="btn btn--primary">
                    Créer
                </button>
            </div>
        </form>
    `;

    const modal = utils.createModal('Créer un compagnon', content);
    
    // Load teams for the dropdown (if needed, though not shown in screenshot)
    loadTeamsForDropdown(modal);
    
    // Handle form submission
    const form = modal.querySelector('#add-employee-form');
    if (form) {
        form.addEventListener('submit', handleEmployeeSubmit);
    }
}

function showAddTeamModal() {
    const content = `
        <form id="add-team-form">
            <div class="input-group">
                <label class="input-label">Nom de l'équipe *</label>
                <input type="text" class="input" name="name" placeholder="Nom de l'équipe" required>
            </div>
            <div class="input-group">
                <label class="input-label">Couleur</label>
                <input type="color" class="input" name="color" value="#6366F1" style="height: 40px; padding: 2px;">
            </div>
            <div class="input-group">
                <label class="input-label">Chef d'équipe</label>
                <select class="select" name="chef_equipe">
                    <option value="">Aucun chef</option>
                </select>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 24px;">
                <button type="submit" class="btn btn--primary" style="flex: 1;">
                    <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Créer l'équipe
                </button>
                <button type="button" class="btn btn--secondary" onclick="this.closest('.modal').remove()">Annuler</button>
            </div>
        </form>
    `;

    const modal = utils.createModal('Ajouter une Équipe', content);
    
    // Load chefs d'équipe for the dropdown
    loadChefsEquipeForDropdown(modal);
    
    // Handle form submission
    const form = modal.querySelector('#add-team-form');
    if (form) {
        form.addEventListener('submit', handleTeamSubmit);
    }
}

function loadTeamsForDropdown(modal) {
    const select = modal.querySelector('select[name="equipe"]');
    if (!select || teams.length === 0) return;
    
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        select.appendChild(option);
    });
}

function loadChefsEquipeForDropdown(modal) {
    const select = modal.querySelector('select[name="chef_equipe"]');
    if (!select) return;
    
    // Filter employees to get only chefs d'équipe
    const chefs = employees.filter(emp => emp.user_type === 'Chef d\'équipe');
    
    chefs.forEach(chef => {
        const option = document.createElement('option');
        option.value = chef.id;
        option.textContent = chef.full_name;
        select.appendChild(option);
    });
}

function handleEmployeeSubmit(e) {
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
    
    fetch('/team/employees/create/', {
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
            showNotification('success', '', 'Nouvel employé bien enregistré !!', true);
            
            // Reload employees list
            loadEmployees();
        } else {
            // Show error notification
            let errorMessage = data.message || 'Erreur lors de la création de l\'employé.';
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
        showNotification('error', 'Erreur', 'Une erreur est survenue lors de la création de l\'employé.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    });
}

function handleTeamSubmit(e) {
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
    
    fetch('/team/teams/create/', {
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
            showNotification('success', '', 'Nouvelle équipe bien enregistrée !!', true);
            
            // Reload teams list
            loadTeams();
            // Also reload employees in case a team was added that should appear in employee form
            loadEmployees();
        } else {
            // Show error notification
            let errorMessage = data.message || 'Erreur lors de la création de l\'équipe.';
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
        showNotification('error', 'Erreur', 'Une erreur est survenue lors de la création de l\'équipe.');
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
