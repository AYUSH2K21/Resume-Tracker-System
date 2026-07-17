from rest_framework import serializers
from .models import Resume


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