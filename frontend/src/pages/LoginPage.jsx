import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, guardarSesion } from '../services/authService';
import styles from './LoginPage.module.css';
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const navigate = useNavigate();
  const [documento, setDocumento] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [recordar, setRecordar] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!documento || !password) {
      setError('Completa todos los campos');
      return;
    }
    setCargando(true);
    try {
      const data = await login(documento, password);
      guardarSesion(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className={styles.container}>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <strong className={styles.logo} onClick={() => navigate('/')}>
          BBVA
        </strong>
        <span className={styles.navLink} onClick={() => navigate('/')}>
          Ir a BBVA Perú
        </span>
      </nav>

      {/* Contenido dos columnas */}
      <div className={styles.content}>

        {/* Columna izquierda — Formulario */}
        <div className={styles.formCol}>
          <h1 className={styles.title}>¡Hola!</h1>
          <p className={styles.subtitle}>
            Completa tus datos y disfruta de tu Banca por Internet
          </p>

          <form onSubmit={handleSubmit}>

            {/* Tipo documento */}
            <label className={styles.label}>Tipo de documento</label>
            <select className={styles.select}>
              <option>DNI</option>
              <option>CE</option>
              <option>Pasaporte</option>
            </select>

            {/* Número documento */}
            <label className={styles.label}>Número de documento</label>
            <input
              type="text"
              className={styles.input}
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder="Número de documento"
              maxLength={8}
            />

            {/* Recordar */}
            <div
              className={styles.checkRow}
              onClick={() => setRecordar(!recordar)}
            >
              <div className={`${styles.checkbox} ${recordar ? styles.checkboxActivo : ''}`}>
                {recordar && (
                  <svg className={styles.checkIcono} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={styles.checkLabel}>Recordar documento</span>
            </div>

            {/* Contraseña */}
            <label className={styles.label}>Contraseña de Banca por Internet</label>
            <div className={styles.passwordWrapper}>
              <input
                type={verPassword ? 'text' : 'password'}
                className={styles.passwordInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setVerPassword(!verPassword)}
              >
                {verPassword
                  ? <EyeSlashIcon className={styles.eyeIcono} />
                  : <EyeIcon className={styles.eyeIcono} />
                }
              </button>
            </div>

            <span className={styles.olvidaste}>
              ¿Olvidaste o bloqueaste tu contraseña?
            </span>

            {error && <p className="error-msg">{error}</p>}

            <div className={styles.btnGroup}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={cargando}
                style={{ flex: 1, opacity: cargando ? 0.7 : 1 }}
              >
                {cargando ? 'Verificando...' : 'Ingresar'}
              </button>
              <button
                type="button"
                className="btn btn-outline  "
                style={{ flex: 1 }}
              >
                Afíliate
              </button>
            </div>

          </form>
        </div>

        {/* Columna derecha — Promo */}
        <div className={styles.promoCol}>
          <span className={styles.promoBadge}>¡Nuevo!</span>

          <div className={styles.lockWrapper}>
            <LockClosedIcon className={styles.lockIcono} />
          </div>

          <div className={styles.sslBadge}>
            <ShieldCheckIcon className={styles.sslIcono} />
            Conexión cifrada SSL
          </div>

          <h2 className={styles.promoTitle}>
            Hazte cliente BBVA,<br />sin trámites ni colas.
          </h2>
          <p className={styles.promoDesc}>
            Abre tu Cuenta Digital en minutos y empieza a ahorrar desde donde estés.
          </p>

          <button className="btn btn-primary" style={{ width: '100%' }}>
            Descarga aquí
          </button>

          <p className={styles.telefono}>
            ¿Problemas para ingresar? Llama al{' '}
            <span className={styles.telefonoNum}>0800-011-0006</span>
          </p>
        </div>

      </div>
    </div>
  );
}