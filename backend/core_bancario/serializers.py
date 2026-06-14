from rest_framework import serializers
from .models import Dpersonal, Dsolicitud, Dcliente, Fagcuentacredito, Fplanpagomes

class LoginCoreSerializer(serializers.Serializer):
    dni = serializers.CharField()
    password = serializers.CharField()

class PersonalSerializer(serializers.ModelSerializer):
    cargo = serializers.SerializerMethodField()
    agencia = serializers.SerializerMethodField()

    def get_cargo(self, obj):
        cargo = obj.dpersonalcargo_set.filter(activo=True).first()
        return cargo.pkcargo.descargo if cargo else 'Sin cargo'

    def get_agencia(self, obj):
        return obj.pkagencia.desagencia if obj.pkagencia else ''

    class Meta:
        model = Dpersonal
        fields = ['pkpersonal', 'dni', 'nombre', 'apellidos', 'correo', 'cargo', 'agencia']

class ClienteResumenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dcliente
        fields = ['pkcliente', 'nombre', 'apellidopaterno', 'apellidomaterno', 'numerodocumento', 'correo', 'celular', 'ingresosmensual']

class SolicitudSerializer(serializers.ModelSerializer):
    cliente = ClienteResumenSerializer(source='pkcliente', read_only=True)
    estado = serializers.CharField(source='pkestado.desestado', read_only=True)
    producto = serializers.CharField(source='pkproducto.desproducto', read_only=True)
    agencia = serializers.CharField(source='pkagencia.desagencia', read_only=True)

    class Meta:
        model = Dsolicitud
        fields = [
            'pksolicitud', 'cliente', 'estado', 'producto', 'agencia',
            'montopedido', 'montoaprobado', 'plazomeses',
            'tasacompensatoria', 'tasamoratoria', 'cuotamensual',
            'proposito', 'created_at'
        ]

class AprobacionSerializer(serializers.Serializer):
    accion = serializers.ChoiceField(choices=['APROBAR', 'RECHAZAR'])
    montoaprobado = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    observacion = serializers.CharField(required=False)