import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginCore, guardarSesionCore } from '../services/coreService';
import styles from './LoginCorePage.module.css';

export default function LoginCorePage() {
  const navigate = useNavigate();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!dni || !password) {
      setError('Completa todos los campos');
      return;
    }
    setCargando(true);
    try {
      const data = await loginCore(dni, password);
      guardarSesionCore(data.token, data.personal);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>BBVA</div>
          <span className={styles.badge}>CORE BANCARIO</span>
          <h2 className={styles.title}>Acceso al Sistema</h2>
          <p className={styles.subtitle}>Solo personal autorizado</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className={styles.label}>DNI del empleado</label>
          <input
            className={styles.input}
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="Número de DNI"
            maxLength={8}
          />

          <label className={styles.label}>Contraseña</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && <p className="error-msg">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={cargando}
            style={{ width: '100%', marginTop: '1rem', opacity: cargando ? 0.7 : 1 }}
          >
            {cargando ? 'Verificando...' : 'Ingresar al Core'}
          </button>
        </form>

        <p className={styles.footer}>
          BBVA Perú · Sistema Core Bancario · Uso interno
        </p>
      </div>
    </div>
  );
}