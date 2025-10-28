"""
Script to populate database with test data.
Run with: python manage.py shell < populate_db.py
"""
from api.models import (
    Korisnik, Zanr, Pesma, Drzava, Duo, Grupa, Solo, Ucesnik, Sudija, Organizator,
    MuzickoTakmicenje, Ziri, Izdanje, Dvorana, TakmickarsKrug, Ucestvuje, Reprezentuje,
    Izvodi, Nastup, Ocenjuje, DodeljujanjeNagrade, Nagrada, Dodeljuje, Organizuje,
    SastojSe, SeOdrzava
)
from datetime import datetime, timedelta
from django.contrib.auth.hashers import make_password

# Clear existing data
print("Čišćenje postojećih podataka...")
Korisnik.objects.all().delete()
Zanr.objects.all().delete()
Drzava.objects.all().delete()

print("Kreiram testne podatke...")

# Create Genres
zanrovi = {
    'pop': Zanr.objects.create(nazzanr='Pop'),
    'rock': Zanr.objects.create(nazzanr='Rock'),
    'folk': Zanr.objects.create(nazzanr='Folk'),
}

# Create Countries
drzave = {
    'serbia': Drzava.objects.create(
        nazdr='Srbija',
        prvagoduc=2004,
        brpob=2
    ),
    'croatia': Drzava.objects.create(
        nazdr='Hrvatska',
        prvagoduc=2000,
        brpob=1
    ),
    'finland': Drzava.objects.create(
        nazdr='Finska',
        prvagoduc=1997,
        brpob=6
    ),
}

# Create Songs
pesme = {
    'pesma1': Pesma.objects.create(
        nazp='Pesma 1',
        trajanje=180,
        datob='2024-01-01',
        zanr=zanrovi['pop']
    ),
    'pesma2': Pesma.objects.create(
        nazp='Pesma 2',
        trajanje=210,
        datob='2024-01-15',
        zanr=zanrovi['rock']
    ),
}

# Create Users
korisnici = {}

# Organizers
org_korisnik = Korisnik.objects.create(
    username='marko_org',
    imek='Marko',
    przk='Marković',
    mejl='marko@example.com',
    lozinka=make_password('password123'),
    tipk='ORGANIZATOR'
)
korisnici['organizator'] = org_korisnik

# Judges
sudija_korisnik1 = Korisnik.objects.create(
    username='dusko_sudija',
    imek='Duško',
    przk='Dušković',
    mejl='dusko@example.com',
    lozinka=make_password('password123'),
    tipk='SUDIJA'
)
sudija_korisnik2 = Korisnik.objects.create(
    username='ana_sudija',
    imek='Ana',
    przk='Anić',
    mejl='ana@example.com',
    lozinka=make_password('password123'),
    tipk='SUDIJA'
)

# Participants
solo1_korisnik = Korisnik.objects.create(
    username='petar_solo',
    imek='Petar',
    przk='Petrović',
    mejl='petar.solo@example.com',
    lozinka=make_password('password123'),
    tipk='UCESNIK'
)

duo1_korisnik1 = Korisnik.objects.create(
    username='jovan_duo',
    imek='Jovan',
    przk='Jovanović',
    mejl='jovan@example.com',
    lozinka='password123',
    tipk='UCESNIK'
)

duo1_korisnik2 = Korisnik.objects.create(
    username='mirjana_duo',
    imek='Mirjana',
    przk='Mirjanić',
    mejl='mirjana@example.com',
    lozinka=make_password('password123'),
    tipk='UCESNIK'
)

# Create Participant Types
solo = Solo.objects.create(umime='Petar Petrović')
duo = Duo.objects.create(nazduo='Duo "Harmony"')
grupa = Grupa.objects.create(nazg='Grupa "Muzika"', brclang=5)

# Create Participant Records
ucesnik_solo = Ucesnik.objects.create(
    idk=solo1_korisnik,
    tipu='SOLO',
    solo=solo
)

ucesnik_duo = Ucesnik.objects.create(
    idk=duo1_korisnik1,
    tipu='DUO',
    duo=duo
)

# Create Judges
sudija1 = Sudija.objects.create(
    idk=sudija_korisnik1,
    titula='Доктор'
)

sudija2 = Sudija.objects.create(
    idk=sudija_korisnik2,
    titula='Магистер'
)

# Create Organizer
organizator = Organizator.objects.create(idk=org_korisnik)

# Create Competition
takmicenje = MuzickoTakmicenje.objects.create(
    nazmt='Međunarodno muzičko takmičenje',
    godosn='2024-01-01'
)

# Create Jury
ziri = Ziri.objects.create(brclanz=2)

# Add judges to jury
SastojSe.objects.create(ziri=ziri, sudija=sudija1, predsednik=True)
SastojSe.objects.create(ziri=ziri, sudija=sudija2, predsednik=False)

# Create Edition
izdanje = Izdanje.objects.create(
    datpoc='2024-05-01',
    datkraj='2024-05-14',
    ziri=ziri,
    muzicko_takmicenje=takmicenje
)

# Create Halls
dvorana = Dvorana.objects.create(
    nazdv='Beogradska Arena',
    kap=6000,
    grad='Beograd',
    drz='Srbija'
)

# Edition in Hall
SeOdrzava.objects.create(dvorana=dvorana, izdanje=izdanje)

# Create Competition Rounds
krug = TakmickarsKrug.objects.create(
    rbrtk=1,
    datodrz='2024-05-05',
    izdanje=izdanje
)

# Create Participation
ucestva = {}
for kod, drzava in drzave.items():
    ucestvo = Ucestvuje.objects.create(
        izdanje=izdanje,
        drzava=drzava
    )
    ucestva[kod] = ucestvo

# Create Representations
Reprezentuje.objects.create(
    ucestvuje=ucestva['serbia'],
    ucesnik=ucesnik_solo
)

# Create Performances
nastup = Nastup.objects.create(
    ukbod=0,
    rbrn=1,
    plasman=1,
    drzava=drzave['serbia'],
    pesma=pesme['pesma1'],
    takmickarski_krug=krug
)

# Create Ratings
Ocenjuje.objects.create(
    nastup=nastup,
    sudija=sudija1,
    bod=8
)
Ocenjuje.objects.create(
    nastup=nastup,
    sudija=sudija2,
    bod=9
)

# Create Awards
dodeljivanje = DodeljujanjeNagrade.objects.create(
    datdodele='2024-05-14',
    sudija=sudija1
)

nagrada = Nagrada.objects.create(
    naznag='Grand Prix',
    dodeljivanje_nagrade=dodeljivanje
)

# Link Award to Edition
Dodeljuje.objects.create(
    izdanje=izdanje,
    nagrada=nagrada
)

# Organize
Organizuje.objects.create(
    organizator=organizator,
    muzicko_takmicenje=takmicenje
)

print("✅ Testni podaci su uspešno kreirani!")
print(f"   - Korisnici: {Korisnik.objects.count()}")
print(f"   - Pesme: {Pesma.objects.count()}")
print(f"   - Zemlje: {Drzava.objects.count()}")
print(f"   - Takmičenja: {MuzickoTakmicenje.objects.count()}")
print(f"   - Nastupi: {Nastup.objects.count()}")
