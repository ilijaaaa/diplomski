# Muzičko Takmičenje - Frontend (React)

Frontendski dio aplikacije za upravljanje muzičkim takmičenjem.

## Osobine

- ✅ Prijava i registracija korisnika
- ✅ Tri tipa korisnika: Sudija, Organizator, Učesnik
- ✅ Prilagođeni dashboard za svaku uloga
- ✅ Upravljanje profilom
- ✅ Promjena lozinke
- ✅ JWT autentifikacija
- ✅ Tailwind CSS styling
- ✅ Responsivni dizajn

## Instalacija

### Zahtjevi
- Node.js >= 14
- npm ili yarn

### Koraci

1. Instaliraj zavisnosti:
```bash
npm install
```

2. Kreiraj `.env` fajl (opciono za konfiguraciju API-ja):
```
REACT_APP_API_URL=http://localhost:8000/api
```

3. Pokreni development server:
```bash
npm start
```

Aplikacija će se otvoriti na `http://localhost:3000`

## Struktura projekta

```
front/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   └── PrivateRoute.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── RegisterSudija.js
│   │   ├── RegisterOrganizator.js
│   │   ├── Dashboard.js
│   │   └── Profile.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── README.md
```

## Upotreba

### Registracija

1. Klikni na "Registracija - Sudija" ili "Registracija - Organizator"
2. Popuni sve potrebne podatke
3. Klikni na "Registruj se"

### Prijava

1. Unesi korisničko ime i lozinku
2. Klikni na "Prijava"

### Dashboard

Nakon prijave, vidićeš prilagođeni dashboard sa funkcionalnostima specifičnim za tvoju uloga:

- **Sudija**: Pregled poslova, ocenjivanja, statistike
- **Organizator**: Upravljanje učesnicima, grupama, takmičenjima
- **Učesnik**: Status učešća, obavijesti o takmičenju

### Upravljanje profilom

1. Klikni na "Profil" u navigaciji
2. Prikaži sve trenutne podatke
3. Klikni na "Uredi profil"
4. Promijeni podatke i opciono lozinku
5. Klikni na "Čuvanje"

## API Integracija

Frontend se konekcija sa Django REST backend-om kroz `/api` endpoint.

### Endpointi koji se koriste:

- `POST /api/auth/login/` - Prijava
- `POST /api/auth/register_sudija/` - Registracija sudije
- `POST /api/auth/register_organizator/` - Registracija organizatora
- `GET /api/auth/me/` - Dobijanje korisničkih podataka
- `PUT /api/auth/update_profil/` - Ažuriranje profila
- `POST /api/token/refresh/` - Osvežavanje tokena

## Build

```bash
npm run build
```

Ovo će kreirati `build/` folder sa optimizovanom produkcijskom verzijom.

## Tehnologije

- React 18
- React Router 6
- Axios
- Tailwind CSS
- Create React App

## Licence

MIT
