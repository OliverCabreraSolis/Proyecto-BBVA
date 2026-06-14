import { useState, useEffect } from 'react';
import { getEstadisticas } from '../services/coreService';
import styles from './EstadisticasPage.module.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, FunnelChart, Funnel, LabelList,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORES = ['#004A97', '#00b894', '#e17055', '#fdcb6e', '#6c5ce7', '#e74c3c'];

export default function EstadisticasPage() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState('');

  useEffect(() => {
    cargar(agenciaSeleccionada);
  }, [agenciaSeleccionada]);

  async function cargar(agencia_id) {
    setCargando(true);
    try {
      const res = await getEstadisticas(agencia_id || null);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  if (cargando) return <div className={styles.container}><p>Cargando estadísticas...</p></div>;
  if (!data) return <div className={styles.container}><p>Error cargando datos</p></div>;

  const { kpis, agencias, por_condicion, por_marca, embudo_solicitudes, matriz_regional } = data;

  function getMoraClass() {
    if (kpis.ratio_mora <= 4) return styles.kpiMoraVerde;
    if (kpis.ratio_mora <= 8) return styles.kpiMoraAmarillo;
    return styles.kpiMoraRojo;
  }

  function getCelClass(condicion, valor) {
    if (valor === 0) return styles.celVacio;
    if (condicion === 'Vigente') return styles.celVigente;
    if (condicion === 'Vencido') return styles.celVencido;
    if (condicion === 'Cobranza Judicial') return styles.celJudicial;
    return '';
  }

  const condiciones = matriz_regional.length > 0
    ? Object.keys(matriz_regional[0]).filter(k => k !== 'agencia')
    : [];

  const embudoOrdenado = [...embudo_solicitudes].sort((a, b) => b.cantidad - a.cantidad);

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h2 className={styles.pageTitle}>Dashboard Gerencial</h2>
        {/* Selector de agencia */}
        <select
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 8,
            border: '1.5px solid #dfe6e9',
            fontSize: '0.9rem',
            color: '#2d3436',
            cursor: 'pointer'
          }}
          value={agenciaSeleccionada}
          onChange={(e) => setAgenciaSeleccionada(e.target.value)}
        >
          <option value="">Todas las agencias</option>
          {agencias.map(a => (
            <option key={a.pkagencia} value={a.pkagencia}>
              {a.desagencia}
            </option>
          ))}
        </select>
      </div>
      <p className={styles.pageSubtitle}>
        Control de Riesgos y Gestión de Mora — Crédito Vehicular BBVA
        {agenciaSeleccionada && ` · ${agencias.find(a => a.pkagencia == agenciaSeleccionada)?.desagencia}`}
      </p>

      {/* KPIs */}
      <div className={styles.kpisGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiSano}`}>
          <p className={styles.kpiLabel}>Monto Total Colocado</p>
          <p className={styles.kpiValor}>
            S/ {kpis.monto_total_colocado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiRiesgo}`}>
          <p className={styles.kpiLabel}>Cartera Atrasada</p>
          <p className={styles.kpiValor}>
            S/ {kpis.cartera_atrasada.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiMora}`}>
          <p className={styles.kpiLabel}>Ratio de Mora</p>
          <p className={`${styles.kpiMoraValor} ${getMoraClass()}`}>
            {kpis.ratio_mora}%
          </p>
          <p style={{ fontSize: '0.8rem', color: '#636e72', marginTop: '0.3rem' }}>
            {kpis.ratio_mora <= 4 ? '🟢 Cartera Sana' : kpis.ratio_mora <= 8 ? '🟡 Alerta Preventiva' : '🔴 Estado Crítico'}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className={styles.graficosGrid}>

        {/* Barras por Marca */}
        <div className={styles.graficoCard}>
          <h3 className={styles.graficoTitle}>🚗 Riesgo por Marca de Vehículo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={por_marca} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => `S/${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="marca" width={80} />
              <Tooltip formatter={(v) => `S/ ${v.toLocaleString('es-PE')}`} />
              <Bar dataKey="saldo" name="Saldo Capital">
                {por_marca.map((_, i) => (
                  <Cell key={i} fill={COLORES[i % COLORES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie por Condición */}
        <div className={styles.graficoCard}>
          <h3 className={styles.graficoTitle}>📊 Distribución por Condición</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={por_condicion}
                dataKey="saldo"
                nameKey="condicion"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ condicion, percent }) => `${condicion} ${(percent * 100).toFixed(0)}%`}
              >
                {por_condicion.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#00b894' : i === 1 ? '#fdcb6e' : '#e74c3c'} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `S/ ${v.toLocaleString('es-PE')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Embudo */}
        <div className={styles.graficoCard}>
          <h3 className={styles.graficoTitle}>🔻 Embudo de Solicitudes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <FunnelChart>
              <Tooltip formatter={(v) => `${v} solicitudes`} />
              <Funnel dataKey="cantidad" data={embudoOrdenado} isAnimationActive>
                <LabelList position="center" fill="#fff" stroke="none" dataKey="estado" />
                {embudoOrdenado.map((_, i) => (
                  <Cell key={i} fill={COLORES[i % COLORES.length]} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Barras por Agencia */}
        <div className={styles.graficoCard}>
          <h3 className={styles.graficoTitle}>🏦 Cartera por Agencia</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={matriz_regional}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agencia" tick={{ fontSize: 9 }} />
              <YAxis tickFormatter={(v) => `S/${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `S/ ${v.toLocaleString('es-PE')}`} />
              <Bar dataKey="Vigente" fill="#00b894" name="Vigente" />
              <Bar dataKey="Vencido" fill="#fdcb6e" name="Vencido" />
              <Bar dataKey="Cobranza Judicial" fill="#e74c3c" name="Judicial" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Matriz Regional */}
      <div className={styles.matrizCard}>
        <h3 className={styles.graficoTitle}>🗺️ Matriz de Calor Regional</h3>
        <table className={styles.matrizTable}>
          <thead>
            <tr>
              <th>Agencia</th>
              {condiciones.map(c => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {matriz_regional.map((fila, i) => (
              <tr key={i}>
                <td>{fila.agencia}</td>
                {condiciones.map(c => (
                  <td key={c} className={getCelClass(c, fila[c])}>
                    {fila[c] > 0
                      ? `S/ ${fila[c].toLocaleString('es-PE', { minimumFractionDigits: 0 })}`
                      : '—'
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}