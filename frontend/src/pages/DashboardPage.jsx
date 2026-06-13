import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerSesion, cerrarSesion, getDashboard } from '../services/authService';
import styles from './DashboardPage.module.css';
import {
  HomeIcon, ArrowsRightLeftIcon, CreditCardIcon,
  BanknotesIcon, CircleStackIcon, QrCodeIcon,
  ArrowDownLeftIcon, ArrowUpRightIcon,
  UserCircleIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const usuario = sesion?.usuario;

  const [dashboard, setDashboard] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDashboard() {
      try {
        const data = await getDashboard(usuario.pkcliente);
        setDashboard(data);
      } catch (err) {
        console.error('Error cargando dashboard:', err);
      } finally {
        setCargando(false);
      }
    }
    if (usuario?.pkcliente) cargarDashboard();
  }, []);

  function handleLogout() {
    cerrarSesion();
    navigate('/');
  }

  const fecha = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const accesos = [
    { icono: <ArrowsRightLeftIcon className={styles.accesoIconoSvg} />, nombre: 'Transacciones' },
    { icono: <CreditCardIcon className={styles.accesoIconoSvg} />, nombre: 'Pagos' },
    { icono: <BanknotesIcon className={styles.accesoIconoSvg} />, nombre: 'Préstamos' },
    { icono: <CircleStackIcon className={styles.accesoIconoSvg} />, nombre: 'Ahorro' },
    { icono: <QrCodeIcon className={styles.accesoIconoSvg} />, nombre: 'QR Pago' },
  ];

  return (
    <div className={styles.container}>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <strong className={styles.navLogo}>BBVA</strong>
        <div className={styles.navRight}>
          <span className={styles.navUsuario}>
            <UserCircleIcon className={styles.navIcono} />
            {usuario?.nombre}
          </span>
          <button className={styles.btnLogout} onClick={handleLogout}>
            <ArrowRightOnRectangleIcon className={styles.btnLogoutIcono} />
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className={styles.layout}>

        {/* Sidebar */}
        <nav className={styles.sidebar}>
          <a className={`${styles.sidebarLink} ${styles.sidebarLinkActive}`}>
            <HomeIcon className={styles.sidebarIcono} /> Dashboard
          </a>
          <a className={styles.sidebarLink}>
            <ArrowsRightLeftIcon className={styles.sidebarIcono} /> Transacciones
          </a>
          <a className={styles.sidebarLink}>
            <CreditCardIcon className={styles.sidebarIcono} /> Pagos
          </a>
          <a className={styles.sidebarLink}>
            <BanknotesIcon className={styles.sidebarIcono} /> Préstamos
          </a>
          <a className={styles.sidebarLink}>
            <CircleStackIcon className={styles.sidebarIcono} /> Ahorro
          </a>
        </nav>

        {/* Contenido */}
        <main className={styles.main}>

          {/* Saludo */}
          <div className={styles.saludoRow}>
            <div>
              <h4 className={styles.saludo}>
                Bienvenido, {usuario?.nombre} 👋
              </h4>
              <p className={styles.fecha}>{fecha}</p>
            </div>
            <span className={styles.badgeOnline}>● En línea</span>
          </div>

          {cargando ? (
            <p style={{ color: '#636e72' }}>Cargando datos...</p>
          ) : (
            <>
              {/* Tarjetas saldo */}
              <div className={styles.tarjetasGrid}>

                {/* Cuenta Ahorros */}
                <div className={`${styles.tarjeta} ${styles.tarjetaAhorros}`}>
                  <span className={`${styles.tarjetaBadge} ${styles.badgeAhorros}`}>
                    Cuenta de Ahorro
                  </span>
                  <p className={styles.tarjetaNumero}>
                    {dashboard?.cuenta_ahorro?.numerocuenta || '---'}
                  </p>
                  <p className={`${styles.tarjetaValor} ${styles.tarjetaValorAhorros}`}>
                    S/ {parseFloat(dashboard?.cuenta_ahorro?.saldocapital || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                  <p className={styles.tarjetaSub}>PEN · Saldo disponible</p>
                </div>

                {/* Crédito Vehicular */}
                {dashboard?.creditos?.length > 0 && (
                  <div className={`${styles.tarjeta} ${styles.tarjetaCredito}`}>
                    <span className={`${styles.tarjetaBadge} ${styles.badgeCredito}`}>
                      {dashboard.creditos[0].producto}
                    </span>
                    <p className={styles.tarjetaNumero}>
                      {dashboard.creditos[0].marca} {dashboard.creditos[0].modelo} {dashboard.creditos[0].anio}
                    </p>
                    <p className={`${styles.tarjetaValor} ${styles.tarjetaValorCredito}`}>
                      S/ {parseFloat(dashboard.creditos[0].saldocapital).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                    <p className={styles.tarjetaSub}>Saldo pendiente · {dashboard.creditos[0].condicion}</p>
                  </div>
                )}

                {/* Próxima cuota */}
                {dashboard?.proxima_cuota && (
                  <div className={`${styles.tarjeta} ${styles.tarjetaCuota}`}>
                    <span className={`${styles.tarjetaBadge} ${styles.badgeCuota}`}>
                      Próxima Cuota
                    </span>
                    <p className={styles.tarjetaNumero}>
                      Cuota #{dashboard.proxima_cuota.nrocuota} · Vence {dashboard.proxima_cuota.fechavencimiento}
                    </p>
                    <p className={`${styles.tarjetaValor} ${styles.tarjetaValorCuota}`}>
                      S/ {parseFloat(dashboard.proxima_cuota.montocuotatotal).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                    <p className={styles.tarjetaSub}>
                      Capital: S/{dashboard.proxima_cuota.amortizacion} · Interés: S/{dashboard.proxima_cuota.interescompensatorio} · Seguro: S/{dashboard.proxima_cuota.segurodesgravamen}
                    </p>
                  </div>
                )}

              </div>

              {/* Accesos rápidos */}
              <p className={styles.accesosTitle}>Accesos rápidos</p>
              <div className={styles.accesosGrid}>
                {accesos.map((a) => (
                  <div key={a.nombre} className={styles.accesoCard}>
                    <div className={styles.accesoIcono}>{a.icono}</div>
                    <p className={styles.accesoNombre}>{a.nombre}</p>
                  </div>
                ))}
              </div>

              {/* Info crédito vehicular */}
              {dashboard?.creditos?.length > 0 && (
                <div className={styles.movimientos}>
                  <div className={styles.movimientosHeader}>
                    <h6 className={styles.movimientosTitle}>
                      🚗 Mi Crédito Vehicular
                    </h6>
                  </div>
                  {dashboard.creditos.map((c) => (
                    <div key={c.pkcuentacredito} className={styles.movimiento}>
                      <div className={styles.movInfo}>
                        <div className={`${styles.movIcono} ${styles.movIconoPos}`}>
                          <ArrowDownLeftIcon className={styles.movSvgPos} />
                        </div>
                        <div>
                          <p className={styles.movDesc}>
                            {c.marca} {c.modelo} {c.anio} · Placa {c.placa}
                          </p>
                          <p className={styles.movFecha}>
                            Desembolso: {c.fechadesembolso} · Tasa: {c.tasacompensatoria}% · Mora: {c.tasamoratoria}%
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className={`${styles.movMonto} ${styles.movPositivo}`}>
                          S/ {parseFloat(c.montoprestamo).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={styles.movFecha}>{c.condicion} · {c.diasatraso} días atraso</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </>
          )}

        </main>
      </div>
    </div>
  );
}