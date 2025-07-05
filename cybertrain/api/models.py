import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.UUIDField(default=uuid.uuid4, editable=False, null=True, blank=True)
    # Add any other profile-specific fields here in the future
    # e.g., avatar, bio, etc.

    def __str__(self):
        return self.user.username

# Signal to create or update UserProfile whenever a User instance is saved.
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        # Ensure profile exists, can happen if user was created before this signal
        # or if profile was somehow deleted.
        profile, new_profile_created = UserProfile.objects.get_or_create(user=instance)
        if not new_profile_created:
            # If you have fields on UserProfile that should be updated based on User model changes,
            # do it here. For now, we just ensure it exists.
            pass
        # instance.profile.save() # Not strictly necessary here unless you modify profile based on user updates
                                # and don't want to rely on get_or_create's potential save.
                                # For simple existence check, get_or_create is enough.
                                # If UserProfile is being created, it's saved by UserProfile.objects.create()
                                # If it exists, no modification is done that would require a save.
