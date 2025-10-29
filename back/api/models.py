"""
Models for the Music Competition System API.
Based on the Oracle DDL schema from Data Modeler.
"""
from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth.hashers import make_password
from datetime import datetime


class Korisnik(models.Model):
    """Base User/Participant model - is-a hierarchy root."""
    KORISNIK_TIPS = [
        ('UCESNIK', 'Učesnik'),
        ('SUDIJA', 'Sudija'),
        ('ORGANIZATOR', 'Organizator'),
    ]
    
    idk = models.AutoField(primary_key=True, db_column='idk')
    imek = models.CharField(max_length=20, db_column='imek')
    przk = models.CharField(max_length=30, db_column='przk')
    mejl = models.EmailField(unique=True, db_column='mejl')
    username = models.CharField(max_length=150, unique=True, db_column='username')
    lozinka = models.CharField(max_length=255, db_column='lozinka')
    tipk = models.CharField(
        max_length=15,
        choices=KORISNIK_TIPS,
        default='UCESNIK',
        db_column='tipk'
    )
    
    class Meta:
        db_table = 'korisnik'
        verbose_name = 'Korisnik'
        verbose_name_plural = 'Korisnici'

    def __str__(self):
        return f"{self.imek} {self.przk} ({self.get_tipk_display()})"
    
    # Convenience properties for compatibility
    @property
    def first_name(self):
        return self.imek
    
    @property
    def last_name(self):
        return self.przk
    
    @property
    def email(self):
        return self.mejl
    
    @property
    def id(self):
        """Map id to idk for JWT compatibility."""
        return self.idk
    
    @property
    def is_active(self):
        """User is always active."""
        return True
    
    @property
    def is_authenticated(self):
        """User is authenticated."""
        return True


class Zanr(models.Model):
    """Music Genre."""
    idzanr = models.AutoField(primary_key=True, db_column='idzanr')
    nazzanr = models.CharField(max_length=15, db_column='nazzanr')

    class Meta:
        db_table = 'zanr'
        verbose_name = 'Žanr'
        verbose_name_plural = 'Žanrovi'

    def __str__(self):
        return self.nazzanr


class Pesma(models.Model):
    """Song."""
    idp = models.AutoField(primary_key=True, db_column='idp')
    nazp = models.CharField(max_length=20, db_column='nazp')
    trajanje = models.IntegerField(validators=[MinValueValidator(0)], db_column='trajanje')  # in seconds
    datob = models.DateField(db_column='datob')
    zanr = models.ForeignKey(Zanr, on_delete=models.PROTECT, db_column='zanr_idzanr')

    class Meta:
        db_table = 'pesma'
        verbose_name = 'Pesma'
        verbose_name_plural = 'Pesme'

    def __str__(self):
        return self.nazp


class Drzava(models.Model):
    """Country."""
    iddr = models.AutoField(primary_key=True, db_column='iddr')
    nazdr = models.CharField(max_length=20, db_column='nazdr')
    prvagoduc = models.IntegerField(validators=[MinValueValidator(1900)], db_column='prvagoduc')
    brpob = models.IntegerField(validators=[MinValueValidator(0)], db_column='brpob')

    class Meta:
        db_table = 'drzava'
        verbose_name = 'Država'
        verbose_name_plural = 'Zemlje'

    def __str__(self):
        return self.nazdr


class Duo(models.Model):
    """Duo participant."""
    idduo = models.AutoField(primary_key=True, db_column='idduo')
    nazduo = models.CharField(max_length=20, db_column='nazduo')

    class Meta:
        db_table = 'duo'
        verbose_name = 'Duo'
        verbose_name_plural = 'Duosi'

    def __str__(self):
        return self.nazduo


class Grupa(models.Model):
    """Group participant."""
    idg = models.AutoField(primary_key=True, db_column='idg')
    nazg = models.CharField(max_length=20, db_column='nazg')
    brclang = models.IntegerField(validators=[MinValueValidator(1)], db_column='brclang')

    class Meta:
        db_table = 'grupa'
        verbose_name = 'Grupa'
        verbose_name_plural = 'Grupe'

    def __str__(self):
        return self.nazg


class Solo(models.Model):
    """Solo participant."""
    ids = models.AutoField(primary_key=True, db_column='ids')
    umime = models.CharField(max_length=20, db_column='umime')

    class Meta:
        db_table = 'solo'
        verbose_name = 'Solo'
        verbose_name_plural = 'Solisti'

    def __str__(self):
        return self.umime


class Ucesnik(models.Model):
    """Participant - can be Solo, Duo, or Grupa (Arc relationship)."""
    UCESNIK_TIPS = [
        ('SOLO', 'Solo'),
        ('DUO', 'Duo'),
        ('GRUPA', 'Grupa'),
    ]
    
    idk = models.OneToOneField(Korisnik, on_delete=models.CASCADE, primary_key=True, db_column='idk')
    solo = models.OneToOneField(Solo, on_delete=models.SET_NULL, null=True, blank=True, db_column='solo_ids')
    duo = models.OneToOneField(Duo, on_delete=models.SET_NULL, null=True, blank=True, db_column='duo_idduo')
    grupa = models.OneToOneField(Grupa, on_delete=models.SET_NULL, null=True, blank=True, db_column='grupa_idg')
    tipu = models.CharField(
        max_length=10,
        choices=UCESNIK_TIPS,
        db_column='tipu'
    )
    
    # Track when participant was added by organizer
    dat_dodeljivanja = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    dodat_od = models.ForeignKey(
        Korisnik, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='dodeljeni_ucesnici',
        help_text='Organizator koji je dodao ovog učesnika'
    )

    class Meta:
        db_table = 'ucesnik'
        verbose_name = 'Učesnik'
        verbose_name_plural = 'Učesnici'

    def __str__(self):
        return f"{self.idk.first_name} {self.idk.last_name} ({self.get_tipu_display()})"

    def clean(self):
        """Validate Arc relationship - only one of solo, duo, grupa can be set."""
        from django.core.exceptions import ValidationError
        
        count = sum([
            self.solo is not None,
            self.duo is not None,
            self.grupa is not None
        ])
        
        if count != 1:
            raise ValidationError("Učesnik mora biti ili Solo, ili Duo, ili Grupa.")


class Sudija(models.Model):
    """Judge."""
    idk = models.OneToOneField(Korisnik, on_delete=models.CASCADE, primary_key=True, db_column='idk')
    titula = models.CharField(max_length=20, db_column='titula')
    
    # Track when judge was registered
    dat_registracije = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        db_table = 'sudija'
        verbose_name = 'Sudija'
        verbose_name_plural = 'Sudije'

    def __str__(self):
        return f"Sudija {self.idk.first_name} {self.idk.last_name}"


class Organizator(models.Model):
    """Organizer."""
    idk = models.OneToOneField(Korisnik, on_delete=models.CASCADE, primary_key=True, db_column='idk')
    
    # Track when organizer was registered
    dat_registracije = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        db_table = 'organizator'
        verbose_name = 'Organizator'
        verbose_name_plural = 'Organizatori'

    def __str__(self):
        return f"Organizator {self.idk.first_name} {self.idk.last_name}"


class MuzickoTakmicenje(models.Model):
    """Music Competition."""
    idmt = models.AutoField(primary_key=True, db_column='idmt')
    nazmt = models.CharField(max_length=30, db_column='nazmt')
    godosn = models.DateField(db_column='godosn')
    organizator = models.ManyToManyField(
        Organizator,
        through='Organizuje',
        related_name='muzicka_takmicenja'
    )

    class Meta:
        db_table = 'muzicko_takmicenje'
        verbose_name = 'Muzičko takmičenje'
        verbose_name_plural = 'Muzička takmičenja'

    def __str__(self):
        return self.nazmt


class Ziri(models.Model):
    """Jury."""
    idz = models.AutoField(primary_key=True, db_column='idz')
    brclanz = models.IntegerField(validators=[MinValueValidator(1)], db_column='brclanz')
    sudija = models.ManyToManyField(
        Sudija,
        through='SastojSe',
        related_name='ziri'
    )

    class Meta:
        db_table = 'ziri'
        verbose_name = 'Žiri'
        verbose_name_plural = 'Žiriji'

    def __str__(self):
        return f"Žiri {self.idz}"


class Izdanje(models.Model):
    """Edition/Instance of competition."""
    idizd = models.AutoField(primary_key=True, db_column='idizd')
    datpoc = models.DateField(db_column='datpoc')
    datkraj = models.DateField(db_column='datkraj')
    ziri = models.ForeignKey(
        Ziri,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='ziri_idz'
    )
    muzicko_takmicenje = models.ForeignKey(
        MuzickoTakmicenje,
        on_delete=models.CASCADE,
        db_column='muzicko_takmicenje_idmt',
        related_name='izdanja'
    )

    class Meta:
        db_table = 'izdanje'
        verbose_name = 'Izdanje'
        verbose_name_plural = 'Izdanja'

    def __str__(self):
        return f"Izdanje {self.idizd} - {self.datpoc} do {self.datkraj}"


class Dvorana(models.Model):
    """Hall/Venue."""
    iddv = models.AutoField(primary_key=True, db_column='iddv')
    nazdv = models.CharField(max_length=20, db_column='nazdv')
    kap = models.IntegerField(validators=[MinValueValidator(1)], db_column='kap')  # capacity
    grad = models.CharField(max_length=20, db_column='grad')
    drz = models.CharField(max_length=20, db_column='drz')
    izdanja = models.ManyToManyField(
        Izdanje,
        through='SeOdrzava',
        related_name='dvorane'
    )

    class Meta:
        db_table = 'dvorana'
        verbose_name = 'Dvorana'
        verbose_name_plural = 'Dvorane'

    def __str__(self):
        return self.nazdv


class TakmickarsKrug(models.Model):
    """Competition Round."""
    idtk = models.AutoField(primary_key=True, db_column='idtk')
    rbrtk = models.IntegerField(validators=[MinValueValidator(1)], db_column='rbrtk')  # round number
    datodrz = models.DateField(db_column='datodrz')  # date held
    izdanje = models.ForeignKey(
        Izdanje,
        on_delete=models.CASCADE,
        db_column='izdanje_idizd',
        related_name='takmickarski_krugovi'
    )
    parent_krug = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='takmicarski_krug_idtk',
        related_name='child_krugovi'
    )

    class Meta:
        db_table = 'takmicarski_krug'
        verbose_name = 'Takmičarski krug'
        verbose_name_plural = 'Takmički krugovi'

    def __str__(self):
        return f"Krug {self.rbrtk} - {self.datodrz}"


class Ucestvuje(models.Model):
    """Participation - Country participates in an Edition."""
    ucestvuje_id = models.AutoField(primary_key=True, db_column='ucestvuje_id')
    izdanje = models.ForeignKey(
        Izdanje,
        on_delete=models.CASCADE,
        db_column='izdanje_idizd',
        related_name='ucestva'
    )
    drzava = models.ForeignKey(
        Drzava,
        on_delete=models.CASCADE,
        db_column='drzava_iddr',
        related_name='ucestva'
    )

    class Meta:
        db_table = 'ucestvuje'
        verbose_name = 'Učešće'
        verbose_name_plural = 'Učešća'
        unique_together = ('izdanje', 'drzava')

    def __str__(self):
        return f"{self.drzava.nazdr} - {self.izdanje.idizd}"


class Reprezentuje(models.Model):
    """Participant represents a Country in a Competition."""
    ucestvuje = models.ForeignKey(
        Ucestvuje,
        on_delete=models.CASCADE,
        db_column='ucestvuje_ucestvuje_id',
        related_name='reprezentacije'
    )
    ucesnik = models.ForeignKey(
        Ucesnik,
        on_delete=models.CASCADE,
        db_column='ucesnik_idk',
        related_name='reprezentuje'
    )

    class Meta:
        db_table = 'reprezentuje'
        verbose_name = 'Reprezentuje'
        verbose_name_plural = 'Reprezentacije'
        unique_together = ('ucestvuje', 'ucesnik')

    def __str__(self):
        return f"{self.ucesnik} - {self.ucestvuje.drzava.nazdr}"


class Izvodi(models.Model):
    """Participant performs a Song."""
    ucesnik = models.ForeignKey(
        Ucesnik,
        on_delete=models.CASCADE,
        db_column='ucesnik_idk',
        related_name='izvodi'
    )
    pesma = models.ForeignKey(
        Pesma,
        on_delete=models.CASCADE,
        db_column='pesma_idp',
        related_name='izvode'
    )

    class Meta:
        db_table = 'izvodi'
        verbose_name = 'Izvodi'
        verbose_name_plural = 'Izvedbe'
        unique_together = ('ucesnik', 'pesma')

    def __str__(self):
        return f"{self.ucesnik} - {self.pesma}"


class Nastup(models.Model):
    """Performance."""
    idn = models.AutoField(primary_key=True, db_column='idn')
    ukbod = models.IntegerField(validators=[MinValueValidator(0)], db_column='ukbod')  # total score
    rbrn = models.IntegerField(validators=[MinValueValidator(1)], db_column='rbrn')  # performance number
    plasman = models.IntegerField(validators=[MinValueValidator(1)], db_column='plasman')  # placement
    drzava = models.ForeignKey(
        Drzava,
        on_delete=models.PROTECT,
        db_column='drzava_iddr',
        related_name='nastupe'
    )
    pesma = models.ForeignKey(
        Pesma,
        on_delete=models.PROTECT,
        db_column='pesma_idp',
        related_name='nastupe'
    )
    takmickarski_krug = models.ForeignKey(
        TakmickarsKrug,
        on_delete=models.CASCADE,
        db_column='takmicarski_krug_idtk',
        related_name='nastupe'
    )
    dodeljivanje_nagrade = models.ForeignKey(
        'DodeljujanjeNagrade',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='dodeljivanje_nagrade_iddg',
        related_name='nastupe'
    )

    class Meta:
        db_table = 'nastup'
        verbose_name = 'Nastup'
        verbose_name_plural = 'Nastupi'

    def calculate_total_score(self):
        """Calculate total score from all judges' ratings."""
        total = sum(ocena.bod for ocena in self.ocene.all())
        return total

    def update_total_score(self):
        """Update ukbod field with calculated total score."""
        self.ukbod = self.calculate_total_score()
        self.save(update_fields=['ukbod'])

    def __str__(self):
        return f"Nastup {self.idn} - {self.pesma}"


class Ocenjuje(models.Model):
    """Judge rates a Performance."""
    nastup = models.ForeignKey(
        Nastup,
        on_delete=models.CASCADE,
        db_column='nastup_idn',
        related_name='ocene'
    )
    sudija = models.ForeignKey(
        Sudija,
        on_delete=models.CASCADE,
        db_column='sudija_idk',
        related_name='ocene'
    )
    bod = models.IntegerField(validators=[MinValueValidator(0)], db_column='bod')

    class Meta:
        db_table = 'ocenjuje'
        verbose_name = 'Ocenjuje'
        verbose_name_plural = 'Ocene'
        unique_together = ('nastup', 'sudija')

    def __str__(self):
        return f"Sudija {self.sudija.idk.imek} - Nastup {self.nastup.idn} : {self.bod} bodova"


class DodeljujanjeNagrade(models.Model):
    """Award Assignment."""
    iddg = models.AutoField(primary_key=True, db_column='iddg')
    datdodele = models.DateField(db_column='datdodele')
    sudija = models.ForeignKey(
        Sudija,
        on_delete=models.PROTECT,
        db_column='sudija_idk',
        related_name='dodeljivanja_nagrada'
    )

    class Meta:
        db_table = 'dodeljivanje_nagrade'
        verbose_name = 'Dodeljivanje nagrade'
        verbose_name_plural = 'Dodeljivanja nagrada'

    def __str__(self):
        return f"Dodeljivanje {self.iddg} - {self.datdodele}"


class Nagrada(models.Model):
    """Award."""
    idnag = models.AutoField(primary_key=True, db_column='idnag')
    naznag = models.CharField(max_length=20, db_column='naznag')
    dodeljivanje_nagrade = models.ForeignKey(
        DodeljujanjeNagrade,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='dodeljivanje_nagrade_iddg',
        related_name='nagrade'
    )

    class Meta:
        db_table = 'nagrada'
        verbose_name = 'Nagrada'
        verbose_name_plural = 'Nagrade'

    def __str__(self):
        return self.naznag


class Dodeljuje(models.Model):
    """Edition awards Prizes."""
    izdanje = models.ForeignKey(
        Izdanje,
        on_delete=models.CASCADE,
        db_column='izdanje_idizd',
        related_name='dodeljuje'
    )
    nagrada = models.ForeignKey(
        Nagrada,
        on_delete=models.CASCADE,
        db_column='nagrada_idnag',
        related_name='dodeljeno_u_izdanju'
    )

    class Meta:
        db_table = 'dodeljuje'
        verbose_name = 'Dodeljuje'
        verbose_name_plural = 'Dodeljavanja'
        unique_together = ('izdanje', 'nagrada')

    def __str__(self):
        return f"Izdanje {self.izdanje.idizd} - {self.nagrada.naznag}"


class Organizuje(models.Model):
    """Organizer organizes a Competition."""
    organizator = models.ForeignKey(
        Organizator,
        on_delete=models.CASCADE,
        db_column='organizator_idk',
        related_name='organizuje'
    )
    muzicko_takmicenje = models.ForeignKey(
        MuzickoTakmicenje,
        on_delete=models.CASCADE,
        db_column='muzicko_takmicenje_idmt',
        related_name='organizovano_od'
    )

    class Meta:
        db_table = 'organizuje'
        verbose_name = 'Organizuje'
        verbose_name_plural = 'Organizovanja'
        unique_together = ('organizator', 'muzicko_takmicenje')

    def __str__(self):
        return f"{self.organizator.idk.imek} - {self.muzicko_takmicenje.nazmt}"


class SastojSe(models.Model):
    """Judge is part of a Jury."""
    ziri = models.ForeignKey(
        Ziri,
        on_delete=models.CASCADE,
        db_column='ziri_idz',
        related_name='sudije_sastava'
    )
    sudija = models.ForeignKey(
        Sudija,
        on_delete=models.CASCADE,
        db_column='sudija_idk',
        related_name='ziri_sastavljivanja'
    )
    predsednik = models.BooleanField(default=False, db_column='predsednik')

    class Meta:
        db_table = 'sastoji_se'
        verbose_name = 'Sastoji se'
        verbose_name_plural = 'Sastavnice'
        unique_together = ('ziri', 'sudija')

    def __str__(self):
        uloga = "Predsednik" if self.predsednik else "Član"
        return f"{self.sudija.idk.imek} - {uloga}"


class SeOdrzava(models.Model):
    """Edition is held in Hall."""
    dvorana = models.ForeignKey(
        Dvorana,
        on_delete=models.CASCADE,
        db_column='dvorana_iddv',
        related_name='izdanja_odrzana'
    )
    izdanje = models.ForeignKey(
        Izdanje,
        on_delete=models.CASCADE,
        db_column='izdanje_idizd',
        related_name='dvorane_odrzavanja'
    )

    class Meta:
        db_table = 'se_odrzava'
        verbose_name = 'Održava se'
        verbose_name_plural = 'Održavanja'
        unique_together = ('dvorana', 'izdanje')

    def __str__(self):
        return f"{self.izdanje.idizd} - {self.dvorana.nazdv}"
