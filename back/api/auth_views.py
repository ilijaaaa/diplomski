"""
Authentication views for registration, login, and user management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Korisnik, Ucesnik, Sudija, Organizator, Duo, Grupa, Solo
from .auth_serializers import (
    RegisterSudijaSerializer, RegisterOrganizatorSerializer, LoginSerializer,
    KorisnikDetailSerializer, UcesnikDetailSerializer
)


class AuthViewSet(viewsets.ViewSet):
    """ViewSet for authentication operations."""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def register_sudija(self, request):
        """Register new Judge."""
        serializer = RegisterSudijaSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Sudija je uspešno registrovan',
                'user': {
                    'idk': user.idk,
                    'username': user.username,
                    'mejl': user.mejl,
                    'imek': user.imek,
                    'przk': user.przk,
                    'tip': user.tipk,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def register_organizator(self, request):
        """Register new Organizer."""
        serializer = RegisterOrganizatorSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Organizator je uspešno registrovan',
                'user': {
                    'idk': user.idk,
                    'username': user.username,
                    'mejl': user.mejl,
                    'imek': user.imek,
                    'przk': user.przk,
                    'tip': user.tipk,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login user and return JWT tokens."""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': f'Dobrodošli {user.imek}',
                'user': {
                    'idk': user.idk,
                    'username': user.username,
                    'mejl': user.mejl,
                    'imek': user.imek,
                    'przk': user.przk,
                    'tip': user.tipk,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user information."""
        serializer = KorisnikDetailSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def update_profil(self, request):
        """Update current user profile."""
        user = request.user
        data = request.data
        
        # Dozvoljeni polјa za ažuriranje
        if 'imek' in data and data['imek'].strip():
            user.imek = data['imek'].strip()
        
        if 'przk' in data and data['przk'].strip():
            user.przk = data['przk'].strip()
        
        if 'mejl' in data and data['mejl'].strip():
            # Provera da li email već postoji
            if Korisnik.objects.filter(mejl=data['mejl']).exclude(idk=user.idk).exists():
                return Response(
                    {'error': 'Taj email je već zauzet.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.mejl = data['mejl'].strip()
        
        # Ako korisnik želi da promijeni lozinku
        if 'old_password' in data and 'new_password' in data:
            from django.contrib.auth.hashers import check_password, make_password
            
            if not check_password(data['old_password'], user.lozinka):
                return Response(
                    {'error': 'Stara lozinka je netačna.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.lozinka = make_password(data['new_password'])
        
        try:
            user.save()
            serializer = KorisnikDetailSerializer(user)
            return Response({
                'message': 'Profil je uspešno ažuriran',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Greška pri ažuriranju profila: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class OrganizatorViewSet(viewsets.ViewSet):
    """ViewSet for Organizer specific operations."""
    permission_classes = [IsAuthenticated]
    
    def check_is_organizator(self, request):
        """Check if user is Organizator."""
        if request.user.tipk != 'ORGANIZATOR':
            raise PermissionError("Samo organizatori mogu da dodaju učesnike.")
    
    @action(detail=False, methods=['post'])
    def dodaj_ucesnika(self, request):
        """Add new participant (Ucesnik) - only Organizator can do this."""
        self.check_is_organizator(request)
        
        try:
            data = request.data
            
            # Validacija
            if not data.get('username') or not data.get('imek') or not data.get('przk'):
                return Response(
                    {'error': 'Korisničko ime, ime i prezime su obavezni.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not data.get('tipu') or data['tipu'] not in ['SOLO', 'DUO', 'GRUPA']:
                return Response(
                    {'error': 'Tip učesnika (SOLO, DUO, GRUPA) je obavezan.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Kreiraj Korisnika
            from django.contrib.auth.hashers import make_password
            password = data.get('password', 'InitialPassword123!')
            
            user = Korisnik.objects.create(
                username=data['username'],
                mejl=data.get('mejl', f"{data['username']}@ucesnik.local"),
                imek=data['imek'],
                przk=data['przk'],
                lozinka=make_password(password),
                tipk='UCESNIK'
            )
            
            # Kreiraj Ucesnika sa odgovarajućom grupom
            tipu = data['tipu']
            
            if tipu == 'SOLO':
                solo = Solo.objects.create(umime=f"{data['imek']} {data['przk']}")
                ucesnik = Ucesnik.objects.create(
                    idk=user,
                    tipu='SOLO',
                    solo=solo,
                    dodat_od=request.user
                )
            
            elif tipu == 'DUO':
                # Ako je prosleđen duo_id, koristi postojeći
                if data.get('duo_id'):
                    duo = Duo.objects.get(idduo=data['duo_id'])
                else:
                    # Kreiraj novi Duo
                    if not data.get('duo_naziv'):
                        return Response(
                            {'error': 'Naziv dua je obavezan ili prosleđi duo_id.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    duo = Duo.objects.create(nazduo=data['duo_naziv'])
                
                ucesnik = Ucesnik.objects.create(
                    idk=user,
                    tipu='DUO',
                    duo=duo,
                    dodat_od=request.user
                )
            
            elif tipu == 'GRUPA':
                # Ako je prosleđen grupa_id, koristi postojeću
                if data.get('grupa_id'):
                    grupa = Grupa.objects.get(idg=data['grupa_id'])
                else:
                    # Kreiraj novu Grupu
                    if not data.get('grupa_naziv') or not data.get('brclang'):
                        return Response(
                            {'error': 'Naziv grupe i broj članova su obavezni ili prosleđi grupa_id.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    grupa = Grupa.objects.create(
                        nazg=data['grupa_naziv'],
                        brclang=int(data['brclang'])
                    )
                
                ucesnik = Ucesnik.objects.create(
                    idk=user,
                    tipu='GRUPA',
                    grupa=grupa,
                    dodat_od=request.user
                )
            
            return Response({
                'message': f'Učesnik {user.imek} {user.przk} je uspešno dodat',
                'ucesnik': {
                    'idk': user.idk,
                    'username': user.username,
                    'ime': user.imek,
                    'prezime': user.przk,
                    'tip': ucesnik.tipu,
                    'lozinka': password,
                }
            }, status=status.HTTP_201_CREATED)
        
        except Duo.DoesNotExist:
            return Response(
                {'error': 'Duo sa datim ID-om ne postoji.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Grupa.DoesNotExist:
            return Response(
                {'error': 'Grupa sa datim ID-om ne postoji.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def lista_duosa(self, request):
        """Get list of all Duos - for selection when adding Duo participant."""
        duosi = Duo.objects.all().values('idduo', 'nazduo')
        return Response({
            'duosi': list(duosi)
        })
    
    @action(detail=False, methods=['get'])
    def lista_grupa(self, request):
        """Get list of all Groups - for selection when adding Group participant."""
        grupe = Grupa.objects.all().values('idg', 'nazg', 'brclang')
        return Response({
            'grupe': list(grupe)
        })
    
    @action(detail=False, methods=['post'])
    def kreiraj_duo(self, request):
        """Create new Duo."""
        self.check_is_organizator(request)
        
        if not request.data.get('naziv'):
            return Response(
                {'error': 'Naziv dua je obavezan.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        duo = Duo.objects.create(nazduo=request.data['naziv'])
        return Response({
            'message': 'Duo je uspešno kreiran',
            'duo': {
                'idduo': duo.idduo,
                'naziv': duo.nazduo,
            }
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def kreiraj_grupu(self, request):
        """Create new Group."""
        self.check_is_organizator(request)
        
        if not request.data.get('naziv') or not request.data.get('brclang'):
            return Response(
                {'error': 'Naziv grupe i broj članova su obavezni.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        grupa = Grupa.objects.create(
            nazg=request.data['naziv'],
            brclang=int(request.data['brclang'])
        )
        return Response({
            'message': 'Grupa je uspešno kreirana',
            'grupa': {
                'idg': grupa.idg,
                'naziv': grupa.nazg,
                'brclang': grupa.brclang,
            }
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def lista_ucesnika(self, request):
        """Get list of all participants."""
        ucesnici = Ucesnik.objects.select_related('idk').all()
        data = []
        for u in ucesnici:
            data.append({
                'idk': u.idk.idk,
                'username': u.idk.username,
                'ime': u.idk.imek,
                'prezime': u.idk.przk,
                'mejl': u.idk.mejl,
                'tip': u.tipu,
                'dodat_od': u.dodat_od.username if u.dodat_od else None,
            })
        return Response({'ucesnici': data})
