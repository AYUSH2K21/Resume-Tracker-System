from django.urls import path
from .views import ResumeUploadAPIView, ResumeListAPIView
from .views import (
    ResumeUploadAPIView,
    ResumeListAPIView,
    ResumeDetailAPIView,
)
from .views import (
    ResumeUploadAPIView,
    ResumeListAPIView,
    ResumeDetailAPIView,
    ResumeUpdateAPIView,
)
from .views import (
    ResumeUploadAPIView,
    ResumeListAPIView,
    ResumeDetailAPIView,
    ResumeUpdateAPIView,
    ResumeDeleteAPIView,
)
from .views import (
    ResumeUploadAPIView,
    ResumeListAPIView,
    ResumeDetailAPIView,
    ResumeUpdateAPIView,
    ResumeDeleteAPIView,
    ResumeATSAPIView,
)

urlpatterns = [
    path("", ResumeListAPIView.as_view(), name="resume-list"),
    path("upload/", ResumeUploadAPIView.as_view(), name="resume-upload"),
    path("<int:pk>/", ResumeDetailAPIView.as_view(), name="resume-detail"),
    path("<int:pk>/update/", ResumeUpdateAPIView.as_view(), name="resume-update"),
    path("<int:pk>/delete/", ResumeDeleteAPIView.as_view(), name="resume-delete"),
    path("<int:pk>/ats/", ResumeATSAPIView.as_view(), name="resume-ats"),
]