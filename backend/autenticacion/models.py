from django.db import models

class Usuarios(models.Model):
    id = models.UUIDField(primary_key=True)
    nombre = models.TextField()
    apellido = models.TextField()
    dni = models.TextField(unique=True)
    email = models.TextField(unique=True)
    password_hash = models.TextField()
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuarios'

class Cuentas(models.Model):
    id = models.UUIDField(primary_key=True)
    usuario = models.ForeignKey(Usuarios, models.DO_NOTHING)
    tipo = models.TextField()
    numero_cuenta = models.TextField()
    saldo = models.DecimalField(max_digits=12, decimal_places=2)
    moneda = models.TextField()
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cuentas'

class Transacciones(models.Model):
    id = models.UUIDField(primary_key=True)
    usuario = models.ForeignKey(Usuarios, models.DO_NOTHING)
    cuenta = models.ForeignKey(Cuentas, models.DO_NOTHING, blank=True, null=True)
    tipo = models.TextField()
    descripcion = models.TextField()
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'transacciones'