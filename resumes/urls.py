from django.urls import path
from .views import (
    ResumeListAPIView,
    ResumeUploadAPIView,
    ResumeDetailAPIView,
    ResumeUpdateAPIView,
    ResumeDeleteAPIView,
    ResumeATSAPIView,
    ResumeAIAPIView,
    JobDescriptionCreateAPIView,
    ResumeJobMatchAPIView,
    CoverLetterAPIView,
    InterviewQuestionsAPIView,
    ResumeRewriteAPIView,
    AnalysisHistoryAPIView,
    JobApplicationListCreateAPIView,
    JobApplicationDetailAPIView,
    ResumeEntryListCreateAPIView,
    ResumeEntryDetailAPIView,
    ResumeEntryPDFDownloadAPIView,
    DashboardStatsAPIView,
)

urlpatterns = [
    path("", ResumeListAPIView.as_view(), name="resume-list"),
    path("upload/", ResumeUploadAPIView.as_view(), name="resume-upload"),
    path("<int:pk>/", ResumeDetailAPIView.as_view(), name="resume-detail"),
    path("<int:pk>/update/", ResumeUpdateAPIView.as_view(), name="resume-update"),
    path("<int:pk>/delete/", ResumeDeleteAPIView.as_view(), name="resume-delete"),
    path("<int:pk>/ats/", ResumeATSAPIView.as_view(), name="resume-ats"),
    path("ats-check-text/", ResumeATSAPIView.as_view(), name="ats-check-text"),
    path("<int:pk>/ai/", ResumeAIAPIView.as_view(), name="resume-ai"),
    
    path("job-description/", JobDescriptionCreateAPIView.as_view(), name="job-description-create"),
    path("<int:resume_id>/match/<int:job_id>/", ResumeJobMatchAPIView.as_view(), name="resume-job-match"),
    path("<int:resume_id>/cover-letter/<int:job_id>/", CoverLetterAPIView.as_view(), name="cover-letter"),
    path("<int:resume_id>/rewrite/<int:job_id>/", ResumeRewriteAPIView.as_view(), name="resume-rewrite"),
    path("<int:resume_id>/interview-questions/<int:job_id>/", InterviewQuestionsAPIView.as_view(), name="interview-questions"),
    
    path("history/", AnalysisHistoryAPIView.as_view(), name="analysis-history"),
    
    path("applications/", JobApplicationListCreateAPIView.as_view(), name="application-list-create"),
    path("applications/<int:pk>/", JobApplicationDetailAPIView.as_view(), name="application-detail"),
    
    path("builder/", ResumeEntryListCreateAPIView.as_view(), name="resume-entry-list-create"),
    path("builder/<int:pk>/", ResumeEntryDetailAPIView.as_view(), name="resume-entry-detail"),
    path("builder/<int:pk>/download/", ResumeEntryPDFDownloadAPIView.as_view(), name="resume-entry-pdf-download"),
    
    path("dashboard-stats/", DashboardStatsAPIView.as_view(), name="dashboard-stats"),
]