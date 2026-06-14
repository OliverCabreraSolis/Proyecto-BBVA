from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_core, name='login_core'),
    path('solicitudes/', views.bandeja_solicitudes, name='bandeja_solicitudes'),
    path('solicitudes/<int:pksolicitud>/', views.detalle_solicitud, name='detalle_solicitud'),
    path('solicitudes/<int:pksolicitud>/decidir/', views.decidir_solicitud, name='decidir_solicitud'),
    path('cartera/mora/', views.cartera_mora, name='cartera_mora'),
    path('estadisticas/', views.estadisticas_dashboard, name='estadisticas'),
]