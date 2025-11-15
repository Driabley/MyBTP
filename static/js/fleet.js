/**
 * Fleet Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    loadCommandes();
});

function loadCommandes() {
    // Since we don't have API, just show empty state
    const commandes = [];
    renderCommandes(commandes);
}

function renderCommandes(commandes) {
    const tbody = document.getElementById('commandes-table-body');
    if (!tbody) return;

    if (commandes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 40px; color: var(--muted);">Aucune commande trouvée</td></tr>';
        return;
    }

    tbody.innerHTML = commandes.map(cmd => `
        <tr>
            <td>${cmd.reference}</td>
            <td>${cmd.chantier_name}</td>
            <td>${cmd.fournisseur}</td>
            <td>${utils.formatCurrency(cmd.montant_ht)}</td>
            <td><span class="chip">${cmd.statut}</span></td>
            <td>${utils.formatDateShort(cmd.created_at)}</td>
            <td>
                <button class="btn btn--secondary" onclick="viewCommande(${cmd.id})">Voir</button>
            </td>
        </tr>
    `).join('');
}

function viewCommande(id) {
    window.location.href = `/fleet/${id}/`;
}
