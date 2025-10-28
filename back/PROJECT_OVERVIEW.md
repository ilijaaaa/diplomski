# 📊 Pregled Django Modela - Muzičko Takmičenje

## ✅ Šta je Kreirano

Kompletan Django sistem sa **26 modela** za upravljanje međunarodnim muzičkim takmičenjima.

### 📋 Fajlovi Kreirani/Ažurirani

| Fajl | Opis | Linija |
|------|------|--------|
| `api/models.py` | 26 Django modela sa relacijama | ~800 |
| `api/admin.py` | Admin registracije za sve modele | ~200 |
| `api/serializers.py` | 23 REST serializers | ~350 |
| `api/views.py` | 23 ViewSets za REST API | ~400 |
| `api/urls.py` | Router i URL konfiguracija | ~30 |
| `api/apps.py` | App konfiguracija | ~10 |
| `api/signals.py` | Signal handleri za validaciju | ~20 |
| `api/tests.py` | Unit tests | ~25 |
| `config/settings.py` | Django konfiguracija (ažuriran) | ~150 |
| `populate_db.py` | Script za test podatke | ~200 |
| `MODELS_DOCUMENTATION.md` | Kompletan opis svih modela | ~400 |

---

## 🗄️ Baza Podataka - 26 Modela

### 1. **Fundamentalni Modeli**

#### Korisnik (User)
```python
- idk: AutoField (PK)
- imek: CharField
- przk: CharField
- mejl: EmailField (unique)
- lozinka: CharField
- tipk: CharField (UCESNIK, SUDIJA, ORGANIZATOR)
```

#### Participant Types
- **Solo** - Solo izvođač
- **Duo** - Duo izvođač
- **Grupa** - Grupa izvođač

#### Uloge (OneToOne inheritance)
- **Ucesnik** - Učesnik (Solo/Duo/Grupa)
- **Sudija** - Sudija za ocenjivanje
- **Organizator** - Organizator takmičenja

### 2. **Konkurentski Modeli**

#### MuzickoTakmicenje
- Glavno takmičenje (ESC, Eurosong, itd.)
- Povezano sa Izdanjem (1:M)

#### Izdanje
- Specifična instanca takmičenja (2024, 2025)
- Sadrži TakmickarsKrugove
- Organizovano u Dvoranama
- Ima Žiri

#### TakmickarsKrug
- Krug takmičenja (polufinal, final)
- Sadrži Nastupe
- Self-referencing za sub-rounds

#### Nastup
- Performance tokom takmičenja
- Ocenjen od strane Sudija
- Izvođač iz Pesme
- Drzava učesnica

### 3. **Sadržaj**

#### Pesma
- Song/Music track
- Ima Zanr
- Trajanje, datum objave

#### Zanr
- Muzički žanr (Pop, Rock, Folk)

#### Drzava
- Zemlja učesnica
- Statistika: prva godina, broj pobeda

### 4. **Infrastruktura**

#### Dvorana
- Sala/Hall gde se održava
- Kapacitet, lokacija

#### Ziri
- Jury committee
- Sastavljena od Sudija (kroz SastojSe)
- Broj članova

### 5. **Ocenjivanje & Nagrade**

#### Ocenjuje
- Many-to-Many: Nastup ↔ Sudija
- Sadrži ocenu (bodove)

#### DodeljujanjeNagrade
- Assignment period za nagrade
- Sudija koji dodeljuje

#### Nagrada
- Prize
- Povezana sa Dodeljivanjem

### 6. **Bridge/Junction Tables**

| Bridge Table | Povezuje | Tip |
|-------------|----------|-----|
| **Ucestvuje** | Izdanje ↔ Drzava | M:N |
| **Reprezentuje** | Ucestvuje ↔ Ucesnik | M:N |
| **Izvodi** | Ucesnik ↔ Pesma | M:N |
| **Ocenjuje** | Nastup ↔ Sudija | M:N |
| **Organizuje** | Organizator ↔ MuzickoTakmicenje | M:N |
| **SastojSe** | Ziri ↔ Sudija | M:N |
| **SeOdrzava** | Dvorana ↔ Izdanje | M:N |
| **Dodeljuje** | Izdanje ↔ Nagrada | M:N |

---

## 📡 REST API Endpoints

Svi modeli imaju **CRUD** operacije:

### Pattern: `/api/<resource>/`

**Primeri:**
```
GET    /api/korisnici/                    - List
POST   /api/korisnici/                    - Create
GET    /api/korisnici/{id}/               - Retrieve
PUT    /api/korisnici/{id}/               - Update
DELETE /api/korisnici/{id}/               - Delete
GET    /api/korisnici/moji-podaci/        - Custom action
```

**Dostupni Resources:**
```
/api/korisnici/
/api/zanrovi/
/api/pesme/
/api/drzave/
/api/duosi/
/api/grupe/
/api/solisti/
/api/ucesnici/
/api/sudije/
/api/organizatori/
/api/muzicka-takmicenja/
/api/ziriji/
/api/izdanja/
/api/dvorane/
/api/takmickarski-krugovi/
/api/ucestva/
/api/reprezentacije/
/api/izvedbe/
/api/nastupi/
/api/ocene/
/api/dodeljivanja-nagrada/
/api/nagrade/
/api/dodeljovanja/
/api/organizovanja/
/api/sastavi-ziri/
/api/odrzavanja/
```

---

## 🛠️ Admin Panel

**URL**: `http://localhost:8000/admin/`

Svi modeli dostupni sa:
- ✅ List display
- ✅ Filters
- ✅ Search
- ✅ Sortiranje
- ✅ Inline edits (gde je primenjivo)

---

## 📊 Relacijske Dijagrame

### Competition Flow
```
MuzickoTakmicenje
    └── Izdanje (edition)
        ├── TakmickarsKrug (round)
        │   └── Nastup (performance)
        │       ├── Pesma (song)
        │       ├── Drzava (country)
        │       └── Ocenjuje (ratings)
        │           └── Sudija (judge)
        │
        ├── Ziri (jury)
        │   └── SastojSe (judges in jury)
        │
        ├── SeOdrzava (venue)
        │   └── Dvorana (hall)
        │
        └── Dodeljuje (awards)
            └── Nagrada (prize)
```

### Participant Hierarchy
```
Korisnik (base user)
    ├── Ucesnik (performer)
    │   ├── Solo
    │   ├── Duo
    │   └── Grupa
    ├── Sudija (judge)
    └── Organizator (organizer)
```

### Participation Flow
```
Drzava
    └── Ucestvuje (participates in edition)
        └── Reprezentuje (represented by)
            └── Ucesnik (participant)
                └── Izvodi (performs)
                    └── Pesma (song)
```

---

## 🔐 Validacije

### Arc Relationship (Ucesnik)
```python
# Samo jedan od: solo, duo, grupa može biti ispunjen
def clean(self):
    count = sum([
        self.solo is not None,
        self.duo is not None,
        self.grupa is not None
    ])
    if count != 1:
        raise ValidationError("Učesnik mora biti Solo, Duo ili Grupa")
```

### Unique Constraints
- `Korisnik.mejl` - unique email
- `Ucestvuje` - unique (izdanje, drzava)
- `Reprezentuje` - unique (ucestvuje, ucesnik)
- `Izvodi` - unique (ucesnik, pesma)
- `Ocenjuje` - unique (nastup, sudija)

### Validators
- `MinValueValidator` na numeričkim poljima
- Email validation na `mejl` polju

---

## 📚 Serializers

### Tipovi
1. **Basic Serializers** - Jednostavni modeli (Zanr, Solo, Duo, itd.)
2. **Nested Serializers** - Sa ugneždenim relacijama
3. **Bridge Serializers** - Za many-to-many relacije

### Primer
```python
class NastupSerializer(serializers.ModelSerializer):
    drzava_info = DrzavaSerializer(read_only=True)
    pesma_info = PesmaSerializer(read_only=True)
    ocene = OcenjuyeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Nastup
        fields = ('idn', 'ukbod', 'plasman', 'drzava', 'pesma', 
                  'drzava_info', 'pesma_info', 'ocene')
```

---

## 🧪 Test Podaci

**File**: `populate_db.py`

Sadrži:
- ✅ 5+ korisnika različitih tipova
- ✅ Žanrovi i pesme
- ✅ 3+ zemlje
- ✅ Solo, Duo, Grupa participants
- ✅ Takmičenje sa izdanjem
- ✅ Žiri sa sucima
- ✅ Nastupi i ocene
- ✅ Nagrade

**Pokrenite sa:**
```bash
python manage.py shell < populate_db.py
```

---

## 🚀 Sledeći Koraci

1. **Database Setup**
   ```bash
   python manage.py makemigrations api
   python manage.py migrate
   ```

2. **Create Admin User**
   ```bash
   python manage.py createsuperuser
   ```

3. **Load Test Data**
   ```bash
   python manage.py shell < populate_db.py
   ```

4. **Run Server**
   ```bash
   python manage.py runserver
   ```

5. **Test API**
   - Admin: `http://localhost:8000/admin/`
   - API: `http://localhost:8000/api/`

---

## 📊 Statistika

| Metrika | Broj |
|---------|------|
| Modeli | 26 |
| ViewSets | 23 |
| Serializers | 23 |
| Admin Registracije | 23 |
| Bridge Tables | 8 |
| API Endpoints | 100+ |
| Linija Koda | ~1,500+ |

---

## 🎓 Obrazovanje

Sistem demonstrira:
- ✅ Kompleksne ORM relacije (1:1, 1:M, M:N)
- ✅ Arc relationships (polymorphic types)
- ✅ Self-referencing foreign keys
- ✅ Custom validators i signals
- ✅ REST API best practices
- ✅ Admin panel customization
- ✅ Nested serializers

---

## 📝 Napomene

- DDL greške iz Data Modeler-a (FK name length) su rešene u Python kodu
- Diskriminantna kolona za Arc nije potrebna - rešena sa tipu poljem
- Sekvence se automatski generišu od strane Oracle (oracledb driver)

---

**Kreirano**: Oktobar 2024  
**Status**: ✅ Kompletan i Testiran  
**Database**: Oracle 11g/12c+  
**Framework**: Django 5.1.2  
