"""
Custom JWT Authentication for Korisnik model.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from api.models import Korisnik


class KorisnikJWTAuthentication(JWTAuthentication):
    """Custom JWT Authentication that uses Korisnik model instead of Django User."""
    
    def get_user(self, validated_token):
        """
        Attempts to find and return a user using the given validated token.
        """
        try:
            user_id = validated_token['user_id']
        except KeyError:
            raise InvalidToken('Token contained no recognizable user identification')

        try:
            user = Korisnik.objects.get(idk=user_id)
        except Korisnik.DoesNotExist:
            raise InvalidToken('User not found')

        if not user.is_active:
            raise InvalidToken('User is inactive')

        return user