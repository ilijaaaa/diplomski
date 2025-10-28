"""
Views for Music Competition System API.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import (
    Korisnik, Zanr, Pesma, Drzava, Duo, Grupa, Solo, Ucesnik, Sudija, Organizator,
    MuzickoTakmicenje, Ziri, Izdanje, Dvorana, TakmickarsKrug, Ucestvuje, Reprezentuje,
    Izvodi, Nastup, Ocenjuje, DodeljujanjeNagrade, Nagrada, Dodeljuje, Organizuje,
    SastojSe, SeOdrzava
)
from .serializers import (
    KorisnikSerializer, ZanrSerializer, PesmaSerializer, DrzavaSerializer, 
    DuoSerializer, GrupaSerializer, SoloSerializer, UcesnikSerializer, 
    SudijaSerializer, OrganizatorSerializer, MuzickoTakmicenjeSerializer, 
    ZiriSerializer, IzdanjeSerializer, DvoranaSerializer, TakmickarsKrugSerializer, 
    UcestvueSerializer, ReprezentuyeSerializer, IzvoriSerializer, NastupSerializer, 
    OcenjuyeSerializer, DodeljujanjeNagradeSerializer, NagradeSerializer, 
    DodeljueSerializer, OrganizueSerializer, SastojSeSerializer, SeOdrzavaSerializer
)


class KorisnikViewSet(viewsets.ModelViewSet):
    """ViewSet for User/Participant management."""
    queryset = Korisnik.objects.all()
    serializer_class = KorisnikSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def moji_podaci(self, request):
        """Get current user data."""
        if not request.user.is_authenticated:
            return Response({'detail': 'Not authenticated'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        try:
            serializer = KorisnikSerializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            return Response({'detail': str(e)}, 
                          status=status.HTTP_404_NOT_FOUND)


class ZanrViewSet(viewsets.ModelViewSet):
    """ViewSet for Music Genres."""
    queryset = Zanr.objects.all()
    serializer_class = ZanrSerializer
    permission_classes = [AllowAny]


class PesmaViewSet(viewsets.ModelViewSet):
    """ViewSet for Songs."""
    queryset = Pesma.objects.all()
    serializer_class = PesmaSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Pesma.objects.all()
        zanr_id = self.request.query_params.get('zanr_id')
        if zanr_id:
            queryset = queryset.filter(zanr_id=zanr_id)
        return queryset


class DrzavaViewSet(viewsets.ModelViewSet):
    """ViewSet for Countries."""
    queryset = Drzava.objects.all()
    serializer_class = DrzavaSerializer
    permission_classes = [AllowAny]


class DuoViewSet(viewsets.ModelViewSet):
    """ViewSet for Duo participants."""
    queryset = Duo.objects.all()
    serializer_class = DuoSerializer
    permission_classes = [AllowAny]


class GrupaViewSet(viewsets.ModelViewSet):
    """ViewSet for Group participants."""
    queryset = Grupa.objects.all()
    serializer_class = GrupaSerializer
    permission_classes = [AllowAny]


class SoloViewSet(viewsets.ModelViewSet):
    """ViewSet for Solo participants."""
    queryset = Solo.objects.all()
    serializer_class = SoloSerializer
    permission_classes = [AllowAny]


class UcesnikViewSet(viewsets.ModelViewSet):
    """ViewSet for Participants."""
    queryset = Ucesnik.objects.all()
    serializer_class = UcesnikSerializer
    permission_classes = [AllowAny]
    
    def update(self, request, pk=None):
        """Custom update method to handle OneToOneField with primary key."""
        try:
            korisnik = Korisnik.objects.get(pk=pk)
            
            # Try to get existing ucesnik or create new one
            ucesnik, created = Ucesnik.objects.get_or_create(
                idk=korisnik,
                defaults=request.data
            )
            
            if not created:
                # Update existing ucesnik
                for key, value in request.data.items():
                    setattr(ucesnik, key, value)
                ucesnik.save()
            
            serializer = self.get_serializer(ucesnik)
            return Response(serializer.data)
            
        except Korisnik.DoesNotExist:
            return Response(
                {'error': 'Korisnik nije pronađen'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class SudijaViewSet(viewsets.ModelViewSet):
    """ViewSet for Judges."""
    queryset = Sudija.objects.all()
    serializer_class = SudijaSerializer
    permission_classes = [AllowAny]


class OrganizatorViewSet(viewsets.ModelViewSet):
    """ViewSet for Organizers."""
    queryset = Organizator.objects.all()
    serializer_class = OrganizatorSerializer
    permission_classes = [AllowAny]


class MuzickoTakmicenjeViewSet(viewsets.ModelViewSet):
    """ViewSet for Music Competitions."""
    queryset = MuzickoTakmicenje.objects.all()
    serializer_class = MuzickoTakmicenjeSerializer
    permission_classes = [AllowAny]


class ZiriViewSet(viewsets.ModelViewSet):
    """ViewSet for Juries."""
    queryset = Ziri.objects.all()
    serializer_class = ZiriSerializer
    permission_classes = [AllowAny]
    
    @action(detail=True, methods=['get'])
    def sastav(self, request, pk=None):
        """Get jury composition (members)."""
        try:
            ziri = self.get_object()
            sastav = SastojSe.objects.filter(ziri=ziri)
            serializer = SastojSeSerializer(sastav, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'detail': str(e)}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['delete'])
    def sudije(self, request, pk=None):
        """Remove all judges from jury."""
        try:
            ziri = self.get_object()
            SastojSe.objects.filter(ziri=ziri).delete()
            return Response({'detail': 'Judges removed successfully'})
        except Exception as e:
            return Response({'detail': str(e)}, 
                          status=status.HTTP_400_BAD_REQUEST)


class IzdanjeViewSet(viewsets.ModelViewSet):
    """ViewSet for Editions/Instances of competitions."""
    queryset = Izdanje.objects.all()
    serializer_class = IzdanjeSerializer
    permission_classes = [AllowAny]


class DvoranaViewSet(viewsets.ModelViewSet):
    """ViewSet for Halls/Venues."""
    queryset = Dvorana.objects.all()
    serializer_class = DvoranaSerializer
    permission_classes = [AllowAny]


class TakmickarsKrugViewSet(viewsets.ModelViewSet):
    """ViewSet for Competition Rounds."""
    queryset = TakmickarsKrug.objects.all()
    serializer_class = TakmickarsKrugSerializer
    permission_classes = [AllowAny]


class UcestvueViewSet(viewsets.ModelViewSet):
    """ViewSet for Country participation in editions."""
    queryset = Ucestvuje.objects.all()
    serializer_class = UcestvueSerializer
    permission_classes = [AllowAny]


class ReprezentuyeViewSet(viewsets.ModelViewSet):
    """ViewSet for Participant representing a country."""
    queryset = Reprezentuje.objects.all()
    serializer_class = ReprezentuyeSerializer
    permission_classes = [AllowAny]


class IzvoriViewSet(viewsets.ModelViewSet):
    """ViewSet for Participant performing songs."""
    queryset = Izvodi.objects.all()
    serializer_class = IzvoriSerializer
    permission_classes = [AllowAny]
    
    def destroy(self, request, pk=None):
        """Custom delete method for compound key lookup via query params."""
        from rest_framework.response import Response
        from rest_framework import status
        
        # Try delete by query parameters if pk doesn't work
        ucesnik_id = request.query_params.get('ucesnik')
        pesma_id = request.query_params.get('pesma')
        
        if ucesnik_id and pesma_id:
            try:
                from .models import Izvodi
                izvodi = Izvodi.objects.get(ucesnik=ucesnik_id, pesma=pesma_id)
                izvodi.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except Izvodi.DoesNotExist:
                return Response(
                    {'error': 'Izvedba nije pronađena'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Fallback to default behavior
        return super().destroy(request, pk)


class NastupViewSet(viewsets.ModelViewSet):
    """ViewSet for Performances."""
    queryset = Nastup.objects.all()
    serializer_class = NastupSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Nastup.objects.all()
        takmickarski_krug_id = self.request.query_params.get('takmickarski_krug_id')
        drzava_id = self.request.query_params.get('drzava_id')
        
        if takmickarski_krug_id:
            queryset = queryset.filter(takmickarski_krug_id=takmickarski_krug_id)
        if drzava_id:
            queryset = queryset.filter(drzava_id=drzava_id)
            
        return queryset.order_by('-ukbod')


class OcenjuyeViewSet(viewsets.ModelViewSet):
    """ViewSet for Performance ratings by judges."""
    queryset = Ocenjuje.objects.all()
    serializer_class = OcenjuyeSerializer
    permission_classes = [AllowAny]


class DodeljujanjeNagradeViewSet(viewsets.ModelViewSet):
    """ViewSet for Award assignments."""
    queryset = DodeljujanjeNagrade.objects.all()
    serializer_class = DodeljujanjeNagradeSerializer
    permission_classes = [AllowAny]


class NagradeViewSet(viewsets.ModelViewSet):
    """ViewSet for Awards."""
    queryset = Nagrada.objects.all()
    serializer_class = NagradeSerializer
    permission_classes = [AllowAny]


class DodeljueViewSet(viewsets.ModelViewSet):
    """ViewSet for Edition awarding prizes."""
    queryset = Dodeljuje.objects.all()
    serializer_class = DodeljueSerializer
    permission_classes = [AllowAny]


class OrganizueViewSet(viewsets.ModelViewSet):
    """ViewSet for Organizer organizing competitions."""
    queryset = Organizuje.objects.all()
    serializer_class = OrganizueSerializer
    permission_classes = [AllowAny]


class SastojSeViewSet(viewsets.ModelViewSet):
    """ViewSet for Judge being part of jury."""
    queryset = SastojSe.objects.all()
    serializer_class = SastojSeSerializer
    permission_classes = [AllowAny]


class SeOdrzavaViewSet(viewsets.ModelViewSet):
    """ViewSet for Edition being held in hall."""
    queryset = SeOdrzava.objects.all()
    serializer_class = SeOdrzavaSerializer
    permission_classes = [AllowAny]

