import json
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView
from django.db.models import Q
from .models import Resume, JobDescription, AnalysisHistory, JobApplication, ResumeEntry
from .serializers import (
    ResumeSerializer, JobDescriptionSerializer, AnalysisHistorySerializer, 
    JobApplicationSerializer, ResumeEntrySerializer
)
from .parser import extract_text_from_pdf
from .ats import analyze_resume
from .ai_service import (
    analyze_resume_with_ai, match_resume_with_job, 
    generate_cover_letter, generate_interview_questions,
    rewrite_resume_with_ai
)

class ResumeUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ResumeSerializer(data=request.data)
        if serializer.is_valid(): 
            try:
                resume = serializer.save(user=request.user)
                text = extract_text_from_pdf(resume.resume_file.path)
                resume.extracted_text = text
                resume.save()
                return Response({"message": "Resume uploaded successfully.", "data": serializer.data}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": f"Failed to process upload: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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

class ResumeATSAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
            result = analyze_resume(resume.extracted_text)
            AnalysisHistory.objects.create(user=request.user, resume=resume, analysis_type="ATS", result=json.dumps(result))
            return Response(result, status=status.HTTP_200_OK)
        except Resume.DoesNotExist:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"ATS check failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, pk=None):
        text = request.data.get("text", "")
        if not text:
            return Response({"error": "No text provided."}, status=status.HTTP_400_BAD_REQUEST)
        result = analyze_resume(text)
        return Response(result, status=status.HTTP_200_OK)

class ResumeAIAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
            result = analyze_resume_with_ai(resume.extracted_text)
            if result.startswith("Error:"):
                return Response({"error": result}, status=status.HTTP_502_BAD_GATEWAY)
            AnalysisHistory.objects.create(user=request.user, resume=resume, analysis_type="AI_ANALYSIS", result=result)
            return Response({"analysis": result}, status=status.HTTP_200_OK)
        except Resume.DoesNotExist:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"AI review failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class JobDescriptionCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = JobDescriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "Job Description saved.", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResumeJobMatchAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, resume_id, job_id):
        try:
            resume = Resume.objects.get(pk=resume_id, user=request.user)
            job = JobDescription.objects.get(pk=job_id, user=request.user)
            result = match_resume_with_job(resume.extracted_text, job.description)
            if result.startswith("Error:"):
                return Response({"error": result}, status=status.HTTP_502_BAD_GATEWAY)
            AnalysisHistory.objects.create(
                user=request.user,
                resume=resume,
                analysis_type="JOB_MATCH",
                result=result
            )
            return Response({"match": result}, status=status.HTTP_200_OK)
        except (Resume.DoesNotExist, JobDescription.DoesNotExist):
            return Response({"error": "Resume or Job Description not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Job matching failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CoverLetterAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, resume_id, job_id):
        try:
            resume = Resume.objects.get(pk=resume_id, user=request.user)
            job = JobDescription.objects.get(pk=job_id, user=request.user)
            result = generate_cover_letter(resume.extracted_text, job.description)
            if result.startswith("Error:"):
                return Response({"error": result}, status=status.HTTP_502_BAD_GATEWAY)
            AnalysisHistory.objects.create(
                user=request.user,
                resume=resume,
                analysis_type="COVER_LETTER",
                result=result
            )
            return Response({"cover_letter": result}, status=status.HTTP_200_OK)
        except (Resume.DoesNotExist, JobDescription.DoesNotExist):
            return Response({"error": "Resume or Job Description not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Cover letter generation failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InterviewQuestionsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, resume_id, job_id):
        try:
            resume = Resume.objects.get(pk=resume_id, user=request.user)
            job = JobDescription.objects.get(pk=job_id, user=request.user)
            result = generate_interview_questions(resume.extracted_text, job.description)
            if result.startswith("Error:"):
                return Response({"error": result}, status=status.HTTP_502_BAD_GATEWAY)
            AnalysisHistory.objects.create(
                user=request.user,
                resume=resume,
                analysis_type="INTERVIEW",
                result=result
            )
            return Response({"interview_questions": result}, status=status.HTTP_200_OK)
        except (Resume.DoesNotExist, JobDescription.DoesNotExist):
            return Response({"error": "Resume or Job Description not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Interview questions generation failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResumeRewriteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id, job_id):
        try:
            resume = Resume.objects.get(pk=resume_id, user=request.user)
            job = JobDescription.objects.get(pk=job_id, user=request.user)
            result = rewrite_resume_with_ai(resume.extracted_text, job.description)
            if result.startswith("Error:"):
                return Response({"error": result}, status=status.HTTP_502_BAD_GATEWAY)
            AnalysisHistory.objects.create(
                user=request.user,
                resume=resume,
                analysis_type="REWRITE",
                result=result
            )
            return Response({"rewritten_resume": result}, status=status.HTTP_200_OK)
        except (Resume.DoesNotExist, JobDescription.DoesNotExist):
            return Response({"error": "Resume or Job Description not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Resume optimization failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AnalysisHistoryAPIView(ListAPIView):
    serializer_class = AnalysisHistorySerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return AnalysisHistory.objects.filter(user=self.request.user).order_by("-created_at")

class JobApplicationListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        applications = JobApplication.objects.filter(user=request.user).order_by("-applied_date", "-id")
        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = JobApplicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobApplicationDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get_object(self, pk, user):
        try:
            return JobApplication.objects.get(pk=pk, user=user)
        except JobApplication.DoesNotExist:
            return None

    def get(self, request, pk):
        application = self.get_object(pk, request.user)
        if not application:
            return Response({"error": "Job Application not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = JobApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        application = self.get_object(pk, request.user)
        if not application:
            return Response({"error": "Job Application not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = JobApplicationSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        application = self.get_object(pk, request.user)
        if not application:
            return Response({"error": "Job Application not found."}, status=status.HTTP_404_NOT_FOUND)
        application.delete()
        return Response({"message": "Job Application deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class ResumeEntryListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        entries = ResumeEntry.objects.filter(user=request.user).order_by("-updated_at")
        serializer = ResumeEntrySerializer(entries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ResumeEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResumeEntryDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return ResumeEntry.objects.get(pk=pk, user=user)
        except ResumeEntry.DoesNotExist:
            return None

    def get(self, request, pk):
        entry = self.get_object(pk, request.user)
        if not entry:
            return Response({"error": "Resume Entry not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ResumeEntrySerializer(entry)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        entry = self.get_object(pk, request.user)
        if not entry:
            return Response({"error": "Resume Entry not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ResumeEntrySerializer(entry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        entry = self.get_object(pk, request.user)
        if not entry:
            return Response({"error": "Resume Entry not found."}, status=status.HTTP_404_NOT_FOUND)
        entry.delete()
        return Response({"message": "Resume Entry deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

import io
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class ResumeEntryPDFDownloadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            entry = ResumeEntry.objects.get(pk=pk, user=request.user)
        except ResumeEntry.DoesNotExist:
            return Response({"error": "Resume Entry not found."}, status=status.HTTP_404_NOT_FOUND)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=54,
            leftMargin=54,
            topMargin=54,
            bottomMargin=54
        )

        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'NameTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#1e293b"),
            alignment=1
        )
        
        contact_style = ParagraphStyle(
            'ContactInfo',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=12,
            textColor=colors.HexColor("#475569"),
            alignment=1
        )

        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#0d9488"),
            spaceBefore=14,
            spaceAfter=6
        )

        body_bold = ParagraphStyle(
            'BodyBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#334155")
        )

        body_text = ParagraphStyle(
            'BodyText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor("#334155")
        )

        italic_text = ParagraphStyle(
            'ItalicText',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=9.5,
            leading=12,
            textColor=colors.HexColor("#475569")
        )

        story = []

        # 1. Personal Info Section
        p_info = entry.personal_info or {}
        name = p_info.get("name", "Name Details")
        email = p_info.get("email", "")
        phone = p_info.get("phone", "")
        website = p_info.get("website", "")

        story.append(Paragraph(name, title_style))
        story.append(Spacer(1, 4))
        
        contact_details = []
        if phone: contact_details.append(phone)
        if email: contact_details.append(email)
        if website: contact_details.append(website)
        contact_line = "  |  ".join(contact_details)
        
        story.append(Paragraph(contact_line, contact_style))
        story.append(Spacer(1, 10))

        def draw_divider():
            t = Table([['']], colWidths=[504])
            t.setStyle(TableStyle([
                ('LINEBELOW', (0,0), (-1,-1), 0.75, colors.HexColor("#cbd5e1")),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
            ]))
            return t

        # 2. Skills Section
        skills_list = entry.skills or []
        if skills_list:
            story.append(Paragraph("SKILLS", section_heading))
            story.append(draw_divider())
            story.append(Spacer(1, 5))
            skills_string = ", ".join(skills_list)
            story.append(Paragraph(skills_string, body_text))
            story.append(Spacer(1, 10))

        # 3. Work Experience Section
        experience_list = entry.experience or []
        if experience_list:
            story.append(Paragraph("EXPERIENCE", section_heading))
            story.append(draw_divider())
            story.append(Spacer(1, 5))
            for exp in experience_list:
                role = exp.get("role", "")
                company = exp.get("company", "")
                duration = exp.get("duration", "")
                desc = exp.get("description", "")
                
                header_text = f"<b>{role}</b> at <b>{company}</b>"
                story.append(Paragraph(header_text, body_bold))
                if duration:
                    story.append(Paragraph(duration, italic_text))
                if desc:
                    story.append(Paragraph(desc, body_text))
                story.append(Spacer(1, 8))

        # 4. Education Section
        education_list = entry.education or []
        if education_list:
            story.append(Paragraph("EDUCATION", section_heading))
            story.append(draw_divider())
            story.append(Spacer(1, 5))
            for edu in education_list:
                degree = edu.get("degree", "")
                school = edu.get("school", "")
                year = edu.get("year", "")
                
                edu_line = f"<b>{degree}</b> - {school}"
                story.append(Paragraph(edu_line, body_text))
                if year:
                    story.append(Paragraph(year, italic_text))
                story.append(Spacer(1, 6))

        doc.build(story)

        pdf = buffer.getvalue()
        buffer.close()
        response = HttpResponse(pdf, content_type='application/pdf')
        filename = f"{name.replace(' ', '_')}_Resume.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        analyses = AnalysisHistory.objects.filter(user=user)
        
        total_analyses = analyses.count()
        scores = []
        ats_score_history = []
        
        for a in analyses.order_by("created_at"):
            score = None
            if a.analysis_type in ["ATS", "UNIFIED_ANALYSIS"]:
                try:
                    data = json.loads(a.result)
                    if isinstance(data, dict):
                        score = int(data.get("score", 0))
                except Exception:
                    try:
                        import ast
                        data = ast.literal_eval(a.result)
                        if isinstance(data, dict):
                            score = int(data.get("score", 0))
                    except Exception:
                        pass
            
            if score is not None:
                scores.append(score)
                ats_score_history.append({
                    "date": a.created_at.strftime("%b %d"),
                    "score": score
                })
        
        avg_score = int(sum(scores) / len(scores)) if scores else 0
        
        latest_resume_obj = Resume.objects.filter(user=user).order_by("-uploaded_at").first()
        recent_resume = {
            "id": latest_resume_obj.id,
            "title": latest_resume_obj.title,
            "uploaded_at": latest_resume_obj.uploaded_at.strftime("%Y-%m-%d")
        } if latest_resume_obj else None
        
        latest_jd_obj = JobDescription.objects.filter(user=user).order_by("-created_at").first()
        latest_jd = {
            "id": latest_jd_obj.id,
            "title": latest_jd_obj.title,
            "created_at": latest_jd_obj.created_at.strftime("%Y-%m-%d")
        } if latest_jd_obj else None
        
        recent_activity = []
        for a in analyses.order_by("-created_at")[:5]:
            recent_activity.append({
                "id": a.id,
                "type": a.analysis_type.replace("_", " "),
                "resume_title": a.resume.title,
                "created_at": a.created_at.strftime("%b %d, %H:%M")
            })
            
        return Response({
            "total_analyses": total_analyses,
            "average_ats_score": avg_score,
            "recent_resume": recent_resume,
            "latest_jd": latest_jd,
            "recent_activity": recent_activity,
            "ats_score_history": ats_score_history[-10:]
        }, status=status.HTTP_200_OK)