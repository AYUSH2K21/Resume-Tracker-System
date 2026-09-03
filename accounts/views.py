import random
import datetime
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, PasswordResetOTP
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
)

class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully."},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "message": "Login successful.",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "phone_number": user.phone_number,
            "profile_picture": user.profile_picture.url if user.profile_picture else None
        })

    def patch(self, request):
        user = request.user
        if 'username' in request.data:
            user.username = request.data['username']
        if 'phone_number' in request.data:
            user.phone_number = request.data['phone_number']
        if 'profile_picture' in request.FILES:
            user.profile_picture = request.FILES['profile_picture']
        
        user.save()
        return Response({"message": "Profile updated successfully."}, status=status.HTTP_200_OK)

class SendOTPAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()

        if user:
            PasswordResetOTP.objects.filter(user=user, is_used=False).update(is_used=True)
            otp_code = f"{random.randint(100000, 999999)}"
            expires_at = timezone.now() + datetime.timedelta(minutes=10)

            PasswordResetOTP.objects.create(
                user=user,
                otp_code=otp_code,
                expires_at=expires_at,
            )

            subject = "ResumeTracker - Password Reset OTP Code"
            message = f"Hello {user.username},\n\nYour password reset verification code is:\n\n{otp_code}\n\nThis code will expire in 10 minutes. If you did not request a password reset, please ignore this email."
            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "webmaster@localhost")

            try:
                send_mail(
                    subject,
                    message,
                    from_email,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Failed to send OTP email: {e}")

        return Response(
            {"message": "If an account exists with this email, a verification code has been sent."},
            status=status.HTTP_200_OK,
        )

class VerifyOTPAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        otp_input = serializer.validated_data["otp"]

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({"error": "Invalid OTP code or email."}, status=status.HTTP_400_BAD_REQUEST)

        latest_otp = PasswordResetOTP.objects.filter(user=user, is_used=False).order_by("-created_at").first()

        if not latest_otp:
            return Response({"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)

        if latest_otp.expires_at < timezone.now():
            return Response({"error": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        if latest_otp.attempts >= 5:
            return Response({"error": "Too many attempts. Please request a new OTP."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        latest_otp.attempts += 1
        latest_otp.save()

        if latest_otp.otp_code != otp_input:
            return Response({"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "OTP verified successfully."}, status=status.HTTP_200_OK)

class ResetPasswordAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        otp_input = serializer.validated_data["otp"]
        new_password = serializer.validated_data["new_password"]

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({"error": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST)

        latest_otp = PasswordResetOTP.objects.filter(user=user, is_used=False).order_by("-created_at").first()

        if not latest_otp or latest_otp.otp_code != otp_input:
            return Response({"error": "Invalid or expired OTP code."}, status=status.HTTP_400_BAD_REQUEST)

        if latest_otp.expires_at < timezone.now():
            return Response({"error": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        latest_otp.is_used = True
        latest_otp.save()

        return Response(
            {"message": "Your password has been reset successfully."},
            status=status.HTTP_200_OK,
        )