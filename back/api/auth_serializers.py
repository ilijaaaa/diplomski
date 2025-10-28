"""
Authentication serializers for registration and login.
"""
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Korisnik, Ucesnik, Sudija, Organizator


class RegisterSudijaSerializer(serializers.ModelSerializer):
    """Serializer for Judge registration."""
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    titula = serializers.CharField(required=True)
    
    class Meta:
        model = Korisnik
        fields = ('username', 'mejl', 'imek', 'przk', 'password', 'password2', 'tipk', 'titula')
        extra_kwargs = {
            'tipk': {'read_only': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Lozinke se ne poklapaju."})
        
        titula = attrs.pop('titula')
        attrs['titula'] = titula
        return attrs
    
    def create(self, validated_data):
        titula = validated_data.pop('titula')
        password = validated_data.pop('password')
        
        user = Korisnik.objects.create(
            username=validated_data['username'],
            mejl=validated_data['mejl'],
            imek=validated_data['imek'],
            przk=validated_data['przk'],
            lozinka=make_password(password),
            tipk='SUDIJA'
        )
        
        Sudija.objects.create(idk=user, titula=titula)
        return user


class RegisterOrganizatorSerializer(serializers.ModelSerializer):
    """Serializer for Organizer registration."""
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = Korisnik
        fields = ('username', 'mejl', 'imek', 'przk', 'password', 'password2', 'tipk')
        extra_kwargs = {
            'tipk': {'read_only': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Lozinke se ne poklapaju."})
        return attrs
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        
        user = Korisnik.objects.create(
            username=validated_data['username'],
            mejl=validated_data['mejl'],
            imek=validated_data['imek'],
            przk=validated_data['przk'],
            lozinka=make_password(password),
            tipk='ORGANIZATOR'
        )
        
        Organizator.objects.create(idk=user)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if not username or not password:
            raise serializers.ValidationError("Korisničko ime i lozinka su obavezni.")
        
        try:
            user = Korisnik.objects.get(username=username)
            from django.contrib.auth.hashers import check_password
            if not check_password(password, user.lozinka):
                raise serializers.ValidationError("Korisničko ime ili lozinka su netačne.")
        except Korisnik.DoesNotExist:
            raise serializers.ValidationError("Korisničko ime ili lozinka su netačne.")
        
        attrs['user'] = user
        return attrs


class UcesnikDetailSerializer(serializers.ModelSerializer):
    """Serializer for Participant details."""
    korisnik = serializers.SerializerMethodField()
    tip_naziv = serializers.CharField(source='get_tipu_display', read_only=True)
    
    class Meta:
        model = Ucesnik
        fields = ('idk', 'korisnik', 'tipu', 'tip_naziv', 'solo', 'duo', 'grupa')
    
    def get_korisnik(self, obj):
        return {
            'username': obj.idk.username,
            'mejl': obj.idk.mejl,
            'ime': obj.idk.imek,
            'prezime': obj.idk.przk,
        }


class KorisnikDetailSerializer(serializers.ModelSerializer):
    """Serializer for user details."""
    tip_naziv = serializers.CharField(source='get_tipk_display', read_only=True)
    sudija = serializers.SerializerMethodField()
    organizator = serializers.SerializerMethodField()
    ucesnik = serializers.SerializerMethodField()
    
    class Meta:
        model = Korisnik
        fields = ('idk', 'username', 'mejl', 'imek', 'przk', 'tipk', 'tip_naziv', 
                  'sudija', 'organizator', 'ucesnik')
    
    def get_sudija(self, obj):
        if obj.tipk == 'SUDIJA':
            try:
                sudija = Sudija.objects.get(idk=obj)
                return {'titula': sudija.titula}
            except Sudija.DoesNotExist:
                return None
        return None
    
    def get_organizator(self, obj):
        return obj.tipk == 'ORGANIZATOR'
    
    def get_ucesnik(self, obj):
        if obj.tipk == 'UCESNIK':
            try:
                ucesnik = Ucesnik.objects.get(idk=obj)
                return {
                    'tip': ucesnik.tipu,
                    'solo': ucesnik.solo.idk if ucesnik.solo else None,
                    'duo': ucesnik.duo.idduo if ucesnik.duo else None,
                    'grupa': ucesnik.grupa.idg if ucesnik.grupa else None,
                }
            except Ucesnik.DoesNotExist:
                return None
        return None
