from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm
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


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('dashboard')
    else:
        form = AuthenticationForm()
    
    return render(request, 'login.html', {'form': form})


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


def planning(request):
    """Planning page with users and chantiers for form"""
    users = User.objects.exclude(user_type__in=['Admin', 'Secrétaire']).order_by('nom', 'prenom')
    chantiers_list = Chantiers.objects.all().order_by('name_chantier')
    
    context = {
        'users': users,
        'chantiers': chantiers_list
    }
    return render(request, 'planning.html', context)


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


def chantiers(request):
    from projects.forms import ChantierForm
    form = ChantierForm()
    return render(request, 'chantiers.html', {'form': form})


def team(request):
    return render(request, 'team.html')


def employee_detail(request, id):
    return render(request, 'employee_detail.html', {'employee_id': id})


def pistes(request):
    return render(request, 'pistes.html')


def map_view(request):
    return render(request, 'map.html')


def fleet(request):
    return render(request, 'fleet.html')


def fleet_item_detail(request, id):
    return render(request, 'fleet_item_detail.html', {'item_id': id})
