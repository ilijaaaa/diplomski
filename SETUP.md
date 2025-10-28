# 🚀 Detaljno Okruženje - Setup Instrukcije

Ovo je detaljan vodič za podešavanje Muzičkog Takmičenja Sistema na lokalnoj mašini.

## 📋 Preduslovi

Proveri da li imaš instaliran:
- **Python 3.11+** - `python --version`
- **Node.js 18+** - `node --version`
- **npm 9+** - `npm --version`
- **Oracle Database** - Lokalno instaliran i pokrenut (port 1521)
- **Git** - `git --version`

## 🔧 Backend Setup (Django)

### 1. Kreiraj Virtuelno Okruženje

```bash
cd back
python -m venv venv

# Za Windows:
venv\Scripts\activate

# Za Linux/Mac:
source venv/bin/activate
```

### 2. Instaliraj Zavisnosti

```bash
pip install -r requirements.txt
```

### 3. Proveri Konfiguraciju Baze

Otidi u `back/config/settings.py` i proveri Oracle konfiguraciju:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.oracle',
        'NAME': 'xepdb1',
        'USER': 'in15',
        'PASSWORD': 'ftn',
        'HOST': 'localhost',
        'PORT': '1521',
    }
}
```

### 4. Primeni Migracije

```bash
python manage.py migrate
```

Očekivani output:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, api
Running migrations:
  ...
  Applying api.0001_initial... OK
```

### 5. Popuni Bazu sa Test Podacima

```bash
python run_populate.py
```

Očekivani output:
```
Kreiram test podatke...
✓ 6 korisnika kreirano
✓ 2 pesme kreirane
✓ 3 zemlje kreirane
✓ Podaci uspešno učitani
```

### 6. Kreiraj Admin Nalog (Opciono)

```bash
python manage.py createsuperuser
```

Odgovori na pitanja i kreiraj admin nalog.

### 7. Pokreni Backend Server

```bash
python manage.py runserver 8000
```

Očekivani output:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**Backend je dostupan na: `http://localhost:8000`**

## 🎨 Frontend Setup (React)

### 1. Instaliraj Zavisnosti

```bash
cd ../front
npm install
```

Čekaj dok se sve zavisnosti instaliraju (~2-3 minuta).

### 2. Kreiraj .env Fajl

Kreiraj `front/.env` fajl sa sledećim sadržajem:

```
REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Pokreni Frontend Server

```bash
npm start
```

Očekivani output:
```
Compiled successfully!

You can now view diplom in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Frontend će se automatski otvoriti na: `http://localhost:3000`**

## ✅ Verifikacija

### Backend Verifikacija

Testiraj da li backend radi:

```bash
# U drugoj terminal sesiji (sa aktivnim venv-om)
curl http://localhost:8000/api/
```

Trebalo bi da dobiješ JSON odgovor.

### Frontend Verifikacija

Otvori `http://localhost:3000` u browser-u. Trebalo bi da vidiš Login stranicu.

## 🔐 Testiranje Autentifikacije

### 1. Prijava kao Organizator

- URL: `http://localhost:3000`
- Username: `marko_org`
- Password: `password123`
- Očekivani rezultat: Zeleni dashboard sa 3 kartice

### 2. Prijava kao Sudija

- Username: `dusko_sudija`
- Password: `password123`
- Očekivani rezultat: Žuti dashboard sa poslovima

### 3. Prijava kao Učesnik

- Username: `petar_solo`
- Password: `password123`
- Očekivani rezultat: Ljubičast dashboard sa statusom učešća

## 📝 Registracija Novih Korisnika

### Registracija Sudije

1. Ideš na `http://localhost:3000` (ako si prijavljen, odjavi se)
2. Klikneš na "Registruj se kao Sudija"
3. Popunjavaš formu sa:
   - Username: `nova_sudija`
   - Ime: `Marko`
   - Prezime: `Marković`
   - Email: `marko@example.com`
   - Titula: `Dr. sc.`
   - Lozinka: `password123`
4. Klikneš "Registruj se"
5. Automatski te prijavljuje i vodiš na dashboard

### Registracija Organizatora

1. Ideš na `http://localhost:3000`
2. Klikneš na "Registruj se kao Organizator"
3. Popunjavaš formu sa:
   - Username: `novi_org`
   - Ime: `Ana`
   - Prezime: `Anić`
   - Email: `ana@example.com`
   - Lozinka: `password123`
4. Klikneš "Registruj se"
5. Automatski te prijavljuje

### Registracija Učesnika

Učesnici se ne mogu sami registrovati. Organizator mora:
1. Ići na Dashboard
2. Kliknu "Dodaj učesnika"
3. Popuni podatke učesnika
4. Odaberi tip učešća (Solo/Duo/Grupa)
5. Učesnik dobija kredencijale

## 🛠️ Troubleshooting

### Problem: "Connection refused" - Oracle baza

**Rešenje:**
```bash
# Proveri da li je Oracle pokrenut
# Windows (SQL*Plus):
sqlplus /nolog
CONNECT in15/ftn@localhost:1521/xepdb1

# Ako ne radi, proveri service:
# Windows Services → OracleServiceXEPDB1
```

### Problem: "Module 'oracledb' not found"

**Rešenje:**
```bash
pip install oracledb
```

### Problem: "ModuleNotFoundError: No module named 'rest_framework'"

**Rešenje:**
```bash
pip install -r requirements.txt
# ili
pip install djangorestframework djangorestframework-simplejwt django-cors-headers
```

### Problem: React aplikacija se ne konektuje na backend

**Rešenje:**
1. Proveri da je backend pokrenut na portu 8000
2. Proveri da je `.env` fajl sa `REACT_APP_API_URL=http://localhost:8000/api`
3. Osvežavaj stranicu (Ctrl+F5)
4. Otvori DevTools (F12) → Network tab → vidi request-ove

### Problem: "CORS error" u browser konzoli

**Rešenje:**
```python
# Back/config/settings.py - već je konfigurisano:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8000",
]
```

## 🔄 Workflow

### Dnevni Development Workflow

1. **Otvori dve terminal sesije**

Session 1 - Backend:
```bash
cd back
venv\Scripts\activate  # Windows
python manage.py runserver 8000
```

Session 2 - Frontend:
```bash
cd front
npm start
```

2. **Razvijaj**
   - Backend: Izmeni kod u `back/api/views.py` ili `models.py`
   - Frontend: Izmeni kod u `front/src/pages/` ili `components/`
   - Automatski reload (hot reload)

3. **Testiraj**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000/api`
   - Admin panel: `http://localhost:8000/admin` (ako imaš superuser)

### Migracije

Ako izmeniš modele:

```bash
cd back
python manage.py makemigrations api
python manage.py migrate
```

### Reset Baze

```bash
cd back
rm api/migrations/0001_initial.py
python manage.py makemigrations api
python manage.py migrate
python run_populate.py
```

## 📦 Docker Setup (Opciono)

Ako koristiš Docker:

```bash
# Pokreni sve servise
docker-compose up -d

# Vidi logs
docker-compose logs -f

# Zaustavi sve
docker-compose down
```

## 📊 Database Admin

### Pristup Oracle SQL*Plus

```bash
sqlplus in15/ftn@localhost:1521/xepdb1
```

### Django Admin Panel

1. Kreiraj superuser:
```bash
python manage.py createsuperuser
```

2. Idi na `http://localhost:8000/admin`
3. Prijavite se sa createsuperuser kredencijalima

## 🎓 Sledeće Korake

1. **Razumi strukturu:**
   - `back/api/models.py` - Database modeli
   - `back/api/serializers.py` - Serialization logika
   - `back/api/views.py` - API views
   - `front/src/pages/` - React stranice

2. **Razvijaj nove feature-ove:**
   - Dodaj novi model u `models.py`
   - Kreiraj serializer
   - Kreiraj viewset
   - Registruj u `urls.py`
   - Kreiraj React stranicu

3. **Testiraj:**
   - Koristi Postman za API testiranje
   - Koristi React DevTools za frontend debugging
   - Koristi Django Admin za data inspection

## 📚 Korisni Resursi

- [Django Dokumentacija](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Dokumentacija](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios Dokumentacija](https://axios-http.com/)

---

**Ako naideš na problem, prvo proveri Troubleshooting sekciju!**
