from django.urls import path
from . import views

urlpatterns = [
    # Auth original
    path('registro/', views.registro, name='registro'),
    path('login/', views.login, name='login'),
    
    # Homebanking clientes
    path('homebanking/login/', views.login_homebanking, name='login_homebanking'),
    path('homebanking/dashboard/<int:pkcliente>/', views.dashboard_cliente, name='dashboard_cliente'),
    path('homebanking/cronograma/<int:pkcuentacredito>/', views.cronograma_cliente, name='cronograma_cliente'),
]