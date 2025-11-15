/**
 * Pistes Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    loadPistes();
    setupEventListeners();
});

function loadPistes() {
    // Since we don't have API, just show empty state
    const pistes = [];
    renderPistes(pistes);
}

function renderPistes(pistes) {
    const tbody = document.getElementById('pistes-table-body');
    if (!tbody) return;

    if (pistes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 40px; color: var(--muted);">Aucune piste trouvée</td></tr>';
        return;
    }

    tbody.innerHTML = pistes.map(piste => `
        <tr>
            <td>${piste.client}</td>
            <td><span class="chip">${piste.statut}</span></td>
            <td>${piste.source || '-'}</td>
            <td>${utils.formatCurrency(piste.montant_estime)}</td>
            <td>${utils.formatPercentage(piste.probabilite)}</td>
            <td>${utils.formatDateShort(piste.date_relance)}</td>
            <td>
                <button class="btn btn--secondary" onclick="viewPiste(${piste.id})">Voir</button>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    const addBtn = document.getElementById('add-piste-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            alert('Fonctionnalité à implémenter avec Django forms');
        });
    }
}

function viewPiste(id) {
    console.log('View piste:', id);
}
