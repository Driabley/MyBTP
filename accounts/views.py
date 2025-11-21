from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import User
from .forms import EmployeeForm


def login_view(request):
    """Login view - redirects authenticated users to dashboard"""
    if request.user.is_authenticated:
        return redirect('/')
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            # Redirect to the page the user was trying to access, or home
            next_url = request.POST.get('next', request.GET.get('next', '/'))
            return redirect(next_url)
        else:
            # Form has errors, will be displayed in template
            pass
    else:
        form = AuthenticationForm()
    
    return render(request, 'accounts/login.html', {'form': form})


@require_http_methods(["POST", "GET"])
def logout_view(request):
    """Logout view - logs out user and redirects to login page"""
    logout(request)
    return redirect('accounts:login')


@login_required
@require_http_methods(["GET"])
@ensure_csrf_cookie
def list_employees(request):
    """Get list of employees via AJAX"""
    employees_list = User.objects.exclude(user_type__in=['Admin', 'Secrétaire']).order_by('nom', 'prenom')
    
    employees_data = []
    for employee in employees_list:
        employees_data.append({
            'id': employee.id,
            'prenom': employee.prenom,
            'nom': employee.nom,
            'full_name': employee.full_name,
            'email': employee.email,
            'numero_telephone': employee.numero_telephone or None,
            'user_type': employee.user_type,
            'cout_h': float(employee.cout_h) if employee.cout_h else None,
            'equipe': employee.equipe.name if employee.equipe else None,
            'competences': employee.competences if employee.competences else [],
        })
    
    return JsonResponse({
        'success': True,
        'employees': employees_data
    }, status=200)


@login_required
@require_http_methods(["POST"])
@ensure_csrf_cookie
def create_employee(request):
    """Create a new employee via AJAX"""
    form = EmployeeForm(request.POST)
    
    if form.is_valid():
        # Get password from POST data
        password = request.POST.get('password', '')
        if not password:
            return JsonResponse({
                'success': False,
                'message': 'Le mot de passe est requis.',
                'errors': {'password': 'Le mot de passe est requis.'}
            }, status=400)
        
        # Create user without password first
        user = form.save(commit=False)
        # Set password
        user.set_password(password)
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': f'L\'employé {user.full_name} a été créé avec succès.',
            'employee': {
                'id': user.id,
                'name': user.full_name,
            }
        }, status=200)
    else:
        errors = {}
        for field, field_errors in form.errors.items():
            errors[field] = field_errors[0] if field_errors else ''
        
        return JsonResponse({
            'success': False,
            'message': 'Erreur lors de la création de l\'employé.',
            'errors': errors
        }, status=400)
