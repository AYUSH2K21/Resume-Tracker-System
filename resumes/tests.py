from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from resumes.models import Resume, AnalysisHistory, JobApplication
from resumes.ats import analyze_resume_fallback

User = get_user_model()


class ResumeAppTests(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(username="usera", email="usera@example.com", password="Password123!")
        self.user_b = User.objects.create_user(username="userb", email="userb@example.com", password="Password123!")

        self.resume_a = Resume.objects.create(
            user=self.user_a,
            title="User A's Resume",
            extracted_text="Experienced Python Django Developer with Master's degree and SQL skills. Contact: dev@example.com Phone: 1234567890."
        )

        self.resume_list_url = reverse("resume-list")
        self.ats_url = reverse("resume-ats", kwargs={"pk": self.resume_a.pk})
        self.dashboard_url = reverse("dashboard-stats")

    def test_user_ownership_isolation(self):
        # User B attempts to access User A's resume ATS endpoint
        self.client.force_authenticate(user=self.user_b)
        response = self.client.get(self.ats_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # User B lists resumes -> Should see 0 resumes
        list_response = self.client.get(self.resume_list_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 0)

    def test_ats_evaluation_fallback_and_json_history_storage(self):
        self.client.force_authenticate(user=self.user_a)
        
        # Test ATS check on resume with single quotes ("Master's degree")
        response = self.client.get(self.ats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("score", response.data)
        self.assertTrue(response.data["email_found"])

        # Verify history record is saved as valid JSON string
        history = AnalysisHistory.objects.filter(user=self.user_a, resume=self.resume_a).first()
        self.assertIsNotNone(history)
        
        # Verify Dashboard API reads stats without throwing JSONDecodeError
        dashboard_response = self.client.get(self.dashboard_url)
        self.assertEqual(dashboard_response.status_code, status.HTTP_200_OK)
        self.assertEqual(dashboard_response.data["total_analyses"], 1)

    def test_ats_fallback_rules(self):
        res = analyze_resume_fallback("python django html css email@test.com 9876543210 education skills experience")
        self.assertGreater(res["score"], 0)
        self.assertTrue(res["email_found"])
        self.assertTrue(res["phone_found"])
        self.assertIn("python", res["found_skills"])

    def test_job_application_crud(self):
        self.client.force_authenticate(user=self.user_a)
        app_url = reverse("application-list-create")
        
        # Create Job Application
        create_res = self.client.post(app_url, {
            "company": "Tech Corp",
            "job_title": "Senior Engineer",
            "status": "APPLIED",
            "resume": self.resume_a.id
        })
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(JobApplication.objects.filter(user=self.user_a).count(), 1)

