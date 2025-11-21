from decimal import Decimal
from datetime import datetime, timedelta
from projects.models import Chantiers
from .models import Planning


def update_chantier_aggregates(chantier_id):
    """
    Update chantier aggregates (hours spent and cost spent) from all Planning entries.
    
    This function:
    - Sums all hours from Planning entries for the chantier
    - Sums all cout_planning values from Planning entries
    - Updates the chantier using queryset.update() to avoid recursive saves
    """
    plannings = Planning.objects.filter(chantier_id=chantier_id)
    
    total_hours = Decimal('0')
    total_cost = Decimal('0')
    
    for p in plannings:
        # Calculate hours using the same logic as Planning._compute_cout_planning
        start = datetime.combine(p.date, p.start_hour)
        end = datetime.combine(p.date, p.end_hour)
        if end < start:
            end += timedelta(days=1)
        
        delta = end - start
        hours = Decimal(str(delta.total_seconds() / 3600.0))
        total_hours += hours
        
        # Sum cout_planning (already computed by Planning.save())
        total_cost += p.cout_planning or Decimal('0')
    
    # Update the chantier via save() to trigger automatic VA recalculation
    # This ensures va is recalculated when cost_spent_on_project changes
    try:
        chantier = Chantiers.objects.get(id=chantier_id)
        chantier.number_hour_spent_on_project = total_hours
        chantier.cost_spent_on_project = total_cost
        # save() will automatically recalculate va via _compute_va()
        chantier.save()
    except Chantiers.DoesNotExist:
        pass

