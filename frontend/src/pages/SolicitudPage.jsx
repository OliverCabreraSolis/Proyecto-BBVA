import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerSesion, crearSolicitud, getMisSolicitudes } from '../services/authService';
import styles from './SolicitudPage.module.css';

export default function SolicitudPage() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const usuario = sesion?.usuario;

  const [monto, setMonto] = useState('25000');
  const [plazo, setPlazo] = useState('24');
  const [producto, setProducto] = useState('1');
  const [proposito, setProposito] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    if (usuario?.pkcliente) cargarSolicitudes();
  }, []);

  async function cargarSolicitudes() {
    try {
      const data = await getMisSolicitudes(usuario.pkcliente);
      setSolicitudes(data.solicitudes);
    } catch (err) {
      console.error(err);
    }
  }

  // Simulación de cuota
  const tasaAnual = 12.50;
  const tasaMensual = tasaAnual / 100 / 12;
  const montoNum = parseFloat(monto) || 0;
  const plazoNum = parseInt(plazo) || 1;
  const cuotaEstimada = montoNum > 0
    ? (montoNum * (tasaMensual * Math.pow(1 + tasaMensual, plazoNum))) / (Math.pow(1 + tasaMensual, plazoNum) - 1)
    : 0;

    async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!monto || !plazo || !producto) {
        setError('Completa todos los campos');
        return;
    }

    setCargando(true);
    try {
        const res = await crearSolicitud(
        usuario.pkcliente,
        montoNum,
        plazoNum,
        parseInt(producto),
        proposito
        );
        setMensaje(res.message + ' Redirigiendo al dashboard...');
        setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
        setError(err.response?.data?.message || 'Error al enviar la solicitud');
        setCargando(false);
    }
    }

  function getBadgeClass(estado) {
    if (estado === 'Pendiente') return styles.badgePendiente;
    if (estado === 'Aprobado') return styles.badgeAprobado;
    if (estado === 'Rechazado') return styles.badgeRechazado;
    if (estado === 'Desembolsado') return styles.badgeDesembolsado;
    return styles.badgePendiente;
  }

  return (
    <div className={styles.container}>

      {/* Navbar */}
        <nav className={styles.navbar} style={{ justifyContent: 'space-between' }}>
        <strong className={styles.navLogo} style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            BBVA
        </strong>
        <button
            onClick={() => navigate('/dashboard')}
            style={{
            background: 'transparent', border: '1.5px solid white',
            color: 'white', padding: '0.4rem 1rem', borderRadius: 20,
            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
            }}
        >
            ← Volver al Dashboard
        </button>
        </nav>

      <div className={styles.content}>
        <div className={styles.card}>

          <h2 className={styles.title}>Solicitar Crédito Vehicular</h2>
          <p className={styles.subtitle}>
            Completa el formulario y un asesor evaluará tu solicitud
          </p>

          <form onSubmit={handleSubmit}>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Monto solicitado (S/)</label>
                <input
                  className={styles.input}
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  min="5000"
                  max="100000"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Plazo (meses)</label>
                <select
                  className={styles.select}
                  value={plazo}
                  onChange={(e) => setPlazo(e.target.value)}
                >
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                  <option value="48">48 meses</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Tipo de crédito vehicular</label>
              <select
                className={styles.select}
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
              >
                <option value="1">Crédito Vehicular - Convenio</option>
                <option value="2">Crédito Vehicular - Nuevo</option>
                <option value="3">Crédito Vehicular - Usado</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Propósito / Detalle del vehículo</label>
              <input
                className={styles.input}
                type="text"
                value={proposito}
                onChange={(e) => setProposito(e.target.value)}
                placeholder="Ej: Toyota Yaris 2024, uso personal"
              />
            </div>

            {/* Simulación */}
            <div className={styles.simulacion}>
              <p className={styles.simulacionTitle}>📊 Simulación de tu crédito</p>
              <div className={styles.simulacionItem}>
                <span>Monto a financiar:</span>
                <strong>S/ {montoNum.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className={styles.simulacionItem}>
                <span>Plazo:</span>
                <strong>{plazoNum} meses</strong>
              </div>
              <div className={styles.simulacionItem}>
                <span>Tasa compensatoria anual:</span>
                <strong>{tasaAnual}%</strong>
              </div>
              <p className={styles.simulacionCuota}>
                Cuota estimada: S/ {cuotaEstimada.toLocaleString('es-PE', { minimumFractionDigits: 2 })}/mes
              </p>
            </div>

            {error && <p className="error-msg">{error}</p>}
            {mensaje && <p className="success-msg">{mensaje}</p>}

            <button
            type="submit"
            className="btn btn-primary"
            disabled={cargando || mensaje}
            style={{ width: '100%', marginTop: '1rem', opacity: (cargando || mensaje) ? 0.7 : 1 }}
            >
            {cargando ? 'Enviando...' : mensaje ? 'Enviado ✓' : 'Enviar Solicitud'}
            </button>

          </form>

          {/* Lista de solicitudes */}
          {solicitudes.length > 0 && (
            <>
              <h3 className={styles.listaTitle}>Mis Solicitudes</h3>
              {solicitudes.map((s) => (
                <div key={s.pksolicitud} className={styles.solicitudCard}>
                  <div className={styles.solicitudInfo}>
                    <p>{s.producto}</p>
                    <p>
                      S/ {parseFloat(s.montopedido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      {' '}· {s.plazomeses} meses · #{s.pksolicitud}
                    </p>
                  </div>
                  <span className={`${styles.badge} ${getBadgeClass(s.estado)}`}>
                    {s.estado}
                  </span>
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  );
}