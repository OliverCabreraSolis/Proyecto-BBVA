# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Dagencia(models.Model):
    pkagencia = models.AutoField(primary_key=True)
    codagencia = models.CharField(unique=True, max_length=10)
    desagencia = models.CharField(max_length=100)
    distrito = models.CharField(max_length=60, blank=True, null=True)
    provincia = models.CharField(max_length=60, blank=True, null=True)
    departamento = models.CharField(max_length=60, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dagencia'


class Dasesor(models.Model):
    pkasesor = models.AutoField(primary_key=True)
    pkpersonal = models.ForeignKey('Dpersonal', models.DO_NOTHING, db_column='pkpersonal', blank=True, null=True)
    codasesor = models.CharField(unique=True, max_length=20)
    activo = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dasesor'


class Dcalificacioncrediticia(models.Model):
    pkcalificacion = models.AutoField(primary_key=True)
    codcalificacion = models.CharField(unique=True, max_length=5)
    descalificacion = models.CharField(max_length=60)

    class Meta:
        managed = False
        db_table = 'dcalificacioncrediticia'


class Dcanaltransaccional(models.Model):
    pkcanal = models.AutoField(primary_key=True)
    codcanal = models.CharField(unique=True, max_length=5)
    descanal = models.CharField(max_length=60)

    class Meta:
        managed = False
        db_table = 'dcanaltransaccional'


class Dcargopersonal(models.Model):
    pkcargo = models.AutoField(primary_key=True)
    codcargo = models.CharField(unique=True, max_length=20)
    descargo = models.CharField(max_length=60)

    class Meta:
        managed = False
        db_table = 'dcargopersonal'


class Dclasepersona(models.Model):
    pkclasepersona = models.AutoField(primary_key=True)
    codclase = models.CharField(unique=True, max_length=5)
    desclase = models.CharField(max_length=60)

    class Meta:
        managed = False
        db_table = 'dclasepersona'


class Dcliente(models.Model):
    pkcliente = models.AutoField(primary_key=True)
    pkdocumento = models.ForeignKey('Dtipodocumentoidentidad', models.DO_NOTHING, db_column='pkdocumento', blank=True, null=True)
    pkclasepersona = models.ForeignKey(Dclasepersona, models.DO_NOTHING, db_column='pkclasepersona', blank=True, null=True)
    numerodocumento = models.CharField(unique=True, max_length=20)
    nombre = models.CharField(max_length=100)
    apellidopaterno = models.CharField(max_length=60)
    apellidomaterno = models.CharField(max_length=60, blank=True, null=True)
    fechanacimiento = models.DateField(blank=True, null=True)
    sexo = models.CharField(max_length=1, blank=True, null=True)
    estadocivil = models.CharField(max_length=20, blank=True, null=True)
    correo = models.CharField(unique=True, max_length=100, blank=True, null=True)
    celular = models.CharField(max_length=15, blank=True, null=True)
    direccion = models.CharField(max_length=200, blank=True, null=True)
    ingresosmensual = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    pkagencia = models.ForeignKey('Dagencia', models.DO_NOTHING, db_column='pkagencia', blank=True, null=True)
    
    class Meta:
        managed = False
        db_table = 'dcliente'


class Dcondicioncontable(models.Model):
    pkcondicion = models.AutoField(primary_key=True)
    codcondicion = models.CharField(unique=True, max_length=5)
    descondicion = models.CharField(max_length=60)

    class Meta:
        managed = False
        db_table = 'dcondicioncontable'


class Dcuentaahorro(models.Model):
    pkcuentaahorro = models.AutoField(primary_key=True)
    pkcliente = models.ForeignKey(Dcliente, models.DO_NOTHING, db_column='pkcliente', blank=True, null=True)
    numerocuenta = models.CharField(unique=True, max_length=20)
    tipo = models.CharField(max_length=5, blank=True, null=True)
    moneda = models.CharField(max_length=3, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dcuentaahorro'


class Dgarantia(models.Model):
    pktipogarantia = models.AutoField(primary_key=True)
    codtipogarantia = models.CharField(unique=True, max_length=10)
    destipogarantia = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'dgarantia'


class Dpersonal(models.Model):
    pkpersonal = models.AutoField(primary_key=True)
    pkagencia = models.ForeignKey(Dagencia, models.DO_NOTHING, db_column='pkagencia', blank=True, null=True)
    dni = models.CharField(unique=True, max_length=20)
    nombre = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    correo = models.CharField(max_length=100, blank=True, null=True)
    password_hash = models.TextField()
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dpersonal'


class Dpersonalcargo(models.Model):
    pkpersonalcargo = models.AutoField(primary_key=True)
    pkpersonal = models.ForeignKey(Dpersonal, models.DO_NOTHING, db_column='pkpersonal', blank=True, null=True)
    pkcargo = models.ForeignKey(Dcargopersonal, models.DO_NOTHING, db_column='pkcargo', blank=True, null=True)
    activo = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dpersonalcargo'


class Dproducto(models.Model):
    pkproducto = models.AutoField(primary_key=True)
    codproducto = models.CharField(unique=True, max_length=20)
    desproducto = models.CharField(max_length=100)
    pktipocredito = models.ForeignKey('Dtipocredito', models.DO_NOTHING, db_column='pktipocredito', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dproducto'


class Dsolicitud(models.Model):
    pksolicitud = models.AutoField(primary_key=True)
    pkcliente = models.ForeignKey(Dcliente, models.DO_NOTHING, db_column='pkcliente', blank=True, null=True)
    pkasesor = models.ForeignKey(Dasesor, models.DO_NOTHING, db_column='pkasesor', blank=True, null=True)
    pkagencia = models.ForeignKey(Dagencia, models.DO_NOTHING, db_column='pkagencia', blank=True, null=True)
    pkproducto = models.ForeignKey(Dproducto, models.DO_NOTHING, db_column='pkproducto', blank=True, null=True)
    pkestado = models.ForeignKey('Dsolicitudestado', models.DO_NOTHING, db_column='pkestado', blank=True, null=True)
    montopedido = models.DecimalField(max_digits=12, decimal_places=2)
    montoaprobado = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    plazomeses = models.IntegerField()
    tasacompensatoria = models.DecimalField(max_digits=5, decimal_places=2)
    tasamoratoria = models.DecimalField(max_digits=5, decimal_places=2)
    cuotamensual = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    proposito = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dsolicitud'


class Dsolicitudestado(models.Model):
    pkestado = models.AutoField(primary_key=True)
    codestado = models.CharField(unique=True, max_length=20)
    desestado = models.CharField(max_length=60)

    class Meta:
        managed = False
        db_table = 'dsolicitudestado'


class Dtipocredito(models.Model):
    pktipocredito = models.AutoField(primary_key=True)
    codtipocredito = models.CharField(unique=True, max_length=5)
    destipocredito = models.CharField(max_length=60)

    class Meta:
        managed = False
        db_table = 'dtipocredito'


class Dtipodocumentoidentidad(models.Model):
    pkdocumento = models.AutoField(primary_key=True)
    coddocumento = models.CharField(unique=True, max_length=5)
    desdocumento = models.CharField(max_length=60)

    class Meta:
        managed = False
        db_table = 'dtipodocumentoidentidad'


class Dtipogestioncobranza(models.Model):
    pktipogestion = models.AutoField(primary_key=True)
    codgestion = models.CharField(unique=True, max_length=20)
    desgestion = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'dtipogestioncobranza'


class Fagcuentacredito(models.Model):
    pkcuentacredito = models.AutoField(primary_key=True)
    pksolicitud = models.ForeignKey(Dsolicitud, models.DO_NOTHING, db_column='pksolicitud', blank=True, null=True)
    pkcliente = models.ForeignKey(Dcliente, models.DO_NOTHING, db_column='pkcliente', blank=True, null=True)
    pkproducto = models.ForeignKey(Dproducto, models.DO_NOTHING, db_column='pkproducto', blank=True, null=True)
    pkcondicion = models.ForeignKey(Dcondicioncontable, models.DO_NOTHING, db_column='pkcondicion', blank=True, null=True)
    pkcalificacion = models.ForeignKey(Dcalificacioncrediticia, models.DO_NOTHING, db_column='pkcalificacion', blank=True, null=True)
    pkcuenta_debito = models.ForeignKey(Dcuentaahorro, models.DO_NOTHING, db_column='pkcuenta_debito', blank=True, null=True)
    montoprestamo = models.DecimalField(max_digits=12, decimal_places=2)
    saldocapital = models.DecimalField(max_digits=12, decimal_places=2)
    tasacompensatoria = models.DecimalField(max_digits=5, decimal_places=2)
    tasamoratoria = models.DecimalField(max_digits=5, decimal_places=2)
    diasatraso = models.IntegerField(blank=True, null=True)
    fechadesembolso = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fagcuentacredito'


class Fcuentaahorro(models.Model):
    pkfcuentaahorro = models.AutoField(primary_key=True)
    pkcuentaahorro = models.ForeignKey(Dcuentaahorro, models.DO_NOTHING, db_column='pkcuentaahorro', blank=True, null=True)
    saldocapital = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    saldointeres = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    saldopromedio = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    tasa = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    fecha = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fcuentaahorro'


class Fgarantia(models.Model):
    pkfgarantia = models.AutoField(primary_key=True)
    pkcuentacredito = models.ForeignKey(Fagcuentacredito, models.DO_NOTHING, db_column='pkcuentacredito', blank=True, null=True)
    pktipogarantia = models.ForeignKey(Dgarantia, models.DO_NOTHING, db_column='pktipogarantia', blank=True, null=True)
    descripcion = models.CharField(max_length=200, blank=True, null=True)
    valorcomercial = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    placa = models.CharField(max_length=20, blank=True, null=True)
    marca = models.CharField(max_length=60, blank=True, null=True)
    modelo = models.CharField(max_length=60, blank=True, null=True)
    anio = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fgarantia'


class Fgestioncobranza(models.Model):
    pkgestion = models.AutoField(primary_key=True)
    pkcuentacredito = models.ForeignKey(Fagcuentacredito, models.DO_NOTHING, db_column='pkcuentacredito', blank=True, null=True)
    pkpersonal = models.ForeignKey(Dpersonal, models.DO_NOTHING, db_column='pkpersonal', blank=True, null=True)
    pktipogestion = models.ForeignKey(Dtipogestioncobranza, models.DO_NOTHING, db_column='pktipogestion', blank=True, null=True)
    diasatraso = models.IntegerField(blank=True, null=True)
    bandariesgo = models.CharField(max_length=20, blank=True, null=True)
    compromisopago = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    fechacompromiso = models.DateField(blank=True, null=True)
    observacion = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fgestioncobranza'


class Foperaciones(models.Model):
    pkoperacion = models.AutoField(primary_key=True)
    pkcliente = models.ForeignKey(Dcliente, models.DO_NOTHING, db_column='pkcliente', blank=True, null=True)
    pkcuentaahorro = models.ForeignKey(Dcuentaahorro, models.DO_NOTHING, db_column='pkcuentaahorro', blank=True, null=True)
    pkcanal = models.ForeignKey(Dcanaltransaccional, models.DO_NOTHING, db_column='pkcanal', blank=True, null=True)
    tipo = models.CharField(max_length=10, blank=True, null=True)
    descripcion = models.TextField()
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha = models.DateTimeField(blank=True, null=True)
    estado = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'foperaciones'


class Fplanpagomes(models.Model):
    pkplanpago = models.AutoField(primary_key=True)
    pkcuentacredito = models.ForeignKey(Fagcuentacredito, models.DO_NOTHING, db_column='pkcuentacredito', blank=True, null=True)
    nrocuota = models.IntegerField()
    fechavencimiento = models.DateField()
    amortizacion = models.DecimalField(max_digits=10, decimal_places=2)
    interescompensatorio = models.DecimalField(max_digits=10, decimal_places=2)
    segurodesgravamen = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    montocuotatotal = models.DecimalField(max_digits=10, decimal_places=2)
    pagado = models.BooleanField(blank=True, null=True)
    fechapago = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fplanpagomes'


class UsuariosHomebanking(models.Model):
    pkusuario = models.AutoField(primary_key=True)
    pkcliente = models.ForeignKey(Dcliente, models.DO_NOTHING, db_column='pkcliente', blank=True, null=True)
    username = models.CharField(unique=True, max_length=60)
    password_hash = models.TextField()
    bloqueado = models.BooleanField(blank=True, null=True)
    intentos = models.IntegerField(blank=True, null=True)
    ultimo_acceso = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuarios_homebanking'