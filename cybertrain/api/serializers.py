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


class CourseSerializer(serializers.Serializer):
    # Based on the API design for GET /api/courses/
    id = serializers.CharField(read_only=True) # Using CharField for UUID or int PK for mocked data
    title = serializers.CharField(max_length=255)
    slug = serializers.SlugField(max_length=255)
    short_description = serializers.CharField()
    image_url = serializers.URLField(max_length=1024, allow_blank=True, required=False)
    level = serializers.ChoiceField(choices=['Beginner', 'Intermediate', 'Advanced', 'All Levels']) # 'All Levels' can be a choice
    duration_display = serializers.CharField(max_length=100)
    enrolled_count = serializers.IntegerField(default=0)
    rating_avg = serializers.FloatField(default=0.0)
    price_display = serializers.CharField(max_length=50)
    price_cents = serializers.IntegerField(default=0)
    currency = serializers.CharField(max_length=3, default='USD')
    tags = serializers.ListField(child=serializers.CharField(max_length=50), required=False, default=list)
    instructor_name = serializers.CharField(max_length=255, allow_blank=True, required=False)
    is_enrolled = serializers.BooleanField(default=False)

    # Note: When using a real model, many of these would be derived from model fields directly
    # class Meta:
    #     model = Course # Replace with actual Course model
    #     fields = [
    #         'id', 'title', 'slug', 'short_description', 'image_url', 'level',
    #         'duration_display', 'enrolled_count', 'rating_avg', 'price_display',
    #         'price_cents', 'currency', 'tags', 'instructor_name', 'is_enrolled'
    #     ]
    #     # read_only_fields could include fields like 'enrolled_count', 'rating_avg' if calculated
    #     # For tags, if it's a ManyToManyField, you might use SlugRelatedField or similar.


class EnrolledCourseSerializer(serializers.Serializer):
    course_id = serializers.CharField() # Could be UUID or int
    enrollment_id = serializers.CharField() # Could be UUID or int
    title = serializers.CharField(max_length=255)
    slug = serializers.SlugField(max_length=255)
    short_description = serializers.CharField(required=False, allow_blank=True)
    image_url = serializers.URLField(max_length=1024, allow_blank=True, required=False)
    instructor_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    progress_percentage = serializers.IntegerField(min_value=0, max_value=100)
    total_lessons_count = serializers.IntegerField(min_value=0)
    completed_lessons_count = serializers.IntegerField(min_value=0)
    next_lesson_title = serializers.CharField(max_length=255, allow_blank=True, required=False, allow_null=True)
    next_lesson_slug = serializers.SlugField(max_length=255, allow_blank=True, required=False, allow_null=True)
    status = serializers.ChoiceField(choices=['Not Started', 'In Progress', 'Completed'])
    user_time_spent_display = serializers.CharField(max_length=100, required=False, allow_blank=True)
    estimated_time_remaining_display = serializers.CharField(max_length=100, required=False, allow_blank=True)
    course_player_url = serializers.CharField(max_length=2048, required=False, allow_blank=True) # URLField might be too strict for relative paths
    course_details_url = serializers.CharField(max_length=2048, required=False, allow_blank=True)
    certificate_url = serializers.CharField(max_length=2048, allow_blank=True, required=False, allow_null=True)
    review_course_url = serializers.CharField(max_length=2048, allow_blank=True, required=False, allow_null=True)

    def validate_completed_lessons_count(self, value):
        # Example validation: completed lessons cannot exceed total lessons
        # This requires access to total_lessons_count, possible via initial_data if this is a write serializer
        # For a read-serializer based on direct dict data, this type of validation is less common here
        # and more about ensuring the data source is correct.
        # For now, this is mostly for structure definition.
        # if 'total_lessons_count' in self.initial_data and value > self.initial_data['total_lessons_count']:
        #     raise serializers.ValidationError("Completed lessons cannot exceed total lessons.")
        return value
