from rest_framework import serializers
from .models import Dcliente
import re

VALIDACIONES_DOCUMENTO = {
    'DNI': {'min': 8, 'max': 8, 'solo_numeros': True},
    'RUC': {'min': 11, 'max': 11, 'solo_numeros': True},
    'Pasaporte': {'min': 6, 'max': 12, 'solo_numeros': False},
    'Carné de Extranjería': {'min': 9, 'max': 12, 'solo_numeros': False},
    'Carné Identidad Militar': {'min': 6, 'max': 12, 'solo_numeros': False},
    'Carné Diplomático': {'min': 6, 'max': 12, 'solo_numeros': False},
    'Partida de Nacimiento': {'min': 6, 'max': 15, 'solo_numeros': False},
    'Carné PTP': {'min': 6, 'max': 12, 'solo_numeros': False},
    'Doc. Identidad País Origen': {'min': 6, 'max': 20, 'solo_numeros': False},
}

class RegistroSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)
    apellido = serializers.CharField(max_length=100)
    tipo_documento = serializers.ChoiceField(choices=list(VALIDACIONES_DOCUMENTO.keys()))
    dni = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate_dni(self, value):
        tipo = self.initial_data.get('tipo_documento', 'DNI')
        reglas = VALIDACIONES_DOCUMENTO.get(tipo)

        if not reglas:
            return value

        if len(value) < reglas['min'] or len(value) > reglas['max']:
            raise serializers.ValidationError(
                f'El {tipo} debe tener entre {reglas["min"]} y {reglas["max"]} caracteres.'
            )

        if reglas['solo_numeros'] and not value.isdigit():
            raise serializers.ValidationError(
                f'El {tipo} debe contener solo números.'
            )

        return value

    def validate_password(self, value):
        if len(value) > 6:
            raise serializers.ValidationError('La contraseña debe tener máximo 6 caracteres.')
        if len(value) < 4:
            raise serializers.ValidationError('La contraseña debe tener mínimo 4 caracteres.')
        if ' ' in value:
            raise serializers.ValidationError('La contraseña no debe contener espacios.')
        if not re.match(r'^[a-zA-Z0-9]+$', value):
            raise serializers.ValidationError('La contraseña solo puede contener letras y números, sin símbolos.')
        return value

    def validate_nombre(self, value):
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$', value):
            raise serializers.ValidationError('El nombre solo puede contener letras.')
        return value

    def validate_apellido(self, value):
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$', value):
            raise serializers.ValidationError('El apellido solo puede contener letras.')
        return value


class LoginSerializer(serializers.Serializer):
    dni = serializers.CharField()
    password = serializers.CharField()

    def validate_password(self, value):
        if ' ' in value:
            raise serializers.ValidationError('La contraseña no debe contener espacios.')
        return value


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dcliente
        fields = ['pkcliente', 'nombre', 'apellidopaterno', 'apellidomaterno', 'numerodocumento', 'correo', 'celular']

        # Agregar estos al final del archivo

class LoginHomebankingSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class CuentaAhorroSerializer(serializers.Serializer):
    pkcuentaahorro = serializers.IntegerField()
    numerocuenta = serializers.CharField()
    tipo = serializers.CharField()
    moneda = serializers.CharField()
    saldocapital = serializers.DecimalField(max_digits=12, decimal_places=2)

class CreditoVehicularSerializer(serializers.Serializer):
    pkcuentacredito = serializers.IntegerField()
    montoprestamo = serializers.DecimalField(max_digits=12, decimal_places=2)
    saldocapital = serializers.DecimalField(max_digits=12, decimal_places=2)
    tasacompensatoria = serializers.DecimalField(max_digits=5, decimal_places=2)
    tasamoratoria = serializers.DecimalField(max_digits=5, decimal_places=2)
    diasatraso = serializers.IntegerField()
    fechadesembolso = serializers.DateField()
    condicion = serializers.CharField()
    producto = serializers.CharField()
    marca = serializers.CharField()
    modelo = serializers.CharField()
    placa = serializers.CharField()
    anio = serializers.IntegerField()

class CuotaSerializer(serializers.Serializer):
    nrocuota = serializers.IntegerField()
    fechavencimiento = serializers.DateField()
    amortizacion = serializers.DecimalField(max_digits=10, decimal_places=2)
    interescompensatorio = serializers.DecimalField(max_digits=10, decimal_places=2)
    segurodesgravamen = serializers.DecimalField(max_digits=10, decimal_places=2)
    montocuotatotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    pagado = serializers.BooleanField()