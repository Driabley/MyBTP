from django import forms
from .models import Chantiers
from accounts.models import User


class ChantierForm(forms.ModelForm):
    """Form for creating and editing Chantiers"""
    
    class Meta:
        model = Chantiers
        fields = [
            'adresse_chantier',
            'cp_ville_chantier',
            'ville_chantier',
            'client_final_type',
            'contact',
            'date_rdv_technique',
            'date_debut_chantier',
            'devis_ht',
            'telephone_contact',
            'chef_chantier',
            'brief_url',
        ]
        widgets = {
            'adresse_chantier': forms.Textarea(attrs={
                'class': 'input',
                'rows': 2,
                'placeholder': 'Adresse complète du chantier'
            }),
            'cp_ville_chantier': forms.TextInput(attrs={
                'class': 'input',
                'placeholder': 'Code postal et ville'
            }),
            'ville_chantier': forms.TextInput(attrs={
                'class': 'input',
                'placeholder': 'Ville'
            }),
            'client_final_type': forms.Select(attrs={
                'class': 'select'
            }),
            'contact': forms.Textarea(attrs={
                'class': 'input',
                'rows': 2,
                'placeholder': 'Si besoin pendant le chantier...'
            }),
            'date_rdv_technique': forms.DateInput(attrs={
                'class': 'input',
                'type': 'date'
            }),
            'date_debut_chantier': forms.DateInput(attrs={
                'class': 'input',
                'type': 'date'
            }),
            'devis_ht': forms.NumberInput(attrs={
                'class': 'input',
                'step': '0.01',
                'min': '0',
                'placeholder': '0.00'
            }),
            'telephone_contact': forms.TextInput(attrs={
                'class': 'input',
                'placeholder': '+33 6 12 34 56 78'
            }),
            'chef_chantier': forms.Select(attrs={
                'class': 'select'
            }),
            'brief_url': forms.URLInput(attrs={
                'class': 'input',
                'placeholder': 'https://...'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Only show chefs d'équipe in the chef_chantier dropdown
        self.fields['chef_chantier'].queryset = User.objects.filter(user_type='Chef d\'équipe')
        self.fields['chef_chantier'].required = False
        self.fields['contact'].required = False
        self.fields['date_rdv_technique'].required = False
        self.fields['date_debut_chantier'].required = False
        self.fields['telephone_contact'].required = False
        self.fields['brief_url'].required = False

