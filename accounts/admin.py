from django.contrib import admin
from .models import User, PasswordResetOTP

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'role', 'is_staff')
    search_fields = ('email', 'username')
    list_filter = ('role', 'is_staff')

@admin.register(PasswordResetOTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp_code', 'is_used', 'expires_at')