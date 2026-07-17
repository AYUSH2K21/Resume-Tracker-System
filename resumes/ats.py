import re
from .ats_rules import ATS_SKILLS, ATS_SECTIONS


def analyze_resume(text):
    text = text.lower()

    # ---------- Skills ----------
    found_skills = [
        skill for skill in ATS_SKILLS
        if skill in text
    ]

    missing_skills = [
        skill for skill in ATS_SKILLS
        if skill not in found_skills
    ]

    # ---------- Sections ----------
    found_sections = [
        section for section in ATS_SECTIONS
        if section in text
    ]

    missing_sections = [
        section for section in ATS_SECTIONS
        if section not in found_sections
    ]

    # ---------- Email ----------
    has_email = bool(
        re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    )

    # ---------- Phone ----------
    has_phone = bool(
        re.search(r"\b\d{10}\b", text)
    )

    # ---------- Score ----------
    score = 0

    score += int((len(found_skills) / len(ATS_SKILLS)) * 60)
    score += int((len(found_sections) / len(ATS_SECTIONS)) * 30)

    if has_email:
        score += 5

    if has_phone:
        score += 5

    return {
        "score": score,
        "found_skills": found_skills,
        "missing_skills": missing_skills,
        "found_sections": found_sections,
        "missing_sections": missing_sections,
        "email_found": has_email,
        "phone_found": has_phone,
    }