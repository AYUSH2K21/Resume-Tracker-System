from rest_framework import request, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Resume
from .serializers import ResumeSerializer
from rest_framework.generics import ListAPIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.generics import RetrieveAPIView, UpdateAPIView
from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView,
)
from .parser import extract_text_from_pdf
from rest_framework.generics import RetrieveAPIView
from .ats import analyze_resume

class ResumeUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ResumeSerializer(data=request.data)

        if serializer.is_valid(): 
         resume = serializer.save(user=request.user)

        text = extract_text_from_pdf(resume.resume_file.path)

        resume.extracted_text = text
        resume.save()
        return Response(
                {
                    "message": "Resume uploaded successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ResumeListAPIView(ListAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).order_by("-uploaded_at")

class ResumeDetailAPIView(RetrieveAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)
    
class ResumeUpdateAPIView(UpdateAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

class ResumeDeleteAPIView(DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)
class ResumeATSAPIView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
        except Resume.DoesNotExist:
            return Response(
                {"error": "Resume not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        result = analyze_resume(resume.extracted_text)

        return Response(result, status=status.HTTP_200_OK)