"""
URL configuration for api app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .auth_views import AuthViewSet, OrganizatorViewSet

# Create router and register viewsets
router = DefaultRouter()

# Auth routes
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'organizator', OrganizatorViewSet, basename='organizator')

# Other routes
router.register(r'korisnici', views.KorisnikViewSet, basename='korisnik')
router.register(r'zanrovi', views.ZanrViewSet, basename='zanr')
router.register(r'pesme', views.PesmaViewSet, basename='pesma')
router.register(r'drzave', views.DrzavaViewSet, basename='drzava')
router.register(r'duosi', views.DuoViewSet, basename='duo')
router.register(r'grupe', views.GrupaViewSet, basename='grupa')
router.register(r'solisti', views.SoloViewSet, basename='solo')
router.register(r'ucesnici', views.UcesnikViewSet, basename='ucesnik')
router.register(r'sudije', views.SudijaViewSet, basename='sudija')
router.register(r'muzicka-takmicenja', views.MuzickoTakmicenjeViewSet, basename='muzicko_takmicenje')
router.register(r'ziriji', views.ZiriViewSet, basename='ziri')
router.register(r'izdanja', views.IzdanjeViewSet, basename='izdanje')
router.register(r'dvorane', views.DvoranaViewSet, basename='dvorana')
router.register(r'takmickarski-krugovi', views.TakmickarsKrugViewSet, basename='takmickarski_krug')
router.register(r'ucestva', views.UcestvueViewSet, basename='ucestvuje')
router.register(r'reprezentacije', views.ReprezentuyeViewSet, basename='reprezentuje')
router.register(r'izvedbe', views.IzvoriViewSet, basename='izvodi')
router.register(r'nastupi', views.NastupViewSet, basename='nastup')
router.register(r'ocene', views.OcenjuyeViewSet, basename='ocenjuje')
router.register(r'dodeljivanja-nagrada', views.DodeljujanjeNagradeViewSet, basename='dodeljivanje_nagrade')
router.register(r'nagrade', views.NagradeViewSet, basename='nagrada')
router.register(r'dodeljovanja', views.DodeljueViewSet, basename='dodeljuje')
router.register(r'organizovanja', views.OrganizueViewSet, basename='organizuje')
router.register(r'sastavi-ziri', views.SastojSeViewSet, basename='sastoji_se')
router.register(r'odrzavanja', views.SeOdrzavaViewSet, basename='se_odrzava')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
