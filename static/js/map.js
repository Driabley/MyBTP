/**
 * Map Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    loadMap();
});

function loadMap() {
    // Since we don't have API, show placeholder
    const chantiers = [];
    renderMap(chantiers);
}

function renderMap(chantiers) {
    const container = document.getElementById('map-container');
    if (!container) return;

    // This would integrate with a mapping library like Leaflet or Google Maps
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--muted);">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 16px; opacity: 0.5;">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Carte des chantiers</div>
            <div style="font-size: 14px;">Intégration avec une API de cartographie requise</div>
        </div>
    `;
}
