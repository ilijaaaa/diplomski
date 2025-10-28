# Django Backend - Muzičko Takmičenje

Diplomski projekat - Django backend sistem za upravljanje međunarodnim muzičkim takmičenjima sa Oracle bazom podataka.

## ✅ Status

✔️ **Modeli**: Svi modeli kreirani i dostupni  
✔️ **Admin Panel**: Svi modeli dostupni u admin panelu  
✔️ **REST API**: Kompletan REST API sa ViewSets  
✔️ **Serializers**: Svi serializers sa nested relacijama  
✔️ **Database**: Oracle DB konfiguracija (oracledb drajver)  

## 📁 Struktura Projekta

```
back/
├── config/                          # Django project configuration
│   ├── __init__.py
│   ├── settings.py                 # Project settings (Oracle DB config)
│   ├── urls.py                     # URL routing
│   ├── wsgi.py                     # WSGI configuration
│   ├── asgi.py                     # ASGI configuration
│   └── env_loader.py               # Environment loader
├── api/                            # Main API application
│   ├── __init__.py
│   ├── models.py                   # 22 Database models
│   ├── views.py                    # 23 ViewSets (REST API)
│   ├── serializers.py              # 23 Serializers
│   ├── urls.py                     # URL routing sa routerom
│   ├── admin.py                    # Admin panel sa 23 registracije
│   ├── apps.py                     # App configuration
│   ├── signals.py                  # Custom signal handlers
│   ├── tests.py                    # Unit tests
├── manage.py                       # Django management script
├── requirements.txt                # Python dependencies
├── .env                           # Environment variables
├── .gitignore                     # Git ignore file
├── MODELS_DOCUMENTATION.md        # Detaljna dokumentacija modela
└── README.md                      # Ovaj fajl
```

## 🗄️ Database Modeli (22 entiteta)

### Core Models
1. **Korisnik** - Osnovni korisnik sistema (UCESNIK, SUDIJA, ORGANIZATOR)
2. **Ucesnik** - Učesnik (Solo, Duo ili Grupa)
3. **Sudija** - Sudija za ocenjivanje
4. **Organizator** - Organizator takmičenja

### Competition Models
5. **MuzickoTakmicenje** - Glavno takmičenje
6. **Izdanje** - Pojedina izdanja takmičenja (npr. 2024, 2025)
7. **TakmickarsKrug** - Krugovi takmičenja (polufinal, final, itd.)
8. **Nastup** - Performance tokom takmičenja

### Content Models
9. **Pesma** - Pesme u bazi
10. **Zanr** - Muzički žanrovi
11. **Drzava** - Države učesnica

### Participant Types
12. **Solo** - Solo performer
13. **Duo** - Duo performer
14. **Grupa** - Grupa performer

### Infrastructure Models
15. **Dvorana** - Sale/dvorane gde se održava takmičenje
16. **Ziri** - Žiri (kolekcija sudija)

### Rating & Awards
17. **Ocenjuje** - Ocene koje sudije daju nastupima
18. **DodeljujanjeNagrade** - Dodeljivanje nagrada
19. **Nagrada** - Nagrade (prize)

### Bridge/Junction Tables
20. **Reprezentuje** - Učesnik reprezentuje zemlju
21. **Izvodi** - Učesnik izvodi pesmu
22. **Organizuje** - Organizator organizuje takmičenje
23. **SastojSe** - Sudija je deo žirija
24. **SeOdrzava** - Izdanje se održava u dvorani
25. **Dodeljuje** - Izdanje dodeljuje nagrade
26. **Ucestvuje** - Država učestvuje u izdanju

## � Setup Uputstva

### 1. Kreiraj Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate
```

### 2. Instaliraj Zavisnosti
```bash
pip install -r requirements.txt
```

### 3. Provjera Konfiguracije
```bash
python manage.py check
```

### 4. Kreiraj Superuser
```bash
python manage.py createsuperuser
```

### 5. Pokreni Development Server
```bash
python manage.py runserver
```

Server će biti dostupan na: `http://localhost:8000`

## � REST API Endpoints

Svi modeli imaju CRUD REST API sa sledećim endpoint-ima:

### Korisnici & Uloge
```
GET    /api/korisnici/              - List korisnika
POST   /api/korisnici/              - Kreiraj novog korisnika
GET    /api/korisnici/{id}/         - Preuzmi korisnika
PUT    /api/korisnici/{id}/         - Ažuriraj korisnika
DELETE /api/korisnici/{id}/         - Obriši korisnika
GET    /api/korisnici/moji-podaci/  - Moji podaci (custom action)
```

### Učesnici
```
GET    /api/ucesnici/               - Lista učesnika
POST   /api/ucesnici/               - Kreiraj učesnika
GET    /api/ucesnici/{id}/          - Detalji učesnika
```

### Takmičenja & Izdanja
```
GET    /api/muzicka-takmicenja/     - Lista takmičenja
GET    /api/izdanja/                - Lista izdanja
GET    /api/takmickarski-krugovi/   - Krugovi takmičenja
```

### Nastupi & Ocene
```
GET    /api/nastupi/                - Lista nastupa
GET    /api/nastupi/?takmickarski_krug_id=X  - Nastupi po krugu
GET    /api/nastupi/?drzava_id=X    - Nastupi po državi
GET    /api/ocene/                  - Ocene sudija
```

### Nagrade
```
GET    /api/nagrade/                - Lista nagrada
GET    /api/dodeljivanja-nagrada/   - Dodeljivanja nagrada
```

### I mnogi drugi...
```
/api/pesme/          - Pesme
/api/zanrovi/        - Žanrovi
/api/drzave/         - Zemlje
/api/sudije/         - Sudije
/api/dvorane/        - Dvorane
/api/ziriji/         - Žiriji
... i više
```

## 🔐 Autentifikacija

### JWT Token
```bash
# Prijavljivanje i dobijanje tokena
POST /api/token/
{
    "username": "korisnik",
    "password": "lozinka"
}

# Korišćenje tokena
Authorization: Bearer <token>
```

## 📊 Admin Panel

Pristupite admin panelu na:
```
http://localhost:8000/admin/
```

Svi modeli su dostupni sa optimizovanim prikazima, filterima i search-om.

## 🗄️ Oracle Database Konfiguracija

### .env Fajl

```env
# Oracle Database Connection
DATABASE_NAME=localhost:1521/xepdb1
DATABASE_USER=in15
DATABASE_PASSWORD=ftn

# Django Secret Key
SECRET_KEY=django-insecure-...

# Debug Mode
DEBUG=True

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

### settings.py Database Konfiguracija

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.oracle',
        'NAME': env('DATABASE_NAME'),
        'USER': env('DATABASE_USER'),
        'PASSWORD': env('DATABASE_PASSWORD'),
    }
}
```

## � Model Relacije

### Arc Relationship (Polymorphic Type)
```
Ucesnik može biti:
  - Solo (jedan izvođač)
  - Duo (dva izvođača)  
  - Grupa (više izvođača)
```

### Hierarchy
```
Korisnik (base)
  ├── Ucesnik (kao performer)
  ├── Sudija (kao judge)
  └── Organizator (kao organizer)
```

## 🔗 Validacije

- Arc relationship u `Ucesnik` - samo jedan tip može biti ispunjen
- Email unique u `Korisnik`
- Unique constraints na bridging tabelama (npr. Ucestvuje, Izvodi)
- Min value validators na numeričkim poljima

## 🧪 Testing

Pokrenuti testove:
```bash
python manage.py test
```

## 📝 Signali

Sistemsko koristi Django signals za:
- Validaciju Arc relationship-a u Ucesniku
- Pre-save validacije

## 🚀 Budućnost

### Planirano
- [ ] Kompleksne business logike (compute rules)
- [ ] Napredne search i filter opcije
- [ ] Aggregation queries za statistiku
- [ ] Custom permissions
- [ ] Rate limiting
- [ ] Caching
- [ ] WebSocket za real-time updates

## 📞 Kontakt & Support

Za probleme ili pitanja:
1. Proverite `MODELS_DOCUMENTATION.md` za detaljan opis svaki model-a
2. Pogledajte `settings.py` za konfiguraciju
3. Pogledajte admin panel na `/admin/`

## 📦 Zavisnosti

| Paket | Verzija | Opis |
|-------|---------|------|
| Django | 5.1.2 | Web framework |
| oracledb | 3.3.0 | Oracle database driver |
| djangorestframework | 3.15.2 | REST API framework |
| djangorestframework-simplejwt | 5.3.1 | JWT Authentication |
| django-environ | 0.12.0 | Environment variables |
| django-cors-headers | 4.6.0 | CORS support |

## 📄 Licenca

Diplomski projekat - Copyright 2024

