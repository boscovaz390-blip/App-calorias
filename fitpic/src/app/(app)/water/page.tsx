'use client';

import { useState, useEffect } from 'react';
import { Droplets, Trash2, Plus } from 'lucide-react';
import CircularProgress from '@/components/CircularProgress';

interface WaterLog {
  id: number;
  amount_ml: number;
  created_at: string;
}

const QUICK_AMOUNTS = [
  { ml: 150, label: 'Vaso pequeño', emoji: '🥃' },
  { ml: 200, label: 'Vaso', emoji: '🥤' },
  { ml: 350, label: 'Botella pequeña', emoji: '💧' },
  { ml: 500, label: 'Botella', emoji: '🍶' },
  { ml: 750, ml2: 750, label: '3/4 botella', emoji: '💦' },
  { ml: 1000, label: 'Botella grande', emoji: '🫗' },
];

export default function WaterPage() {
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [total, setTotal] = useState(0);
  const [goal, setGoal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [custom, setCustom] = useState('');
  const [today] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [waterRes, meRes] = await Promise.all([
      fetch(`/api/water?date=${today}`),
      fetch('/api/auth/me'),
    ]);

    if (waterRes.ok) {
      const data = await waterRes.json();
      setLogs(data.logs);
      setTotal(data.total);
    }

    if (meRes.ok) {
      const { profile } = await meRes.json();
      if (profile?.daily_water_goal) setGoal(profile.daily_water_goal);
    }

    setLoading(false);
  }

  const addWater = async (amount: number) => {
    const res = await fetch('/api/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, amount_ml: amount }),
    });
    if (res.ok) {
      const { id } = await res.json();
      setLogs(prev => [...prev, { id, amount_ml: amount, created_at: new Date().toISOString() }]);
      setTotal(prev => prev + amount);
    }
  };

  const deleteLog = async (id: number, amount: number) => {
    await fetch(`/api/water?id=${id}`, { method: 'DELETE' });
    setLogs(logs.filter(l => l.id !== id));
    setTotal(prev => Math.max(0, prev - amount));
  };

  const pct = Math.min(Math.round((total / goal) * 100), 100);

  const getMotivation = () => {
    if (pct >= 100) return { msg: '¡Meta cumplida! Excelente hidratación 🏆', color: '#43e97b' };
    if (pct >= 75) return { msg: '¡Casi llegas! Solo un poco más 💪', color: '#fbbf24' };
    if (pct >= 50) return { msg: 'Vas por buen camino, sigue así 👍', color: '#60a5fa' };
    if (pct >= 25) return { msg: 'Recuerda hidratarte regularmente 💧', color: '#a78bfa' };
    return { msg: 'Empieza el día con un buen vaso de agua 🌅', color: '#ff6584' };
  };

  const motivation = getMotivation();

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#f0f0ff' }}>💧 Hidratación</h1>
        <p style={{ color: '#8888aa' }} className="mt-1">
          {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Main Water Gauge */}
      <div className="card p-6 mb-6 flex flex-col items-center">
        <CircularProgress
          value={total}
          max={goal}
          size={180}
          strokeWidth={14}
          color="#60a5fa"
          bgColor="#1e3a5f"
          label={`${total}`}
          sublabel="ml"
        />
        <p className="text-lg font-semibold mt-4" style={{ color: '#f0f0ff' }}>
          {total} / {goal} ml
        </p>
        <p className="text-sm mt-1" style={{ color: '#8888aa' }}>
          {Math.max(0, goal - total)} ml restantes para tu meta
        </p>
        <div className="mt-3 px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: `${motivation.color}18`, color: motivation.color }}>
          {motivation.msg}
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold mb-4" style={{ color: '#f0f0ff' }}>Agregar agua rápido</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {QUICK_AMOUNTS.map((item) => (
            <button key={item.ml} onClick={() => addWater(item.ml)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: '#1a1a25', border: '1px solid #2a2a3a' }}>
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-sm font-bold" style={{ color: '#60a5fa' }}>{item.ml} ml</span>
              <span className="text-xs" style={{ color: '#8888aa' }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Cantidad personalizada (ml)"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            className="input-field flex-1"
            min="1"
            max="2000"
          />
          <button
            onClick={() => { if (custom && parseInt(custom) > 0) { addWater(parseInt(custom)); setCustom(''); } }}
            disabled={!custom || parseInt(custom) <= 0}
            className="px-4 py-2 rounded-xl font-semibold transition-all disabled:opacity-40"
            style={{ background: 'rgba(96,165,250,0.2)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold mb-3" style={{ color: '#f0f0ff' }}>💡 Consejos de hidratación</h3>
        <ul className="flex flex-col gap-2">
          {[
            'Bebe un vaso al levantarte para activar tu metabolismo',
            'Toma agua 30 min antes de cada comida',
            'Lleva siempre una botella de agua contigo',
            'Las frutas y verduras también cuentan para tu hidratación',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#ccccdd' }}>
              <Droplets size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#60a5fa' }} />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Today's Log */}
      <div className="card p-5">
        <h3 className="font-semibold mb-4" style={{ color: '#f0f0ff' }}>
          Registros de hoy ({logs.length})
        </h3>
        {loading ? (
          <div style={{ color: '#8888aa' }} className="text-center py-4">Cargando...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-2">💧</p>
            <p style={{ color: '#8888aa' }}>Sin registros todavía</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {[...logs].reverse().map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: '#1a1a25' }}>
                <div className="flex items-center gap-3">
                  <Droplets size={18} style={{ color: '#60a5fa' }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#60a5fa' }}>{log.amount_ml} ml</p>
                    <p className="text-xs" style={{ color: '#8888aa' }}>{formatTime(log.created_at)}</p>
                  </div>
                </div>
                <button onClick={() => deleteLog(log.id, log.amount_ml)}
                  className="p-2 rounded-lg hover:text-red-400 transition-colors"
                  style={{ color: '#555577' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
