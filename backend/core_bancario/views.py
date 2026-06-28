from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Dpersonal, Dpersonalcargo, Dsolicitud, Dsolicitudestado,
    Dcliente, Fagcuentacredito, Fplanpagomes, Dcuentaahorro,
    Foperaciones, Dcanaltransaccional, Dproducto,
    Dcondicioncontable, Dcalificacioncrediticia
)
from .serializers import (
    LoginCoreSerializer, PersonalSerializer,
    SolicitudSerializer, AprobacionSerializer
)


# ─── LOGIN CORE ───────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def login_core(request):
    serializer = LoginCoreSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    try:
        personal = Dpersonal.objects.get(dni=data['dni'])
    except Dpersonal.DoesNotExist:
        return Response({'message': 'Credenciales incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)

    if not check_password(data['password'], personal.password_hash):
        return Response({'message': 'Credenciales incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)

    # Obtener cargo
    cargo_obj = personal.dpersonalcargo_set.filter(activo=True).first()
    cargo = cargo_obj.pkcargo.descargo if cargo_obj else 'Sin cargo'
    codcargo = cargo_obj.pkcargo.codcargo if cargo_obj else ''

    refresh = RefreshToken()
    refresh['pkpersonal'] = personal.pkpersonal
    refresh['nombre'] = personal.nombre
    refresh['dni'] = personal.dni
    refresh['cargo'] = cargo
    refresh['codcargo'] = codcargo

    return Response({
        'token': str(refresh.access_token),
        'personal': PersonalSerializer(personal).data
    }, status=status.HTTP_200_OK)


# ─── BANDEJA SOLICITUDES PENDIENTES ──────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def bandeja_solicitudes(request):
    estado = request.query_params.get('estado', 'PENDIENTE')

    try:
        estado_obj = Dsolicitudestado.objects.get(codestado=estado)
        solicitudes = Dsolicitud.objects.filter(pkestado=estado_obj).order_by('-created_at')
    except Dsolicitudestado.DoesNotExist:
        solicitudes = Dsolicitud.objects.none()

    serializer = SolicitudSerializer(solicitudes, many=True)
    return Response({
        'total': solicitudes.count(),
        'solicitudes': serializer.data
    }, status=status.HTTP_200_OK)


# ─── DETALLE SOLICITUD ────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def detalle_solicitud(request, pksolicitud):
    try:
        solicitud = Dsolicitud.objects.get(pksolicitud=pksolicitud)
    except Dsolicitud.DoesNotExist:
        return Response({'message': 'Solicitud no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    cliente = solicitud.pkcliente
    capacidad_pago = float(cliente.ingresosmensual or 0) * 0.30
    cuota_estimada = float(solicitud.cuotamensual or 0)
    viable = cuota_estimada <= capacidad_pago

    return Response({
        'solicitud': SolicitudSerializer(solicitud).data,
        'analisis': {
            'ingresos_mensuales': str(cliente.ingresosmensual),
            'capacidad_pago_30': str(round(capacidad_pago, 2)),
            'cuota_estimada': str(cuota_estimada),
            'viable': viable,
            'mensaje': '✅ Viable' if viable else '❌ Cuota supera el 30% de ingresos'
        }
    }, status=status.HTTP_200_OK)


# ─── APROBAR O RECHAZAR SOLICITUD ────────────────────────
@api_view(['PUT'])
@permission_classes([AllowAny])
def decidir_solicitud(request, pksolicitud):
    serializer = AprobacionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    try:
        solicitud = Dsolicitud.objects.get(pksolicitud=pksolicitud)
    except Dsolicitud.DoesNotExist:
        return Response({'message': 'Solicitud no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    if data['accion'] == 'RECHAZAR':
        estado_rechazado = Dsolicitudestado.objects.get(codestado='RECHAZADO')
        solicitud.pkestado = estado_rechazado
        solicitud.save()
        return Response({'message': 'Solicitud rechazada'}, status=status.HTTP_200_OK)

    # APROBAR
    estado_desembolsado = Dsolicitudestado.objects.get(codestado='DESEMBOLSADO')
    solicitud.pkestado = estado_desembolsado
    solicitud.montoaprobado = data.get('montoaprobado', solicitud.montopedido)
    solicitud.save()

    # Crear cuenta de crédito
    condicion = Dcondicioncontable.objects.get(codcondicion='VIG')
    calificacion = Dcalificacioncrediticia.objects.get(codcalificacion='0')
    cuenta_debito = Dcuentaahorro.objects.filter(pkcliente=solicitud.pkcliente).first()

    credito = Fagcuentacredito.objects.create(
        pksolicitud=solicitud,
        pkcliente=solicitud.pkcliente,
        pkproducto=solicitud.pkproducto,
        pkcondicion=condicion,
        pkcalificacion=calificacion,
        pkcuenta_debito=cuenta_debito,
        montoprestamo=solicitud.montoaprobado,
        saldocapital=solicitud.montoaprobado,
        tasacompensatoria=solicitud.tasacompensatoria,
        tasamoratoria=solicitud.tasamoratoria,
        diasatraso=0,
        fechadesembolso=timezone.now().date(),
        created_at=timezone.now(),
    )

    # Generar plan de pagos
    monto = float(solicitud.montoaprobado)
    plazo = solicitud.plazomeses
    tasa_mensual = float(solicitud.tasacompensatoria) / 100 / 12
    seguro = 35.50

    if tasa_mensual > 0:
        cuota = monto * (tasa_mensual * (1 + tasa_mensual) ** plazo) / ((1 + tasa_mensual) ** plazo - 1)
    else:
        cuota = monto / plazo

    saldo = monto
    for i in range(1, plazo + 1):
        interes = round(saldo * tasa_mensual, 2)
        amortizacion = round(cuota - interes, 2)
        saldo = round(saldo - amortizacion, 2)
        fecha_venc = timezone.now().date().replace(day=1)
        from dateutil.relativedelta import relativedelta
        fecha_venc = fecha_venc + relativedelta(months=i)

        Fplanpagomes.objects.create(
            pkcuentacredito=credito,
            nrocuota=i,
            fechavencimiento=fecha_venc,
            amortizacion=amortizacion,
            interescompensatorio=interes,
            segurodesgravamen=seguro,
            montocuotatotal=round(cuota + seguro, 2),
            pagado=False,
        )

    # Registrar operación de desembolso
    canal = Dcanaltransaccional.objects.filter(codcanal='WEB').first()
    if cuenta_debito:
        Foperaciones.objects.create(
            pkcliente=solicitud.pkcliente,
            pkcuentaahorro=cuenta_debito,
            pkcanal=canal,
            tipo='CREDITO',
            descripcion=f'Desembolso crédito vehicular - Solicitud #{pksolicitud}',
            monto=solicitud.montoaprobado,
            fecha=timezone.now(),
            estado='COMPLETADO',
        )

    return Response({
        'message': 'Solicitud aprobada y crédito desembolsado',
        'pkcuentacredito': credito.pkcuentacredito,
        'cuota_mensual': round(cuota + seguro, 2),
        'plazo': plazo,
    }, status=status.HTTP_200_OK)


# ─── LISTA CLIENTES EN MORA ───────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def cartera_mora(request):
    creditos = Fagcuentacredito.objects.filter(diasatraso__gt=0).order_by('-diasatraso')

    data = []
    for c in creditos:
        cliente = c.pkcliente
        data.append({
            'pkcuentacredito': c.pkcuentacredito,
            'cliente': f'{cliente.nombre} {cliente.apellidopaterno}',
            'numerodocumento': cliente.numerodocumento,
            'celular': cliente.celular,
            'diasatraso': c.diasatraso,
            'saldocapital': str(c.saldocapital),
            'condicion': c.pkcondicion.descondicion if c.pkcondicion else '',
            'banda': 'CRITICO' if c.diasatraso > 90 else 'ALTO' if c.diasatraso > 30 else 'MEDIO',
        })

    return Response({'total': len(data), 'cartera': data}, status=status.HTTP_200_OK)


# ─── ESTADÍSTICAS PARA DASHBOARD ─────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def estadisticas_dashboard(request):
    from django.db.models import Sum, Count, Q
    from .models import Dagencia

    agencia_id = request.query_params.get('agencia', None)
    filtro_agencia = {'pksolicitud__pkagencia': agencia_id} if agencia_id else {}

    # KPIs globales
    monto_total = Fagcuentacredito.objects.filter(**filtro_agencia).aggregate(
        total=Sum('montoprestamo')
    )['total'] or 0

    cartera_atrasada = Fagcuentacredito.objects.filter(
        diasatraso__gt=0, **filtro_agencia
    ).aggregate(total=Sum('saldocapital'))['total'] or 0

    ratio_mora = round((float(cartera_atrasada) / float(monto_total) * 100), 2) if monto_total > 0 else 0

    # Por condición contable
    por_condicion = []
    condiciones = Dcondicioncontable.objects.all()
    for cond in condiciones:
        total = Fagcuentacredito.objects.filter(
            pkcondicion=cond, **filtro_agencia
        ).aggregate(total=Sum('saldocapital'))['total'] or 0
        if total > 0:
            por_condicion.append({
                'condicion': cond.descondicion,
                'saldo': float(total)
            })

    # Por marca de vehículo
    from .models import Fgarantia
    marcas = Fgarantia.objects.filter(
        pkcuentacredito__in=Fagcuentacredito.objects.filter(**filtro_agencia)
    ).values('marca').annotate(
        total_saldo=Sum('pkcuentacredito__saldocapital')
    ).order_by('-total_saldo')[:6]

    por_marca = [{'marca': m['marca'], 'saldo': float(m['total_saldo'] or 0)} for m in marcas]

    # Embudo de solicitudes
    filtro_sol = {'pkagencia': agencia_id} if agencia_id else {}
    estados = Dsolicitudestado.objects.all()
    embudo = []
    for est in estados:
        count = Dsolicitud.objects.filter(pkestado=est, **filtro_sol).count()
        if count > 0:
            embudo.append({
                'estado': est.desestado,
                'cantidad': count
            })

    # Matriz regional
    agencias = Dagencia.objects.all()
    matriz = []
    for ag in agencias:
        fila = {'agencia': ag.desagencia}
        for cond in condiciones:
            saldo = Fagcuentacredito.objects.filter(
                pksolicitud__pkagencia=ag,
                pkcondicion=cond
            ).aggregate(total=Sum('saldocapital'))['total'] or 0
            fila[cond.descondicion] = float(saldo)
        matriz.append(fila)

    # Lista de agencias para el selector
    lista_agencias = [{'pkagencia': a.pkagencia, 'desagencia': a.desagencia} for a in agencias]

    return Response({
        'kpis': {
            'monto_total_colocado': float(monto_total),
            'cartera_atrasada': float(cartera_atrasada),
            'ratio_mora': ratio_mora,
        },
        'agencias': lista_agencias,
        'por_condicion': por_condicion,
        'por_marca': por_marca,
        'embudo_solicitudes': embudo,
        'matriz_regional': matriz,
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def pago_anticipado(request, pkcuentacredito):
    """
    Pago Anticipado: abono mayor a 2 cuotas.
    Reduce el capital y recalcula intereses sobre el saldo restante.
    """
    monto_abono = request.data.get('monto_abono')

    if not monto_abono:
        return Response({'message': 'Debe indicar el monto del abono'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        credito = Fagcuentacredito.objects.get(pkcuentacredito=pkcuentacredito)
    except Fagcuentacredito.DoesNotExist:
        return Response({'message': 'Crédito no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    cuotas_pendientes = Fplanpagomes.objects.filter(
        pkcuentacredito=credito, pagado=False
    ).order_by('nrocuota')

    if not cuotas_pendientes.exists():
        return Response({'message': 'No hay cuotas pendientes'}, status=status.HTTP_400_BAD_REQUEST)

    valor_cuota_promedio = float(cuotas_pendientes.first().montocuotatotal)
    monto_abono = float(monto_abono)

    # Regla del PDF: Pago Anticipado = abono mayor a 2 cuotas
    if monto_abono <= (valor_cuota_promedio * 2):
        return Response({
            'message': 'Este monto corresponde a un Adelanto de Cuotas (≤2 cuotas), no a un Pago Anticipado. '
                       'El Pago Anticipado requiere un abono mayor a 2 cuotas.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Reducir el capital
    saldo_anterior = float(credito.saldocapital)
    nuevo_saldo = round(saldo_anterior - monto_abono, 2)

    if nuevo_saldo < 0:
        nuevo_saldo = 0

    credito.saldocapital = nuevo_saldo
    credito.save()

    return Response({
        'message': 'Pago Anticipado aplicado exitosamente. El capital ha sido reducido.',
        'saldo_anterior': saldo_anterior,
        'monto_abonado': monto_abono,
        'nuevo_saldo_capital': nuevo_saldo,
        'nota': 'El cliente puede elegir reducir el plazo o el monto de la cuota (regla BBVA).'
    }, status=status.HTTP_200_OK)