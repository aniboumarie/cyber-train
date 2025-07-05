from django.contrib.auth.models import User
from django.urls import reverse
from django.core import mail # For checking sent emails
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator


from rest_framework import status
from rest_framework.test import APITestCase

from .models import UserProfile

# Helper to get the most recently created user
def get_latest_user():
    return User.objects.order_by('-id').first()

class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth-register')
        self.login_url = reverse('token_obtain_pair') # from simplejwt
        self.verify_email_url = reverse('auth-verify-email')
        self.password_reset_request_url = reverse('auth-password-reset-request')
        self.password_reset_confirm_url = reverse('auth-password-reset-confirm')
        self.current_user_url = reverse('auth-current-user')


        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'StrongPassword123!',
            'password2': 'StrongPassword123!'
        }
        self.user_data_login = { # for login, only username and password
            'username': 'testuser',
            'password': 'StrongPassword123!'
        }

    # --- Registration Tests ---
    def test_user_registration_success(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = get_latest_user()
        self.assertIsNotNone(user)
        self.assertEqual(user.username, self.user_data['username'])
        self.assertEqual(user.email, self.user_data['email'])
        self.assertFalse(user.is_active) # Should be inactive until verified

        user_profile = UserProfile.objects.get(user=user)
        self.assertIsNotNone(user_profile)
        self.assertFalse(user_profile.email_verified)
        self.assertIsNotNone(user_profile.email_verification_token)

        # Check if email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Activate Your CyberTrain Account')
        self.assertIn(str(user_profile.email_verification_token), mail.outbox[0].body)

    def test_user_registration_existing_username(self):
        # Create a user first
        User.objects.create_user(username='testuser', email='another@example.com', password='password')
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data.get('details', [])[0].lower())


    def test_user_registration_existing_email(self):
        User.objects.create_user(username='anotheruser', email='test@example.com', password='password')
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data.get('details', [])[0].lower())

    def test_user_registration_password_mismatch(self):
        data = self.user_data.copy()
        data['password2'] = 'DifferentPassword123!'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data.get('details', [])[0].lower())

    def test_user_registration_weak_password(self):
        data = self.user_data.copy()
        data['password'] = 'weak'
        data['password2'] = 'weak'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data.get('details', [])[0].lower()) # Django's validator should catch this

    def test_user_registration_invalid_email_format(self):
        data = self.user_data.copy()
        data['email'] = 'notanemail'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data.get('details', [])[0].lower())

    # --- Email Verification Tests ---
    def test_email_verification_success(self):
        # Register user first
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user()
        user_profile = UserProfile.objects.get(user=user)
        token = str(user_profile.email_verification_token)

        response = self.client.post(self.verify_email_url, {'token': token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], "Email successfully verified. You can now log in.")

        user.refresh_from_db()
        user_profile.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertTrue(user_profile.email_verified)
        self.assertIsNone(user_profile.email_verification_token)

    def test_email_verification_invalid_token(self):
        response = self.client.post(self.verify_email_url, {'token': 'invalid-token-uuid'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid or expired verification token', response.data['error']) # Or "Invalid token format"

    def test_email_verification_already_verified(self):
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user()
        user_profile = UserProfile.objects.get(user=user)
        token = str(user_profile.email_verification_token)

        # First verification
        self.client.post(self.verify_email_url, {'token': token}, format='json')

        # Attempt second verification
        response = self.client.post(self.verify_email_url, {'token': token}, format='json')
        # This case, the token is now None, so it will be "Invalid or expired"
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid or expired verification token', response.data['error'])

        # If we try to verify an already verified user with a NEW valid token for another user (hypothetically)
        # or if the logic was slightly different to allow re-sending verification.
        # For now, token being None is the primary path for "already verified then try again with same (now invalid) token"
        user.is_active = True
        user_profile.email_verified = True
        user_profile.email_verification_token = None # Simulate it's fully verified and token cleared
        user_profile.save()
        user.save()

        # To test "Email already verified" message, we need a token that exists but profile is already verified.
        # This state is hard to reach with current flow as token is cleared.
        # We can manually set it up:
        new_token_for_verified_user = UserProfile.objects.create(user=User.objects.create_user(username="verified_user", password="password"), email_verified=True, email_verification_token=None)
        new_token_for_verified_user.email_verified = True # ensure this is true
        new_token_for_verified_user.email_verification_token = "123e4567-e89b-12d3-a456-426614174000" # give it a token again
        new_token_for_verified_user.save()

        response_already_verified = self.client.post(self.verify_email_url, {'token': "123e4567-e89b-12d3-a456-426614174000"}, format='json')
        self.assertEqual(response_already_verified.status_code, status.HTTP_200_OK)
        self.assertEqual(response_already_verified.data['message'], "Email already verified.")


    # --- Login Tests ---
    def test_user_login_success_after_verification(self):
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user()
        user_profile = UserProfile.objects.get(user=user)
        token = str(user_profile.email_verification_token)
        self.client.post(self.verify_email_url, {'token': token}, format='json') # Verify email

        response = self.client.post(self.login_url, self.user_data_login, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_login_before_verification(self):
        self.client.post(self.register_url, self.user_data, format='json') # User is inactive
        response = self.client.post(self.login_url, self.user_data_login, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED) # is_active is false
        self.assertIn('No active account found with the given credentials', response.data['detail'])

    def test_user_login_incorrect_password(self):
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user()
        user_profile = UserProfile.objects.get(user=user)
        token = str(user_profile.email_verification_token)
        self.client.post(self.verify_email_url, {'token': token}, format='json') # Verify

        wrong_credentials = self.user_data_login.copy()
        wrong_credentials['password'] = 'WrongPassword!'
        response = self.client.post(self.login_url, wrong_credentials, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- Password Reset Request Tests ---
    def test_password_reset_request_success(self):
        # Register and verify user
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user()
        user_profile = UserProfile.objects.get(user=user)
        self.client.post(self.verify_email_url, {'token': str(user_profile.email_verification_token)}, format='json')

        mail.outbox = [] # Clear previous registration email
        response = self.client.post(self.password_reset_request_url, {'email': self.user_data['email']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], "If an account with this email exists, a password reset link has been sent.")
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Password Reset Request for CyberTrain')

    def test_password_reset_request_non_existent_email(self):
        response = self.client.post(self.password_reset_request_url, {'email': 'nonexistent@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK) # Should not leak info
        self.assertEqual(len(mail.outbox), 0) # No email should be sent

    def test_password_reset_request_inactive_user(self):
        self.client.post(self.register_url, self.user_data, format='json') # User created but not active
        mail.outbox = [] # Clear registration email
        response = self.client.post(self.password_reset_request_url, {'email': self.user_data['email']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK) # Should not leak info
        self.assertEqual(len(mail.outbox), 0) # No email should be sent as user is inactive


    # --- Password Reset Confirm Tests ---
    def test_password_reset_confirm_success(self):
        # 1. Register and verify
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user()
        user_profile = UserProfile.objects.get(user=user)
        self.client.post(self.verify_email_url, {'token': str(user_profile.email_verification_token)}, format='json')

        # 2. Request password reset to get token and uid
        mail.outbox = []
        self.client.post(self.password_reset_request_url, {'email': self.user_data['email']}, format='json')
        sent_email = mail.outbox[0]
        # Extract uid and token from email body (this is a bit fragile, depends on email format)
        # Example link: http://localhost:5173/auth/reset-password/MTI/c1v-06a0e238097180440956906f72140c10/
        body_parts = sent_email.body.split('/')
        uid = body_parts[-3] # Assuming structure .../uid/token/
        token = body_parts[-2]

        new_password = "NewStrongPassword456!"
        confirm_data = {'uid': uid, 'token': token, 'password': new_password}
        response = self.client.post(self.password_reset_confirm_url, confirm_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], "Password has been reset successfully. You can now log in with your new password.")

        # Try logging in with new password
        login_data = {'username': self.user_data['username'], 'password': new_password}
        login_response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)

    def test_password_reset_confirm_invalid_token_or_uid(self):
        confirm_data = {'uid': 'invaliduid', 'token': 'invalidtoken', 'password': 'NewPassword123!'}
        response = self.client.post(self.password_reset_confirm_url, confirm_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], "Invalid or expired password reset link.")

    def test_password_reset_confirm_weak_new_password(self):
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user()
        user_profile = UserProfile.objects.get(user=user)
        self.client.post(self.verify_email_url, {'token': str(user_profile.email_verification_token)}, format='json')

        mail.outbox = []
        self.client.post(self.password_reset_request_url, {'email': self.user_data['email']}, format='json')
        sent_email = mail.outbox[0]
        body_parts = sent_email.body.split('/')
        uid = body_parts[-3]
        token = body_parts[-2]

        confirm_data = {'uid': uid, 'token': token, 'password': 'weak'}
        response = self.client.post(self.password_reset_confirm_url, confirm_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Password validation failed", response.data["error"])

    # --- Current User View Test ---
    def test_get_current_user_authenticated(self):
        # Register, verify, and login
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user()
        user_profile = UserProfile.objects.get(user=user)
        self.client.post(self.verify_email_url, {'token': str(user_profile.email_verification_token)}, format='json')
        login_response = self.client.post(self.login_url, self.user_data_login, format='json')
        access_token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.current_user_url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user_data['username'])
        self.assertEqual(response.data['email'], self.user_data['email'])
        self.assertTrue(response.data['is_active'])
        self.assertTrue(response.data['profile']['email_verified'])

    def test_get_current_user_unauthenticated(self):
        response = self.client.get(self.current_user_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- Token Refresh Test ---
    def test_token_refresh(self):
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user()
        user_profile = UserProfile.objects.get(user=user)
        self.client.post(self.verify_email_url, {'token': str(user_profile.email_verification_token)}, format='json')

        login_response = self.client.post(self.login_url, self.user_data_login, format='json')
        refresh_token = login_response.data['refresh']

        refresh_url = reverse('token_refresh')
        response = self.client.post(refresh_url, {'refresh': refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertNotIn('refresh', response.data) # Default behavior is not to return new refresh token unless rotated

    def test_token_refresh_invalid_token(self):
        refresh_url = reverse('token_refresh')
        response = self.client.post(refresh_url, {'refresh': 'invalidtoken'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('token_not_valid', response.data['code'])

    # --- Token Verify Test ---
    def test_token_verify_valid_token(self):
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user()
        user_profile = UserProfile.objects.get(user=user)
        self.client.post(self.verify_email_url, {'token': str(user_profile.email_verification_token)}, format='json')

        login_response = self.client.post(self.login_url, self.user_data_login, format='json')
        access_token = login_response.data['access']

        verify_url = reverse('token_verify')
        response = self.client.post(verify_url, {'token': access_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {}) # Successful verification returns empty JSON object

    def test_token_verify_invalid_token(self):
        verify_url = reverse('token_verify')
        response = self.client.post(verify_url, {'token': 'invalidtoken'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('token_not_valid', response.data['code'])

```python
# Small correction for test_user_registration_existing_username and email error checking:
# The serializer returns a list of error messages for a field.
# The actual detail might be a list of strings, or a dict if multiple fields.
# My views.py RegisterView formats them into a flat list of strings for "details".
# So, `response.data.get('details', [])[0].lower()` should work if 'details' is populated as I designed.
# Let's assume the view's error formatting is consistent.
```
