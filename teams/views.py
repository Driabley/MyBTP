from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Equipe
from .forms import TeamForm


@login_required
@require_http_methods(["GET"])
@ensure_csrf_cookie
def list_teams(request):
    """Get list of teams via AJAX"""
    teams_list = Equipe.objects.all().order_by('name')
    
    teams_data = []
    for team in teams_list:
        teams_data.append({
            'id': team.id,
            'name': team.name,
            'color': team.color,
            'chef_equipe': team.chef_equipe.full_name if team.chef_equipe else None,
            'member_count': team.members.count(),
        })
    
    return JsonResponse({
        'success': True,
        'teams': teams_data
    }, status=200)


@login_required
@require_http_methods(["POST"])
@ensure_csrf_cookie
def create_team(request):
    """Create a new team via AJAX"""
    form = TeamForm(request.POST)
    
    if form.is_valid():
        team = form.save()
        return JsonResponse({
            'success': True,
            'message': f'L\'équipe {team.name} a été créée avec succès.',
            'team': {
                'id': team.id,
                'name': team.name,
            }
        }, status=200)
    else:
        errors = {}
        for field, field_errors in form.errors.items():
            errors[field] = field_errors[0] if field_errors else ''
        
        return JsonResponse({
            'success': False,
            'message': 'Erreur lors de la création de l\'équipe.',
            'errors': errors
        }, status=400)
