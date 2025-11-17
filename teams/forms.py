from django import forms
from .models import Equipe
from accounts.models import User


class TeamForm(forms.ModelForm):
    """Form for creating and editing Teams"""
    
    class Meta:
        model = Equipe
        fields = [
            'name',
            'color',
            'chef_equipe',
        ]
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'input',
                'placeholder': 'Nom de l\'équipe'
            }),
            'color': forms.TextInput(attrs={
                'class': 'input',
                'type': 'color',
                'style': 'height: 40px; padding: 2px;'
            }),
            'chef_equipe': forms.Select(attrs={
                'class': 'select'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Only show chefs d'équipe in the chef_equipe dropdown
        self.fields['chef_equipe'].queryset = User.objects.filter(user_type='Chef d\'équipe')
        self.fields['chef_equipe'].required = False

