# 🏗️ Arhitektura Sistema - Detaljno

Detaljno objašnjenje arhitekture Muzičkog Takmičenja Sistema.

## 📐 Високо-Нивоска Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    KLIJENT (Browser)                        │
│                   React 18 - Tailwind CSS                   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/HTTP
                         │
┌────────────────────────┴────────────────────────────────────┐
│               REST API - Django REST Framework              │
│  JWT Authentication • CORS • Serialization • Validation     │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL/OCI
                         │
┌────────────────────────┴────────────────────────────────────┐
│              ORACLE DATABASE - 26 Models                    │
│     Is-A Hierarchy • Arc Relationships • M:N Relationships  │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Autentifikacioni Tok

```
[Korisnik]
    ↓
[Login/Register]
    ↓
[JWT Token Generate]
    ├── Access Token (60 min)
    └── Refresh Token (1 day)
    ↓
[localStorage]
    ↓
[API Requests with Bearer Token]
    ├── Valid Token → Request Processed
    ├── Expired Token → Auto Refresh
    └── Invalid Token → Redirect to Login
```

## 📊 Dijagram Modela (Upravljanog Podsistema)

### Is-A Hijerarhija

```
        ┌─────────────────┐
        │    KORISNIK     │
        │   (idk = PK)    │
        │  - username     │
        │  - imek         │
        │  - przk         │
        │  - mejl         │
        │  - lozinka      │
        │  - tipk         │
        └────────┬────────┘
                 │
        ┌────────┼────────┐
        │        │        │
        ↓        ↓        ↓
     ┌──────┐ ┌──────┐ ┌──────────┐
     │SUDIJA│ │  ORG │ │ UCESNIK  │
     │      │ │      │ │          │
     │titula│ │      │ │  Arc:    │
     └──────┘ └──────┘ │ Solo XOR │
                        │ Duo XOR  │
                        │ Grupa    │
                        └──────────┘
```

### Arc Relationship - Tip Učešća

```
       ┌─────────────────┐
       │    UCESNIK      │
       │  (idk = PK)     │
       └────────┬────────┘
                │
        ┌───────┼───────┐
        │       │       │
       1:1     1:1     1:1
        │       │       │
        ↓       ↓       ↓
     ┌───────┬────────┬──────┐
     │       │        │      │
    SOLO    DUO     GRUPA    
     │       │        │
    [*]     [**]     [*+]
```

**Arc Constraint**: Tačno jedan od (SOLO, DUO, GRUPA) mora biti postavljen

### M:N Relationship - Muzičko Takmičenje

```
┌──────────────┐         ┌────────────────┐
│ ZIRI (судии) │         │ IZDANJE (event)│
└──────────────┘         └────────────────┘
        │                        │
        └────────────┬───────────┘
                     │
            ┌────────┴────────┐
            │   SastojSe      │ (M:N)
            │   SeOdrzava     │
            │   Organizuje    │
            └─────────────────┘
                     │
        ┌────────────┴────────────┐
        ↓                         ↓
  ┌───────────────┐    ┌──────────────────┐
  │ NASTUP        │    │ TAKMICKARSKI_KRUG│
  │ (performance) │    │                  │
  └───────────────┘    └──────────────────┘
        │
        ├─ Ocenjuje (M:N sa SUDIJA)
        ├─ Ucestvuje (M:N sa UCESNIK)
        └─ Izvodi (1:M sa PESMA)
```

## 🔄 Podatkovni Tokovi

### Tok Registracije

```
[Frontend]
    ↓
POST /auth/register_sudija/
{
  "username": "nova_sudija",
  "imek": "Marko",
  "przk": "Marković",
  "mejl": "marko@example.com",
  "titula": "Dr. sc.",
  "password": "secure123",
  "password2": "secure123"
}
    ↓
[Backend - AuthViewSet.register_sudija]
    ├─ Validacija input-a
    ├─ Hashiranje lozinke (make_password)
    ├─ Kreiranje KORISNIK sa tipk=SUDIJA
    ├─ Kreiranje SUDIJA sa OneToOne vezom
    ├─ Generisanje JWT tokena
    └─ Vraćanje tokenima + user info
    ↓
[Frontend]
    ├─ Čuvaj tokens u localStorage
    ├─ Postavi App state
    └─ Redirekcija na Dashboard
```

### Tok Prijave

```
[Frontend]
    ↓
POST /auth/login/
{
  "username": "marko_org",
  "password": "password123"
}
    ↓
[Backend - AuthViewSet.login]
    ├─ Pronađi KORISNIK po username-u
    ├─ Proveri password (check_password)
    ├─ Ako je valid:
    │  └─ Generiši JWT tokens
    └─ Vrati tokens + user data
    ↓
[Frontend]
    ├─ Čuvaj tokens
    ├─ Postavi App state
    └─ Redirekcija na Dashboard
```

### Tok Dodavanja Učesnika (Organizator Feature)

```
[Frontend - Organizator Dashboard]
    ↓
POST /api/organizator/dodaj_ucesnika/
{
  "username": "petar",
  "imek": "Petar",
  "przk": "Petrović",
  "mejl": "petar@example.com",
  "tip_ucesca": "SOLO",
  "pesma": 1
}
    ↓
[Backend - OrganizatorViewSet.dodaj_ucesnika]
    ├─ Kreiraj KORISNIK sa tipk=UCESNIK
    ├─ Kreiraj UCESNIK sa OneToOne vezom
    ├─ Ako tip_ucesca == "SOLO":
    │  └─ Kreiraj SOLO i vežu sa UCESNIK
    ├─ Ako tip_ucesca == "DUO":
    │  └─ Vežи sa postojećim ili novim DUO
    ├─ Ako tip_ucesca == "GRUPA":
    │  └─ Vežи sa postojećom ili novom GRUPA
    ├─ Vežи UCESNIK sa PESMA
    └─ Vrati učesnika sa svim podacima
    ↓
[Frontend]
    └─ Prikaži poruku o uspehu
```

## 🗄️ Database Schema - Ključne Relacije

### Korisnik - Center Hijerarhije

```sql
CREATE TABLE korisnik (
    idk NUMBER PRIMARY KEY,
    username VARCHAR2(50) UNIQUE NOT NULL,
    imek VARCHAR2(50) NOT NULL,
    przk VARCHAR2(50) NOT NULL,
    mejl VARCHAR2(100) UNIQUE NOT NULL,
    lozinka VARCHAR2(255) NOT NULL,
    tipk VARCHAR2(20) NOT NULL CHECK(tipk IN ('SUDIJA', 'ORGANIZATOR', 'UCESNIK'))
);
```

### OneToOne Relacije

```
SUDIJA → KORISNIK via (idk = FK to korisnik.idk)
ORGANIZATOR → KORISNIK via (idk = FK to korisnik.idk)
UCESNIK → KORISNIK via (idk = FK to korisnik.idk)
```

### Arc Relationship

```
UCESNIK → SOLO (1:1, nullable)
UCESNIK → DUO (1:1, nullable)
UCESNIK → GRUPA (1:1, nullable)
Constraint: Tačno jedan od tri mora biti NOT NULL
```

## 🔌 API Struktura

### REST Endpointi - Organizacija

```
/api/
├── auth/
│   ├── register_sudija/      [POST]
│   ├── register_organizator/ [POST]
│   ├── login/                [POST]
│   ├── me/                   [GET]
│   └── update_profil/        [PUT]
├── token/
│   └── refresh/              [POST]
├── organizator/
│   ├── dodaj_ucesnika/       [POST]
│   ├── lista_duosa/          [GET]
│   ├── lista_grupa/          [GET]
│   ├── kreiraj_duo/          [POST]
│   ├── kreiraj_grupu/        [POST]
│   └── lista_ucesnika/       [GET]
├── zanrovi/                  [GET, POST, PUT, DELETE]
├── pesme/                    [GET, POST, PUT, DELETE]
├── drzave/                   [GET, POST, PUT, DELETE]
├── takmicenja/               [GET, POST, PUT, DELETE]
└── ... (19 drugih resursa)
```

## 🔐 JWT Token Struktura

### Access Token (60 minuta)

```json
{
  "token_type": "access",
  "exp": 1234567890,
  "iat": 1234567890,
  "jti": "unique-id",
  "user_id": 1,
  "username": "marko_org"
}
```

### Refresh Token (1 dan)

```json
{
  "token_type": "refresh",
  "exp": 1234654290,
  "iat": 1234567890,
  "jti": "unique-id",
  "user_id": 1
}
```

## 🎨 Frontend Arhitektura

### Folder Struktura

```
front/
├── public/
│   └── index.html
├── src/
│   ├── App.js                 # Main router
│   ├── index.js               # Entry point
│   ├── index.css              # Tailwind + CSS
│   ├── components/
│   │   ├── Navbar.js          # Navigation
│   │   └── PrivateRoute.js    # Auth protection
│   ├── pages/
│   │   ├── Login.js           # Login page
│   │   ├── RegisterSudija.js  # Judge registration
│   │   ├── RegisterOrganizator.js # Organizer registration
│   │   ├── Dashboard.js       # Role-based dashboard
│   │   └── Profile.js         # Profile management
│   └── services/
│       └── api.js             # API client
├── package.json
├── tailwind.config.js
└── .env
```

### Komponenta Hijerarhija

```
App
├── Navbar
├── PrivateRoute
│   └── Dashboard
│   └── Profile
├── Login
├── RegisterSudija
└── RegisterOrganizator
```

### State Management

```
App Component
├── user (state)
│   ├── idk
│   ├── username
│   ├── imek
│   ├── przk
│   ├── mejl
│   ├── tipk
│   └── rolle-specifični podaci (titula za Sudiju)
├── loading (state)
└── setUser (setState)

localStorage
├── access_token
└── refresh_token
```

## 📝 Serializers - Data Transformation

### RegisterSudijaSerializer

```
Input JSON → Validacija → Kreiranje Korisnika + Sudije → JWT Generisanje
                                                         ↓
                                                     Output JSON
```

### KorisnikDetailSerializer

```
Database Model → Include Related Data (sudija/organizator/ucesnik) → JSON
                                                                       ↓
                                                                  Frontend
```

## 🔄 Error Handling

### Backend Error Responses

```json
{
  "detail": "Greška sa opisom",
  "code": "error_code"
}
```

```json
{
  "field_name": ["Greška validacije"]
}
```

### Frontend Error Handling

```javascript
try {
  const response = await api.post('/auth/login/', data);
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Invalid credentials
  } else if (error.response?.status === 400) {
    // Validation error
  } else {
    // Network or server error
  }
}
```

## 🔒 Sigurnost

### Mehanizmi Zaštite

1. **Password Hashing**
   - `make_password()` sa SHA256 + salt

2. **JWT Tokens**
   - Signed sa SECRET_KEY
   - Ekspirira nakon vremena
   - Refresh token za proširenje

3. **CORS**
   - Samo localhost dozvoljen
   - Development okruženje

4. **SQL Injection Prevention**
   - ORM korišćenje (Django)
   - Parameterized queries

5. **CSRF Protection**
   - Uključeno u Django

## 🎯 Design Pattern-i

### 1. MVC Pattern
- **Model**: Django modeli (models.py)
- **View**: ViewSets (views.py)
- **Controller**: Serializers (serializers.py)

### 2. Token-Based Authentication
- Stateless autentifikacija
- JWT implementacija

### 3. Component-Based Architecture (Frontend)
- Reusable komponente
- Single Responsibility Principle

### 4. Service Layer Pattern
- API service (`api.js`)
- Centralizovana komunikacija sa backend-om

## 📈 Skalabilnost

### Mogućnosti Proširenja

1. **Baza Podataka**
   - Trenutno: Oracle 11g/12c
   - Može: PostgreSQL, MySQL (sa minor promenama)

2. **Frontend**
   - Trenutno: Create React App
   - Može: Next.js za server-side rendering

3. **Backend**
   - Trenutno: Django 5.1
   - Može: Django REST + Celery za async tasks

4. **Deployment**
   - Trenutno: Local development
   - Može: Docker, Docker Compose, Kubernetes

## 🧪 Testing Strategy

### Backend Testing

```python
# Unit Tests
class AuthSerializerTestCase(TestCase):
    def test_register_sudija(self): ...
    def test_password_hashing(self): ...
    def test_jwt_generation(self): ...

# Integration Tests
class AuthViewTestCase(APITestCase):
    def test_login_flow(self): ...
    def test_token_refresh(self): ...
```

### Frontend Testing

```javascript
// Component Tests
describe('Login Component', () => {
  test('renders login form', () => { ... });
  test('handles form submission', () => { ... });
});

// Integration Tests
describe('Authentication Flow', () => {
  test('complete login flow', () => { ... });
});
```

## 🚀 Performanse

### Optimizacije

1. **Database**
   - Indexing na sada polja
   - Query optimization sa `.select_related()`

2. **Frontend**
   - React.memo za komponente
   - Code splitting sa React Router

3. **API**
   - Pagination za large datasets
   - Caching sa Redis (future)

---

**Za više informacija vidi `back/MODELS_DOCUMENTATION.md` i `back/COMPLETE_DOCUMENTATION.md`**
