import { useNavigate } from 'react-router-dom';
import { obtenerSesion, cerrarSesion } from '../services/authService';
import styles from './DashboardPage.module.css';
import {
  HomeIcon,
  ArrowsRightLeftIcon,
  CreditCardIcon,
  BanknotesIcon,
  CircleStackIcon,
  QrCodeIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const usuario = sesion?.usuario;

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

  const movimientos = [
    { desc: 'Depósito en cuenta', monto: '+S/ 500.00', fecha: '14/05/2026', positivo: true },
    { desc: 'Pago de servicio luz', monto: '-S/ 120.00', fecha: '13/05/2026', positivo: false },
    { desc: 'Transferencia recibida', monto: '+S/ 200.00', fecha: '12/05/2026', positivo: true },
    { desc: 'Compra con tarjeta', monto: '-S/ 85.00', fecha: '11/05/2026', positivo: false },
    { desc: 'Pago de préstamo', monto: '-S/ 350.00', fecha: '10/05/2026', positivo: false },
  ];

  return (
    <div className={styles.container}>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <strong className={styles.navLogo}>BBVA</strong>
        <div className={styles.navRight}>
          <span className={styles.navUsuario}>
            <UserCircleIcon className={styles.navIcono} />
            {usuario?.nombre || usuario?.email}
          </span>
          <button className={styles.btnLogout} onClick={handleLogout}>
            <ArrowRightOnRectangleIcon className={styles.btnLogoutIcono} />
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Layout */}
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

        {/* Contenido principal */}
        <main className={styles.main}>

          {/* Saludo */}
          <div className={styles.saludoRow}>
            <div>
              <h4 className={styles.saludo}>
                Bienvenido, {usuario?.nombre || usuario?.email} 👋
              </h4>
              <p className={styles.fecha}>{fecha}</p>
            </div>
            <span className={styles.badgeOnline}>● En línea</span>
          </div>

          {/* Tarjetas saldo */}
          <div className={styles.tarjetasGrid}>
            <div className={`${styles.tarjeta} ${styles.tarjetaAhorros}`}>
              <span className={`${styles.tarjetaBadge} ${styles.badgeAhorros}`}>
                Cuenta de Ahorro
              </span>
              <p className={styles.tarjetaNumero}>••• - •••••• - 4521</p>
              <p className={`${styles.tarjetaValor} ${styles.tarjetaValorAhorros}`}>
                S/ 3,450.00
              </p>
              <p className={styles.tarjetaSub}>PEN · Saldo disponible</p>
            </div>

            <div className={`${styles.tarjeta} ${styles.tarjetaCredito}`}>
              <span className={`${styles.tarjetaBadge} ${styles.badgeCredito}`}>
                Crédito Activo
              </span>
              <p className={styles.tarjetaNumero}>••• - •••••• - 8832</p>
              <p className={`${styles.tarjetaValor} ${styles.tarjetaValorCredito}`}>
                S/ 8,000.00
              </p>
              <p className={styles.tarjetaSub}>PEN · Saldo pendiente</p>
            </div>

            <div className={`${styles.tarjeta} ${styles.tarjetaCuota}`}>
              <span className={`${styles.tarjetaBadge} ${styles.badgeCuota}`}>
                Próxima Cuota
              </span>
              <p className={styles.tarjetaNumero}>Vence en 30 días</p>
              <p className={`${styles.tarjetaValor} ${styles.tarjetaValorCuota}`}>
                15/06/2026
              </p>
              <p className={styles.tarjetaSub}>S/ 350.00 a pagar</p>
            </div>
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

          {/* Movimientos */}
          <div className={styles.movimientos}>
            <div className={styles.movimientosHeader}>
              <h6 className={styles.movimientosTitle}>
                Últimos movimientos
              </h6>
              <button className={styles.verTodos}>Ver todos</button>
            </div>

            {movimientos.map((m, i) => (
              <div key={i} className={styles.movimiento}>
                <div className={styles.movInfo}>
                  <div className={`${styles.movIcono} ${m.positivo ? styles.movIconoPos : styles.movIconoNeg}`}>
                    {m.positivo
                      ? <ArrowDownLeftIcon className={styles.movSvgPos} />
                      : <ArrowUpRightIcon className={styles.movSvgNeg} />
                    }
                  </div>
                  <div>
                    <p className={styles.movDesc}>{m.desc}</p>
                    <p className={styles.movFecha}>{m.fecha}</p>
                  </div>
                </div>
                <p className={`${styles.movMonto} ${m.positivo ? styles.movPositivo : styles.movNegativo}`}>
                  {m.monto}
                </p>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}