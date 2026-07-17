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