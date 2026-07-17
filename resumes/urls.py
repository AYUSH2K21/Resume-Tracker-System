from django.urls import path
from .views import ResumeUploadAPIView

urlpatterns = [
    path("upload/", ResumeUploadAPIView.as_view(), name="resume-upload"),
]