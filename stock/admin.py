from django.contrib import admin
from .models import Commandes


@admin.register(Commandes)
class CommandesAdmin(admin.ModelAdmin):
    list_display = ['reference', 'chantier', 'fournisseur', 'montant_ht', 'statut', 'created_at']
    list_filter = ['statut', 'created_at', 'chantier']
    search_fields = ['reference', 'fournisseur', 'chantier__name_chantier']
    readonly_fields = ['created_at', 'updated_at']
