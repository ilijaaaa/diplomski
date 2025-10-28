"""
Signals for Music Competition System.
Auto-increment sequence handling and model validations.
"""
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Ucesnik


@receiver(pre_save, sender=Ucesnik)
def validate_ucesnik_type(sender, instance, **kwargs):
    """
    Validate that Ucesnik has exactly one of: solo, duo, or grupa.
    """
    count = sum([
        instance.solo is not None,
        instance.duo is not None,
        instance.grupa is not None
    ])
    
    if count != 1:
        raise ValueError(
            "Učesnik mora biti tačno jedan od: Solo, Duo ili Grupa. "
            f"Trenutno ima {count} vrednosti."
        )
