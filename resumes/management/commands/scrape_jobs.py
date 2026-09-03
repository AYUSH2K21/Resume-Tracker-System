from django.core.management.base import BaseCommand
from resumes.models import ScrapedJob

class Command(BaseCommand):
    help = "Seeds the database with job listings from mock portals or RSS feeds."

    def handle(self, *args, **options):
        self.stdout.write("Fetching job listings...")
        
        mock_jobs = [
            {
                "title": "Software Engineer (Django/React)",
                "company": "TechCorp Solutions",
                "location": "Remote",
                "description": "Looking for a Software Engineer with expertise in Python, Django, React, and REST APIs. Responsibilities include building scalable web applications and optimizing system performance.",
                "url": "https://example.com/jobs/1",
                "source": "LinkedIn"
            },
            {
                "title": "Product Manager",
                "company": "Productive Inc.",
                "location": "New York, NY",
                "description": "We need a Product Manager with 3+ years experience in Agile methodology, roadmap design, and user experience analysis. MBA or equivalent experience is a plus.",
                "url": "https://example.com/jobs/2",
                "source": "Indeed"
            },
            {
                "title": "UI/UX Designer",
                "company": "Creative Studio",
                "location": "San Francisco, CA",
                "description": "Seeking a talented UI/UX designer. Must be proficient in Figma, design systems, and wireframing. Experience in user testing is highly desired.",
                "url": "https://example.com/jobs/3",
                "source": "CreativeJobs"
            },
            {
                "title": "Data Analyst",
                "company": "FinanceFlow",
                "location": "Remote",
                "description": "Looking for a Data Analyst skilled in SQL, Tableau, Excel, and Python. Responsibilities include translating business data into actionable dashboard insights.",
                "url": "https://example.com/jobs/4",
                "source": "Indeed"
            },
            {
                "title": "DevOps Engineer",
                "company": "CloudScale",
                "location": "Austin, TX",
                "description": "Responsibilities include managing AWS infrastructure, configuring Docker containers, and setting up CI/CD pipelines. Experience in Kubernetes is a plus.",
                "url": "https://example.com/jobs/5",
                "source": "LinkedIn"
            },
            {
                "title": "HR Generalist",
                "company": "Global Recruiters",
                "location": "Chicago, IL",
                "description": "HR Generalist wanted. Skills in candidate sourcing, talent management, employee relations, and labor compliance are required.",
                "url": "https://example.com/jobs/6",
                "source": "Indeed"
            }
        ]

        created_count = 0
        for job in mock_jobs:
            obj, created = ScrapedJob.objects.get_or_create(
                title=job["title"],
                company=job["company"],
                defaults={
                    "location": job["location"],
                    "description": job["description"],
                    "url": job["url"],
                    "source": job["source"]
                }
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully loaded {created_count} new job listings!"))
