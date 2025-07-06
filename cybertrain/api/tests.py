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
        self.dashboard_overview_url = reverse('dashboard-overview')
        self.course_list_url = reverse('course-list')
        self.user_enrolled_courses_url = reverse('user-enrolled-courses') # Added


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

    # --- Dashboard Overview Tests ---
    def test_dashboard_overview_authenticated(self):
        # 1. Register, verify, and login a user
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user()
        user.first_name = "Test" # Add first name for the test
        user.last_name = "User"
        user.save()

        user_profile = UserProfile.objects.get(user=user)
        self.client.post(self.verify_email_url, {'token': str(user_profile.email_verification_token)}, format='json')

        login_response = self.client.post(self.login_url, self.user_data_login, format='json')
        access_token = login_response.data['access']

        # 2. Make authenticated request to dashboard overview
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.dashboard_overview_url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check for user_name
        self.assertEqual(response.data['user_name'], user.first_name)

        # Check for top-level keys
        expected_keys = ["user_name", "stats", "enrolled_courses", "upcoming_quizzes", "recent_activity"]
        for key in expected_keys:
            self.assertIn(key, response.data)

        # Check structure of stats (since it's mocked but has a defined structure)
        self.assertIn("enrolled_courses_count", response.data["stats"])
        self.assertIn("average_progress_percentage", response.data["stats"])
        self.assertIn("certificates_earned_count", response.data["stats"])
        self.assertIn("hours_learned", response.data["stats"])

        # Check if lists are present (even if mocked, they should be lists)
        self.assertIsInstance(response.data["enrolled_courses"], list)
        self.assertIsInstance(response.data["upcoming_quizzes"], list)
        self.assertIsInstance(response.data["recent_activity"], list)

        # Check a mocked item to ensure data consistency with frontend expectations
        if response.data["enrolled_courses"]: # if not empty
            self.assertIn("title", response.data["enrolled_courses"][0])
            self.assertIn("progress_percentage", response.data["enrolled_courses"][0])

    def test_dashboard_overview_unauthenticated(self):
        response = self.client.get(self.dashboard_overview_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- Course List Tests ---
    def test_course_list_unauthenticated(self):
        response = self.client.get(self.course_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        self.assertIn('results', response.data)

        results = response.data['results']
        self.assertIsInstance(results, list)
        if results: # If there are courses in mock data
            self.assertIn('id', results[0])
            self.assertIn('title', results[0])
            self.assertIn('slug', results[0])
            self.assertIn('short_description', results[0])
            self.assertIn('image_url', results[0])
            self.assertIn('level', results[0])
            self.assertIn('duration_display', results[0])
            self.assertIn('enrolled_count', results[0])
            self.assertIn('rating_avg', results[0])
            self.assertIn('price_display', results[0])
            self.assertIn('tags', results[0])
            self.assertIn('instructor_name', results[0])
            self.assertEqual(results[0]['is_enrolled'], False) # Should be false for unauthenticated

    def test_course_list_authenticated_is_enrolled_simulation(self):
        # Register, verify, and login 'testuser'
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user()
        user_profile = UserProfile.objects.get(user=user)
        self.client.post(self.verify_email_url, {'token': str(user_profile.email_verification_token)}, format='json')
        login_response = self.client.post(self.login_url, self.user_data_login, format='json')
        access_token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        response = self.client.get(self.course_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        if results:
            # Check the mock logic: 'uuid-course-1' should be enrolled for 'testuser'
            course1 = next((c for c in results if c['id'] == 'uuid-course-1'), None)
            if course1:
                self.assertTrue(course1['is_enrolled'])

            # Other courses should not be enrolled by default by the mock logic
            course2 = next((c for c in results if c['id'] == 'uuid-course-2'), None)
            if course2:
                self.assertFalse(course2['is_enrolled'])

    def test_course_list_filter_by_level(self):
        response = self.client.get(self.course_list_url, {'level': 'Beginner'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        for course in results:
            self.assertEqual(course['level'], 'Beginner')
        # Check if count matches expected number of Beginner courses in mock data
        # MOCK_COURSES_DB has 2 Beginner courses
        self.assertEqual(response.data['count'], 2)

    def test_course_list_search(self):
        response = self.client.get(self.course_list_url, {'search': 'Network'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        for course in results:
            self.assertTrue('Network'.lower() in course['title'].lower() or 'Network'.lower() in course['short_description'].lower())
        # MOCK_COURSES_DB has 1 course with "Network" in title
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(results[0]['id'], 'uuid-course-1')

    def test_course_list_pagination(self):
        # MOCK_COURSES_DB has 6 courses, StandardResultsSetPagination page_size is 6
        response = self.client.get(self.course_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 6) # Should show all 6 on one page
        self.assertIsNone(response.data['next']) # No next page as all fit

        # If we had more courses, e.g., 7, and page_size was 3:
        # self.assertEqual(len(response.data['results']), 3)
        # self.assertIsNotNone(response.data['next'])
        # response_page2 = self.client.get(response.data['next'], format='json')
        # self.assertEqual(len(response_page2.data['results']), 3)
        # ...and so on. Current mock data fits on one page.

    # --- User Enrolled Courses Tests ---
    def test_user_enrolled_courses_unauthenticated(self):
        response = self.client.get(self.user_enrolled_courses_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_enrolled_courses_authenticated_testuser(self):
        # Register, verify, and login 'testuser'
        self.client.post(self.register_url, self.user_data, format='json')
        user = get_latest_user() # This is 'testuser'
        user_profile = UserProfile.objects.get(user=user)
        self.client.post(self.verify_email_url, {'token': str(user_profile.email_verification_token)}, format='json')
        login_response = self.client.post(self.login_url, self.user_data_login, format='json')
        access_token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        response = self.client.get(self.user_enrolled_courses_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check overall structure
        self.assertIn('summary_stats', response.data)
        self.assertIn('pagination', response.data)
        self.assertIn('results', response.data)

        # Check summary_stats for 'testuser' (from MOCK_USER_ENROLLED_COURSES_STATS)
        expected_stats = {
            "total_enrolled_courses": 2,
            "average_progress_percentage": 87, # int((75 + 100) / 2)
            "total_hours_learned": 18
        }
        self.assertEqual(response.data['summary_stats'], expected_stats)

        # Check pagination for 'testuser' (has 2 mocked enrolled courses)
        self.assertEqual(response.data['pagination']['count'], 2)
        self.assertEqual(len(response.data['results']), 2) # All fit on one page

        # Check structure of one result item
        if response.data['results']:
            first_enrolled_course = response.data['results'][0]
            self.assertEqual(first_enrolled_course['course_id'], 'uuid-course-1')
            self.assertEqual(first_enrolled_course['title'], 'Network Security Fundamentals')
            self.assertEqual(first_enrolled_course['progress_percentage'], 75)
            self.assertEqual(first_enrolled_course['status'], 'In Progress')

    def test_user_enrolled_courses_authenticated_anotheruser(self):
        # Create and login 'anotheruser'
        another_user_data = {'username': 'anotheruser', 'email': 'another@example.com', 'password': 'Password123!'}
        # Simplified registration: directly create and activate user for this test
        user = User.objects.create_user(
            username=another_user_data['username'],
            email=another_user_data['email'],
            password=another_user_data['password'],
            is_active=True # Activate directly for simplicity in this test
        )
        # UserProfile.objects.get_or_create(user=user) # Ensure profile exists

        login_response = self.client.post(self.login_url, {'username': 'anotheruser', 'password': 'Password123!'}, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK, login_response.data) # Check if login successful
        access_token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        response = self.client.get(self.user_enrolled_courses_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        expected_stats = { # From MOCK_USER_ENROLLED_COURSES_STATS for 'anotheruser'
            "total_enrolled_courses": 1,
            "average_progress_percentage": 10,
            "total_hours_learned": 2
        }
        self.assertEqual(response.data['summary_stats'], expected_stats)
        self.assertEqual(response.data['pagination']['count'], 1)
        self.assertEqual(len(response.data['results']), 1)
        if response.data['results']:
            self.assertEqual(response.data['results'][0]['course_id'], 'uuid-course-2') # Enrolled in Ethical Hacking

    def test_user_enrolled_courses_authenticated_no_mock_data_user(self):
        # Create and login a user not in MOCK_USER_ENROLLED_COURSES_DB
        new_user_data = {'username': 'newuser', 'email': 'new@example.com', 'password': 'Password123!'}
        user = User.objects.create_user(
            username=new_user_data['username'],
            email=new_user_data['email'],
            password=new_user_data['password'],
            is_active=True
        )
        # UserProfile.objects.get_or_create(user=user)

        login_response = self.client.post(self.login_url, {'username': 'newuser', 'password': 'Password123!'}, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        access_token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        response = self.client.get(self.user_enrolled_courses_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        expected_stats = { # Default stats if user not in mock
            "total_enrolled_courses": 0,
            "average_progress_percentage": 0,
            "total_hours_learned": 0
        }
        self.assertEqual(response.data['summary_stats'], expected_stats)
        self.assertEqual(response.data['pagination']['count'], 0)
        self.assertEqual(len(response.data['results']), 0)

```python
# Small correction for test_user_registration_existing_username and email error checking:
# The serializer returns a list of error messages for a field.
# The actual detail might be a list of strings, or a dict if multiple fields.
# My views.py RegisterView formats them into a flat list of strings for "details".
# So, `response.data.get('details', [])[0].lower()` should work if 'details' is populated as I designed.
# Let's assume the view's error formatting is consistent.
```
