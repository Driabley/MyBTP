from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Pistes(models.Model):
    """Lead/prospect model for tracking potential clients"""
    
    STATUT_CHOICES = [
        ('Nouveau', 'Nouveau'),
        ('Qualifié', 'Qualifié'),
        ('Devis', 'Devis'),
        ('Gagné', 'Gagné'),
        ('Perdu', 'Perdu'),
    ]
    
    client = models.CharField(max_length=180)
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='Nouveau'
    )
    source = models.CharField(max_length=120, blank=True)
    montant_estime = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    probabilite = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Probabilité de conversion (0-100%)"
    )
    date_relance = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pistes'
        verbose_name = 'Piste'
        verbose_name_plural = 'Pistes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.client} - {self.statut}"
