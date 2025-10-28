# ❓ FAQ - Česta Pitanja

Odgovori na najčešća pitanja o Muzičkom Takmičenju Sistemu.

## 🚀 Instalacija i Pokretanje

### P: Kako da pokrenem projekat?

O: Prati korake u `SETUP.md`:
1. `cd back && pip install -r requirements.txt`
2. `python manage.py migrate`
3. `python run_populate.py`
4. `python manage.py runserver 8000`
5. U drugoj terminal sesiji: `cd front && npm install && npm start`

### P: Šta da radim ako dobjem "No module named 'oracledb'"?

O: Instaliraj Oracle driver:
```bash
pip install oracledb
```

Ako i dalje ne radi, probaj:
```bash
pip install cx_Oracle  # Stariji driver
```

### P: Koja je lozinka za Oracle bazu?

O: Vidiš u `back/config/settings.py`:
```
USER: in15
PASSWORD: ftn
HOST: localhost:1521
NAME: xepdb1
```

### P: Kako da resetujem bazu?

O: 
```bash
cd back
rm api/migrations/0001_initial.py
python manage.py makemigrations api
python manage.py migrate
python run_populate.py
```

### P: Frontend se ne konektuje na backend

O: Proveri:
1. Da li je backend pokrenut na `http://localhost:8000`?
2. Da li je `.env` u `front` folderu sa `REACT_APP_API_URL=http://localhost:8000/api`?
3. Proveri DevTools (F12) Network tab
4. Osvežavaj stranicu (Ctrl+F5)

## 🔐 Autentifikacija

### P: Šta su test kredencijali?

O:
```
Organizator: marko_org / password123
Sudija: dusko_sudija / password123
Učesnik: petar_solo / password123
```

### P: Kako da se registrujem kao nova sudija?

O:
1. Idi na `http://localhost:3000`
2. Klikni "Registruj se kao Sudija"
3. Popuni formu sa username, ime, prezime, email, titula i lozinkom
4. Klikni "Registruj se"
5. Automatski ćeš biti prijavljen

### P: Mogu li da promenim lozinku?

O: Da, idi na `/profil` i u "Edit mode" opciono unesi novu lozinku.

### P: Šta je token refresh?

O: Sistemski koristi JWT tokene koji ističu nakon 60 minuta. Automatski se osvežavaju korišćenjem refresh tokena koji traje 1 dan.

### P: Gde se čuvaju tokeni?

O: U browser `localStorage`:
- `access_token` - Važi 60 minuta
- `refresh_token` - Važi 1 dan

## 🎨 Frontend Pitanja

### P: Kako da dodam novu stranicu?

O:
1. Kreiraj file u `front/src/pages/NoveStrane.js`
2. Napiši React komponentu
3. Dodaj rutu u `front/src/App.js`:
```javascript
<Route path="/nova-stranica" element={<NovaStrana />} />
```

### P: Kako da dodam komponentu?

O:
1. Kreiraj file u `front/src/components/NovaKomponenta.js`
2. Napiši React komponentu
3. Uvezi je u stranici gde je trebam:
```javascript
import NovaKomponenta from '../components/NovaKomponenta';
```

### P: Kako da pozivaš API sa frontend-a?

O:
```javascript
import api from '../services/api';

// GET
const response = await api.get('/pesme/');
console.log(response.data);

// POST
const response = await api.post('/auth/login/', {
  username: 'marko_org',
  password: 'password123'
});

// PUT
await api.put('/auth/update_profil/', {
  imek: 'Novo ime',
  przk: 'Novo prezime'
});

// DELETE
await api.delete('/zanrovi/1/');
```

### P: Kako da dodam Tailwind CSS klase?

O: Koristi Tailwind klase direktno u JSX:
```javascript
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Plaviprimer
</div>
```

## 🔧 Backend Pitanja

### P: Kako da dodam novi model?

O:
1. Dodaj model u `back/api/models.py`
2. Dodaj serializer u `back/api/serializers.py`
3. Dodaj viewset u `back/api/views.py`
4. Registruj u `back/api/admin.py`
5. Dodaj rutu u `back/api/urls.py`:
```python
router.register(r'novi-model', NoviModelViewSet, basename='novi-model')
```
6. Kreiraj migraciju:
```bash
python manage.py makemigrations api
python manage.py migrate
```

### P: Kako da dodaj validaciju modelu?

O:
```python
class Pesma(models.Model):
    naziv = models.CharField(max_length=255)
    trajanje = models.IntegerField()
    
    def clean(self):
        if self.trajanje <= 0:
            raise ValidationError('Trajanje mora biti veće od 0')
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
```

### P: Kako da dodam permission za access?

O:
```python
# Samo autentifikovani korisnici
from rest_framework.permissions import IsAuthenticated

class NoviViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
```

### P: Kako da dodam custom endpoint?

O:
```python
class NoviViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def custom_action(self, request):
        # Tvoj kod
        return Response({'status': 'OK'})

# URL će biti: /api/novi-model/custom_action/
```

## 🐛 Debugging

### P: Kako da vidim SQL queries?

O: U Django shell:
```bash
python manage.py shell
>>> from django.db import connection
>>> from api.models import Korisnik
>>> Korisnik.objects.all()
>>> print(connection.queries)
```

### P: Kako da vidim API request/response?

O: U DevTools (F12):
1. Otvori Network tab
2. Osvežavaj stranicu
3. Klikni na zahtev i vidi Details

### P: Kako da logujem debug poruke?

O:
```python
# Backend
import logging
logger = logging.getLogger(__name__)
logger.debug('Debug poruka: %s', value)
```

```javascript
// Frontend
console.log('Debug poruka:', value);
console.error('Greška:', error);
console.warn('Upozorenje:', warning);
```

## 📦 Deployment

### P: Gde da deploy-ujem aplikaciju?

O: Vidi `DEPLOYMENT.md` za:
- Heroku
- DigitalOcean
- AWS
- Azure

### P: Kako da koristim Docker?

O:
```bash
docker-compose up -d
```

Proveravanja:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

### P: Kako da omogućim HTTPS?

O: Vidi `DEPLOYMENT.md` za Let's Encrypt setup.

## 🔒 Sigurnost

### P: Gde da čuvam Secret Key?

O: U `.env` fajlu ili okruženju, nikad u kodu:
```bash
# .env
SECRET_KEY=your-long-secret-key-here
```

### P: Kako da se štitim od SQL injection?

O: Koristi Django ORM, ne raw SQL:
```python
# ✅ DOBRO
Korisnik.objects.filter(username=username)

# ❌ LOŠE
Korisnik.objects.raw(f"SELECT * FROM korisnik WHERE username = '{username}'")
```

### P: Kako da se štitim od XSS?

O: React automatski escapuje HTML. Ako trebam HTML:
```javascript
// ✅ DOBRO - Escaped
<div>{user_input}</div>

// ⚠️ OPASNO - Ne escape
<div dangerouslySetInnerHTML={{__html: user_input}} />
```

## 💾 Baza Podataka

### P: Kako da vidim tabele u bazi?

O: SQL*Plus:
```bash
sqlplus in15/ftn@localhost:1521/xepdb1
DESC korisnik;
SELECT * FROM korisnik;
```

### P: Kako da dodam test podatke?

O:
```bash
python populate_db.py
```

Ili manuelno u Django shell:
```bash
python manage.py shell
>>> from api.models import Korisnik, Sudija
>>> from django.contrib.auth.hashers import make_password
>>> k = Korisnik.objects.create(
...   username='test',
...   imek='Test',
...   przk='User',
...   mejl='test@example.com',
...   lozinka=make_password('password123'),
...   tipk='SUDIJA'
... )
>>> Sudija.objects.create(idk=k, titula='Dr.')
```

### P: Kako da napravim backup baze?

O:
```bash
expdp in15/ftn@xepdb1 full=Y file=diplomski.dmp
```

## 🆘 Greške

### P: "Connection refused" na 127.0.0.1:1521

O: Oracle nije pokrenut:
```bash
# Windows
net start OracleServiceXEPDB1

# Linux
sudo systemctl start oracle
```

### P: "CORS policy" error

O: Backend mora dozvoliti frontend:
```python
# back/config/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8000",
]
```

### P: "Module not found" u React

O:
```bash
cd front
npm install [module-name]
```

### P: "Page not found" 404

O: Proveri rutu u `App.js` i fajl koji postoji.

## 📚 Dodatni Resursi

### Dokumentacija
- `SETUP.md` - Installation instrukcije
- `ARCHITECTURE.md` - System design
- `DEPLOYMENT.md` - Production setup
- `CONTRIBUTING.md` - Development guide

### Linkovi
- [Django Docs](https://docs.djangoproject.com/)
- [React Docs](https://react.dev/)
- [Django REST](https://www.django-rest-framework.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📞 Kontakt

Ako ne nađeš odgovor:
1. Čitaj logs
2. Pretraži existing issues
3. Kreiraj novi issue sa detaljima
4. Kontaktiraj maintainere

---

**Nemaš još pitanja? Otvori issue ili pull request!** 🚀
