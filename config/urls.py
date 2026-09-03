from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        "status": "online",
        "message": "Resume Tracker API Backend is running.",
        "frontend_url": "http://localhost:5173/",
        "endpoints": {
            "auth": "/api/auth/",
            "resumes": "/api/resumes/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path("", api_root_view, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/resumes/", include("resumes.urls")),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)