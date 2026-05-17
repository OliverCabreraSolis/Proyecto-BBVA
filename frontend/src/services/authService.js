import axios from 'axios';

const API = 'http://localhost:8000/api/auth';

export async function login(dni, password) {
  const res = await axios.post(`${API}/login/`, { dni, password });
  return res.data;
}

export async function registro(nombre, apellido, dni, email, password) {
  const res = await axios.post(`${API}/registro/`, { nombre, apellido, dni, email, password });
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