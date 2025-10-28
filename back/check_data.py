#!/usr/bin/env python
import os
import sys

# Add backend to path
sys.path.insert(0, r'd:\Fakultet\S8\Diplomski\Projekat\diplomski\back')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from api.models import MuzickoTakmicenje, Izdanje, Drzava, Dvorana, Sudija, Korisnik

print("=== MUZIČKA TAKMIČENJA ===")
takmicenja = MuzickoTakmicenje.objects.all()
for t in takmicenja:
    print(f"ID: {t.idmt}, Naziv: {t.nazmt}, Godina: {t.godosn}")

print("\n=== IZDANJA ===")
izdanja = Izdanje.objects.all()
for i in izdanja:
    print(f"ID: {i.idizd}, Start: {i.datpoc}, End: {i.datkraj}, Takmičenje: {i.muzicko_takmicenje.nazmt}")

print("\n=== DRŽAVE ===")
drzave = Drzava.objects.all()
for d in drzave:
    print(f"ID: {d.iddr}, Naziv: {d.nazdr}")

print("\n=== DVORANE ===")
dvorane = Dvorana.objects.all()
for d in dvorane:
    print(f"ID: {d.iddv}, Naziv: {d.nazdv}, Kapacitet: {d.kap}, Grad: {d.grad}, Država: {d.drz}")

print("\n=== SUDIJE ===")
sudije = Sudija.objects.all()
for s in sudije:
    print(f"ID: {s.idk.idk}, Ime: {s.idk.imek} {s.idk.przk}, Titula: {s.titula}")