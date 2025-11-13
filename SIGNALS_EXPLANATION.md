# Django Signals Explanation

## What are Signals?

Django signals are a way to allow decoupled applications to get notified when certain actions occur elsewhere in the application. They're like "hooks" that let you execute code when something happens.

## signals.py in the Planning App

The `planning/signals.py` file contains a signal receiver that automatically updates planning costs when a user's hourly rate changes.

### How it Works

```python
from django.db.models.signals import post_save
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
```

### Explanation

1. **`@receiver(post_save, sender=User)`**: This decorator tells Django to listen for the `post_save` signal from the `User` model.

2. **`post_save`**: This signal is sent after a model instance is saved (created or updated).

3. **`sender=User`**: This specifies that we only want to listen for signals from the User model.

4. **The function**: When a User is saved, this function runs:
   - It finds all Planning entries for that user
   - It saves each Planning entry, which triggers the `_compute_cout_planning()` method in the Planning model
   - This recalculates the cost based on the user's new hourly rate

### Why is this useful?

- **Automatic updates**: When you change a user's hourly rate (`cout_h`), all their existing planning entries automatically get updated costs
- **No manual intervention**: You don't need to manually update each planning entry
- **Data consistency**: Ensures that planning costs always reflect the current user rates

### Common Django Signals

- `pre_save`: Sent before a model's save() method is called
- `post_save`: Sent after a model's save() method is called
- `pre_delete`: Sent before a model's delete() method is called
- `post_delete`: Sent after a model's delete() method is called
- `m2m_changed`: Sent when a ManyToManyField is changed

### Important Note

Signals are NOT API-related. They're a core Django feature that works regardless of whether you use REST Framework or not. They're useful for maintaining data integrity and automating tasks.

## When to Use Signals

- Automatically updating related data when a model changes
- Sending notifications when something happens
- Logging changes
- Maintaining data consistency
- Cleaning up related objects

## When NOT to Use Signals

- For complex business logic (use model methods instead)
- When the code should be explicit (signals can be "hidden")
- For performance-critical operations (signals run on every save)

## In This Project

The signal in `planning/signals.py` ensures that whenever a user's hourly rate is updated, all their planning entries are automatically recalculated with the new rate. This keeps the data consistent without requiring manual updates.



