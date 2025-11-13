from django.db import models
from django.core.exceptions import ValidationError


class Equipe(models.Model):
    """Team model for organizing workers"""
    
    name = models.CharField(max_length=120, unique=True)
    chef_equipe = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='equipes_chef',
        help_text="Chef d'équipe must have user_type == 'Chef d'équipe'"
    )
    members = models.ManyToManyField(
        'accounts.User',
        related_name='equipes_membre',
        blank=True
    )
    color = models.CharField(
        max_length=7,
        default='#6C63FF',
        help_text="Color code for team display (hex format)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'equipes'
        verbose_name = 'Équipe'
        verbose_name_plural = 'Équipes'
        ordering = ['name']
    
    def clean(self):
        """Validate chef_equipe user_type"""
        if self.chef_equipe and self.chef_equipe.user_type != 'Chef d\'équipe':
            raise ValidationError({
                'chef_equipe': "Le chef d'équipe doit avoir le type 'Chef d'équipe'"
            })
    
    def save(self, *args, **kwargs):
        """Override save to run validation and ensure chef is in members"""
        self.full_clean()
        super().save(*args, **kwargs)
        # Ensure chef_equipe is in members if set
        if self.chef_equipe and self.chef_equipe not in self.members.all():
            self.members.add(self.chef_equipe)
    
    def __str__(self):
        return self.name
