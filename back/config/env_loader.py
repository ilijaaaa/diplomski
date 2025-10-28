import os
from pathlib import Path

# Dekorator za učitavanje environment varijabli
def load_env():
    """Učitava environment varijable iz .env fajla."""
    from decouple import config
    return config
