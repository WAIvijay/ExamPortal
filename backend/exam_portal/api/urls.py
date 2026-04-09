from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('students/', views.get_students),
    path('add/', views.add_student),
    path('scan-omr/', views.scan_omr),
    path('scan-bulk/', views.scan_bulk),
    path('login/', TokenObtainPairView.as_view()),
]
