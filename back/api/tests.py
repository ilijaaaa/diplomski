"""
Tests for Music Competition System API.
"""
from django.test import TestCase
from .models import Korisnik, Zanr, Pesma, Drzava


class KorisnikTestCase(TestCase):
    def setUp(self):
        self.korisnik = Korisnik.objects.create(
            imek='Petar',
            przk='Petrovic',
            mejl='petar@example.com',
            lozinka='sifra123',
            tipk='UCESNIK'
        )

    def test_korisnik_creation(self):
        self.assertEqual(self.korisnik.imek, 'Petar')
        self.assertEqual(self.korisnik.tipk, 'UCESNIK')


class ZanrTestCase(TestCase):
    def setUp(self):
        self.zanr = Zanr.objects.create(nazzanr='Pop')

    def test_zanr_creation(self):
        self.assertEqual(self.zanr.nazzanr, 'Pop')
