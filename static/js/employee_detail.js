/**
 * Employee Detail Page JavaScript
 */

function loadEmployeeDetail(id) {
    // Since we don't have API, show placeholder
    const container = document.getElementById('employee-detail');
    if (!container) return;

    container.innerHTML = `
        <div style="color: var(--muted); text-align: center; padding: 40px;">
            <p>Chargement des données de l'employé #${id}...</p>
            <p style="font-size: 12px; margin-top: 8px;">Fonctionnalité à implémenter avec Django views</p>
        </div>
    `;
}
