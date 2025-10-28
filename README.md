# Muzičko Takmičenje - Kompletan Sistem

Kompletan sistem za upravljanje muzičkim takmičenjem sa Django backend-om i React frontend-om.

## 📋 Pregled

Sistem je namenjen za upravljanje muzičkim takmičenjima sa sledećim karakteristikama:

- **Tri tipa korisnika**: Sudija, Organizator, Učesnik
- **Prijava i registracija** sa JWT autentifikacijom
- **Upravljanje profilom** sa mogućnošću promene lozinke
- **Role-based dashboard** sa prilagođenim interfejsom
- **Beautiful UI** sa Tailwind CSS-om
- **RESTful API** sa Django REST Framework-om

## 🏗️ Arhitektura

```
diplomski/
├── back/                 # Django backend
│   ├── api/             # API aplikacija
│   ├── config/          # Konfiguracija
│   ├── manage.py
│   ├── requirements.txt
│   └── populate_db.py   # Test podaci
├── front/               # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
└── README.md
```

## 🚀 Brz Start

### Backend (Django)

1. **Otidi u `back` folder**:
```bash
cd back
```

2. **Kreiraj virtuelno okruženje**:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. **Instaliraj zavisnosti**:
```bash
pip install -r requirements.txt
```

4. **Primeni migracije**:
```bash
python manage.py migrate
```

5. **Popuni bazu sa test podacima**:
```bash
python run_populate.py
```

6. **Pokreni server**:
```bash
python manage.py runserver 8000
```

Backend će biti dostupan na `http://localhost:8000`

### Frontend (React)

1. **Otidi u `front` folder**:
```bash
cd ../front
```

2. **Instaliraj zavisnosti**:
```bash
npm install
```

3. **Pokreni development server**:
```bash
npm start
```

Frontend će se otvoriti na `http://localhost:3000`

## 👥 Tipovi Korisnika

### 🎵 Sudija
- Prijavljivanje putem `Login` stranice
- Pregled nastupa i takmičenja
- Davanje ocena i povratnih informacija
- Upravljanje profilom i lozinkom

### 🎪 Organizator
- Registracija via `/register-organizator`
- Upravljanje učesnicima i grupama
- Dodavanje učesnika sa Solo/Duo/Grupa opcijama
- Upravljanje takmičenjima
- Upravljanje profilom i lozinkom

### 🎤 Učesnik
- Samo prijava (registracija se vrši kroz organizatora)
- Pregled svog statusa učešća
- Pregled nastupa i rezultata
- Upravljanje profilom i lozinkom

## 📝 Test Podaci

Script `populate_db.py` kreira sledeće test podatke:

- **6 Korisnika**: 1 organizator, 2 sudije, 3 učesnika
- **2 Pesme**: Pop i Rock
- **3 Zemlje**: Srbija, Hrvatska, Finska
- **1 Takmičenje**: Međunarodno muzičko takmičenje
- **1 Nastup**: Petar Petrović sa pesmom

### Login Kredencijali za Testiranje

```
Organizator:
Username: marko_org
Password: password123

Sudija:
Username: dusko_sudija
Password: password123

Učesnik (Solo):
Username: petar_solo
Password: password123
```

## 🔐 Autentifikacija

Sistem koristi **JWT (JSON Web Token)** autentifikaciju:

- Access token: Važi 60 minuta
- Refresh token: Važi 1 dan
- Automatski refresh tokena pri isteku

## 📚 API Endpointi

### Autentifikacija
- `POST /api/auth/login/` - Prijava
- `POST /api/auth/register_sudija/` - Registracija sudije
- `POST /api/auth/register_organizator/` - Registracija organizatora
- `GET /api/auth/me/` - Dobijanje korisničkih podataka
- `PUT /api/auth/update_profil/` - Ažuriranje profila

### Organizator
- `POST /api/organizator/dodaj_ucesnika/` - Dodavanje učesnika
- `GET /api/organizator/lista_duosa/` - Lista svih duosa
- `GET /api/organizator/lista_grupa/` - Lista svih grupa
- `POST /api/organizator/kreiraj_duo/` - Kreiranje dua
- `POST /api/organizator/kreiraj_grupu/` - Kreiranje grupe
- `GET /api/organizator/lista_ucesnika/` - Lista učesnika

### Ostali Resursi
- `GET /api/zanrovi/` - Žanrovi muzike
- `GET /api/pesme/` - Pesme
- `GET /api/drzave/` - Zemlje
- `GET /api/takmicenja/` - Takmičenja
- `GET /api/nastupi/` - Nastupi
- ...i mnogi drugi

## 🛠️ Tehnologije

### Backend
- **Django 5.1.2** - Web framework
- **Django REST Framework 3.15.2** - REST API
- **djangorestframework-simplejwt** - JWT autentifikacija
- **django-cors-headers** - CORS podrška
- **oracledb 3.3.0** - Oracle baza podataka

### Frontend
- **React 18** - UI library
- **React Router 6** - Rutiranje
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

## 📦 Baza Podataka

Sistem koristi **Oracle 11g/12c+** bazu podataka.

### Konfiguracija
```
HOST: localhost
PORT: 1521
NAME: xepdb1
USER: in15
PASSWORD: ftn
```

## 🎨 Styling

Frontend koristi **Tailwind CSS** sa gradijentima i animacijama:
- **Login**: Purple-Blue gradijent
- **Sudija**: Yellow-Orange gradijent
- **Organizator**: Green gradijent
- **Učesnik**: Purple-Pink gradijent

## 🧪 Testiranje

### Backend Test
```bash
cd back
python manage.py test
```

### Frontend Test
```bash
cd front
npm test
```

## 📖 Struktura Modela

26 Django modela sa kompleksnim relacijama:
- **Korisnik**: Bazni model sa is-a hijerarhijom
- **Ucesnik/Sudija/Organizator**: Naslednici Korisnika
- **Solo/Duo/Grupa**: Arc relationship za tipove učešća
- **MuzickoTakmicenje, Izdanje, TakmickarsKrug**: Takmičenjska struktura
- **Nastup, Ocenjuje**: Performanse i ocene
- **Nagrada, DodeljujanjeNagrade**: Sistem nagrada
- ...i mnogi drugi

## 🔄 Tokovi

### Registracija Sudije/Organizatora
1. Korisnik ide na `/register-sudija` ili `/register-organizator`
2. Popunjava formu i registruje se
3. Automatski se prijavljuje i vodi na dashboard

### Registracija Učesnika
1. Organizator ide na dashboard
2. Klikne "Dodaj učesnika"
3. Popuni formu i dodeli grupu
4. Učesnik prima kredencijale i može da se prijavi

### Ažuriranje Profila
1. Korisnik ide na `/profil`
2. Klikne "Uredi profil"
3. Promeni podatke i opciono lozinku
4. Klikne "Čuvanje"

## 📝 Bilješke

- Sve lozinke se heširaju sa `django.contrib.auth.hashers`
- JWT tokeni se automatski osvežavaju
- CORS je omogućen za localhost
- Oracle baza se koristi za persistenciju podataka

## 🚨 Troubleshooting

### Backend ne pokreće
```bash
# Očisti i kreiraj migracije
rm api/migrations/0001_initial.py
python manage.py makemigrations api
python manage.py migrate
```

### Frontend ne pokreće
```bash
# Očisti node_modules
rm -r node_modules package-lock.json
npm install
npm start
```

### CORS greške
Proveri da su porturi ispravni (3000 za React, 8000 za Django) i da je `CORS_ALLOWED_ORIGINS` korektno konfiguriran u `settings.py`

## 📄 Licenca

MIT

## 👨‍💻 Autor

Diplomski rad - Muzičko Takmičenje Sistem

---

**Za više informacija vidi `back/README.md` i `front/README.md`**