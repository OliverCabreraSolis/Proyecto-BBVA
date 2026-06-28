from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
import uuid

from .models import (
    Dcliente, UsuariosHomebanking,
    Dcuentaahorro, Fcuentaahorro,
    Fagcuentacredito, Fgarantia, Fplanpagomes,
    Dsolicitud, Dsolicitudestado, Dproducto, Dagencia
)

from .serializers import (
    RegistroSerializer, LoginSerializer, UsuarioSerializer,
    LoginHomebankingSerializer
)
# ─── REGISTRO (tabla dcliente) ───────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def registro(request):
    serializer = RegistroSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    if Dcliente.objects.filter(correo=data['email']).exists():
        return Response({'message': 'El correo ya está registrado'}, status=status.HTTP_400_BAD_REQUEST)

    if Dcliente.objects.filter(numerodocumento=data['dni']).exists():
        return Response({'message': 'El documento ya está registrado'}, status=status.HTTP_400_BAD_REQUEST)

    agencia_obj = Dagencia.objects.filter(pkagencia=data.get('pkagencia', 1)).first()

    cliente = Dcliente.objects.create(
    nombre=data['nombre'],
    apellidopaterno=data['apellido'],
    numerodocumento=data['dni'],
    correo=data['email'],
    ingresosmensual=data.get('ingresosmensual', 2000.00),
    pkagencia=agencia_obj,
    created_at=timezone.now(),
    )

    usuario_hb = UsuariosHomebanking.objects.create(
        pkcliente=cliente,
        username=data['dni'],
        password_hash=make_password(data['password']),
        created_at=timezone.now(),
    )

    # Crear cuenta de ahorros con la agencia seleccionada
    
    pkagencia = data.get('pkagencia', 1)
    saldo_inicial = data.get('saldo_inicial', 0.00)
    numero_cuenta = f'191-{str(cliente.pkcliente).zfill(8)}'

    cuenta = Dcuentaahorro.objects.create(
        pkcliente=cliente,
        numerocuenta=numero_cuenta,
        tipo='AC',
        moneda='PEN',
        created_at=timezone.now(),
    )

    Fcuentaahorro.objects.create(
        pkcuentaahorro=cuenta,
        saldocapital=saldo_inicial,
        saldointeres=0.00,
        saldopromedio=saldo_inicial,
        tasa=1.5,
        fecha=timezone.now().date(),
    )

    refresh = RefreshToken()
    refresh['pkcliente'] = cliente.pkcliente
    refresh['nombre'] = cliente.nombre
    refresh['numerodocumento'] = cliente.numerodocumento

    return Response({
        'message': 'Usuario registrado exitosamente',
        'token': str(refresh.access_token),
        'user': {
            'pkcliente': cliente.pkcliente,
            'nombre': cliente.nombre,
            'numerodocumento': cliente.numerodocumento,
            'correo': cliente.correo,
        }
    }, status=status.HTTP_201_CREATED)

# ─── LOGIN ORIGINAL (por DNI) ────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    try:
        usuario = UsuariosHomebanking.objects.get(username=data['dni'])
    except UsuariosHomebanking.DoesNotExist:
        return Response({'message': 'Credenciales incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)

    if not check_password(data['password'], usuario.password_hash):
        return Response({'message': 'Credenciales incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)

    cliente = usuario.pkcliente

    refresh = RefreshToken()
    refresh['pkcliente'] = cliente.pkcliente
    refresh['nombre'] = cliente.nombre
    refresh['numerodocumento'] = cliente.numerodocumento

    return Response({
        'token': str(refresh.access_token),
        'user': {
            'pkcliente': cliente.pkcliente,
            'nombre': cliente.nombre,
            'apellidopaterno': cliente.apellidopaterno,
            'numerodocumento': cliente.numerodocumento,
            'correo': cliente.correo,
        }
    }, status=status.HTTP_200_OK)

# ─── LOGIN HOMEBANKING (por username) ────────────────────
@api_view(['POST'])
def login_homebanking(request):
    serializer = LoginHomebankingSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    try:
        usuario = UsuariosHomebanking.objects.get(username=data['username'])
    except UsuariosHomebanking.DoesNotExist:
        return Response({'message': 'Credenciales incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)

    if usuario.bloqueado:
        return Response({'message': 'Usuario bloqueado. Contacte al banco.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not check_password(data['password'], usuario.password_hash):
        usuario.intentos = (usuario.intentos or 0) + 1
        if usuario.intentos >= 3:
            usuario.bloqueado = True
        usuario.save()
        return Response(
            {'message': f'Credenciales incorrectas. Intentos: {usuario.intentos}/3'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    usuario.intentos = 0
    usuario.ultimo_acceso = timezone.now()
    usuario.save()

    cliente = usuario.pkcliente

    refresh = RefreshToken()
    refresh['pkusuario'] = usuario.pkusuario
    refresh['username'] = usuario.username
    refresh['pkcliente'] = cliente.pkcliente
    refresh['nombre'] = cliente.nombre
    refresh['numerodocumento'] = cliente.numerodocumento

    return Response({
        'token': str(refresh.access_token),
        'user': {
            'pkcliente': cliente.pkcliente,
            'nombre': cliente.nombre,
            'apellidopaterno': cliente.apellidopaterno,
            'apellidomaterno': cliente.apellidomaterno,
            'numerodocumento': cliente.numerodocumento,
            'correo': cliente.correo,
            'celular': cliente.celular,
            'ingresosmensual': str(cliente.ingresosmensual),
        }
    }, status=status.HTTP_200_OK)


# ─── DASHBOARD CLIENTE ───────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_cliente(request, pkcliente):
    try:
        cuenta = Dcuentaahorro.objects.get(pkcliente=pkcliente)
        saldo = Fcuentaahorro.objects.filter(pkcuentaahorro=cuenta).last()
        cuenta_data = {
            'pkcuentaahorro': cuenta.pkcuentaahorro,
            'numerocuenta': cuenta.numerocuenta,
            'tipo': cuenta.tipo,
            'moneda': cuenta.moneda,
            'saldocapital': str(saldo.saldocapital) if saldo else '0.00',
        }
    except Dcuentaahorro.DoesNotExist:
        cuenta_data = None

    creditos = Fagcuentacredito.objects.filter(pkcliente=pkcliente)
    creditos_data = []
    for credito in creditos:
        garantia = Fgarantia.objects.filter(pkcuentacredito=credito).first()
        creditos_data.append({
            'pkcuentacredito': credito.pkcuentacredito,
            'montoprestamo': str(credito.montoprestamo),
            'saldocapital': str(credito.saldocapital),
            'tasacompensatoria': str(credito.tasacompensatoria),
            'tasamoratoria': str(credito.tasamoratoria),
            'diasatraso': credito.diasatraso,
            'fechadesembolso': str(credito.fechadesembolso),
            'condicion': credito.pkcondicion.descondicion if credito.pkcondicion else '',
            'producto': credito.pkproducto.desproducto if credito.pkproducto else '',
            'marca': garantia.marca if garantia else '',
            'modelo': garantia.modelo if garantia else '',
            'placa': garantia.placa if garantia else '',
            'anio': garantia.anio if garantia else '',
        })

    proxima_cuota = None
    if creditos.exists():
        cuota = Fplanpagomes.objects.filter(
            pkcuentacredito__in=creditos,
            pagado=False
        ).order_by('fechavencimiento').first()
        if cuota:
            proxima_cuota = {
                'nrocuota': cuota.nrocuota,
                'fechavencimiento': str(cuota.fechavencimiento),
                'montocuotatotal': str(cuota.montocuotatotal),
                'amortizacion': str(cuota.amortizacion),
                'interescompensatorio': str(cuota.interescompensatorio),
                'segurodesgravamen': str(cuota.segurodesgravamen),
            }
            

    return Response({
        'cuenta_ahorro': cuenta_data,
        'creditos': creditos_data,
        'proxima_cuota': proxima_cuota,
    }, status=status.HTTP_200_OK)


# ─── CRONOGRAMA DE PAGOS ─────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def cronograma_cliente(request, pkcuentacredito):
    cuotas = Fplanpagomes.objects.filter(
        pkcuentacredito=pkcuentacredito
    ).order_by('nrocuota')

    cuotas_data = []
    for cuota in cuotas:
        cuotas_data.append({
            'nrocuota': cuota.nrocuota,
            'fechavencimiento': str(cuota.fechavencimiento),
            'amortizacion': str(cuota.amortizacion),
            'interescompensatorio': str(cuota.interescompensatorio),
            'segurodesgravamen': str(cuota.segurodesgravamen),
            'montocuotatotal': str(cuota.montocuotatotal),
            'pagado': cuota.pagado,
            'fechapago': str(cuota.fechapago) if cuota.fechapago else None,
        })

    return Response({'cuotas': cuotas_data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def crear_solicitud(request):
    pkcliente = request.data.get('pkcliente')
    montopedido = request.data.get('montopedido')
    plazomeses = request.data.get('plazomeses')
    pkproducto = request.data.get('pkproducto')
    proposito = request.data.get('proposito', '')

    if float(montopedido) < 700:
        return Response({'message': 'El monto mínimo del préstamo es S/ 700.00'}, status=status.HTTP_400_BAD_REQUEST)
    try:
      cliente = Dcliente.objects.get(pkcliente=pkcliente)
      producto = Dproducto.objects.get(pkproducto=pkproducto)
      estado_pendiente = Dsolicitudestado.objects.get(codestado='PENDIENTE')
      agencia = cliente.pkagencia if cliente.pkagencia else Dagencia.objects.first()
    except Exception as e:
        return Response({'message': f'Error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    
    monto = float(montopedido)
    plazo = int(plazomeses)
    tasa = 12.50
    tasa_mensual = tasa / 100 / 12
    cuota = monto * (tasa_mensual * (1 + tasa_mensual) ** plazo) / ((1 + tasa_mensual) ** plazo - 1)

    solicitud = Dsolicitud.objects.create(
        pkcliente=cliente,
        pkasesor=None,
        pkagencia=agencia,
        pkproducto=producto,
        pkestado=estado_pendiente,
        montopedido=monto,
        plazomeses=plazo,
        tasacompensatoria=tasa,
        tasamoratoria=24.00,
        cuotamensual=round(cuota, 2),
        proposito=proposito,
        created_at=timezone.now(),
    )

    return Response({
        'message': 'Solicitud enviada exitosamente. Será evaluada por un asesor.',
        'pksolicitud': solicitud.pksolicitud,
        'cuota_estimada': round(cuota, 2),
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def mis_solicitudes(request, pkcliente):
    solicitudes = Dsolicitud.objects.filter(pkcliente=pkcliente).order_by('-created_at')

    data = []
    for s in solicitudes:
        data.append({
            'pksolicitud': s.pksolicitud,
            'producto': s.pkproducto.desproducto if s.pkproducto else '',
            'estado': s.pkestado.desestado if s.pkestado else '',
            'montopedido': str(s.montopedido),
            'montoaprobado': str(s.montoaprobado) if s.montoaprobado else None,
            'plazomeses': s.plazomeses,
            'cuotamensual': str(s.cuotamensual) if s.cuotamensual else None,
            'created_at': str(s.created_at),
        })

    return Response({'solicitudes': data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def listar_agencias(request):
    agencias = Dagencia.objects.all()
    data = [{'pkagencia': a.pkagencia, 'desagencia': a.desagencia} for a in agencias]
    return Response({'agencias': data}, status=status.HTTP_200_OK)