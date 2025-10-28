"""
Serializers for Music Competition System API.
"""
from rest_framework import serializers
from .models import (
    Korisnik, Zanr, Pesma, Drzava, Duo, Grupa, Solo, Ucesnik, Sudija, Organizator,
    MuzickoTakmicenje, Ziri, Izdanje, Dvorana, TakmickarsKrug, Ucestvuje, Reprezentuje,
    Izvodi, Nastup, Ocenjuje, DodeljujanjeNagrade, Nagrada, Dodeljuje, Organizuje,
    SastojSe, SeOdrzava
)


# Basic Serializers

class KorisnikSerializer(serializers.ModelSerializer):
    class Meta:
        model = Korisnik
        fields = ('idk', 'username', 'mejl', 'imek', 'przk', 'tipk')
        read_only_fields = ('idk',)


class ZanrSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zanr
        fields = '__all__'
        read_only_fields = ('idzanr',)


class PesmaSerializer(serializers.ModelSerializer):
    zanr_naziv = serializers.CharField(source='zanr.nazzanr', read_only=True)
    
    class Meta:
        model = Pesma
        fields = ('idp', 'nazp', 'trajanje', 'datob', 'zanr', 'zanr_naziv')
        read_only_fields = ('idp',)


class DrzavaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drzava
        fields = '__all__'
        read_only_fields = ('iddr',)


class DuoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Duo
        fields = '__all__'
        read_only_fields = ('idduo',)


class GrupaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grupa
        fields = '__all__'
        read_only_fields = ('idg',)


class SoloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solo
        fields = '__all__'
        read_only_fields = ('ids',)


class SudijaSerializer(serializers.ModelSerializer):
    korisnik_info = KorisnikSerializer(source='idk', read_only=True)
    
    class Meta:
        model = Sudija
        fields = ('idk', 'titula', 'korisnik_info')
        read_only_fields = ('idk',)


class OrganizatorSerializer(serializers.ModelSerializer):
    korisnik_info = KorisnikSerializer(source='idk', read_only=True)
    
    class Meta:
        model = Organizator
        fields = ('idk', 'korisnik_info')
        read_only_fields = ('idk',)


class UcesnikSerializer(serializers.ModelSerializer):
    korisnik_info = KorisnikSerializer(source='idk', read_only=True)
    solo_info = SoloSerializer(source='solo', read_only=True)
    duo_info = DuoSerializer(source='duo', read_only=True)
    grupa_info = GrupaSerializer(source='grupa', read_only=True)
    
    class Meta:
        model = Ucesnik
        fields = ('idk', 'tipu', 'korisnik_info', 'solo', 'solo_info', 
                  'duo', 'duo_info', 'grupa', 'grupa_info')
        read_only_fields = ('idk',)


# Relationship Serializers

class ZiriSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ziri
        fields = '__all__'
        read_only_fields = ('idz',)


class MuzickoTakmicenjeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuzickoTakmicenje
        fields = '__all__'
        read_only_fields = ('idmt',)


class IzdanjeSerializer(serializers.ModelSerializer):
    muzicko_takmicenje_naziv = serializers.CharField(
        source='muzicko_takmicenje.nazmt', 
        read_only=True
    )
    
    class Meta:
        model = Izdanje
        fields = ('idizd', 'datpoc', 'datkraj', 'ziri', 'muzicko_takmicenje', 
                  'muzicko_takmicenje_naziv')
        read_only_fields = ('idizd',)


class DvoranaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dvorana
        fields = '__all__'
        read_only_fields = ('iddv',)


class TakmickarsKrugSerializer(serializers.ModelSerializer):
    izdanje_info = IzdanjeSerializer(source='izdanje', read_only=True)
    
    class Meta:
        model = TakmickarsKrug
        fields = ('idtk', 'rbrtk', 'datodrz', 'izdanje', 'parent_krug', 'izdanje_info')
        read_only_fields = ('idtk',)


class UcestvueSerializer(serializers.ModelSerializer):
    izdanje_info = IzdanjeSerializer(source='izdanje', read_only=True)
    drzava_info = DrzavaSerializer(source='drzava', read_only=True)
    
    class Meta:
        model = Ucestvuje
        fields = ('ucestvuje_id', 'izdanje', 'drzava', 'izdanje_info', 'drzava_info')
        read_only_fields = ('ucestvuje_id',)


class ReprezentuyeSerializer(serializers.ModelSerializer):
    ucestvuje_info = UcestvueSerializer(source='ucestvuje', read_only=True)
    ucesnik_info = UcesnikSerializer(source='ucesnik', read_only=True)
    
    class Meta:
        model = Reprezentuje
        fields = ('ucestvuje', 'ucesnik', 'ucestvuje_info', 'ucesnik_info')


class IzvoriSerializer(serializers.ModelSerializer):
    ucesnik_info = UcesnikSerializer(source='ucesnik', read_only=True)
    pesma_info = PesmaSerializer(source='pesma', read_only=True)
    
    class Meta:
        model = Izvodi
        fields = ('ucesnik', 'pesma', 'ucesnik_info', 'pesma_info')


# Performance Serializers

class OcenjuyeSerializer(serializers.ModelSerializer):
    sudija_info = SudijaSerializer(source='sudija', read_only=True)
    
    class Meta:
        model = Ocenjuje
        fields = ('nastup', 'sudija', 'bod', 'sudija_info')


class DodeljujanjeNagradeSerializer(serializers.ModelSerializer):
    sudija_info = SudijaSerializer(source='sudija', read_only=True)
    
    class Meta:
        model = DodeljujanjeNagrade
        fields = ('iddg', 'datdodele', 'sudija', 'sudija_info')
        read_only_fields = ('iddg',)


class NagradeSerializer(serializers.ModelSerializer):
    dodeljivanje_info = DodeljujanjeNagradeSerializer(
        source='dodeljivanje_nagrade', 
        read_only=True
    )
    
    class Meta:
        model = Nagrada
        fields = ('idnag', 'naznag', 'dodeljivanje_nagrade', 'dodeljivanje_info')
        read_only_fields = ('idnag',)


class NastupSerializer(serializers.ModelSerializer):
    drzava_info = DrzavaSerializer(source='drzava', read_only=True)
    pesma_info = PesmaSerializer(source='pesma', read_only=True)
    takmickarski_krug_info = TakmickarsKrugSerializer(
        source='takmickarski_krug', 
        read_only=True
    )
    ocene = OcenjuyeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Nastup
        fields = ('idn', 'ukbod', 'rbrn', 'plasman', 'drzava', 'pesma', 
                  'takmickarski_krug', 'dodeljivanje_nagrade', 'drzava_info', 
                  'pesma_info', 'takmickarski_krug_info', 'ocene')
        read_only_fields = ('idn',)


# Bridge Serializers

class DodeljueSerializer(serializers.ModelSerializer):
    izdanje_info = IzdanjeSerializer(source='izdanje', read_only=True)
    nagrada_info = NagradeSerializer(source='nagrada', read_only=True)
    
    class Meta:
        model = Dodeljuje
        fields = ('izdanje', 'nagrada', 'izdanje_info', 'nagrada_info')


class OrganizueSerializer(serializers.ModelSerializer):
    organizator_info = OrganizatorSerializer(source='organizator', read_only=True)
    takmicenje_info = MuzickoTakmicenjeSerializer(
        source='muzicko_takmicenje', 
        read_only=True
    )
    
    class Meta:
        model = Organizuje
        fields = ('organizator', 'muzicko_takmicenje', 
                  'organizator_info', 'takmicenje_info')


class SastojSeSerializer(serializers.ModelSerializer):
    sudija_info = SudijaSerializer(source='sudija', read_only=True)
    
    class Meta:
        model = SastojSe
        fields = ('ziri', 'sudija', 'predsednik', 'sudija_info')


class SeOdrzavaSerializer(serializers.ModelSerializer):
    izdanje_info = IzdanjeSerializer(source='izdanje', read_only=True)
    dvorana_info = DvoranaSerializer(source='dvorana', read_only=True)
    
    class Meta:
        model = SeOdrzava
        fields = ('dvorana', 'izdanje', 'izdanje_info', 'dvorana_info')
