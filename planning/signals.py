from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Planning
from accounts.models import User


@receiver(post_save, sender=User)
def update_planning_costs_on_user_change(sender, instance, **kwargs):
    """Update planning costs when user.cout_h changes"""
    # Get all plannings for this user and recalculate costs
    plannings = Planning.objects.filter(user=instance)
    for planning in plannings:
        planning.save()  # This will recompute cout_planning

