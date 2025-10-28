"""
Django Admin configuration for Music Competition System.
"""
from django.contrib import admin
from .models import (
    Korisnik, Zanr, Pesma, Drzava, Duo, Grupa, Solo, Ucesnik, Sudija, Organizator,
    MuzickoTakmicenje, Ziri, Izdanje, Dvorana, TakmickarsKrug, Ucestvuje, Reprezentuje,
    Izvodi, Nastup, Ocenjuje, DodeljujanjeNagrade, Nagrada, Dodeljuje, Organizuje,
    SastojSe, SeOdrzava
)


@admin.register(Korisnik)
class KorisnikAdmin(admin.ModelAdmin):
    list_display = ('idk', 'username', 'imek', 'przk', 'mejl', 'tipk')
    list_filter = ('tipk',)
    search_fields = ('username', 'imek', 'przk', 'mejl')
    ordering = ('idk',)


@admin.register(Zanr)
class ZanrAdmin(admin.ModelAdmin):
    list_display = ('idzanr', 'nazzanr')
    search_fields = ('nazzanr',)


@admin.register(Pesma)
class PesmaAdmin(admin.ModelAdmin):
    list_display = ('idp', 'nazp', 'zanr', 'trajanje', 'datob')
    list_filter = ('zanr', 'datob')
    search_fields = ('nazp',)


@admin.register(Drzava)
class DrzavaAdmin(admin.ModelAdmin):
    list_display = ('iddr', 'nazdr', 'prvagoduc', 'brpob')
    search_fields = ('nazdr',)
    ordering = ('nazdr',)


@admin.register(Duo)
class DuoAdmin(admin.ModelAdmin):
    list_display = ('idduo', 'nazduo')
    search_fields = ('nazduo',)


@admin.register(Grupa)
class GrupaAdmin(admin.ModelAdmin):
    list_display = ('idg', 'nazg', 'brclang')
    search_fields = ('nazg',)


@admin.register(Solo)
class SoloAdmin(admin.ModelAdmin):
    list_display = ('ids', 'umime')
    search_fields = ('umime',)


@admin.register(Ucesnik)
class UcesnikAdmin(admin.ModelAdmin):
    list_display = ('idk', 'get_ime', 'tipu', 'get_grupa')
    list_filter = ('tipu',)
    search_fields = ('idk__imek', 'idk__przk', 'idk__username')
    
    def get_ime(self, obj):
        return f"{obj.idk.imek} {obj.idk.przk}"
    get_ime.short_description = "Ime i prezime"
    
    def get_grupa(self, obj):
        if obj.solo:
            return obj.solo.umime
        elif obj.duo:
            return obj.duo.nazduo
        elif obj.grupa:
            return obj.grupa.nazg
        return '-'
    get_grupa.short_description = "Solo/Duo/Grupa"


@admin.register(Sudija)
class SudijaAdmin(admin.ModelAdmin):
    list_display = ('idk', 'get_ime', 'titula', 'dat_registracije')
    search_fields = ('idk__imek', 'idk__przk', 'idk__username')
    
    def get_ime(self, obj):
        return f"{obj.idk.imek} {obj.idk.przk}"
    get_ime.short_description = "Ime i prezime"


@admin.register(Organizator)
class OrganizatorAdmin(admin.ModelAdmin):
    list_display = ('idk', 'get_ime', 'dat_registracije')
    search_fields = ('idk__imek', 'idk__przk', 'idk__username')
    
    def get_ime(self, obj):
        return f"{obj.idk.imek} {obj.idk.przk}"
    get_ime.short_description = "Ime i prezime"


@admin.register(MuzickoTakmicenje)
class MuzickoTakmicenjeAdmin(admin.ModelAdmin):
    list_display = ('idmt', 'nazmt', 'godosn')
    search_fields = ('nazmt',)
    ordering = ('-godosn',)


@admin.register(Ziri)
class ZiriAdmin(admin.ModelAdmin):
    list_display = ('idz', 'brclanz')


@admin.register(Izdanje)
class IzdanjeAdmin(admin.ModelAdmin):
    list_display = ('idizd', 'muzicko_takmicenje', 'datpoc', 'datkraj')
    list_filter = ('muzicko_takmicenje', 'datpoc')
    search_fields = ('muzicko_takmicenje__nazmt',)


@admin.register(Dvorana)
class DvoranaAdmin(admin.ModelAdmin):
    list_display = ('iddv', 'nazdv', 'grad', 'drz', 'kap')
    list_filter = ('grad', 'drz')
    search_fields = ('nazdv', 'grad')


@admin.register(TakmickarsKrug)
class TakmickarsKrugAdmin(admin.ModelAdmin):
    list_display = ('idtk', 'rbrtk', 'datodrz', 'izdanje')
    list_filter = ('izdanje', 'datodrz')
    search_fields = ('izdanje__idizd',)


@admin.register(Ucestvuje)
class UcestvueAdmin(admin.ModelAdmin):
    list_display = ('ucestvuje_id', 'izdanje', 'drzava')
    list_filter = ('izdanje', 'drzava')
    search_fields = ('drzava__nazdr',)


@admin.register(Reprezentuje)
class ReprezentuyeAdmin(admin.ModelAdmin):
    list_display = ('ucestvuje', 'ucesnik')
    list_filter = ('ucestvuje__izdanje',)
    search_fields = ('ucesnik__idk__imek',)


@admin.register(Izvodi)
class IzvoriAdmin(admin.ModelAdmin):
    list_display = ('ucesnik', 'pesma')
    list_filter = ('pesma__zanr',)
    search_fields = ('ucesnik__idk__imek', 'pesma__nazp')


@admin.register(Nastup)
class NastupAdmin(admin.ModelAdmin):
    list_display = ('idn', 'pesma', 'drzava', 'ukbod', 'plasman', 'rbrn')
    list_filter = ('takmickarski_krug', 'drzava', 'plasman')
    search_fields = ('pesma__nazp', 'drzava__nazdr')
    ordering = ('-ukbod',)


@admin.register(Ocenjuje)
class OcenjuyeAdmin(admin.ModelAdmin):
    list_display = ('nastup', 'sudija', 'bod')
    list_filter = ('nastup__takmickarski_krug',)
    search_fields = ('nastup__idn', 'sudija__idk__imek')


@admin.register(DodeljujanjeNagrade)
class DodeljujanjeNagradeAdmin(admin.ModelAdmin):
    list_display = ('iddg', 'datdodele', 'sudija')
    list_filter = ('datdodele',)
    search_fields = ('sudija__idk__imek',)


@admin.register(Nagrada)
class NagradeAdmin(admin.ModelAdmin):
    list_display = ('idnag', 'naznag', 'dodeljivanje_nagrade')
    search_fields = ('naznag',)


@admin.register(Dodeljuje)
class DodeljueAdmin(admin.ModelAdmin):
    list_display = ('izdanje', 'nagrada')
    list_filter = ('izdanje',)
    search_fields = ('nagrada__naznag',)


@admin.register(Organizuje)
class OrganizueAdmin(admin.ModelAdmin):
    list_display = ('organizator', 'muzicko_takmicenje')
    list_filter = ('muzicko_takmicenje',)
    search_fields = ('muzicko_takmicenje__nazmt',)


@admin.register(SastojSe)
class SastojSeAdmin(admin.ModelAdmin):
    list_display = ('ziri', 'sudija', 'predsednik')
    list_filter = ('predsednik',)
    search_fields = ('sudija__idk__imek', 'ziri__idz')


@admin.register(SeOdrzava)
class SeOdrzavaAdmin(admin.ModelAdmin):
    list_display = ('izdanje', 'dvorana')
    list_filter = ('izdanje',)
    search_fields = ('dvorana__nazdv',)
