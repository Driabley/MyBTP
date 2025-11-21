from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from datetime import datetime, timedelta, date
from .models import Chantiers
from .forms import ChantierForm
from planning.models import Planning
from accounts.models import User


@login_required
@require_http_methods(["GET"])
@ensure_csrf_cookie
def list_chantiers(request):
    """Get list of chantiers via AJAX"""
    chantiers_list = Chantiers.objects.all().order_by('-created_at')
    
    chantiers_data = []
    for chantier in chantiers_list:
        chantiers_data.append({
            'id': chantier.id,
            'name_chantier': chantier.name_chantier,
            'adresse_chantier': chantier.adresse_chantier,
            'cp_ville_chantier': chantier.cp_ville_chantier,
            'date_debut_chantier': chantier.date_debut_chantier.isoformat() if chantier.date_debut_chantier else None,
            'chef_chantier': chantier.chef_chantier.full_name if chantier.chef_chantier else None,
            'avancement_chantier': chantier.avancement_chantier,
            'devis_ht': float(chantier.devis_ht) if chantier.devis_ht else 0,
            'nombre_de_jours_chantier': chantier.nombre_de_jours_chantier,
        })
    
    return JsonResponse({
        'success': True,
        'chantiers': chantiers_data
    }, status=200)


@login_required
@require_http_methods(["POST"])
@ensure_csrf_cookie
def create_chantier(request):
    """Create a new chantier via AJAX"""
    form = ChantierForm(request.POST)
    
    if form.is_valid():
        chantier = form.save()
        return JsonResponse({
            'success': True,
            'message': f'Le chantier {chantier.name_chantier} a été créé avec succès.',
            'chantier': {
                'id': chantier.id,
                'name': str(chantier),
            }
        }, status=200)
    else:
        errors = {}
        for field, field_errors in form.errors.items():
            errors[field] = field_errors[0] if field_errors else ''
        
        return JsonResponse({
            'success': False,
            'message': 'Erreur lors de la création du chantier.',
            'errors': errors
        }, status=400)


@login_required
def chantier_detail(request, id):
    """Display detail page for a single chantier with tabs"""
    chantier = get_object_or_404(
        Chantiers.objects.select_related('chef_chantier'),
        id=id
    )
    
    # Get current week for planning summary
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    
    # Get planning for current week
    week_planning = (
        Planning.objects.filter(
            chantier=chantier,
            date__gte=week_start,
            date__lte=week_end
        )
        .select_related('user')
        .order_by('date', 'start_hour')
    )
    
    # Calculate week summary
    planning_data = []
    week_hours = 0
    week_cost = 0
    
    for slot in week_planning:
        start = datetime.combine(slot.date, slot.start_hour)
        end = datetime.combine(slot.date, slot.end_hour)
        if end < start:
            end += timedelta(days=1)
        delta = end - start
        hours = delta.total_seconds() / 3600.0
        week_hours += hours
        cost = float(slot.cout_planning) if slot.cout_planning else 0
        week_cost += cost
        
        planning_data.append({
            'date': slot.date,
            'user': slot.user.full_name if slot.user else 'N/A',
            'start_hour': slot.start_hour.strftime('%H:%M'),
            'end_hour': slot.end_hour.strftime('%H:%M'),
            'hours': round(hours, 2),
            'cost': cost,
        })
    
    # Get all assigned employees (distinct users who have planning entries)
    assigned_employees = (
        User.objects.filter(plannings__chantier=chantier)
        .distinct()
        .order_by('prenom', 'nom')
    )
    
    # Get ALL plannings for this chantier (not just current week)
    all_plannings = chantier.plannings.select_related('user').order_by('date', 'start_hour')
    
    # Calculate progress data for "Avancement du chantier"
    from decimal import Decimal
    planned = chantier.number_hour_planned or Decimal('0')
    spent = chantier.number_hour_spent_on_project or Decimal('0')
    
    if planned > 0:
        remaining = max(planned - spent, Decimal('0'))
        excess = max(spent - planned, Decimal('0'))
        percent = (spent / planned) * Decimal('100')
    else:
        remaining = Decimal('0')
        excess = Decimal('0')
        percent = Decimal('0')
    
    # Compute bar segment widths for CSS
    if planned <= 0 and spent <= 0:
        # no data
        green_width = grey_width = red_width = 0
        has_hours = False
    else:
        has_hours = True
        if spent <= planned:
            # Under or equal to plan
            total = planned if planned > 0 else spent
            green_width = float((spent / total) * 100) if total > 0 else 0
            grey_width = float((remaining / total) * 100) if total > 0 else 0
            red_width = 0.0
        else:
            # Over plan
            total = spent  # spent is the max
            green_width = float((planned / total) * 100) if total > 0 else 0
            red_width = float((excess / total) * 100) if total > 0 else 0
            grey_width = 0.0
    
    progress = {
        "planned": planned,
        "spent": spent,
        "remaining": remaining,
        "excess": excess,
        "percent": percent,
        "green_width": green_width,
        "grey_width": grey_width,
        "red_width": red_width,
        "has_hours": has_hours,
    }
    
    # Build all plannings data for the table
    all_planning_data = []
    for slot in all_plannings:
        start = datetime.combine(slot.date, slot.start_hour)
        end = datetime.combine(slot.date, slot.end_hour)
        if end < start:
            end += timedelta(days=1)
        delta = end - start
        hours = delta.total_seconds() / 3600.0
        cost = float(slot.cout_planning) if slot.cout_planning else 0
        
        all_planning_data.append({
            'date': slot.date,
            'user': slot.user.full_name if slot.user else 'N/A',
            'start_hour': slot.start_hour.strftime('%H:%M'),
            'end_hour': slot.end_hour.strftime('%H:%M'),
            'hours': round(hours, 2),
            'cost': cost,
        })
    
    # Calculate VA metrics for the VA card
    devis = chantier.devis_ht or Decimal('0')
    va_euros = chantier.va or Decimal('0')
    
    if devis > 0:
        va_percent = (va_euros / devis) * Decimal('100')
    else:
        va_percent = None
    
    # Determine status
    threshold = Decimal('55')  # 55%
    if va_percent is None:
        va_status = "unknown"
    elif va_percent >= threshold:
        va_status = "good"
    else:
        va_status = "bad"
    
    # Pass Decimal values to template (Django templates handle Decimal formatting automatically)
    va_context = {
        "devis": devis,
        "va_euros": va_euros,
        "va_percent": va_percent,  # Decimal or None
        "va_status": va_status,
    }
    
    # Determine status badge
    status_badge = "NON DÉFINI"
    if chantier.avancement_statut:
        if isinstance(chantier.avancement_statut, list) and len(chantier.avancement_statut) > 0:
            status_badge = str(chantier.avancement_statut[0])
        else:
            status_badge = str(chantier.avancement_statut)
    
    context = {
        'chantier': chantier,
        'status_badge': status_badge,
        'planning_summary': {
            'week_hours': round(week_hours, 2),
            'week_cost': round(week_cost, 2),
            'planning_data': planning_data,
        },
        'assigned_employees': assigned_employees,
        'week_range': {
            'start': week_start,
            'end': week_end,
        },
        # Progress data for "Avancement du chantier" card
        'progress': progress,
        # All plannings for the full table
        'all_planning_data': all_planning_data,
        # VA (Valeur Ajoutée) context
        'va_context': va_context,
    }
    
    return render(request, 'chantier_detail.html', context)


@login_required
def map_chantiers(request):
    """Display map view with all chantiers that have coordinates"""
    import json
    
    # Query all chantiers with non-null latitude and longitude
    chantiers_with_coords = Chantiers.objects.filter(
        latitude__isnull=False,
        longitude__isnull=False
    ).order_by('name_chantier')
    
    # Serialize chantiers data
    chantiers_data = []
    for chantier in chantiers_with_coords:
        chantiers_data.append({
            'name': chantier.name_chantier or 'Sans nom',
            'adresse': chantier.adresse_chantier or '',
            'cp_ville': chantier.cp_ville_chantier or '',
            'lat': float(chantier.latitude),
            'lng': float(chantier.longitude),
        })
    
    context = {
        'chantiers': json.dumps(chantiers_data),
    }
    
    return render(request, 'map.html', context)
