from django.contrib import admin
from .models import Planning


@admin.register(Planning)
class PlanningAdmin(admin.ModelAdmin):
    list_display = ['user', 'chantier', 'date', 'start_hour', 'end_hour', 'cout_planning']
    list_filter = ['date', 'chantier', 'user']
    search_fields = ['user__email', 'chantier__name_chantier']
    readonly_fields = ['cout_planning', 'created_at', 'updated_at']
    date_hierarchy = 'date'
