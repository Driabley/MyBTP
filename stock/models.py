from django.db import models


class Commandes(models.Model):
    """Orders model for equipment and material fleet management"""
    
    STATUT_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('commandé', 'Commandé'),
        ('reçu', 'Reçu'),
        ('annulé', 'Annulé'),
    ]
    
    reference = models.CharField(max_length=120, unique=True)
    chantier = models.ForeignKey(
        'projects.Chantiers',
        on_delete=models.CASCADE,
        related_name='commandes'
    )
    fournisseur = models.CharField(max_length=180)
    montant_ht = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='brouillon'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'commandes'
        verbose_name = 'Commande'
        verbose_name_plural = 'Commandes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.reference} - {self.chantier} - {self.statut}"
