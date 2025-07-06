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
from rest_framework.pagination import PageNumberPagination

from .serializers import RegisterSerializer, UserSerializer, CourseSerializer, EnrolledCourseSerializer # Added EnrolledCourseSerializer
from .models import UserProfile

# --- Mock Data Store ---
# This would normally come from the database via models
MOCK_COURSES_DB = [
    {
        "id": "uuid-course-1",
        "title": "Network Security Fundamentals",
        "slug": "network-security-fundamentals",
        "short_description": "Learn the basics of network security, including firewalls, VPNs, and IDS.",
        "image_url": "/images/course-network-security.jpg", # Adjusted path
        "level": "Beginner",
        "duration_display": "8 weeks",
        "enrolled_count": 1247,
        "rating_avg": 4.8,
        "price_display": "$199",
        "price_cents": 19900,
        "currency": "USD",
        "tags": ["Networking", "Security", "Firewalls"],
        "instructor_name": "Dr. Alice Secure",
        "is_enrolled": False
    },
    {
        "id": "uuid-course-2",
        "title": "Ethical Hacking & Penetration Testing",
        "slug": "ethical-hacking-penetration-testing",
        "short_description": "Master ethical hacking techniques and learn how to conduct professional penetration tests.",
        "image_url": "/images/course-ethical-hacking.jpg", # Adjusted path
        "level": "Advanced",
        "duration_display": "12 weeks",
        "enrolled_count": 892,
        "rating_avg": 4.9,
        "price_display": "$299",
        "price_cents": 29900,
        "currency": "USD",
        "tags": ["Ethical Hacking", "Pentesting", "Offensive Security"],
        "instructor_name": "Mr. Bob Exploit",
        "is_enrolled": False
    },
    {
        "id": "uuid-course-3",
        "title": "Cybersecurity Awareness Training",
        "slug": "cybersecurity-awareness-training",
        "short_description": "Essential cybersecurity awareness for employees and teams to prevent common attacks.",
        "image_url": "/images/course-awareness.jpg", # Adjusted path
        "level": "Beginner",
        "duration_display": "4 weeks",
        "enrolled_count": 2156,
        "rating_avg": 4.7,
        "price_display": "$99",
        "price_cents": 9900,
        "currency": "USD",
        "tags": ["Awareness", "Phishing", "Social Engineering"],
        "instructor_name": "Ms. Carol Vigilant",
        "is_enrolled": False
    },
    {
        "id": "uuid-course-4",
        "title": "Advanced Threat Detection",
        "slug": "advanced-threat-detection",
        "short_description": "Learn advanced techniques for detecting and responding to sophisticated cyber threats.",
        "image_url": "/images/course-network-security.jpg", # Reusing image for mock, adjusted path
        "level": "Intermediate",
        "enrolled_count": 567,
        "rating_avg": 4.6,
        "price_display": "$249",
        "price_cents": 24900,
        "currency": "USD",
        "tags": ["Threat Hunting", "SIEM", "Intrusion Analysis"],
        "instructor_name": "Dr. Alice Secure",
        "is_enrolled": False
    },
    {
        "id": "uuid-course-5",
        "title": "Incident Response & Forensics",
        "slug": "incident-response-forensics",
        "short_description": "Master incident response procedures and digital forensics techniques.",
        "image_url": "/images/course-ethical-hacking.jpg", # Reusing image for mock, adjusted path
        "level": "Advanced",
        "duration_display": "14 weeks",
        "enrolled_count": 334,
        "rating_avg": 4.8,
        "price_display": "$349",
        "price_cents": 34900,
        "currency": "USD",
        "tags": ["Incident Response", "Digital Forensics", "Malware Analysis"],
        "instructor_name": "Mr. Bob Exploit",
        "is_enrolled": False
    },
    {
        "id": "uuid-course-6",
        "title": "Cloud Security Essentials",
        "slug": "cloud-security-essentials",
        "short_description": "Learn how to secure cloud environments and implement best practices for cloud security.",
        "image_url": "/images/course-awareness.jpg", # Reusing image for mock, adjusted path
        "level": "Intermediate",
        "duration_display": "6 weeks",
        "enrolled_count": 723,
        "rating_avg": 4.5,
        "price_display": "$179",
        "price_cents": 17900,
        "currency": "USD",
        "tags": ["Cloud Security", "AWS", "Azure", "GCP"],
        "instructor_name": "Ms. Carol Vigilant",
        "is_enrolled": False
    }
]
# --- End Mock Data Store ---


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


class DashboardOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        user_name = user.first_name if user.first_name else user.username # Prefer first name

        # Placeholder data - to be replaced with real data when models are implemented
        dashboard_data = {
            "user_name": user_name,
            "stats": {
                "enrolled_courses_count": 3,
                "average_progress_percentage": 68,
                "certificates_earned_count": 1,
                "hours_learned": 24.5
            },
            "enrolled_courses": [
                {
                    "id": "course_mock_1",
                    "title": "Network Security Fundamentals",
                    "progress_percentage": 75,
                    "next_lesson": {
                        "title": "Firewall Configuration",
                        "id": "lesson_mock_abc"
                    },
                    "time_left_estimate": "2 hours"
                },
                {
                    "id": "course_mock_2",
                    "title": "Ethical Hacking & Penetration Testing",
                    "progress_percentage": 30,
                    "next_lesson": {
                        "title": "SQL Injection Techniques",
                        "id": "lesson_mock_def"
                    },
                    "time_left_estimate": "8 hours"
                },
                {
                    "id": "course_mock_3",
                    "title": "Cybersecurity Awareness Training",
                    "progress_percentage": 100,
                    "next_lesson": None,
                    "time_left_estimate": "Complete"
                }
            ],
            "upcoming_quizzes": [
                {
                    "id": "quiz_mock_1",
                    "course_title": "Network Security Fundamentals",
                    "course_id": "course_mock_1",
                    "due_date": "2024-08-15T23:59:59Z", # Example future date
                    "questions_count": 15,
                    "quiz_url": f"/courses/course_mock_1/quizzes/quiz_mock_1/start"
                },
                {
                    "id": "quiz_mock_2",
                    "course_title": "Incident Response & Forensics",
                    "course_id": "course_mock_4",
                    "due_date": "2024-08-18T23:59:59Z", # Example future date
                    "questions_count": 20,
                    "quiz_url": f"/courses/course_mock_4/quizzes/quiz_mock_2/start"
                }
            ],
            "recent_activity": [
                {
                    "id": "activity_mock_1",
                    "type": "lesson_completed",
                    "description": "Completed \"Introduction to Cryptography\"",
                    "timestamp": "2024-07-28T10:30:00Z",
                    "related_item": {
                        "type": "lesson",
                        "id": "lesson_mock_crypto_intro",
                        "title": "Introduction to Cryptography"
                    }
                },
                {
                    "id": "activity_mock_2",
                    "type": "certificate_earned",
                    "description": "Earned \"Ethical Hacking Essentials\" Certificate",
                    "timestamp": "2024-07-27T15:00:00Z",
                    "related_item": {
                        "type": "certificate",
                        "id": "cert_mock_ethics",
                        "title": "Ethical Hacking Essentials"
                    }
                },
                {
                    "id": "activity_mock_3",
                    "type": "course_enrollment",
                    "description": "Started \"Cloud Security Basics\"",
                    "timestamp": "2024-07-25T09:00:00Z",
                    "related_item": {
                        "type": "course",
                        "id": "course_mock_cloud",
                        "title": "Cloud Security Basics"
                    }
                }
            ]
        }
        return Response(dashboard_data, status=status.HTTP_200_OK)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 6 # Number of items per page
    page_size_query_param = 'page_size'
    max_page_size = 100


class CourseListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny] # Courses can be viewed by anyone
    serializer_class = CourseSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # In a real scenario, this would be: return Course.objects.filter(is_published=True)
        # For now, return the mocked data

        # Basic filtering example (can be expanded)
        queryset = MOCK_COURSES_DB
        level_filter = self.request.query_params.get('level')
        search_query = self.request.query_params.get('search')

        if level_filter and level_filter != "All":
            queryset = [course for course in queryset if course['level'] == level_filter]

        if search_query:
            queryset = [
                course for course in queryset
                if search_query.lower() in course['title'].lower() or \
                   search_query.lower() in course['short_description'].lower()
            ]

        # Simulate is_enrolled for authenticated users (very basic example)
        # In a real app, this would involve checking Enrollment model
        user = self.request.user
        if user.is_authenticated:
            # Example: Mark first course as enrolled if user is 'testuser'
            # This is highly simplified and just for demonstration with mock data.
            for course in queryset:
                if user.username == 'testuser' and course['id'] == 'uuid-course-1':
                    course['is_enrolled'] = True
                else:
                    course['is_enrolled'] = False # Default for others or if not 'testuser'
        else:
            for course in queryset:
                course['is_enrolled'] = False

        return queryset

    # Override list to handle pagination structure if not using Django models directly
    # For ListAPIView with a simple list, it should paginate correctly.
    # If get_queryset returns a list, DRF's pagination should handle it.
    # The default list method will call self.get_queryset(), then self.paginate_queryset(),
    # then self.get_serializer(), and finally return self.get_paginated_response().

# Example for a single course (not implemented in this step, but for context)
# class CourseDetailView(generics.RetrieveAPIView):
#     permission_classes = [permissions.AllowAny]
#     serializer_class = CourseSerializer
#     lookup_field = 'slug' # or 'id'
#
#     def get_queryset(self):
#         # return Course.objects.filter(is_published=True)
#         return MOCK_COURSES_DB # simplified for mock
#
#     def get_object(self):
#         queryset = self.get_queryset()
#         lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
#         filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
#
#         obj = next((course for course in queryset if course.get(self.lookup_field) == filter_kwargs.get(self.lookup_field)), None)
#
#         if not obj:
#             raise Http404("Course not found")
#         self.check_object_permissions(self.request, obj) # Not strictly needed for AllowAny
#         return obj


MOCK_USER_ENROLLED_COURSES_DB = {
    "testuser": [ # Assuming a user with username 'testuser'
        {
            "course_id": "uuid-course-1",
            "enrollment_id": "enroll-A",
            "title": "Network Security Fundamentals",
            "slug": "network-security-fundamentals",
            "short_description": "Your current focus for foundational network knowledge.",
            "image_url": "/images/course-network-security.jpg",
            "instructor_name": "Dr. Alice Secure",
            "progress_percentage": 75,
            "total_lessons_count": 20,
            "completed_lessons_count": 15,
            "next_lesson_title": "Firewall Configuration",
            "next_lesson_slug": "firewall-configuration",
            "status": "In Progress",
            "user_time_spent_display": "12 hours",
            "estimated_time_remaining_display": "4 hours remaining",
            "course_player_url": "/courses/network-security-fundamentals/player/firewall-configuration",
            "course_details_url": "/courses/network-security-fundamentals/",
            "certificate_url": None,
            "review_course_url": "/courses/network-security-fundamentals/review"
        },
        {
            "course_id": "uuid-course-3",
            "enrollment_id": "enroll-C",
            "title": "Cybersecurity Awareness Training",
            "slug": "cybersecurity-awareness-training",
            "short_description": "Great job completing this essential training!",
            "image_url": "/images/course-awareness.jpg",
            "instructor_name": "Ms. Carol Vigilant",
            "progress_percentage": 100,
            "total_lessons_count": 12,
            "completed_lessons_count": 12,
            "next_lesson_title": "Course Completed!",
            "next_lesson_slug": None,
            "status": "Completed",
            "user_time_spent_display": "6 hours",
            "estimated_time_remaining_display": "Certificate earned",
            "course_player_url": "/courses/cybersecurity-awareness-training/player/",
            "course_details_url": "/courses/cybersecurity-awareness-training/",
            "certificate_url": "/users/me/certificates/cert-awareness-123/",
            "review_course_url": "/courses/cybersecurity-awareness-training/review"
        }
    ],
    "anotheruser": [ # Example for a different user
         {
            "course_id": "uuid-course-2",
            "enrollment_id": "enroll-B",
            "title": "Ethical Hacking & Penetration Testing",
            "slug": "ethical-hacking-penetration-testing",
            "short_description": "Dive deep into ethical hacking.",
            "image_url": "/images/course-ethical-hacking.jpg",
            "instructor_name": "Mr. Bob Exploit",
            "progress_percentage": 10,
            "total_lessons_count": 25,
            "completed_lessons_count": 2, # Corrected from 8 to be < total
            "next_lesson_title": "Reconnaissance Techniques",
            "next_lesson_slug": "reconnaissance-techniques",
            "status": "In Progress",
            "user_time_spent_display": "2 hours",
            "estimated_time_remaining_display": "23 hours remaining",
            "course_player_url": "/courses/ethical-hacking-penetration-testing/player/reconnaissance-techniques",
            "course_details_url": "/courses/ethical-hacking-penetration-testing/",
            "certificate_url": None,
            "review_course_url": "/courses/ethical-hacking-penetration-testing/review"
        }
    ]
}

MOCK_USER_ENROLLED_COURSES_STATS = {
    "testuser": {
        "total_enrolled_courses": 2,
        "average_progress_percentage": int((75 + 100) / 2), # (75+100)/2 = 87.5 -> 87
        "total_hours_learned": 12 + 6 # 18
    },
    "anotheruser": {
        "total_enrolled_courses": 1,
        "average_progress_percentage": 10,
        "total_hours_learned": 2
    }
}


class UserEnrolledCoursesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination # Use the same pagination class for consistency

    def get(self, request, *args, **kwargs):
        user = request.user

        # Get mocked enrolled courses for the current user, default to empty list if user not in mock
        user_enrolled_courses = MOCK_USER_ENROLLED_COURSES_DB.get(user.username, [])

        # Get mocked summary stats for the current user
        user_summary_stats = MOCK_USER_ENROLLED_COURSES_STATS.get(user.username, {
            "total_enrolled_courses": 0,
            "average_progress_percentage": 0,
            "total_hours_learned": 0
        })

        # Paginate the list of courses
        paginator = self.pagination_class()
        paginated_courses = paginator.paginate_queryset(user_enrolled_courses, request, view=self)

        # Serialize the paginated courses
        serializer = EnrolledCourseSerializer(paginated_courses, many=True)

        # Construct the final response
        # paginator.get_paginated_response(serializer.data) gives {count, next, previous, results}
        # We need to add our summary_stats to this.

        paginated_response_data = {
            'count': paginator.page.paginator.count,
            'next': paginator.get_next_link(),
            'previous': paginator.get_previous_link(),
            'results': serializer.data
        }

        return Response({
            "summary_stats": user_summary_stats,
            "pagination": { # Manually constructing pagination details for the custom structure
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "page_size": paginator.page_size,
                "current_page": paginator.page.number,
                "total_pages": paginator.page.paginator.num_pages
            },
            "results": serializer.data # This is what the frontend expects as 'results'
        }, status=status.HTTP_200_OK)
