from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Q
from datetime import datetime, timedelta
from decimal import Decimal


class Planning(models.Model):
    """Planning model for scheduling workers to construction sites"""
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='plannings'
    )
    chantier = models.ForeignKey(
        'projects.Chantiers',
        on_delete=models.CASCADE,
        related_name='plannings'
    )
    date = models.DateField()
    start_hour = models.TimeField()
    end_hour = models.TimeField()
    cout_planning = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'planning'
        verbose_name = 'Planning'
        verbose_name_plural = 'Plannings'
        ordering = ['date', 'start_hour']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['chantier', 'date']),
        ]
        unique_together = [['user', 'date', 'start_hour', 'end_hour']]
    
    def clean(self):
        """Validate planning data"""
        errors = {}
        
        # Validate that minutes are in 15-minute increments (00, 15, 30, 45)
        allowed_minutes = [0, 15, 30, 45]
        
        if self.start_hour:
            if self.start_hour.minute not in allowed_minutes:
                errors['start_hour'] = "L'heure de début doit être un multiple de 15 minutes (00, 15, 30, 45)"
        
        if self.end_hour:
            if self.end_hour.minute not in allowed_minutes:
                errors['end_hour'] = "L'heure de fin doit être un multiple de 15 minutes (00, 15, 30, 45)"
        
        # Check end_hour > start_hour
        if self.end_hour <= self.start_hour:
            errors['end_hour'] = "L'heure de fin doit être postérieure à l'heure de début"
        
        # Check for overlaps
        if self.pk:
            # Exclude self when checking for overlaps during update
            overlapping = Planning.objects.filter(
                user=self.user,
                date=self.date
            ).exclude(pk=self.pk).filter(
                Q(start_hour__lt=self.end_hour, end_hour__gt=self.start_hour)
            )
        else:
            overlapping = Planning.objects.filter(
                user=self.user,
                date=self.date
            ).filter(
                Q(start_hour__lt=self.end_hour, end_hour__gt=self.start_hour)
            )
        
        if overlapping.exists():
            errors['__all__'] = "Conflit de planning détecté pour cet employé."
        
        if errors:
            raise ValidationError(errors)
    
    def _compute_cout_planning(self):
        """Compute cout_planning from hours and user.cout_h"""
        if self.start_hour and self.end_hour and self.user:
            # Check if it's a full day (08:00-17:00) - bill only 8 hours (1h unpaid lunch break)
            is_full_day = (
                self.start_hour == datetime.strptime('08:00', '%H:%M').time() and
                self.end_hour == datetime.strptime('17:00', '%H:%M').time()
            )
            
            if is_full_day:
                # Full day preset: bill 8 hours instead of 9
                hours = Decimal('8.0')
            else:
                # Calculate hours difference normally
                start = datetime.combine(self.date, self.start_hour)
                end = datetime.combine(self.date, self.end_hour)
                if end < start:
                    # Handle overnight shifts (shouldn't happen with validation, but safety check)
                    end += timedelta(days=1)
                
                delta = end - start
                hours = Decimal(str(delta.total_seconds() / 3600.0))  # Convert to hours
            
            # Get user hourly cost
            if self.user.cout_h:
                self.cout_planning = hours * self.user.cout_h
            else:
                self.cout_planning = Decimal('0')
        else:
            self.cout_planning = Decimal('0')
    
    def save(self, *args, **kwargs):
        """Override save to run validation and compute cost"""
        self.full_clean()
        self._compute_cout_planning()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user} - {self.chantier} - {self.date} ({self.start_hour}-{self.end_hour})"
