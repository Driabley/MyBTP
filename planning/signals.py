from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .models import Planning
from .utils import update_chantier_aggregates
from accounts.models import User


@receiver(post_save, sender=User)
def update_planning_costs_on_user_change(sender, instance, **kwargs):
    """Update planning costs when user.cout_h changes"""
    # Get all plannings for this user and recalculate costs
    plannings = Planning.objects.filter(user=instance)
    for planning in plannings:
        planning.save()  # This will recompute cout_planning


@receiver(post_save, sender=Planning)
def planning_post_save(sender, instance, **kwargs):
    """Update chantier aggregates when a Planning is saved"""
    update_chantier_aggregates(instance.chantier_id)


@receiver(post_delete, sender=Planning)
def planning_post_delete(sender, instance, **kwargs):
    """Update chantier aggregates when a Planning is deleted"""
    update_chantier_aggregates(instance.chantier_id)

