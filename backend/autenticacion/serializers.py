from rest_framework import serializers
from .models import Usuarios
import re

class RegistroSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)
    apellido = serializers.CharField(max_length=100)
    tipo_documento = serializers.ChoiceField(choices=['DNI', 'CE', 'Pasaporte'])
    dni = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate_dni(self, value):
        tipo = self.initial_data.get('tipo_documento', 'DNI')
        if tipo == 'DNI':
            if not value.isdigit():
                raise serializers.ValidationError('El DNI debe contener solo números.')
            if len(value) != 8:
                raise serializers.ValidationError('El DNI debe tener exactamente 8 dígitos.')
        elif tipo == 'CE':
            if len(value) < 9 or len(value) > 12:
                raise serializers.ValidationError('El Carné de Extranjería debe tener entre 9 y 12 caracteres.')
        elif tipo == 'Pasaporte':
            if len(value) < 6 or len(value) > 12:
                raise serializers.ValidationError('El Pasaporte debe tener entre 6 y 12 caracteres.')
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
        if not re.match(r'^[a-zA-Z0-9]+$', value):
            raise serializers.ValidationError('La contraseña solo puede contener letras y números.')
        return value


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = ['id', 'nombre', 'apellido', 'dni', 'email', 'created_at']