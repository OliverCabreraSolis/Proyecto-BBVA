import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getSolicitudes, getDetalleSolicitud,
  decidirSolicitud, getCarteraMora,
  obtenerSesionCore, cerrarSesionCore
} from '../services/coreService';
import styles from './DashboardCorePage.module.css';
import EstadisticasPage from './EstadisticasPage';
import {
  HomeIcon, ClipboardDocumentListIcon,
  ExclamationTriangleIcon, ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function DashboardCorePage() {
  const navigate = useNavigate();
  const sesion = obtenerSesionCore();
  const personal = sesion?.personal;

  const [vista, setVista] = useState('solicitudes');
  const [estadoFiltro, setEstadoFiltro] = useState('PENDIENTE');
  const [solicitudes, setSolicitudes] = useState([]);
  const [totalSolicitudes, setTotalSolicitudes] = useState(0);
  const [mora, setMora] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (vista === 'solicitudes') cargarSolicitudes();
    if (vista === 'mora') cargarMora();
  }, [vista, estadoFiltro]);

  async function cargarSolicitudes() {
    setCargando(true);
    try {
      const data = await getSolicitudes(estadoFiltro);
      setSolicitudes(data.solicitudes);
      setTotalSolicitudes(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  async function cargarMora() {
    setCargando(true);
    try {
      const data = await getCarteraMora();
      setMora(data.cartera);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  async function verDetalle(pksolicitud) {
    try {
      const data = await getDetalleSolicitud(pksolicitud);
      setDetalle(data);
      setModalAbierto(true);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDecision(accion) {
    try {
      const res = await decidirSolicitud(
        detalle.solicitud.pksolicitud,
        accion,
        detalle.solicitud.montopedido
      );
      setMensaje(res.message);
      setModalAbierto(false);
      cargarSolicitudes();
    } catch (err) {
      console.error(err);
    }
  }

  function handleLogout() {
    cerrarSesionCore();
    navigate('/');
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
      <nav className={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong className={styles.navLogo}>BBVA</strong>
          <span className={styles.navBadge}>CORE</span>
        </div>
        <div className={styles.navRight}>
          <div>
            <p className={styles.navUsuario}>
              <UserCircleIcon style={{ width: 16, display: 'inline', marginRight: 4 }} />
              {personal?.nombre} {personal?.apellidos}
            </p>
            <p className={styles.navCargo}>{personal?.cargo} · {personal?.agencia}</p>
          </div>
          <button className={styles.btnLogout} onClick={handleLogout}>
            <ArrowRightOnRectangleIcon style={{ width: 16, display: 'inline', marginRight: 4 }} />
            Salir
          </button>
        </div>
      </nav>

      <div className={styles.layout}>

        {/* Sidebar */}
        <nav className={styles.sidebar}>
          <div
            className={`${styles.sidebarLink} ${vista === 'estadisticas' ? styles.sidebarLinkActive : ''}`}
            onClick={() => setVista('estadisticas')}
          >
            <HomeIcon className={styles.sidebarIcono} />
            Estadísticas
          </div>
          <div
            className={`${styles.sidebarLink} ${vista === 'solicitudes' ? styles.sidebarLinkActive : ''}`}
            onClick={() => setVista('solicitudes')}
          >
            <ClipboardDocumentListIcon className={styles.sidebarIcono} />
            Solicitudes
          </div>
          <div
            className={`${styles.sidebarLink} ${vista === 'mora' ? styles.sidebarLinkActive : ''}`}
            onClick={() => setVista('mora')}
          >
            <ExclamationTriangleIcon className={styles.sidebarIcono} />
            Cartera en Mora
          </div>
        </nav>

        {/* Contenido */}
        <main className={styles.main}>

          {mensaje && <p className="success-msg" style={{ marginBottom: '1rem' }}>{mensaje}</p>}
          {/* Vista Estadísticas */}
          {vista === 'estadisticas' && <EstadisticasPage />}   
          {/* Vista Solicitudes */}
          {vista === 'solicitudes' && (
            <>
              <h2 className={styles.pageTitle}>Bandeja de Solicitudes</h2>
              <p className={styles.pageSubtitle}>
                {totalSolicitudes} solicitud(es) · {estadoFiltro}
              </p>

              {/* Filtros */}
              <div className={styles.filtros}>
                {['PENDIENTE', 'EN_EVALUACION', 'APROBADO', 'RECHAZADO', 'DESEMBOLSADO'].map(e => (
                  <button
                    key={e}
                    className={`${styles.filtroBtn} ${estadoFiltro === e ? styles.filtroBtnActivo : ''}`}
                    onClick={() => setEstadoFiltro(e)}
                  >
                    {e.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Tabla */}
              <div className={styles.tabla}>
                <div className={styles.tablaHeader}>
                  <span>#</span>
                  <span>Cliente</span>
                  <span>Producto</span>
                  <span>Monto</span>
                  <span>Plazo</span>
                  <span>Estado</span>
                  <span>Acción</span>
                </div>

                {cargando ? (
                  <p className={styles.vacio}>Cargando...</p>
                ) : solicitudes.length === 0 ? (
                  <p className={styles.vacio}>No hay solicitudes en este estado</p>
                ) : (
                  solicitudes.map((s) => (
                    <div key={s.pksolicitud} className={styles.tablaFila}>
                      <span style={{ color: '#b2bec3', fontSize: '0.85rem' }}>#{s.pksolicitud}</span>
                      <div>
                        <p className={styles.clienteNombre}>
                          {s.cliente?.nombre} {s.cliente?.apellidopaterno}
                        </p>
                        <p className={styles.clienteDni}>{s.cliente?.numerodocumento}</p>
                      </div>
                      <span style={{ fontSize: '0.85rem' }}>{s.producto}</span>
                      <span className={styles.monto}>
                        S/ {parseFloat(s.montopedido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                      <span style={{ fontSize: '0.85rem' }}>{s.plazomeses} meses</span>
                      <span className={`${styles.badge} ${getBadgeClass(s.estado)}`}>
                        {s.estado}
                      </span>
                      <button className={styles.btnVer} onClick={() => verDetalle(s.pksolicitud)}>
                        Ver
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Vista Mora */}
          {vista === 'mora' && (
            <>
              <h2 className={styles.pageTitle}>Cartera en Mora</h2>
              <p className={styles.pageSubtitle}>
                {mora.length} cliente(s) con días de atraso
              </p>

              {cargando ? (
                <p>Cargando...</p>
              ) : mora.length === 0 ? (
                <p className={styles.vacio}>No hay clientes en mora 🎉</p>
              ) : (
                mora.map((c) => (
                  <div
                    key={c.pkcuentacredito}
                    className={`${styles.moraCard} ${c.banda === 'ALTO' ? styles.moraCardAlto : c.banda === 'MEDIO' ? styles.moraCardMedio : ''}`}
                  >
                    <div>
                      <p className={styles.moraNombre}>{c.cliente}</p>
                      <p className={styles.moraDni}>DNI: {c.numerodocumento} · Cel: {c.celular}</p>
                      <p style={{ fontSize: '0.85rem', color: '#636e72', marginTop: '0.3rem' }}>
                        Saldo: S/ {parseFloat(c.saldocapital).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className={styles.moraDias}>{c.diasatraso} días</p>
                      <span className={`${styles.moraBanda} ${styles[`banda${c.banda.charAt(0) + c.banda.slice(1).toLowerCase()}`]}`}>
                        {c.banda}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

        </main>
      </div>

      {/* Modal detalle solicitud */}
      {modalAbierto && detalle && (
        <div className={styles.modalOverlay} onClick={() => setModalAbierto(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              Solicitud #{detalle.solicitud.pksolicitud} — {detalle.solicitud.estado}
            </h3>

            <div className={styles.modalGrid}>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Cliente</span>
                <span className={styles.modalValue}>
                  {detalle.solicitud.cliente?.nombre} {detalle.solicitud.cliente?.apellidopaterno}
                </span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>DNI</span>
                <span className={styles.modalValue}>{detalle.solicitud.cliente?.numerodocumento}</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Producto</span>
                <span className={styles.modalValue}>{detalle.solicitud.producto}</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Agencia</span>
                <span className={styles.modalValue}>{detalle.solicitud.agencia}</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Monto Pedido</span>
                <span className={styles.modalValue}>
                  S/ {parseFloat(detalle.solicitud.montopedido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Plazo</span>
                <span className={styles.modalValue}>{detalle.solicitud.plazomeses} meses</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Tasa Compensatoria</span>
                <span className={styles.modalValue}>{detalle.solicitud.tasacompensatoria}%</span>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalLabel}>Tasa Moratoria</span>
                <span className={styles.modalValue}>{detalle.solicitud.tasamoratoria}%</span>
              </div>
            </div>

            {/* Análisis de capacidad de pago */}
            <div className={styles.analisis}>
              <p className={styles.analisisTitle}>📊 Análisis de Capacidad de Pago</p>
              <div className={styles.analisisItem}>
                <span>Ingresos mensuales:</span>
                <strong>S/ {parseFloat(detalle.analisis.ingresos_mensuales).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className={styles.analisisItem}>
                <span>Capacidad de pago (30%):</span>
                <strong>S/ {parseFloat(detalle.analisis.capacidad_pago_30).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className={styles.analisisItem}>
                <span>Cuota estimada:</span>
                <strong>S/ {parseFloat(detalle.analisis.cuota_estimada).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
              </div>
              <p className={`${styles.viable}`} style={{ color: detalle.analisis.viable ? '#00b894' : '#e74c3c' }}>
                {detalle.analisis.mensaje}
              </p>
            </div>

            {(detalle.solicitud.estado === 'Pendiente' || detalle.solicitud.estado === 'En Evaluación') && (
              <div className={styles.modalBtns}>
                <button
                  className="btn btn-success"
                  style={{ flex: 1 }}
                  onClick={() => handleDecision('APROBAR')}
                >
                  ✅ Aprobar
                </button>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={() => handleDecision('RECHAZAR')}
                >
                  ❌ Rechazar
                </button>
              </div>
            )}

            <button
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => setModalAbierto(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}