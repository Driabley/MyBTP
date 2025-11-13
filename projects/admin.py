from django.contrib import admin
from .models import Chantiers


@admin.register(Chantiers)
class ChantiersAdmin(admin.ModelAdmin):
    list_display = ['name_chantier', 'client_final_type', 'chef_chantier', 'date_debut_chantier', 'avancement_chantier', 'devis_ht']
    list_filter = ['client_final_type', 'chef_chantier', 'date_debut_chantier']
    search_fields = ['name_chantier', 'adresse_chantier', 'cp_ville_chantier']
    readonly_fields = ['name_chantier', 'nbr_heures', 'nombre_de_jours_chantier', 'created_at', 'updated_at']
    fieldsets = (
        ('Informations générales', {
            'fields': ('name_chantier', 'contact', 'client_final_type', 'chef_chantier')
        }),
        ('Localisation', {
            'fields': ('adresse_chantier', 'cp_ville_chantier', 'latitude', 'longitude')
        }),
        ('Dates', {
            'fields': ('date_rdv_technique', 'date_debut_chantier', 'date_fin_prevue_chantier', 'annee_periode_construction')
        }),
        ('Avancement', {
            'fields': ('avancement_chantier', 'avancement_statut', 'cr_next_step', 'nombre_de_jours_chantier', 'nbr_heures')
        }),
        ('Financier', {
            'fields': ('devis_ht', 'cout_total', 'telephone_contact')
        }),
        ('Documents', {
            'fields': ('gdrive_urls', 'brief_url', 'travaux_type')
        }),
        ('Dates système', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
