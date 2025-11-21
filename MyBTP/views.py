from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta, date

from projects.models import Chantiers
from planning.models import Planning
from lead.models import Pistes
from accounts.models import User
from teams.models import Equipe


@login_required
def dashboard(request):
    """Dashboard view with statistics"""
    # Chantiers stats
    total_chantiers = Chantiers.objects.count()
    active_chantiers = Chantiers.objects.filter(avancement_chantier__lt=100).count()
    total_revenue = Chantiers.objects.aggregate(Sum('devis_ht'))['devis_ht__sum'] or 0
    
    # Planning stats
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    week_planning = Planning.objects.filter(date__gte=week_start, date__lte=week_end)
    
    # Calculate week_hours
    week_hours = 0
    for p in week_planning:
        start = datetime.combine(p.date, p.start_hour)
        end = datetime.combine(p.date, p.end_hour)
        if end < start:
            end += timedelta(days=1)
        delta = end - start
        week_hours += delta.total_seconds() / 3600.0
    
    week_cost = week_planning.aggregate(Sum('cout_planning'))['cout_planning__sum'] or 0
    
    # Leads stats
    total_leads = Pistes.objects.count()
    qualified_leads = Pistes.objects.filter(statut__in=['Qualifié', 'Devis']).count()
    won_leads = Pistes.objects.filter(statut='Gagné').count()
    total_estimated = Pistes.objects.aggregate(Sum('montant_estime'))['montant_estime__sum'] or 0
    
    # Team stats
    total_employees = User.objects.exclude(user_type__in=['Admin', 'Secrétaire']).count()
    active_teams = Equipe.objects.count()
    
    context = {
        'chantiers': {
            'total': total_chantiers,
            'active': active_chantiers,
            'total_revenue': float(total_revenue)
        },
        'planning': {
            'week_hours': round(week_hours, 2),
            'week_cost': float(week_cost)
        },
        'leads': {
            'total': total_leads,
            'qualified': qualified_leads,
            'won': won_leads,
            'total_estimated': float(total_estimated)
        },
        'team': {
            'total_employees': total_employees,
            'active_teams': active_teams
        }
    }
    
    return render(request, 'dashboard.html', context)


@login_required
def planning(request):
    """Planning page with users and chantiers for form"""
    users = User.objects.exclude(user_type__in=['Admin', 'Secrétaire']).order_by('nom', 'prenom')
    chantiers_list = Chantiers.objects.all().order_by('name_chantier')
    
    context = {
        'users': users,
        'chantiers': chantiers_list
    }
    return render(request, 'planning.html', context)


@login_required
@require_http_methods(["GET"])
def list_planning_slots(request):
    """Get planning slots for a date range"""
    try:
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        
        if not date_from or not date_to:
            return JsonResponse({'error': 'date_from et date_to sont requis'}, status=400)
        
        # Parse dates
        date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
        date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
        
        # Get planning slots in date range
        slots = Planning.objects.filter(
            date__gte=date_from_obj,
            date__lte=date_to_obj
        ).select_related('user', 'chantier').order_by('date', 'start_hour')
        
        # Get all users and chantiers for the grid structure
        users = User.objects.exclude(user_type__in=['Admin', 'Secrétaire']).order_by('nom', 'prenom')
        chantiers = Chantiers.objects.all().order_by('name_chantier')
        
        # Build slots data
        slots_data = []
        for slot in slots:
            start = datetime.combine(slot.date, slot.start_hour)
            end = datetime.combine(slot.date, slot.end_hour)
            if end < start:
                end += timedelta(days=1)
            delta = end - start
            hours = delta.total_seconds() / 3600.0
            
            slots_data.append({
                'id': slot.id,
                'user_id': slot.user.id,
                'user_name': slot.user.full_name,
                'chantier_id': slot.chantier.id,
                'chantier_name': slot.chantier.name_chantier,
                'date': slot.date.strftime('%Y-%m-%d'),
                'start_hour': slot.start_hour.strftime('%H:%M'),
                'end_hour': slot.end_hour.strftime('%H:%M'),
                'hours': round(hours, 2),
                'cost': float(slot.cout_planning) if slot.cout_planning else 0,
            })
        
        # Build users data
        users_data = []
        for user in users:
            users_data.append({
                'id': user.id,
                'prenom': user.prenom,
                'nom': user.nom,
                'full_name': user.full_name,
            })
        
        # Build chantiers data
        chantiers_data = []
        for chantier in chantiers:
            chantiers_data.append({
                'id': chantier.id,
                'name_chantier': chantier.name_chantier,
                'avancement_chantier': chantier.avancement_chantier,
                'avancement_statut': chantier.avancement_statut if chantier.avancement_statut else [],
            })
        
        return JsonResponse({
            'success': True,
            'slots': slots_data,
            'users': users_data,
            'chantiers': chantiers_data,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def create_planning_slot(request):
    """Create a new planning slot"""
    try:
        user_id = request.POST.get('user')
        chantier_id = request.POST.get('chantier')
        date_str = request.POST.get('date')
        start_hour = request.POST.get('start_hour')
        end_hour = request.POST.get('end_hour')
        
        if not all([user_id, chantier_id, date_str, start_hour, end_hour]):
            return JsonResponse({'error': 'Tous les champs sont requis'}, status=400)
        
        user = User.objects.get(id=user_id)
        chantier = Chantiers.objects.get(id=chantier_id)
        
        planning = Planning.objects.create(
            user=user,
            chantier=chantier,
            date=date_str,
            start_hour=start_hour,
            end_hour=end_hour
        )
        
        return JsonResponse({'success': True, 'id': planning.id})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@login_required
def chantiers(request):
    from projects.forms import ChantierForm
    form = ChantierForm()
    return render(request, 'chantiers.html', {'form': form})


@login_required
def team(request):
    return render(request, 'team.html')


@login_required
def employee_detail(request, id):
    return render(request, 'employee_detail.html', {'employee_id': id})


@login_required
def pistes(request):
    return render(request, 'pistes.html')


@login_required
def map_view(request):
    return render(request, 'map.html')


@login_required
def fleet(request):
    return render(request, 'fleet.html')


@login_required
def fleet_item_detail(request, id):
    return render(request, 'fleet_item_detail.html', {'item_id': id})
