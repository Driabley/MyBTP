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
    // Since we don't have API, just show empty state
    chantiers = [];
    filteredChantiers = [];
    renderChantiers();
}

function renderChantiers() {
    const tbody = document.getElementById('chantiers-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 40px; color: var(--muted);">Aucun chantier trouvé</td></tr>';
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
    // Filter logic would go here when we have data
    renderChantiers();
}

function showAddChantierModal() {
    const content = `
        <form id="add-chantier-form">
            <div class="input-group">
                <label class="input-label">Adresse</label>
                <input type="text" class="input" name="adresse_chantier" required>
            </div>
            <div class="input-group">
                <label class="input-label">Code Postal et Ville</label>
                <input type="text" class="input" name="cp_ville_chantier" required>
            </div>
            <div class="input-group">
                <label class="input-label">Type de Client</label>
                <select class="select" name="client_final_type" required>
                    <option value="Particulier">Particulier</option>
                    <option value="Professionnel">Professionnel</option>
                </select>
            </div>
            <div class="input-group">
                <label class="input-label">Devis HT (€)</label>
                <input type="number" class="input" name="devis_ht" step="0.01" required>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 20px;">
                <button type="button" class="btn btn--primary" onclick="alert('Fonctionnalité à implémenter avec Django forms')" style="flex: 1;">Créer</button>
                <button type="button" class="btn btn--secondary" onclick="this.closest('.modal').remove()">Annuler</button>
            </div>
        </form>
    `;

    const modal = utils.createModal('Ajouter un Chantier', content);
}
