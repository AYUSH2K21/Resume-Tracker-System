import os
import json
import re
from dotenv import load_dotenv
from django.conf import settings
from groq import Groq

load_dotenv("backend/.env")

def get_groq_model():
    return getattr(settings, "GROQ_MODEL", os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"))

api_key = os.getenv("GROQ_API_KEY")
if not api_key or api_key == "change_this_later":
    client = None
else:
    try:
        client = Groq(api_key=api_key)
    except Exception as e:
        print(f"Failed to initialize Groq client: {e}")
        client = None


def analyze_resume_with_ai(resume_text):
    if not client:
        return "Error: Groq API key is not configured or is invalid."
    try:
        prompt = f"""You are an expert ATS Resume Reviewer. Analyze the following resume.
Return your answer in this format:
1. Professional Summary
2. Strengths
3. Weaknesses
4. Missing Skills
5. Improvement Suggestions
6. ATS Score Improvement Tips

Resume:
{resume_text}"""
        response = client.chat.completions.create(
            model=get_groq_model(),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: AI analysis failed: {str(e)}"


def match_resume_with_job(resume_text, job_description):
    if not client:
        return "Error: Groq API key is not configured or is invalid."
    try:
        prompt = f"""You are an ATS Resume Matching Expert. Compare the resume with the job description.
Return your answer in this format:
1. Match Score (0-100%)
2. Matching Skills
3. Missing Skills
4. Strengths
5. Weaknesses
6. Suggestions

Resume:
{resume_text}
Job Description:
{job_description}"""
        response = client.chat.completions.create(
            model=get_groq_model(),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: Job matching failed: {str(e)}"


def generate_cover_letter(resume_text, job_description):
    if not client:
        return "Error: Groq API key is not configured or is invalid."
    try:
        prompt = f"""You are a professional HR recruiter. Generate a professional one-page cover letter based on the following resume and job description.

Resume:
{resume_text}
Job Description:
{job_description}"""
        response = client.chat.completions.create(
            model=get_groq_model(),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: Cover letter generation failed: {str(e)}"


def generate_interview_questions(resume_text, job_description):
    if not client:
        return "Error: Groq API key is not configured or is invalid."
    try:
        prompt = f"""You are a Senior Technical Interviewer. Based on the resume and job description, generate:
1. 10 Technical Interview Questions
2. 5 HR Interview Questions
3. 5 Project-Based Questions

Resume:
{resume_text}
Job Description:
{job_description}"""
        response = client.chat.completions.create(
            model=get_groq_model(),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: Interview questions generation failed: {str(e)}"


def rewrite_resume_with_ai(resume_text, job_description):
    if not client:
        return "Error: Groq API key is not configured or is invalid."
    try:
        prompt = f"""You are an expert resume writer and ATS optimization consultant.
Analyze the original resume against the provided job description and optimize the content.
STRICT RULE: DO NOT invent fake companies, job titles, years of experience, technologies, or certifications.

Structure your response clearly with:
1. ORIGINAL CONTENT OVERVIEW
2. IMPROVED VERSION
3. WHY THIS IS BETTER

Resume:
{resume_text}
Job Description:
{job_description}"""
        response = client.chat.completions.create(
            model=get_groq_model(),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: Resume optimization failed: {str(e)}"


def run_unified_analysis(resume_text, job_description):
    if not client:
        return {"error": "Groq API key is not configured or is invalid."}
    
    prompt = f"""You are an expert full-stack technical recruiter, ATS scanner, and resume optimization advisor.
Analyze the resume text against the job description.

You MUST return a valid JSON object matching EXACTLY these keys:
{{
  "score": <int 0-100>,
  "keyword_match": [<string>],
  "missing_skills": [<string>],
  "improvement_suggestions": [<string>],
  "resume_rewrite": "<string>",
  "interview_questions": {{
    "technical": [<string>],
    "hr": [<string>],
    "behavioral": [<string>]
  }},
  "strengths": [<string>],
  "weaknesses": [<string>]
}}

Resume:
{resume_text}

Job Description:
{job_description}"""

    try:
        response = client.chat.completions.create(
            model=get_groq_model(),
            messages=[
                {"role": "system", "content": "You are an AI assistant that outputs strictly valid raw JSON. Return only the JSON object without markdown formatting or code blocks."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        return json.loads(content)
    except Exception as e:
        print(f"Error in unified analysis: {e}")
        return {
            "error": f"Failed to parse LLM analysis response: {str(e)}",
            "score": 50,
            "keyword_match": [],
            "missing_skills": [],
            "improvement_suggestions": ["Ensure Groq key is active and valid."],
            "resume_rewrite": "Error optimizing resume. Please check your API configuration.",
            "interview_questions": {"technical": [], "hr": [], "behavioral": []},
            "strengths": [],
            "weaknesses": []
        }