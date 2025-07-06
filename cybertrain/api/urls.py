from django.urls import path
from .views import (
    RegisterView,
    CurrentUserView,
    EmailVerificationView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    DashboardOverviewView,
    CourseListView,
    UserEnrolledCoursesView,
    PasswordChangeView  # Added
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/user/', CurrentUserView.as_view(), name='auth-current-user'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'), # Good to have for frontend
    path('auth/verify-email/', EmailVerificationView.as_view(), name='auth-verify-email'),
    path('auth/password-reset/request/', PasswordResetRequestView.as_view(), name='auth-password-reset-request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='auth-password-reset-confirm'),
    # Dashboard URLs
    path('dashboard/overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    # Course URLs
    path('courses/', CourseListView.as_view(), name='course-list'),
    # User-specific URLs (e.g., for "My Courses")
    path('users/me/enrolled-courses/', UserEnrolledCoursesView.as_view(), name='user-enrolled-courses'),
    # Auth-related settings
    path('auth/password/change/', PasswordChangeView.as_view(), name='auth-password-change'),
]
