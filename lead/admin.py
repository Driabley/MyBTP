from django.contrib import admin
from .models import Pistes


@admin.register(Pistes)
class PistesAdmin(admin.ModelAdmin):
    list_display = ['client', 'statut', 'montant_estime', 'probabilite', 'date_relance', 'created_at']
    list_filter = ['statut', 'source', 'created_at']
    search_fields = ['client', 'source', 'notes']
    readonly_fields = ['created_at', 'updated_at']
