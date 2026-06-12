import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const navigate = useNavigate();

  const productos = [
    { emoji: '👤', titulo: 'Hazte Cliente BBVA' },
    { emoji: '💸', titulo: 'Afíliate a Plin' },
    { emoji: '💳', titulo: 'Obtén tu Tarjeta de Crédito' },
    { emoji: '🏦', titulo: 'Necesito un Préstamo' },
    { emoji: '🐷', titulo: 'Quiero una cuenta de ahorros' },
    { emoji: '📈', titulo: 'Abre tu Depósito a Plazo' },
  ];

  return (
    <div>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <strong className={styles.logo}>BBVA</strong>
        <div className={styles.navLinks}>
          <span className={styles.navLink}>Personas</span>
          <span className={styles.navLink}>Empresas</span>
          <span className={styles.navLink} onClick={() => navigate('/register')} 
            >Obtén tu Tarjeta de Crédito
            </span>
          <span className={styles.navLink} onClick={() => navigate('/register')}
            >Abre tu cuenta ▾
            </span>
          <button className="btn btn-primary" onClick={() => navigate('/banca')}>
            Banca por Internet
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.heroSubtitle}>Tarjeta de Crédito BBVA</p>
          <h1 className={styles.heroTitle}>
            ¡Queremos verte en la tribuna!
          </h1>
          <p className={styles.heroDesc}>
            Gana uno de los dos paquetes dobles a la Copa Mundial de la FIFA 2026™
            gracias a Visa. Además, sorteamos cientos de premios entre consolas,
            televisores, parrillas y más.
          </p>
          <div className={styles.heroButtons}>
            <button className="btn btn-primary">Solicítala aquí</button>
            <button className="btn btn-outline" onClick={() => navigate('/register')}>
              Inscríbete aquí
            </button>
          </div>
        </div>

        <div className={styles.heroImage}>
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
            alt="BBVA Hero"
          />
        </div>
      </section>

      {/* Productos */}
      <section className={styles.productos}>
        <h2 className={styles.productosTitle}>
          Tú decides el ritmo. Nosotros te damos las herramientas.
        </h2>
        <div className={styles.productosGrid}>
          {productos.map((p) => (
            <div key={p.titulo} className={styles.productoCard}>
              <div className={styles.productoEmoji}>{p.emoji}</div>
              <p className={styles.productoNombre}>{p.titulo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className={styles.banner}>
        <h2 className={styles.bannerTitle}>Tu banco siempre contigo</h2>
        <p className={styles.bannerDesc}>
          Descarga la app BBVA y maneja tus finanzas desde donde estés.
        </p>
        <button className="btn btn-white">Descarga la app</button>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        BBVA Perú S.A. | Supervisado por la SBS | 0800-011-0006
      </footer>

    </div>
  );
}