'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';
import { TrendingUp, Flame, Droplets, Award, ChevronDown, Scale, Plus } from 'lucide-react';

interface HistoryDay {
  date: string;
  calories_in: number;
  calories_burned: number;
  water_ml: number;
  score: number | null;
}

interface DailySummary {
  id: number;
  date: string;
  summary_text: string;
  total_calories_in: number;
  total_calories_burned: number;
  total_water_ml: number;
  score: number;
}

interface BodyMetric {
  id: number;
  date: string;
  weight_kg: number;
  body_fat_pct: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<'calories' | 'water' | 'weight'>('calories');
  const [showMetricForm, setShowMetricForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newBF, setNewBF] = useState('');
  const [expandedSummary, setExpandedSummary] = useState<number | null>(null);

  useEffect(() => { loadHistory(); }, [days]);

  async function loadHistory() {
    setLoading(true);
    const res = await fetch(`/api/history?days=${days}`);
    if (res.ok) {
      const data = await res.json();
      setHistory(data.history);
      setSummaries(data.summaries);
      setMetrics(data.metrics);
    }
    setLoading(false);
  }

  async function saveMetric() {
    if (!newWeight && !newBF) return;
    const today = new Date().toISOString().split('T')[0];
    await fetch('/api/body-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, weight_kg: newWeight ? parseFloat(newWeight) : null, body_fat_pct: newBF ? parseFloat(newBF) : null }),
    });
    setNewWeight(''); setNewBF('');
    setShowMetricForm(false);
    loadHistory();
  }

  const chartData = history.map(d => ({
    day: new Date(d.date + 'T00:00:00').toLocaleDateString('es', { month: 'short', day: 'numeric' }),
    Consumidas: d.calories_in,
    Quemadas: d.calories_burned,
    Agua: Math.round(d.water_ml / 100) / 10,
    Score: d.score,
  }));

  const weightData = metrics.map(m => ({
    day: new Date(m.date + 'T00:00:00').toLocaleDateString('es', { month: 'short', day: 'numeric' }),
    Peso: m.weight_kg,
    'Grasa%': m.body_fat_pct,
  })).reverse();

  const avgCalories = history.filter(d => d.calories_in > 0).reduce((s, d) => s + d.calories_in, 0) / Math.max(history.filter(d => d.calories_in > 0).length, 1);
  const avgScore = summaries.length > 0 ? summaries.reduce((s, d) => s + d.score, 0) / summaries.length : 0;
  const activeDays = history.filter(d => d.calories_in > 0 || d.calories_burned > 0).length;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#f0f0ff' }}>📈 Mi Progreso</h1>
          <p style={{ color: '#8888aa' }} className="mt-1">Historial y estadísticas de tu viaje</p>
        </div>
        <select value={days} onChange={e => setDays(parseInt(e.target.value))}
          className="input-field w-auto text-sm">
          <option value={7}>7 días</option>
          <option value={14}>14 días</option>
          <option value={30}>30 días</option>
          <option value={60}>60 días</option>
          <option value={90}>90 días</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="card p-4 text-center">
          <TrendingUp size={20} className="mx-auto mb-2" style={{ color: '#6c63ff' }} />
          <p className="text-xl font-bold" style={{ color: '#f0f0ff' }}>{activeDays}</p>
          <p className="text-xs" style={{ color: '#8888aa' }}>Días activos</p>
        </div>
        <div className="card p-4 text-center">
          <Flame size={20} className="mx-auto mb-2" style={{ color: '#ff6584' }} />
          <p className="text-xl font-bold" style={{ color: '#f0f0ff' }}>{Math.round(avgCalories)}</p>
          <p className="text-xs" style={{ color: '#8888aa' }}>Kcal promedio/día</p>
        </div>
        <div className="card p-4 text-center">
          <Award size={20} className="mx-auto mb-2" style={{ color: '#fbbf24' }} />
          <p className="text-xl font-bold" style={{ color: '#f0f0ff' }}>{Math.round(avgScore)}</p>
          <p className="text-xs" style={{ color: '#8888aa' }}>Score promedio</p>
        </div>
        <div className="card p-4 text-center">
          <Droplets size={20} className="mx-auto mb-2" style={{ color: '#60a5fa' }} />
          <p className="text-xl font-bold" style={{ color: '#f0f0ff' }}>
            {Math.round(history.filter(d => d.water_ml > 0).reduce((s, d) => s + d.water_ml, 0) / Math.max(history.filter(d => d.water_ml > 0).length, 1))}
          </p>
          <p className="text-xs" style={{ color: '#8888aa' }}>ml agua/día prom.</p>
        </div>
      </div>

      {/* Charts */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          {[
            { id: 'calories', label: 'Calorías', color: '#6c63ff' },
            { id: 'water', label: 'Agua', color: '#60a5fa' },
            { id: 'weight', label: 'Peso', color: '#43e97b' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? `${tab.color}22` : 'transparent',
                color: activeTab === tab.id ? tab.color : '#8888aa',
                border: activeTab === tab.id ? `1px solid ${tab.color}44` : '1px solid transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center" style={{ color: '#8888aa' }}>Cargando...</div>
        ) : activeTab === 'calories' ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData.slice(-14)}>
              <XAxis dataKey="day" tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#f0f0ff' }} />
              <Bar dataKey="Consumidas" fill="#6c63ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Quemadas" fill="#43e97b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : activeTab === 'water' ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData.slice(-14)}>
              <XAxis dataKey="day" tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#f0f0ff' }}
                formatter={(val: unknown) => [`${(Number(val) * 1000).toFixed(0)} ml`, 'Agua']} />
              <Bar dataKey="Agua" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <>
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightData}>
                  <XAxis dataKey="day" tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#f0f0ff' }}
                    formatter={(val: unknown) => [`${val} kg`, 'Peso']} />
                  <Line type="monotone" dataKey="Peso" stroke="#43e97b" strokeWidth={2} dot={{ fill: '#43e97b', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center gap-3">
                <Scale size={32} style={{ color: '#8888aa' }} />
                <p style={{ color: '#8888aa' }}>Sin registros de peso aún</p>
                <button onClick={() => setShowMetricForm(true)}
                  className="text-sm px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(67,233,123,0.15)', color: '#43e97b' }}>
                  + Registrar peso
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Body Metrics */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: '#f0f0ff' }}>⚖️ Métricas corporales</h3>
          <button onClick={() => setShowMetricForm(!showMetricForm)}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(67,233,123,0.1)', color: '#43e97b' }}>
            <Plus size={14} /> Registrar
          </button>
        </div>

        {showMetricForm && (
          <div className="p-4 rounded-xl mb-4" style={{ background: '#1a1a25', border: '1px solid #2a2a3a' }}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#8888aa' }}>Peso (kg)</label>
                <input type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)}
                  className="input-field" placeholder="70.5" />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#8888aa' }}>% Grasa corporal</label>
                <input type="number" step="0.1" value={newBF} onChange={e => setNewBF(e.target.value)}
                  className="input-field" placeholder="20.0" />
              </div>
            </div>
            <button onClick={saveMetric}
              className="w-full py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #43e97b, #38d9a9)', color: '#0a0a0f' }}>
              Guardar métricas
            </button>
          </div>
        )}

        {metrics.slice(0, 5).map((m) => (
          <div key={m.id} className="flex items-center justify-between p-3 rounded-xl mb-2"
            style={{ background: '#1a1a25' }}>
            <span className="text-sm" style={{ color: '#8888aa' }}>
              {new Date(m.date + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })}
            </span>
            {m.weight_kg && <span className="text-sm font-bold" style={{ color: '#43e97b' }}>{m.weight_kg} kg</span>}
            {m.body_fat_pct && <span className="text-sm font-bold" style={{ color: '#ff6584' }}>{m.body_fat_pct}% grasa</span>}
          </div>
        ))}

        {metrics.length === 0 && !showMetricForm && (
          <p className="text-center py-3 text-sm" style={{ color: '#8888aa' }}>
            Registra tu peso y métricas para ver tu progreso
          </p>
        )}
      </div>

      {/* Daily Summaries */}
      {summaries.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: '#f0f0ff' }}>🤖 Resúmenes IA del día</h3>
          <div className="flex flex-col gap-3">
            {summaries.slice(0, 10).map((s) => (
              <div key={s.id} className="rounded-xl overflow-hidden" style={{ background: '#1a1a25', border: '1px solid #2a2a3a' }}>
                <button className="w-full flex items-center justify-between p-4"
                  onClick={() => setExpandedSummary(expandedSummary === s.id ? null : s.id)}>
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="text-sm font-semibold" style={{ color: '#f0f0ff' }}>
                        {new Date(s.date + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-xs" style={{ color: '#8888aa' }}>
                        {s.total_calories_in} kcal • {Math.round(s.total_water_ml / 1000 * 10) / 10}L agua
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        background: s.score >= 80 ? 'rgba(67,233,123,0.2)' : s.score >= 60 ? 'rgba(251,191,36,0.2)' : 'rgba(255,101,132,0.2)',
                        color: s.score >= 80 ? '#43e97b' : s.score >= 60 ? '#fbbf24' : '#ff6584',
                      }}>
                      {s.score}/100
                    </span>
                    <ChevronDown size={16} style={{ color: '#8888aa', transform: expandedSummary === s.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                </button>
                {expandedSummary === s.id && (
                  <div className="px-4 pb-4">
                    <p className="text-sm whitespace-pre-wrap" style={{ color: '#ccccdd', lineHeight: '1.7' }}>{s.summary_text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
