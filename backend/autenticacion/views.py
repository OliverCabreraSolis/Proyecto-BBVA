from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
import uuid

from .models import Usuarios, Cuentas
from .serializers import RegistroSerializer, LoginSerializer, UsuarioSerializer
def get_tokens(usuario):
    refresh = RefreshToken()
    refresh['user_id'] = str(usuario.id)
    refresh['email'] = usuario.email
    refresh['nombre'] = usuario.nombre
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
def registro(request):
    serializer = RegistroSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    # Verificar si ya existe
    if Usuarios.objects.filter(email=data['email']).exists():
        return Response(
            {'message': 'El correo ya está registrado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if Usuarios.objects.filter(dni=data['dni']).exists():
        return Response(
            {'message': 'El documento ya está registrado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Crear usuario
    usuario = Usuarios.objects.create(
        id=uuid.uuid4(),
        nombre=data['nombre'],
        apellido=data['apellido'],
        dni=data['dni'],
        email=data['email'],
        password_hash=make_password(data['password']),
        created_at=timezone.now(),
    )

    # Crear cuenta de ahorros automáticamente
    numero_cuenta = f'019-{str(uuid.uuid4())[:7].upper()}'
    Cuentas.objects.create(
        id=uuid.uuid4(),
        usuario=usuario,
        tipo='ahorro',
        numero_cuenta=numero_cuenta,
        saldo=0.00,
        moneda='PEN',
    )

    tokens = get_tokens(usuario)
    return Response({
        'message': 'Usuario registrado exitosamente',
        'tipo_documento': data['tipo_documento'],
        'token': tokens['access'],
        'user': UsuarioSerializer(usuario).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    # Buscar usuario por DNI
    try:
        usuario = Usuarios.objects.get(dni=data['dni'])
    except Usuarios.DoesNotExist:
        return Response(
            {'message': 'Credenciales incorrectas'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Verificar contraseña
    if not check_password(data['password'], usuario.password_hash):
        return Response(
            {'message': 'Credenciales incorrectas'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    tokens = get_tokens(usuario)
    return Response({
        'token': tokens['access'],
        'user': UsuarioSerializer(usuario).data
    }, status=status.HTTP_200_OK)