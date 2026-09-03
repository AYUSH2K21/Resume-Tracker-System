import re
import os
import json
from groq import Groq
from dotenv import load_dotenv
from django.conf import settings
from .ats_rules import ATS_SKILLS, ATS_SECTIONS

load_dotenv("backend/.env")

def analyze_resume_fallback(text):
    text_lower = text.lower() if text else ""
    found_skills = [skill for skill in ATS_SKILLS if skill in text_lower]
    missing_skills = [skill for skill in ATS_SKILLS if skill not in found_skills]
    found_sections = [section for section in ATS_SECTIONS if section in text_lower]
    missing_sections = [section for section in ATS_SECTIONS if section not in found_sections]
    has_email = bool(re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text))
    has_phone = bool(re.search(r"\b\d{10}\b", text))

    skills_score = int((len(found_skills) / len(ATS_SKILLS)) * 100) if ATS_SKILLS else 0
    section_score = int((len(found_sections) / len(ATS_SECTIONS)) * 100) if ATS_SECTIONS else 0
    keyword_score = min(100, int(len(found_skills) * 8 + (10 if has_email else 0) + (10 if has_phone else 0)))
    experience_score = 75 if ("experience" in found_sections or "work" in text_lower) else 30
    education_score = 90 if ("education" in found_sections or "degree" in text_lower or "bachelor" in text_lower or "master" in text_lower) else 20

    overall = int((skills_score * 0.35) + (section_score * 0.25) + (keyword_score * 0.20) + (experience_score * 0.10) + (education_score * 0.10))

    return {
        "score": overall,
        "keyword_score": keyword_score,
        "keyword_explanation": f"Found {len(found_skills)} industry keyword matches.",
        "skills_score": skills_score,
        "skills_explanation": f"Matched {len(found_skills)} essential skills.",
        "experience_score": experience_score,
        "experience_explanation": "Work history section detected.",
        "education_score": education_score,
        "education_explanation": "Academic credentials detected.",
        "section_completeness_score": section_score,
        "section_completeness_explanation": f"Contains {len(found_sections)} standard ATS sections.",
        "overall_explanation": f"Overall ATS Score is {overall}/100.",
        "found_skills": found_skills,
        "missing_skills": missing_skills,
        "found_sections": found_sections,
        "missing_sections": missing_sections,
        "email_found": has_email,
        "phone_found": has_phone,
        "is_ai": False,
    }

def analyze_resume(text):
    if not text or not text.strip():
        return analyze_resume_fallback("")

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "change_this_later":
        fallback_data = analyze_resume_fallback(text)
        fallback_data["is_ai"] = False
        return fallback_data

    try:
        client = Groq(api_key=api_key)
        prompt = f"""You are an expert ATS (Applicant Tracking System) parser.
Analyze this resume text and output a valid JSON object matching EXACTLY these keys:
{{
    "score": <int 0-100>,
    "keyword_score": <int 0-100>,
    "keyword_explanation": "<string>",
    "skills_score": <int 0-100>,
    "skills_explanation": "<string>",
    "experience_score": <int 0-100>,
    "experience_explanation": "<string>",
    "education_score": <int 0-100>,
    "education_explanation": "<string>",
    "section_completeness_score": <int 0-100>,
    "section_completeness_explanation": "<string>",
    "overall_explanation": "<string>",
    "found_skills": [<string list>],
    "missing_skills": [<string list>],
    "found_sections": [<string list>],
    "missing_sections": [<string list>],
    "email_found": <boolean>,
    "phone_found": <boolean>
}}
Resume Text: {text}"""

        groq_model = getattr(settings, "GROQ_MODEL", os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"))
        response = client.chat.completions.create(
            model=groq_model,
            messages=[
                {"role": "system", "content": "You are an AI assistant that outputs strictly valid raw JSON. Return only the JSON object without markdown formatting or code blocks."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content.strip()
        data = json.loads(content)
        data["is_ai"] = True
        return data

    except Exception as e:
        print(f"Error in dynamic ATS analysis: {e}")
        fallback_data = analyze_resume_fallback(text)
        fallback_data["is_ai"] = False
        fallback_data["error_message"] = str(e)
        return fallback_data