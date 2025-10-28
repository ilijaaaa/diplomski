#!/usr/bin/env python
import os
import sys

# Add backend to path
sys.path.insert(0, r'd:\Fakultet\S8\Diplomski\Projekat\diplomski\back')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from api.models import Korisnik

print("Provera korisnika u bazi:")
users = Korisnik.objects.all()
print(f"Ukupno korisnika: {users.count()}")

for user in users:
    print(f"ID: {user.idk}, Username: {user.username}, Tip: {user.tipk}")

# Check if marko_org exists
try:
    marko = Korisnik.objects.get(username='marko_org')
    print(f"\nmarko_org pronađen: {marko.imek} {marko.przk}")
except Korisnik.DoesNotExist:
    print("\nmarko_org NE POSTOJI!")
    
    # Create test user
    from django.contrib.auth.hashers import make_password
    test_user = Korisnik.objects.create(
        username='marko_org',
        imek='Marko',
        przk='Petrovic',
        mejl='marko@test.com',
        lozinka=make_password('password123'),
        tipk='ORGANIZATOR'
    )
    print(f"Kreiran test user: {test_user.username}")