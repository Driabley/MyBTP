from django import forms
from .models import User
from teams.models import Equipe


class EmployeeForm(forms.ModelForm):
    """Form for creating and editing Employees"""
    
    class Meta:
        model = User
        fields = [
            'prenom',
            'nom',
            'email',
            'numero_telephone',
            'user_type',
            'cout_h',
            'cout_j',
            'equipe',
        ]
        widgets = {
            'prenom': forms.TextInput(attrs={
                'class': 'input',
                'placeholder': 'Prénom'
            }),
            'nom': forms.TextInput(attrs={
                'class': 'input',
                'placeholder': 'Nom'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'input',
                'placeholder': 'email@example.com'
            }),
            'numero_telephone': forms.TextInput(attrs={
                'class': 'input',
                'placeholder': '+33 6 12 34 56 78'
            }),
            'user_type': forms.Select(attrs={
                'class': 'select'
            }),
            'cout_h': forms.NumberInput(attrs={
                'class': 'input',
                'step': '0.01',
                'min': '0',
                'placeholder': '0.00'
            }),
            'cout_j': forms.NumberInput(attrs={
                'class': 'input',
                'step': '0.01',
                'min': '0',
                'placeholder': '0.00'
            }),
            'equipe': forms.Select(attrs={
                'class': 'select'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Only show teams that exist
        self.fields['equipe'].queryset = Equipe.objects.all().order_by('name')
        self.fields['equipe'].required = False
        self.fields['numero_telephone'].required = False
        self.fields['cout_h'].required = False
        self.fields['cout_j'].required = False
        # Remove password field from form - it will be set separately
        self.fields['password'] = forms.CharField(
            widget=forms.PasswordInput(attrs={
                'class': 'input',
                'placeholder': 'Mot de passe'
            }),
            required=True,
            help_text="Le mot de passe est requis pour créer un employé."
        )

