from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError # Alias to avoid name clash
from rest_framework import serializers
from .models import UserProfile
import re # For email validation

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('email_verified',)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')

    def validate_email(self, value):
        """
        Check if the email is already in use.
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email address already in use.")
        # Basic regex for email structure (not exhaustive, Django's EmailField does more)
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", value):
            raise serializers.ValidationError("Enter a valid email address.")
        return value

    def validate_username(self, value):
        """
        Check if the username is already in use.
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        if not re.match(r"^\w+$", value): # Django's default User model username validator is more complex
                                         # This is a simpler version: letters, numbers, underscore
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        # Django's validate_password raises DjangoValidationError, which needs to be caught
        # and re-raised as DRF's serializers.ValidationError
        try:
            validate_password(attrs['password'], user=User(username=attrs.get('username'), email=attrs.get('email')))
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})

        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.is_active = False # Deactivate account until email confirmation
        user.save()
        # UserProfile is created by the signal in models.py
        return user

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile', 'is_active')
