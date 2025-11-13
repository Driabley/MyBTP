from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'prenom', 'nom', 'user_type', 'equipe', 'is_active', 'is_staff']
    list_filter = ['user_type', 'is_active', 'is_staff', 'equipe']
    search_fields = ['email', 'prenom', 'nom']
    ordering = ['nom', 'prenom']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('prenom', 'nom', 'numero_telephone', 'user_type')}),
        ('Work info', {'fields': ('cout_h', 'cout_j', 'competences', 'permis_de_conduire', 'equipe')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'prenom', 'nom', 'password1', 'password2', 'user_type'),
        }),
    )
