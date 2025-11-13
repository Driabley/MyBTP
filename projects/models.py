from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import math


class Chantiers(models.Model):
    """Construction site/project model"""
    
    CLIENT_TYPE_CHOICES = [
        ('Professionnel', 'Professionnel'),
        ('Particulier', 'Particulier'),
    ]
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Le numéro de téléphone doit être au format: '+999999999'. Jusqu'à 15 chiffres autorisés."
    )
    
    name_chantier = models.CharField(max_length=180, unique=True, blank=True)
    contact = models.TextField(blank=True, default="Si besoin pendant le chantier...")
    date_rdv_technique = models.DateField(null=True, blank=True)
    travaux_type = models.JSONField(default=list, blank=True)
    client_final_type = models.CharField(
        max_length=20,
        choices=CLIENT_TYPE_CHOICES,
        default='Particulier'
    )
    adresse_chantier = models.TextField()
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    cp_ville_chantier = models.CharField(max_length=16)
    avancement_statut = models.JSONField(default=list, blank=True)
    cr_next_step = models.JSONField(default=list, blank=True)
    avancement_chantier = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Pourcentage d'avancement (0-100)"
    )
    nbr_heures = models.PositiveIntegerField(default=0)
    date_debut_chantier = models.DateField(null=True, blank=True)
    date_fin_prevue_chantier = models.DateField(null=True, blank=True)
    annee_periode_construction = models.CharField(max_length=32, blank=True)
    chef_chantier = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chantiers_chef',
        help_text="Chef de chantier must have user_type == 'Chef d'équipe'"
    )
    gdrive_urls = models.JSONField(default=list, blank=True)
    brief_url = models.URLField(blank=True)
    devis_ht = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    nombre_de_jours_chantier = models.PositiveIntegerField(default=0)
    telephone_contact = models.CharField(
        validators=[phone_regex],
        max_length=32,
        blank=True
    )
    cout_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chantiers'
        verbose_name = 'Chantier'
        verbose_name_plural = 'Chantiers'
        ordering = ['-created_at']
    
    def clean(self):
        """Validate model data"""
        errors = {}
        
        # Validate chef_chantier user_type
        if self.chef_chantier and self.chef_chantier.user_type != 'Chef d\'équipe':
            errors['chef_chantier'] = "Le chef de chantier doit avoir le type 'Chef d'équipe'"
        
        # Validate dates
        if self.date_debut_chantier and self.date_fin_prevue_chantier:
            if self.date_fin_prevue_chantier < self.date_debut_chantier:
                errors['date_fin_prevue_chantier'] = "La date de fin ne peut pas être antérieure à la date de début"
        
        # Validate gdrive_urls
        if self.gdrive_urls:
            from django.core.validators import URLValidator
            validator = URLValidator()
            for url in self.gdrive_urls:
                if not isinstance(url, str):
                    errors['gdrive_urls'] = "Tous les éléments de gdrive_urls doivent être des chaînes"
                    break
                try:
                    validator(url)
                except ValidationError:
                    errors['gdrive_urls'] = f"URL invalide dans gdrive_urls: {url}"
                    break
        
        if errors:
            raise ValidationError(errors)
    
    def _generate_name_chantier(self):
        """Generate automatic name_chantier if empty"""
        if not self.name_chantier:
            year = timezone.now().year
            # Get the last sequence number for this year
            last_chantier = Chantiers.objects.filter(
                name_chantier__startswith=f'CH-{year}-'
            ).order_by('-name_chantier').first()
            
            if last_chantier:
                try:
                    sequence = int(last_chantier.name_chantier.split('-')[-1]) + 1
                except (ValueError, IndexError):
                    sequence = 1
            else:
                sequence = 1
            
            self.name_chantier = f'CH-{year}-{sequence:04d}'
    
    def _compute_nombre_de_jours_chantier(self):
        """Compute nombre_de_jours_chantier from dates"""
        if self.date_debut_chantier and self.date_fin_prevue_chantier:
            delta = self.date_fin_prevue_chantier - self.date_debut_chantier
            self.nombre_de_jours_chantier = max(delta.days + 1, 0)
        else:
            self.nombre_de_jours_chantier = 0
    
    def _compute_nbr_heures(self):
        """Compute nbr_heures from devis_ht: floor(devis_ht / 500)"""
        if self.devis_ht:
            self.nbr_heures = int(math.floor(float(self.devis_ht) / 500))
        else:
            self.nbr_heures = 0
    
    def save(self, *args, **kwargs):
        """Override save to run validations and computations"""
        self.full_clean()
        self._generate_name_chantier()
        self._compute_nombre_de_jours_chantier()
        self._compute_nbr_heures()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name_chantier
