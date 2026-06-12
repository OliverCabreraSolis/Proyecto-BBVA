import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registro, guardarSesion } from '../services/authService';
import styles from './RegisterPage.module.css';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const TIPOS_DOCUMENTO = [
  'DNI',
  'RUC',
  'Pasaporte',
  'Carné de Extranjería',
  'Carné Identidad Militar',
  'Carné Diplomático',
  'Partida de Nacimiento',
  'Carné PTP',
  'Doc. Identidad País Origen',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: 'DNI',
    dni: '',
    email: '',
    password: '',
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');

    if (!form.nombre || !form.apellido || !form.dni || !form.email || !form.password) {
      setError('Completa todos los campos.');
      return;
    }

    setCargando(true);
    try {
      const data = await registro(
        form.nombre,
        form.apellido,
        form.tipo_documento,
        form.dni,
        form.email,
        form.password
      );
      guardarSesion(data.token, data.user);
      setExito('¡Cuenta creada exitosamente! Redirigiendo...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar. Inténtalo de nuevo.');
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
        <span className={styles.navLink} onClick={() => navigate('/login')}>
          ¿Ya tienes cuenta? Inicia sesión
        </span>
      </nav>

      {/* Contenido */}
      <div className={styles.content}>
        <div className={styles.card}>

          <h1 className={styles.title}>Abre tu cuenta BBVA</h1>
          <p className={styles.subtitle}>
            Completa tus datos para registrarte en Banca por Internet
          </p>

          <form onSubmit={handleSubmit}>

            {/* Nombre y Apellido */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Nombre</label>
                <input
                  className={styles.input}
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Apellido</label>
                <input
                  className={styles.input}
                  type="text"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            {/* Tipo documento */}
            <div className={styles.field}>
              <label className={styles.label}>Tipo de documento</label>
              <select
                className={styles.select}
                name="tipo_documento"
                value={form.tipo_documento}
                onChange={handleChange}
              >
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            {/* Número documento */}
            <div className={styles.field}>
              <label className={styles.label}>Número de documento</label>
              <input
                className={styles.input}
                type="text"
                name="dni"
                value={form.dni}
                onChange={handleChange}
                placeholder={form.tipo_documento === 'DNI' ? '8 dígitos' : 'Número de documento'}
                maxLength={form.tipo_documento === 'DNI' ? 8 : 20}
              />
              {form.tipo_documento === 'DNI' && (
                <span className={styles.hint}>Solo números, exactamente 8 dígitos</span>
              )}
            </div>

            <hr className={styles.divider} />

            {/* Email */}
            <div className={styles.field}>
              <label className={styles.label}>Correo electrónico</label>
              <input
                className={styles.input}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            {/* Contraseña */}
            <div className={styles.field}>
              <label className={styles.label}>Contraseña de Banca por Internet</label>
              <div className={styles.passwordWrapper}>
                <input
                  className={styles.passwordInput}
                  type={verPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Máx. 6 caracteres, solo letras y números"
                  maxLength={6}
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
              <span className={styles.hint}>
                Máximo 6 caracteres · Solo letras y números · Sin espacios ni símbolos
              </span>
            </div>

            {error && <p className="error-msg">{error}</p>}
            {exito && <p className="success-msg">{exito}</p>}

            <div className={styles.btnGroup}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={cargando}
                style={{ flex: 1, opacity: cargando ? 0.7 : 1 }}
              >
                {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => navigate('/login')}
              >
                Ya tengo cuenta
              </button>
            </div>

          </form>

          <p className={styles.loginLink}>
            ¿Ya eres cliente BBVA?{' '}
            <button className={styles.loginLinkBtn} onClick={() => navigate('/login')}>
              Inicia sesión aquí
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}