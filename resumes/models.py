from django.db import models
from django.conf import settings


class Resume(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resumes",
    )

    title = models.CharField(max_length=255)

    resume_file = models.FileField(
        upload_to="resumes/"
    )
    extracted_text = models.TextField(
    blank=True
)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
class JobDescription(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    title = models.CharField(max_length=255)

    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class AnalysisHistory(models.Model):
    ANALYSIS_TYPES = (
        ("ATS", "ATS"),
        ("AI_ANALYSIS", "AI Analysis"),
        ("JOB_MATCH", "Job Match"),
        ("COVER_LETTER", "Cover Letter"),
        ("INTERVIEW", "Interview Questions"),
        ("REWRITE", "Rewritten Resume"),
        ("UNIFIED_ANALYSIS", "Unified Analysis"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE
    )

    analysis_type = models.CharField(
        max_length=50,
        choices=ANALYSIS_TYPES
    )

    result = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.analysis_type}"

class JobApplication(models.Model):
    STATUS_CHOICES = (
        ("APPLIED", "Applied"),
        ("PHONE_SCREEN", "Phone Screen"),
        ("INTERVIEWING", "Interviewing"),
        ("OFFER", "Offer"),
        ("REJECTED", "Rejected"),
        ("ACCEPTED", "Accepted"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications"
    )
    resume = models.ForeignKey(
        Resume,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="applications"
    )
    company = models.CharField(max_length=255)
    job_title = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="APPLIED"
    )
    job_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True)
    applied_date = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.job_title} at {self.company}"

class ResumeEntry(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resume_entries"
    )
    title = models.CharField(max_length=255)
    personal_info = models.JSONField(default=dict)
    education = models.JSONField(default=list)
    experience = models.JSONField(default=list)
    skills = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} (by {self.user.username})"