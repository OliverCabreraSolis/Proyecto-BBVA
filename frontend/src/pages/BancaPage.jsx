import { useNavigate } from 'react-router-dom';
import styles from './BancaPage.module.css';

export default function BancaPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>

      {/* Navbar */}
      <nav className={styles.navbar} onClick={() => navigate('/')}>
        <strong className={styles.logo}>BBVA</strong>
        <span style={{ color: '#004A97', fontWeight: 600, fontSize: '0.95rem' }}>
          Ir a BBVA Perú
        </span>
      </nav>

      {/* Contenido */}
      <div className={styles.content}>
        <div className={styles.card}>

          <div className={styles.iconWrapper}>🔒</div>

          <h2 className={styles.title}>Banca por Internet</h2>

          <div className={styles.badge}>
            ✅ Conexión cifrada SSL
          </div>

          <p className={styles.desc}>
            Ingresa con tu usuario y contraseña para acceder 
            a tus productos BBVA de forma segura.
          </p>

          <div className={styles.btnGroup}>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Ingresar a mi cuenta
            </button>
            <button className="btn btn-outline">
              Afiliarme a Banca por Internet
            </button>
          </div>

          <p className={styles.telefono}>
            ¿Problemas para ingresar? Llama al{' '}
            <span className={styles.telefonoNum}>0800-011-0006</span>
          </p>

        </div>
      </div>

    </div>
  );
}