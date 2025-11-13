from django.contrib import admin
from .models import Equipe


@admin.register(Equipe)
class EquipeAdmin(admin.ModelAdmin):
    list_display = ['name', 'chef_equipe', 'color', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'chef_equipe__email']
    filter_horizontal = ['members']
    readonly_fields = ['created_at', 'updated_at']
