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
    // Since we don't have API, just show empty state
    employees = [];
    renderEmployees();
    updateEmployeeCount();
}

function loadTeams() {
    // Since we don't have API, just show empty state
    teams = [];
    renderTeams();
}

function renderEmployees() {
    const tbody = document.getElementById('employees-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding: 40px; color: var(--muted);">Aucun employé trouvé</td></tr>';
}

function renderTeams() {
    const container = document.getElementById('teams-list');
    if (!container) return;

    container.innerHTML = '<div style="color: var(--muted); font-size: 14px; text-align: center; padding: 20px;">Aucune équipe</div>';
}

function updateEmployeeCount() {
    const countEl = document.getElementById('employee-count');
    if (countEl) {
        countEl.textContent = '0';
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
        <form id="add-employee-form">
            <div class="input-group">
                <label class="input-label">Prénom</label>
                <input type="text" class="input" name="prenom" required>
            </div>
            <div class="input-group">
                <label class="input-label">Nom</label>
                <input type="text" class="input" name="nom" required>
            </div>
            <div class="input-group">
                <label class="input-label">Email</label>
                <input type="email" class="input" name="email" required>
            </div>
            <div class="input-group">
                <label class="input-label">Téléphone</label>
                <input type="text" class="input" name="numero_telephone">
            </div>
            <div class="input-group">
                <label class="input-label">Type</label>
                <select class="select" name="user_type" required>
                    <option value="Employé">Employé</option>
                    <option value="Chef d\'équipe">Chef d'équipe</option>
                </select>
            </div>
            <div class="input-group">
                <label class="input-label">Coût Horaire (€)</label>
                <input type="number" class="input" name="cout_h" step="0.01">
            </div>
            <div style="display: flex; gap: 8px; margin-top: 20px;">
                <button type="button" class="btn btn--primary" onclick="alert('Fonctionnalité à implémenter avec Django forms')" style="flex: 1;">Créer</button>
                <button type="button" class="btn btn--secondary" onclick="this.closest('.modal').remove()">Annuler</button>
            </div>
        </form>
    `;

    const modal = utils.createModal('Ajouter un Employé', content);
}

function showAddTeamModal() {
    const content = `
        <form id="add-team-form">
            <div class="input-group">
                <label class="input-label">Nom de l'équipe</label>
                <input type="text" class="input" name="name" required>
            </div>
            <div class="input-group">
                <label class="input-label">Couleur</label>
                <input type="color" class="input" name="color" value="#6366F1" style="height: 40px;">
            </div>
            <div style="display: flex; gap: 8px; margin-top: 20px;">
                <button type="button" class="btn btn--primary" onclick="alert('Fonctionnalité à implémenter avec Django forms')" style="flex: 1;">Créer</button>
                <button type="button" class="btn btn--secondary" onclick="this.closest('.modal').remove()">Annuler</button>
            </div>
        </form>
    `;

    const modal = utils.createModal('Ajouter une Équipe', content);
}
