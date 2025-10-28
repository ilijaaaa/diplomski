# Muzičko Takmičenje - Django Models

## 📋 Pregled Modela

Kreirani su svi modeli na osnovu Oracle DDL šeme. Sistem je zasnovan na relacijskoj bazi podataka za upravljanje međunarodnim muzičkim takmičenjima.

## 🎯 Glavne Entitete

### 1. **Korisnik** (User/Participant Base)
- `idk` (PK) - ID korisnika
- `imek` - Ime
- `przk` - Prezime
- `mejl` - Email (unique)
- `lozinka` - Lozinka
- `tipk` - Tip korisnika (UCESNIK, SUDIJA, ORGANIZATOR)

### 2. **Učesnik** (Participant - Arc Relationship)
- `idk` (PK, FK) - Korisnik
- `tipu` - Tip učesnika (SOLO, DUO, GRUPA)
- `solo` (FK, nullable) - Link na Solo
- `duo` (FK, nullable) - Link na Duo
- `grupa` (FK, nullable) - Link na Grupa

**Napomena**: Arc relationship je implementiran sa OneToOneField - samo jedan od tri polja može biti ispunjen.

### 3. **Sudija** (Judge)
- `idk` (PK, FK) - Korisnik
- `titula` - Titula sudije

### 4. **Organizator** (Organizer)
- `idk` (PK, FK) - Korisnik

### 5. **Pesma** (Song)
- `idp` (PK) - ID pesme
- `nazp` - Naziv
- `trajanje` - Trajanje (u sekundama)
- `datob` - Datum objavljivanja
- `zanr` (FK) - Žanr

### 6. **Drzava** (Country)
- `iddr` (PK) - ID zemlje
- `nazdr` - Naziv
- `prvagoduc` - Prva godina učešća
- `brpob` - Broj pobeda

### 7. **MuzickoTakmicenje** (Music Competition)
- `idmt` (PK) - ID takmičenja
- `nazmt` - Naziv
- `godosn` - Godina osnivanja

### 8. **Izdanje** (Edition/Instance)
- `idizd` (PK) - ID izdanja
- `datpoc` - Datum početka
- `datkraj` - Datum kraja
- `ziri` (FK, nullable) - Žiri
- `muzicko_takmicenje` (FK) - Takmičenje

### 9. **TakmickarsKrug** (Competition Round)
- `idtk` (PK) - ID kruga
- `rbrtk` - Redni broj kruga
- `datodrz` - Datum održavanja
- `izdanje` (FK) - Izdanje
- `parent_krug` (FK, nullable, self) - Stariji krug (ako postoji)

### 10. **Nastup** (Performance)
- `idn` (PK) - ID nastupa
- `ukbod` - Ukupan broj bodova
- `rbrn` - Redni broj nastupa
- `plasman` - Plasman
- `drzava` (FK) - Država koja nastupi
- `pesma` (FK) - Pesma koja se izvodi
- `takmickarski_krug` (FK) - Krug takmičenja
- `dodeljivanje_nagrade` (FK, nullable) - Nagrada (ako je dobitnik)

### 11. **Ucestvuje** (Participation)
- `ucestvuje_id` (PK, auto-increment) - ID učešća
- `izdanje` (FK) - Izdanje takmičenja
- `drzava` (FK) - Država
- **Unique**: (izdanje, drzava)

### 12. **Reprezentuje** (Representation)
- `ucestvuje` (FK) - Učešće
- `ucesnik` (FK) - Učesnik

### 13. **Izvodi** (Performance/Execution)
- `ucesnik` (FK) - Učesnik
- `pesma` (FK) - Pesma
- **Unique**: (ucesnik, pesma)

### 14. **Ocenjuje** (Rating)
- `nastup` (FK) - Nastup
- `sudija` (FK) - Sudija
- `bod` - Broj bodova
- **Unique**: (nastup, sudija)

### 15. **DodeljujanjeNagrade** (Award Assignment)
- `iddg` (PK) - ID dodeljivanja
- `datdodele` - Datum dodeljivanja
- `sudija` (FK) - Sudija koji deljuje

### 16. **Nagrada** (Award)
- `idnag` (PK) - ID nagrade
- `naznag` - Naziv nagrade
- `dodeljivanje_nagrade` (FK, nullable) - Dodeljivanje

### 17. **Ziri** (Jury)
- `idz` (PK) - ID žirija
- `brclanz` - Broj članova

### 18. **SastojSe** (Jury Composition)
- `ziri` (FK) - Žiri
- `sudija` (FK) - Sudija
- `predsednik` - Da li je predsednik (boolean)

### 19. **Dvorana** (Hall/Venue)
- `iddv` (PK) - ID dvorane
- `nazdv` - Naziv
- `kap` - Kapacitet
- `grad` - Grad
- `drz` - Država

### 20. **SeOdrzava** (Venue Hosting)
- `dvorana` (FK) - Dvorana
- `izdanje` (FK) - Izdanje

### 21. **Organizuje** (Organization)
- `organizator` (FK) - Organizator
- `muzicko_takmicenje` (FK) - Takmičenje

### 22. **Dodeljuje** (Award Distribution)
- `izdanje` (FK) - Izdanje
- `nagrada` (FK) - Nagrada

## 📚 Primarne Klase

### Participant Type Hierarchy
```
Korisnik (UCESNIK, SUDIJA, ORGANIZATOR)
    ├── Ucesnik (SOLO, DUO, GRUPA)
    ├── Sudija
    └── Organizator
```

### Competition Structure
```
MuzickoTakmicenje
    └── Izdanje(s)
        ├── TakmickarsKrug(ovi)
        │   └── Nastup(i)
        │       └── Ocenjuje (Judge Ratings)
        ├── Ziri
        │   └── SastojSe (Judges in Jury)
        └── SeOdrzava (Held in Halls)
```

## 🔗 Relacije

### Many-to-Many (Through Models)
- `MuzickoTakmicenje` ↔ `Organizator` (Organizuje)
- `Vydanje` ↔ `Dvorana` (SeOdrzava)
- `Ziri` ↔ `Sudija` (SastojSe)
- `Ucesnik` ↔ `Pesma` (Izvodi)
- `Ucestvuje` ↔ `Ucesnik` (Reprezentuje)
- `Nastup` ↔ `Sudija` (Ocenjuje)
- `Izdanje` ↔ `Nagrada` (Dodeljuje)

### One-to-Many
- `Zanr` → `Pesma` (songs in genre)
- `TakmickarsKrug` → `Nastup` (performances in round)
- `Izdanje` → `TakmickarsKrug` (rounds in edition)
- `DodeljujanjeNagrade` → `Nagrada` (awards in assignment)

### One-to-One Inheritance
- `Korisnik` → `Ucesnik` / `Sudija` / `Organizator`
- `Solo` / `Duo` / `Grupa` → `Ucesnik` (Arc relationship)

## 📡 API Endpoints

Svi modeli imaju REST API endpoints sa CRUD operacijama:

- `/api/korisnici/` - Users
- `/api/zanrovi/` - Genres
- `/api/pesme/` - Songs
- `/api/drzave/` - Countries
- `/api/ucesnici/` - Participants
- `/api/sudije/` - Judges
- `/api/organizatori/` - Organizers
- `/api/muzicka-takmicenja/` - Competitions
- `/api/izdanja/` - Editions
- `/api/takmickarski-krugovi/` - Rounds
- `/api/nastupi/` - Performances
- `/api/ocene/` - Ratings
- `/api/nagrade/` - Awards
- `/api/dvorane/` - Halls
- `/api/ziriji/` - Juries
- ... i mnogi drugi

## 🛠️ Admin Panel

Svi modeli su dostupni u Django admin panelu sa optimizovanim prikazima:
- `http://localhost:8000/admin/`

## 📝 Validacija

- Arc relationship u `Ucesnik` - samo jedan od (solo, duo, grupa) može biti ispunjen
- Unique constraints na bridging tabelama
- Minimum validators na numeričkim poljima

## 🚀 Sledeći Koraci

1. Pokrenuti migracije
2. Kreirajte superuser za admin
3. Testirajte API endpoints
4. Dodajte test podatke
5. Implementirajte kompleksnije business logike po potrebi
