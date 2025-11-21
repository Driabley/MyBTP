/**
 * Planning Page JavaScript
 */

let planningData = {
    slots: [],
    users: [],
    chantiers: []
};
let currentView = 'sites'; // 'workers' or 'sites' - default to 'sites'
let currentDateRange = 'week';
let currentDate = new Date();
let expandedItems = new Set(); // Track expanded items
let searchFilter = '';
let sitesViewInitialized = false; // Track if sites view has been initialized with expanded items
let workersViewInitialized = false; // Track if workers view has been initialized with expanded items

document.addEventListener('DOMContentLoaded', function() {
    setupDateRange();
    loadPlanning();
    setupEventListeners();
});

function setupDateRange() {
    const { start, end } = currentDateRange === 'week' ? utils.getWeekDates(currentDate) : utils.getMonthDates(currentDate);
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    if (dateFrom) dateFrom.value = utils.formatDateForAPI(start);
    if (dateTo) dateTo.value = utils.formatDateForAPI(end);
}

async function loadPlanning() {
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    
    if (!dateFrom || !dateTo || !dateFrom.value || !dateTo.value) {
        setupDateRange();
        return;
    }
    
    try {
        const response = await fetch(`/planning/list/?date_from=${dateFrom.value}&date_to=${dateTo.value}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            planningData = {
                slots: result.slots || [],
                users: result.users || [],
                chantiers: result.chantiers || []
            };
            renderPlanning();
        } else {
            console.error('Error loading planning:', result.error);
            renderPlanning(); // Render with empty data
        }
    } catch (error) {
        console.error('Error loading planning:', error);
        renderPlanning(); // Render with empty data
    }
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

function getDaysInRange() {
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    
    if (!dateFrom || !dateTo || !dateFrom.value || !dateTo.value) {
        return [];
    }
    
    const start = new Date(dateFrom.value);
    const end = new Date(dateTo.value);
    const days = [];
    const current = new Date(start);
    
    while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    
    return days;
}

function formatDayHeader(date) {
    const days = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${dayName} ${day} ${month}`;
}

function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function getSlotsForCell(userId, chantierId, date) {
    return planningData.slots.filter(slot => {
        const slotDate = new Date(slot.date);
        const matchesDate = slotDate.getDate() === date.getDate() &&
                           slotDate.getMonth() === date.getMonth() &&
                           slotDate.getFullYear() === date.getFullYear();
        
        if (currentView === 'sites') {
            return matchesDate && slot.chantier_id === chantierId && slot.user_id === userId;
        } else {
            return matchesDate && slot.user_id === userId && slot.chantier_id === chantierId;
        }
    });
}

function renderSitesView() {
    const container = document.getElementById('planning-calendar');
    if (!container) return;
    
    const days = getDaysInRange();
    
    // Filter chantiers by search
    let displayChantiers = planningData.chantiers;
    if (searchFilter) {
        const filter = searchFilter.toLowerCase();
        displayChantiers = displayChantiers.filter(c => 
            c.name_chantier.toLowerCase().includes(filter)
        );
    }
    
    // Group slots by chantier
    const slotsByChantier = {};
    displayChantiers.forEach(chantier => {
        slotsByChantier[chantier.id] = planningData.slots.filter(s => s.chantier_id === chantier.id);
    });
    
    // Get employees assigned to each chantier (from slots in date range)
    const employeesByChantier = {};
    displayChantiers.forEach(chantier => {
        const assignedUserIds = new Set(
            slotsByChantier[chantier.id].map(s => s.user_id)
        );
        // Get users that have slots for this chantier in the date range
        employeesByChantier[chantier.id] = planningData.users
            .filter(u => assignedUserIds.has(u.id))
            .sort((a, b) => {
                // Sort by full name
                const nameA = a.full_name || `${a.prenom} ${a.nom}`;
                const nameB = b.full_name || `${b.prenom} ${b.nom}`;
                return nameA.localeCompare(nameB);
            });
    });
    
    let html = `
        <div class="planning-grid" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
                <thead>
                    <tr>
                        <th style="position: sticky; left: 0; background: var(--panel); z-index: 10; padding: 12px 16px; border: 1px solid var(--panel-border); text-align: left; min-width: 250px;">CHANTIER</th>
                        ${days.map(day => `
                            <th style="padding: 12px 8px; border: 1px solid var(--panel-border); text-align: center; background: ${isToday(day) ? '#e3f2fd' : isWeekend(day) ? '#f5f5f5' : 'var(--backgroundAlt)'}; min-width: 120px;">
                                <div style="font-size: 12px; font-weight: 600; color: var(--text-strong);">${formatDayHeader(day)}</div>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    if (displayChantiers.length === 0) {
        html += `
            <tr>
                <td colspan="${days.length + 1}" style="padding: 40px; text-align: center; color: var(--muted);">
                    ${searchFilter ? 'Aucun chantier trouvé' : 'Aucun chantier'}
                </td>
            </tr>
        `;
    } else {
        // In "Chantiers view", expand all chantiers by default
        // Always ensure all chantiers are expanded (re-initialize if needed)
        displayChantiers.forEach(chantier => {
            expandedItems.add(`chantier-${chantier.id}`);
        });
        sitesViewInitialized = true;
        
        displayChantiers.forEach(chantier => {
            const isExpanded = expandedItems.has(`chantier-${chantier.id}`);
            const employees = employeesByChantier[chantier.id] || [];
            
            // Chantier header row
            html += `
                <tr style="background: ${isExpanded ? 'var(--backgroundAlt)' : 'var(--panel)'};">
                    <td style="position: sticky; left: 0; background: ${isExpanded ? 'var(--backgroundAlt)' : 'var(--panel)'}; z-index: 9; padding: 12px 16px; border: 1px solid var(--panel-border); cursor: pointer;" onclick="toggleExpand('chantier-${chantier.id}')">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="transition: transform 0.2s; display: inline-block; transform: rotate(${isExpanded ? '90deg' : '0deg'});">▶</span>
                            <span style="font-weight: 600;">${chantier.name_chantier || 'Sans nom'}</span>
                            ${chantier.avancement_statut && chantier.avancement_statut.length > 0 ? `
                                <span style="background: #5D54EA; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
                                    ${chantier.avancement_statut[0]}
                                </span>
                            ` : ''}
                        </div>
                    </td>
                    ${days.map(day => {
                        // Empty cells in chantier header row - allow adding slots at chantier level
                        return `
                            <td class="planning-cell planning-cell--empty planning-cell--chantier-header" 
                                data-date="${utils.formatDateForAPI(day)}"
                                data-chantier-id="${chantier.id}"
                                style="padding: 4px; border: 1px solid var(--panel-border); background: ${isToday(day) ? '#e3f2fd' : ''}; position: relative;">
                                <button type="button" class="planning-cell-add-btn planning-cell-add-btn--small" onclick="event.stopPropagation(); showAddSlotModalForCell(null, ${chantier.id}, '${utils.formatDateForAPI(day)}')" title="Ajouter un créneau">
                                    +
                                </button>
                            </td>
                        `;
                    }).join('')}
                </tr>
            `;
            
            // Employee rows (only if expanded)
            if (isExpanded) {
                if (employees.length === 0) {
                    html += `
                        <tr>
                            <td style="padding-left: 40px; padding: 8px 16px; border: 1px solid var(--panel-border); color: var(--muted); font-style: italic; background: var(--panel);">
                                Aucun employé assigné à ce chantier
                            </td>
                            ${days.map(day => `
                                <td style="padding: 4px; border: 1px solid var(--panel-border); background: var(--panel);"></td>
                            `).join('')}
                        </tr>
                    `;
                } else {
                    employees.forEach(user => {
                        html += `
                            <tr style="background: var(--panel);">
                                <td style="position: sticky; left: 0; background: var(--panel); z-index: 8; padding-left: 40px; padding: 8px 16px; border: 1px solid var(--panel-border);">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${getUserColor(user.id)}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px;">
                                            ${user.prenom.charAt(0)}${user.nom.charAt(0)}
                                        </div>
                                        <span>${user.full_name}</span>
                                    </div>
                                </td>
                                ${days.map(day => {
                                    const cellSlots = getSlotsForCell(user.id, chantier.id, day);
                                    if (cellSlots.length > 0) {
                                        const slot = cellSlots[0]; // Display first slot
                                        return `
                                            <td style="padding: 4px; border: 1px solid var(--panel-border); background: var(--panel); position: relative;">
                                                <div style="background: ${getUserColor(user.id)}; color: white; padding: 6px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;" onclick="showSlotDetails(${slot.id})">
                                                    <div style="font-weight: 600;">${slot.start_hour} - ${slot.end_hour}</div>
                                                    <div style="font-size: 10px; opacity: 0.9;">${slot.hours}h (${slot.cost.toFixed(2)}€)</div>
                                                </div>
                                            </td>
                                        `;
                                    } else {
                                        return `
                                            <td class="planning-cell planning-cell--empty" 
                                                data-date="${utils.formatDateForAPI(day)}"
                                                data-user-id="${user.id}"
                                                data-chantier-id="${chantier.id}"
                                                style="padding: 4px; border: 1px solid var(--panel-border); background: var(--panel); position: relative;">
                                                <button type="button" class="planning-cell-add-btn" onclick="event.stopPropagation(); showAddSlotModalForCell(${user.id}, ${chantier.id}, '${utils.formatDateForAPI(day)}')" title="Ajouter un créneau">
                                                    +
                                                </button>
                                            </td>
                                        `;
                                    }
                                }).join('')}
                            </tr>
                        `;
                    });
                }
            }
        });
    }
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderWorkersView() {
    const container = document.getElementById('planning-calendar');
    if (!container) return;
    
    const days = getDaysInRange();
    
    // Filter users by search
    let displayUsers = planningData.users;
    if (searchFilter) {
        const filter = searchFilter.toLowerCase();
        displayUsers = displayUsers.filter(u => 
            u.full_name.toLowerCase().includes(filter) ||
            u.prenom.toLowerCase().includes(filter) ||
            u.nom.toLowerCase().includes(filter)
        );
    }
    
    // Group slots by user
    const slotsByUser = {};
    displayUsers.forEach(user => {
        slotsByUser[user.id] = planningData.slots.filter(s => s.user_id === user.id);
    });
    
    // Get chantiers assigned to each user (from slots in date range)
    const chantiersByUser = {};
    displayUsers.forEach(user => {
        const assignedChantierIds = new Set(
            slotsByUser[user.id].map(s => s.chantier_id)
        );
        // Get chantiers that have slots for this user in the date range
        chantiersByUser[user.id] = planningData.chantiers
            .filter(c => assignedChantierIds.has(c.id))
            .sort((a, b) => {
                // Sort by name
                const nameA = a.name_chantier || '';
                const nameB = b.name_chantier || '';
                return nameA.localeCompare(nameB);
            });
    });
    
    let html = `
        <div class="planning-grid" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
                <thead>
                    <tr>
                        <th style="position: sticky; left: 0; background: var(--panel); z-index: 10; padding: 12px 16px; border: 1px solid var(--panel-border); text-align: left; min-width: 250px;">EMPLOYÉ</th>
                        ${days.map(day => `
                            <th style="padding: 12px 8px; border: 1px solid var(--panel-border); text-align: center; background: ${isToday(day) ? '#e3f2fd' : isWeekend(day) ? '#f5f5f5' : 'var(--backgroundAlt)'}; min-width: 120px;">
                                <div style="font-size: 12px; font-weight: 600; color: var(--text-strong);">${formatDayHeader(day)}</div>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    if (displayUsers.length === 0) {
        html += `
            <tr>
                <td colspan="${days.length + 1}" style="padding: 40px; text-align: center; color: var(--muted);">
                    ${searchFilter ? 'Aucun employé trouvé' : 'Aucun employé'}
                </td>
            </tr>
        `;
    } else {
        // In "Employés view", expand all employees by default
        // Always ensure all employees are expanded (re-initialize if needed)
        displayUsers.forEach(user => {
            expandedItems.add(`user-${user.id}`);
        });
        workersViewInitialized = true;
        
        displayUsers.forEach(user => {
            const isExpanded = expandedItems.has(`user-${user.id}`);
            const chantiers = chantiersByUser[user.id] || [];
            
            // User header row
            html += `
                <tr style="background: ${isExpanded ? 'var(--backgroundAlt)' : 'var(--panel)'};">
                    <td style="position: sticky; left: 0; background: ${isExpanded ? 'var(--backgroundAlt)' : 'var(--panel)'}; z-index: 9; padding: 12px 16px; border: 1px solid var(--panel-border); cursor: pointer;" onclick="toggleExpand('user-${user.id}')">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="transition: transform 0.2s; display: inline-block; transform: rotate(${isExpanded ? '90deg' : '0deg'});">▶</span>
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${getUserColor(user.id)}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px;">
                                ${user.prenom.charAt(0)}${user.nom.charAt(0)}
                            </div>
                            <span style="font-weight: 600;">${user.full_name}</span>
                        </div>
                    </td>
                    ${days.map(day => {
                        // Empty cells in user header row - allow adding slots at user level
                        return `
                            <td class="planning-cell planning-cell--empty planning-cell--user-header" 
                                data-date="${utils.formatDateForAPI(day)}"
                                data-user-id="${user.id}"
                                style="padding: 4px; border: 1px solid var(--panel-border); background: ${isToday(day) ? '#e3f2fd' : ''}; position: relative;">
                                <button type="button" class="planning-cell-add-btn planning-cell-add-btn--small" onclick="event.stopPropagation(); showAddSlotModalForCell(${user.id}, null, '${utils.formatDateForAPI(day)}')" title="Ajouter un créneau">
                                    +
                                </button>
                            </td>
                        `;
                    }).join('')}
                </tr>
            `;
            
            // Chantier rows (only if expanded)
            if (isExpanded) {
                if (chantiers.length === 0) {
                    html += `
                        <tr>
                            <td style="padding-left: 40px; padding: 8px 16px; border: 1px solid var(--panel-border); color: var(--muted); font-style: italic; background: var(--panel);">
                                Aucun chantier assigné
                            </td>
                            ${days.map(day => `
                                <td style="padding: 4px; border: 1px solid var(--panel-border); background: var(--panel);"></td>
                            `).join('')}
                        </tr>
                    `;
                } else {
                    chantiers.forEach(chantier => {
                        html += `
                            <tr style="background: var(--panel);">
                                <td style="position: sticky; left: 0; background: var(--panel); z-index: 8; padding-left: 40px; padding: 8px 16px; border: 1px solid var(--panel-border);">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 16px;">🏗️</span>
                                        <span>${chantier.name_chantier || 'Sans nom'}</span>
                                        ${chantier.avancement_statut && chantier.avancement_statut.length > 0 ? `
                                            <span style="background: #5D54EA; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
                                                ${chantier.avancement_statut[0]}
                                            </span>
                                        ` : ''}
                                    </div>
                                </td>
                                ${days.map(day => {
                                    const cellSlots = getSlotsForCell(user.id, chantier.id, day);
                                    if (cellSlots.length > 0) {
                                        const slot = cellSlots[0]; // Display first slot
                                        return `
                                            <td style="padding: 4px; border: 1px solid var(--panel-border); background: var(--panel); position: relative;">
                                                <div style="background: ${getUserColor(user.id)}; color: white; padding: 6px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;" onclick="showSlotDetails(${slot.id})">
                                                    <div style="font-weight: 600;">${slot.start_hour} - ${slot.end_hour}</div>
                                                    <div style="font-size: 10px; opacity: 0.9;">${slot.hours}h (${slot.cost.toFixed(2)}€)</div>
                                                </div>
                                            </td>
                                        `;
                                    } else {
                                        return `
                                            <td class="planning-cell planning-cell--empty" 
                                                data-date="${utils.formatDateForAPI(day)}"
                                                data-user-id="${user.id}"
                                                data-chantier-id="${chantier.id}"
                                                style="padding: 4px; border: 1px solid var(--panel-border); background: var(--panel); position: relative;">
                                                <button type="button" class="planning-cell-add-btn" onclick="event.stopPropagation(); showAddSlotModalForCell(${user.id}, ${chantier.id}, '${utils.formatDateForAPI(day)}')" title="Ajouter un créneau">
                                                    +
                                                </button>
                                            </td>
                                        `;
                                    }
                                }).join('')}
                            </tr>
                        `;
                    });
                }
            }
        });
    }
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function getUserColor(userId) {
    const colors = [
        '#5D54EA', '#00B894', '#FDCB6E', '#E17055', '#0984E3',
        '#A29BFE', '#FD79A8', '#55EFC4', '#74B9FF', '#FF7675'
    ];
    return colors[userId % colors.length];
}

function toggleExpand(itemId) {
    if (expandedItems.has(itemId)) {
        expandedItems.delete(itemId);
    } else {
        expandedItems.add(itemId);
    }
    renderPlanning();
}

function showSlotDetails(slotId) {
    // TODO: Implement slot details/edit modal
    const slot = planningData.slots.find(s => s.id === slotId);
    if (slot) {
        alert(`Créneau: ${slot.start_hour} - ${slot.end_hour}\n${slot.hours}h - ${slot.cost.toFixed(2)}€`);
    }
}

// Generate all time options in 15-minute increments (00:00 to 23:45)
function generateTimeOptions() {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const hourStr = String(hour).padStart(2, '0');
            const minuteStr = String(minute).padStart(2, '0');
            times.push(`${hourStr}:${minuteStr}`);
        }
    }
    return times;
}

// Create a custom time picker component
function createTimePicker(fieldName, initialValue = '', required = true) {
    const timeOptions = generateTimeOptions();
    const displayValue = initialValue || '--:--';
    const requiredAttr = required ? 'required' : '';
    
    const optionsHtml = timeOptions.map(time => {
        const isSelected = time === initialValue ? 'data-selected="true"' : '';
        return `<div class="time-picker-option" data-value="${time}" ${isSelected}>${time}</div>`;
    }).join('');
    
    return `<div class="time-picker" data-field-name="${fieldName}">
        <input type="hidden" name="${fieldName}" value="${initialValue}" ${requiredAttr}>
        <button type="button" class="time-picker-display" aria-label="Sélectionner ${fieldName}">
            <span class="time-picker-label">${displayValue}</span>
            <span class="time-picker-icon">⌄</span>
        </button>
        <div class="time-picker-dropdown" style="display: none;">
            <div class="time-picker-options">
                ${optionsHtml}
            </div>
        </div>
    </div>`;
}

// Initialize time picker interactions
function initTimePicker(timePickerElement) {
    const displayBtn = timePickerElement.querySelector('.time-picker-display');
    const hiddenInput = timePickerElement.querySelector('input[type="hidden"]');
    const dropdown = timePickerElement.querySelector('.time-picker-dropdown');
    const label = timePickerElement.querySelector('.time-picker-label');
    const options = timePickerElement.querySelectorAll('.time-picker-option');
    
    // Toggle dropdown on click
    displayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.style.display !== 'none';
        
        // Close all other time pickers
        document.querySelectorAll('.time-picker-dropdown').forEach(dd => {
            if (dd !== dropdown) {
                dd.style.display = 'none';
            }
        });
        
        dropdown.style.display = isOpen ? 'none' : 'block';
        timePickerElement.classList.toggle('time-picker--open', !isOpen);
    });
    
    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = option.getAttribute('data-value');
            
            // Update hidden input
            hiddenInput.value = value;
            
            // Update label
            label.textContent = value;
            
            // Update selected state
            options.forEach(opt => opt.removeAttribute('data-selected'));
            option.setAttribute('data-selected', 'true');
            
            // Close dropdown
            dropdown.style.display = 'none';
            timePickerElement.classList.remove('time-picker--open');
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!timePickerElement.contains(e.target)) {
            dropdown.style.display = 'none';
            timePickerElement.classList.remove('time-picker--open');
        }
    });
}

// Set time picker value programmatically
function setTimePickerValue(timePickerElement, value) {
    const hiddenInput = timePickerElement.querySelector('input[type="hidden"]');
    const label = timePickerElement.querySelector('.time-picker-label');
    const options = timePickerElement.querySelectorAll('.time-picker-option');
    
    if (value) {
        hiddenInput.value = value;
        label.textContent = value;
        
        // Update selected state
        options.forEach(opt => {
            if (opt.getAttribute('data-value') === value) {
                opt.setAttribute('data-selected', 'true');
            } else {
                opt.removeAttribute('data-selected');
            }
        });
    }
}

function showAddSlotModalForCell(userId, chantierId, date) {
    // Handle null values (when clicking on header row cells)
    // userId and chantierId can be null when clicking on parent row cells
    const user = userId ? planningData.users.find(u => u.id === userId) : null;
    const chantier = chantierId ? planningData.chantiers.find(c => c.id === chantierId) : null;
    
    // Prefill logic based on context:
    // - In employee view: prefill user (if provided), date; chantier can be empty
    // - In chantier view: prefill chantier (if provided), date; user can be empty (if header row) or prefilled (if sub-row)
    const prefilledUserId = userId || '';
    const prefilledChantierId = chantierId || '';
    
    // Build user options
    let userOptions = '';
    if (prefilledUserId) {
        const selectedUser = planningData.users.find(u => u.id === prefilledUserId);
        const displayName = selectedUser ? (selectedUser.full_name || `${selectedUser.prenom} ${selectedUser.nom}`) : 'Sélectionner un employé';
        userOptions = `<option value="${prefilledUserId}" selected>${displayName}</option>`;
        planningData.users.filter(u => u.id !== prefilledUserId).forEach(u => {
            const fullName = u.full_name || `${u.prenom} ${u.nom}`;
            userOptions += `<option value="${u.id}">${fullName}</option>`;
        });
    } else {
        userOptions = '<option value="">Sélectionner un employé</option>';
        planningData.users.forEach(u => {
            const fullName = u.full_name || `${u.prenom} ${u.nom}`;
            userOptions += `<option value="${u.id}">${fullName}</option>`;
        });
    }
    
    // Build chantier options
    let chantierOptions = '';
    if (prefilledChantierId) {
        const selectedChantier = planningData.chantiers.find(c => c.id === prefilledChantierId);
        chantierOptions = `<option value="${prefilledChantierId}" selected>${selectedChantier ? selectedChantier.name_chantier : 'Sélectionner un chantier'}</option>`;
        planningData.chantiers.filter(c => c.id !== prefilledChantierId).forEach(c => {
            chantierOptions += `<option value="${c.id}">${c.name_chantier}</option>`;
        });
    } else {
        chantierOptions = '<option value="">Sélectionner un chantier</option>';
        planningData.chantiers.forEach(c => {
            chantierOptions += `<option value="${c.id}">${c.name_chantier}</option>`;
        });
    }
    
    const content = `
        <form id="add-slot-form">
            <div class="input-group">
                <label class="input-label">Date *</label>
                <input type="date" class="input" name="date" value="${date}" required ${(userId || chantierId) ? 'readonly' : ''}>
            </div>
            <div class="input-group">
                <label class="input-label">Presets de temps</label>
                <div class="time-preset-cards">
                    <button type="button" class="time-preset-card" data-preset="morning" data-start="08:00" data-end="12:00">
                        <div class="time-preset-card__title">Demi-journée matin</div>
                        <div class="time-preset-card__time">08:00 → 12:00</div>
                    </button>
                    <button type="button" class="time-preset-card" data-preset="afternoon" data-start="13:00" data-end="17:00">
                        <div class="time-preset-card__title">Demi-journée après-midi</div>
                        <div class="time-preset-card__time">13:00 → 17:00</div>
                    </button>
                    <button type="button" class="time-preset-card" data-preset="full-day" data-start="08:00" data-end="17:00">
                        <div class="time-preset-card__title">Journée</div>
                        <div class="time-preset-card__time">08:00 → 17:00</div>
                    </button>
                </div>
            </div>
            <div class="input-group">
                <label class="input-label">Heure de début *</label>
                ${createTimePicker('start_hour', '08:00', true)}
            </div>
            <div class="input-group">
                <label class="input-label">Heure de fin *</label>
                ${createTimePicker('end_hour', '17:00', true)}
            </div>
            <div class="input-group">
                <label class="input-label">Employé *</label>
                <select class="select" name="user" required>
                    ${userOptions}
                </select>
            </div>
            <div class="input-group">
                <label class="input-label">Chantier *</label>
                <select class="select" name="chantier" required>
                    ${chantierOptions}
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
    
    // Initialize time pickers
    const startHourPicker = modal.querySelector('.time-picker[data-field-name="start_hour"]');
    const endHourPicker = modal.querySelector('.time-picker[data-field-name="end_hour"]');
    if (startHourPicker) initTimePicker(startHourPicker);
    if (endHourPicker) initTimePicker(endHourPicker);
    
    // Handle preset card clicks
    const presetCards = modal.querySelectorAll('.time-preset-card');
    presetCards.forEach(card => {
        card.addEventListener('click', () => {
            const startTime = card.getAttribute('data-start');
            const endTime = card.getAttribute('data-end');
            const preset = card.getAttribute('data-preset');
            
            // Remove active state from all cards
            presetCards.forEach(c => c.classList.remove('time-preset-card--active'));
            
            // Add active state to clicked card
            card.classList.add('time-preset-card--active');
            
            // Fill the time pickers
            if (startHourPicker && startTime) setTimePickerValue(startHourPicker, startTime);
            if (endHourPicker && endTime) setTimePickerValue(endHourPicker, endTime);
            
            // Store preset type in a hidden field or data attribute for backend processing
            form.setAttribute('data-preset-type', preset);
        });
    });
    
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
                await loadPlanning(); // Reload data
                // Show success notification (quiet)
                showNotification('success', '', 'Créneau créé avec succès', true);
            } else {
                alert('Erreur: ' + (result.error || 'Erreur lors de la création du créneau'));
            }
        } catch (error) {
            console.error('Error creating slot:', error);
            alert('Erreur lors de la création du créneau');
        }
    });
}

function setupEventListeners() {
    const viewToggle = document.getElementById('view-toggle');
    const dateRangeToggle = document.getElementById('date-range-toggle');
    const refreshBtn = document.getElementById('refresh-btn');
    const prevBtn = document.getElementById('prev-period');
    const nextBtn = document.getElementById('next-period');
    const addSlotBtn = document.getElementById('add-slot-btn');
    const searchInput = document.getElementById('search-input');
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');

    if (viewToggle) {
        viewToggle.addEventListener('click', () => {
            currentView = currentView === 'workers' ? 'sites' : 'workers';
            viewToggle.textContent = currentView === 'workers' ? 'Vue Employés' : 'Vue Chantiers';
            // Reset initialization flags when switching views so both views expand on render
            sitesViewInitialized = false;
            workersViewInitialized = false;
            expandedItems.clear(); // Clear expanded items when switching views
            renderPlanning(); // renderPlanning will auto-expand all items in the new view
        });
        // Set initial text
        viewToggle.textContent = currentView === 'workers' ? 'Vue Employés' : 'Vue Chantiers';
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
        refreshBtn.addEventListener('click', () => {
            loadPlanning();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const days = currentDateRange === 'week' ? 7 : 30;
            currentDate = new Date(currentDate);
            currentDate.setDate(currentDate.getDate() - days);
            setupDateRange();
            loadPlanning();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const days = currentDateRange === 'week' ? 7 : 30;
            currentDate = new Date(currentDate);
            currentDate.setDate(currentDate.getDate() + days);
            setupDateRange();
            loadPlanning();
        });
    }

    if (addSlotBtn) {
        addSlotBtn.addEventListener('click', showAddSlotModal);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', utils.debounce((e) => {
            searchFilter = e.target.value;
            renderPlanning();
        }, 300));
    }
    
    if (dateFrom && dateTo) {
        dateFrom.addEventListener('change', () => {
            loadPlanning();
        });
        dateTo.addEventListener('change', () => {
            loadPlanning();
        });
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
                <label class="input-label">Presets de temps</label>
                <div class="time-preset-cards">
                    <button type="button" class="time-preset-card" data-preset="morning" data-start="08:00" data-end="12:00">
                        <div class="time-preset-card__title">Demi-journée matin</div>
                        <div class="time-preset-card__time">08:00 → 12:00</div>
                    </button>
                    <button type="button" class="time-preset-card" data-preset="afternoon" data-start="13:00" data-end="17:00">
                        <div class="time-preset-card__title">Demi-journée après-midi</div>
                        <div class="time-preset-card__time">13:00 → 17:00</div>
                    </button>
                    <button type="button" class="time-preset-card" data-preset="full-day" data-start="08:00" data-end="17:00">
                        <div class="time-preset-card__title">Journée</div>
                        <div class="time-preset-card__time">08:00 → 17:00</div>
                    </button>
                </div>
            </div>
            <div class="input-group">
                <label class="input-label">Heure de début *</label>
                ${createTimePicker('start_hour', '08:00', true)}
            </div>
            <div class="input-group">
                <label class="input-label">Heure de fin *</label>
                ${createTimePicker('end_hour', '17:00', true)}
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
    
    // Initialize time pickers
    const startHourPicker = modal.querySelector('.time-picker[data-field-name="start_hour"]');
    const endHourPicker = modal.querySelector('.time-picker[data-field-name="end_hour"]');
    if (startHourPicker) initTimePicker(startHourPicker);
    if (endHourPicker) initTimePicker(endHourPicker);
    
    // Handle preset card clicks
    const presetCards = modal.querySelectorAll('.time-preset-card');
    presetCards.forEach(card => {
        card.addEventListener('click', () => {
            const startTime = card.getAttribute('data-start');
            const endTime = card.getAttribute('data-end');
            const preset = card.getAttribute('data-preset');
            
            // Remove active state from all cards
            presetCards.forEach(c => c.classList.remove('time-preset-card--active'));
            
            // Add active state to clicked card
            card.classList.add('time-preset-card--active');
            
            // Fill the time pickers
            if (startHourPicker && startTime) setTimePickerValue(startHourPicker, startTime);
            if (endHourPicker && endTime) setTimePickerValue(endHourPicker, endTime);
            
            // Store preset type in a data attribute for backend processing
            form.setAttribute('data-preset-type', preset);
        });
    });
    
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
                await loadPlanning(); // Reload data
                // Show success notification (quiet)
                showNotification('success', '', 'Créneau créé avec succès', true);
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

// Make functions globally available for onclick handlers
window.toggleExpand = toggleExpand;
window.showSlotDetails = showSlotDetails;
window.showAddSlotModalForCell = showAddSlotModalForCell;
