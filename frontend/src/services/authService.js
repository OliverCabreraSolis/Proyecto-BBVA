import axios from 'axios';

const API = 'http://localhost:8000/api/auth';

// Login original (DNI)
export async function login(dni, password) {
  const res = await axios.post(`${API}/login/`, { dni, password });
  return res.data;
}

// Login homebanking (username)
export async function loginHomebanking(username, password) {
  const res = await axios.post(`${API}/homebanking/login/`, { username, password });
  return res.data;
}

// Dashboard cliente
export async function getDashboard(pkcliente) {
  const res = await axios.get(`${API}/homebanking/dashboard/${pkcliente}/`);
  return res.data;
}

// Cronograma de pagos
export async function getCronograma(pkcuentacredito, token) {
  const res = await axios.get(`${API}/homebanking/cronograma/${pkcuentacredito}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function registro(nombre, apellido, tipo_documento, dni, email, password) {
  const res = await axios.post(`${API}/registro/`, {
    nombre, apellido, tipo_documento, dni, email, password
  });
  return res.data;
}

export function guardarSesion(token, usuario) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

export function obtenerSesion() {
  const token = localStorage.getItem('token');
  const usuario = localStorage.getItem('usuario');
  if (!token) return null;
  return { token, usuario: JSON.parse(usuario) };
}

export function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function haySesion() {
  return !!localStorage.getItem('token');
}

export async function crearSolicitud(pkcliente, montopedido, plazomeses, pkproducto, proposito) {
  const res = await axios.post(`${API}/homebanking/solicitud/`, {
    pkcliente, montopedido, plazomeses, pkproducto, proposito
  });
  return res.data;
}

export async function getMisSolicitudes(pkcliente) {
  const res = await axios.get(`${API}/homebanking/mis-solicitudes/${pkcliente}/`);
  return res.data;
}