from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterAPIView,
    LoginAPIView,
    ProfileAPIView,
    SendOTPAPIView,
    VerifyOTPAPIView,
    ResetPasswordAPIView,
)

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("profile/", ProfileAPIView.as_view(), name="profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("send-otp/", SendOTPAPIView.as_view(), name="send_otp"),
    path("verify-otp/", VerifyOTPAPIView.as_view(), name="verify_otp"),
    path("reset-password/", ResetPasswordAPIView.as_view(), name="reset_password"),
]