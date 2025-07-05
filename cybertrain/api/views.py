from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator


from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegisterSerializer, UserSerializer
from .models import UserProfile

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # Log detailed error for debugging
            print(f"Registration serializer errors: {serializer.errors}")
            # Provide a user-friendly generic error or specific errors
            error_messages = []
            for field, messages in serializer.errors.items():
                for message in messages:
                    error_messages.append(f"{field.replace('_', ' ').capitalize()}: {message}")
            return Response(
                {"error": "Registration failed. Please check the provided data.", "details": error_messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save() # This also deactivates the user (is_active=False)

        # UserProfile is created via post_save signal. Fetch it.
        user_profile = UserProfile.objects.get(user=user)

        # Generate email verification token (using UserProfile's UUID field)
        token = str(user_profile.email_verification_token)

        # Build verification URL (adjust domain as needed for frontend)
        # For now, let's assume the frontend handles this at /verify-email?token=TOKEN
        # In a real app, this base URL would come from settings or site framework.
        # verification_url = f"http://localhost:3000/verify-email?token={token}"

        # Using Django's token generator for a more standard approach to token generation for URLs
        # This is typically used for password reset, but can be adapted for email verification.
        # However, for simplicity with the UUID token on UserProfile, we'll use that directly.
        # If we wanted more robust token features (like expiry separate from model),
        # Django's default_token_generator or a custom one would be better.

        # For this implementation, the UserProfile.email_verification_token (UUID) is used.
        # The frontend will take this token and send it back to a verification endpoint.

        # Construct the verification link.
        # The frontend URL part needs to be configurable or known.
        # Example: http://localhost:5173/verify-email/TOKEN_HERE if using Vite default port for frontend
        # For now, just sending the token. The frontend will construct the full URL.
        # A more robust way is to send the full link.

        # Let's use a placeholder for the frontend URL for now.
        # This should be configured in settings.py for different environments.
        FRONTEND_VERIFY_EMAIL_URL = getattr(settings, 'FRONTEND_VERIFY_EMAIL_URL', 'http://localhost:5173/auth/verify-email/')
        verification_link = f"{FRONTEND_VERIFY_EMAIL_URL}{token}/"


        subject = 'Activate Your CyberTrain Account'
        message = (
            f"Hi {user.username},\n\n"
            f"Thank you for registering at CyberTrain.\n"
            f"Please click the link below to verify your email address and activate your account:\n"
            f"{verification_link}\n\n"
            f"If you did not request this, please ignore this email.\n\n"
            f"Thanks,\nThe CyberTrain Team"
        )

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@cybertrain.com',
                [user.email],
                fail_silently=False,
            )
            return Response(
                {"message": "User registered successfully. Please check your email to verify your account."},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            # Log the exception
            print(f"Failed to send verification email to {user.email}: {e}")
            # Optionally, delete the user or mark them for re-verification if email fails
            # For now, we inform the user about the registration but also about the email issue.
            return Response(
                {
                    "message": "User registered successfully, but failed to send verification email. Please contact support.",
                    "user_id": user.id # For potential manual verification by admin
                },
                status=status.HTTP_201_CREATED # User is created, but email step failed.
                                                # Could also be a 207 Multi-Status or a custom error.
            )


class EmailVerificationView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Validate if token is a valid UUID, otherwise UserProfile.objects.get will fail badly
            from uuid import UUID
            try:
                uuid_obj = UUID(token, version=4)
            except ValueError:
                return Response({"error": "Invalid token format."}, status=status.HTTP_400_BAD_REQUEST)

            user_profile = UserProfile.objects.get(email_verification_token=uuid_obj)

            if user_profile.email_verified:
                return Response({"message": "Email already verified."}, status=status.HTTP_200_OK)

            user = user_profile.user
            user.is_active = True
            user.save()

            user_profile.email_verified = True
            user_profile.email_verification_token = None # Invalidate the token
            user_profile.save()

            return Response({"message": "Email successfully verified. You can now log in."}, status=status.HTTP_200_OK)

        except UserProfile.DoesNotExist:
            return Response({"error": "Invalid or expired verification token."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log the exception for server-side review
            print(f"Email verification error: {e}")
            return Response({"error": "An unexpected error occurred during email verification."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Do not reveal that the user doesn't exist or is not active.
            # Always return a success-like message.
            return Response({"message": "If an account with this email exists, a password reset link has been sent."}, status=status.HTTP_200_OK)

        if not user.is_active: # Or user.has_usable_password() if you want to be more specific
             return Response({"message": "If an account with this email exists, a password reset link has been sent."}, status=status.HTTP_200_OK)


        # Generate token and uid
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Configure this URL in settings.py
        FRONTEND_PASSWORD_RESET_CONFIRM_URL = getattr(settings, 'FRONTEND_PASSWORD_RESET_CONFIRM_URL', 'http://localhost:5173/auth/reset-password/')
        reset_link = f"{FRONTEND_PASSWORD_RESET_CONFIRM_URL}{uid}/{token}/"

        subject = 'Password Reset Request for CyberTrain'
        message = (
            f"Hi {user.username},\n\n"
            f"Someone requested a password reset for your CyberTrain account. "
            f"If this was you, click the link below to set a new password:\n"
            f"{reset_link}\n\n"
            f"If you did not request a password reset, please ignore this email.\n\n"
            f"Thanks,\nThe CyberTrain Team"
        )

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send password reset email to {user.email}: {e}")
            # Still return a generic message to the user

        return Response({"message": "If an account with this email exists, a password reset link has been sent."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')

        if not all([uidb64, token, password]):
            return Response({"error": "UID, token, and new password are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from django.utils.http import urlsafe_base64_decode
            from django.utils.encoding import force_str
            from django.core.exceptions import ValidationError as DjangoValidationError # Added this
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist, DjangoValidationError):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            try:
                from django.contrib.auth.password_validation import validate_password
                validate_password(password, user) # Validate new password
                user.set_password(password)
                user.save()
                # If you have session invalidation logic upon password change, add it here
                return Response({"message": "Password has been reset successfully. You can now log in with your new password."}, status=status.HTTP_200_OK)
            except DjangoValidationError as e: # Django's ValidationError
                 return Response({"error": "Password validation failed.", "details": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({"error": "Invalid or expired password reset link."}, status=status.HTTP_400_BAD_REQUEST)
