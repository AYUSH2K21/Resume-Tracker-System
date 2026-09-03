from rest_framework import serializers
from .models import Resume, JobDescription, AnalysisHistory, JobApplication, ResumeEntry

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [
            "id",
            "title",
            "resume_file",
            "extracted_text",
            "uploaded_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "uploaded_at",
            "extracted_text",
            "updated_at",
        ]

class JobDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDescription
        fields = "__all__"
        read_only_fields = [
            "user",
            "created_at",
        ]

class AnalysisHistorySerializer(serializers.ModelSerializer):
    resume_title = serializers.CharField(source="resume.title", read_only=True)

    class Meta:
        model = AnalysisHistory
        fields = "__all__"

class JobApplicationSerializer(serializers.ModelSerializer):
    resume_title = serializers.CharField(source="resume.title", read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "company",
            "job_title",
            "status",
            "job_url",
            "notes",
            "resume",
            "resume_title",
            "applied_date",
            "updated_at"
        ]
        read_only_fields = ["id", "applied_date", "updated_at"]

class ResumeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeEntry
        fields = [
            "id",
            "title",
            "personal_info",
            "education",
            "experience",
            "skills",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]