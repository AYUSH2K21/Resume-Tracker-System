from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.profile_url = reverse("profile")
        self.token_refresh_url = reverse("token_refresh")

        self.user_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "Password123!",
            "role": "candidate",
            "phone_number": "1234567890",
        }

    def test_user_registration_success(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="testuser").exists())

    def test_admin_role_self_assignment_blocked(self):
        admin_data = self.user_data.copy()
        admin_data["username"] = "fakeadmin"
        admin_data["email"] = "fakeadmin@example.com"
        admin_data["role"] = "admin"

        response = self.client.post(self.register_url, admin_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="fakeadmin")
        self.assertEqual(user.role, User.Role.CANDIDATE)

    def test_user_login_and_jwt_refresh(self):
        User.objects.create_user(
            username=self.user_data["username"],
            email=self.user_data["email"],
            password=self.user_data["password"],
        )

        login_payload = {
            "email": self.user_data["email"],
            "password": self.user_data["password"],
        }
        response = self.client.post(self.login_url, login_payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        access_token = response.data["access"]
        refresh_token = response.data["refresh"]

        # Test profile with JWT token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        profile_response = self.client.get(self.profile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data["username"], "testuser")

        # Test Token Refresh endpoint
        self.client.credentials()  # clear header
        refresh_response = self.client.post(self.token_refresh_url, {"refresh": refresh_token})
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_response.data)

    def test_unauthenticated_profile_access_denied(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

