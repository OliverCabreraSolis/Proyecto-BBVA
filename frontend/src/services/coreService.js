import axios from 'axios';

const API = 'http://localhost:8001/api/core';

export async function loginCore(dni, password) {
  const res = await axios.post(`${API}/login/`, { dni, password });
  return res.data;
}

export async function getSolicitudes(estado = 'PENDIENTE') {
  const res = await axios.get(`${API}/solicitudes/?estado=${estado}`);
  return res.data;
}

export async function getDetalleSolicitud(pksolicitud) {
  const res = await axios.get(`${API}/solicitudes/${pksolicitud}/`);
  return res.data;
}

export async function decidirSolicitud(pksolicitud, accion, montoaprobado) {
  const res = await axios.put(`${API}/solicitudes/${pksolicitud}/decidir/`, {
    accion,
    montoaprobado
  });
  return res.data;
}

export async function getCarteraMora() {
  const res = await axios.get(`${API}/cartera/mora/`);
  return res.data;
}

export function guardarSesionCore(token, personal) {
  localStorage.setItem('core_token', token);
  localStorage.setItem('core_personal', JSON.stringify(personal));
}

export function obtenerSesionCore() {
  const token = localStorage.getItem('core_token');
  const personal = localStorage.getItem('core_personal');
  if (!token) return null;
  return { token, personal: JSON.parse(personal) };
}

export function cerrarSesionCore() {
  localStorage.removeItem('core_token');
  localStorage.removeItem('core_personal');
}

export function haySesionCore() {
  return !!localStorage.getItem('core_token');
}

export async function getEstadisticas(agencia_id = null) {
  const params = agencia_id ? `?agencia=${agencia_id}` : '';
  const res = await axios.get(`${API}/estadisticas/${params}`);
  return res.data;
}