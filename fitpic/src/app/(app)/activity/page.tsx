'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Activity, Clock, Flame, Search, X } from 'lucide-react';

interface ActivityLog {
  id: number;
  activity_name: string;
  category: string;
  duration_minutes: number;
  calories_burned: number;
  intensity: string;
  created_at: string;
}

const ACTIVITIES = [
  { name: 'Correr', category: 'cardio', met: 9.8, emoji: '🏃' },
  { name: 'Caminar', category: 'cardio', met: 3.8, emoji: '🚶' },
  { name: 'Ciclismo', category: 'cardio', met: 8.0, emoji: '🚴' },
  { name: 'Natación', category: 'cardio', met: 7.0, emoji: '🏊' },
  { name: 'Yoga', category: 'flexibility', met: 2.5, emoji: '🧘' },
  { name: 'Pesas / Fuerza', category: 'strength', met: 5.0, emoji: '🏋️' },
  { name: 'Fútbol', category: 'sport', met: 7.0, emoji: '⚽' },
  { name: 'Básquetbol', category: 'sport', met: 6.5, emoji: '🏀' },
  { name: 'Tenis', category: 'sport', met: 7.3, emoji: '🎾' },
  { name: 'Baile / Zumba', category: 'cardio', met: 5.0, emoji: '💃' },
  { name: 'Pilates', category: 'flexibility', met: 3.0, emoji: '🤸' },
  { name: 'Saltar la cuerda', category: 'cardio', met: 11.0, emoji: '🪢' },
  { name: 'Elíptica', category: 'cardio', met: 5.0, emoji: '⚙️' },
  { name: 'Escaladora', category: 'cardio', met: 9.0, emoji: '🧗' },
  { name: 'HIIT', category: 'cardio', met: 10.0, emoji: '🔥' },
  { name: 'Crossfit', category: 'strength', met: 9.0, emoji: '💪' },
  { name: 'Senderismo', category: 'outdoor', met: 5.3, emoji: '🏔️' },
  { name: 'Remo', category: 'cardio', met: 7.0, emoji: '🚣' },
  { name: 'Golf', category: 'sport', met: 3.5, emoji: '⛳' },
  { name: 'Otro', category: 'other', met: 4.0, emoji: '🏅' },
];

const intensityOptions = [
  { value: 'light', label: 'Leve', multiplier: 0.8 },
  { value: 'moderate', label: 'Moderado', multiplier: 1.0 },
  { value: 'intense', label: 'Intenso', multiplier: 1.25 },
];

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(ACTIVITIES[0]);
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState('moderate');
  const [weight, setWeight] = useState(70);
  const [saving, setSaving] = useState(false);
  const [today] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadLogs();
    loadUserWeight();
  }, []);

  async function loadUserWeight() {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const { profile } = await res.json();
      if (profile?.weight_kg) setWeight(profile.weight_kg);
    }
  }

  async function loadLogs() {
    const res = await fetch(`/api/activity?date=${today}`);
    if (res.ok) {
      const { logs: data } = await res.json();
      setLogs(data);
    }
    setLoading(false);
  }

  const calculateCalories = () => {
    const dur = parseInt(duration) || 0;
    const intensityMult = intensityOptions.find(i => i.value === intensity)?.multiplier || 1;
    return Math.round(selected.met * weight * (dur / 60) * intensityMult);
  };

  const handleSave = async () => {
    if (!duration || parseInt(duration) <= 0) return;
    setSaving(true);
    const calories = calculateCalories();

    const res = await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: today,
        activity_name: selected.name,
        category: selected.category,
        duration_minutes: parseInt(duration),
        calories_burned: calories,
        intensity,
      }),
    });

    if (res.ok) {
      setShowForm(false);
      setDuration('30');
      loadLogs();
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/activity?id=${id}`, { method: 'DELETE' });
    setLogs(logs.filter(l => l.id !== id));
  };

  const totalBurned = logs.reduce((sum, l) => sum + l.calories_burned, 0);
  const totalMinutes = logs.reduce((sum, l) => sum + l.duration_minutes, 0);

  const filtered = ACTIVITIES.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#f0f0ff' }}>💪 Actividad Física</h1>
          <p style={{ color: '#8888aa' }} className="mt-1">
            {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #43e97b, #38d9a9)', color: '#0a0a0f' }}>
          <Plus size={16} /> Agregar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <Flame size={20} className="mx-auto mb-1" style={{ color: '#ff6584' }} />
          <p className="text-xl font-bold" style={{ color: '#ff6584' }}>{totalBurned}</p>
          <p className="text-xs" style={{ color: '#8888aa' }}>kcal quemadas</p>
        </div>
        <div className="card p-4 text-center">
          <Clock size={20} className="mx-auto mb-1" style={{ color: '#6c63ff' }} />
          <p className="text-xl font-bold" style={{ color: '#6c63ff' }}>{totalMinutes}</p>
          <p className="text-xs" style={{ color: '#8888aa' }}>minutos activo</p>
        </div>
        <div className="card p-4 text-center">
          <Activity size={20} className="mx-auto mb-1" style={{ color: '#43e97b' }} />
          <p className="text-xl font-bold" style={{ color: '#43e97b' }}>{logs.length}</p>
          <p className="text-xs" style={{ color: '#8888aa' }}>actividades</p>
        </div>
      </div>

      {/* Add Activity Form */}
      {showForm && (
        <div className="card p-5 mb-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: '#f0f0ff' }}>Nueva actividad</h3>
            <button onClick={() => setShowForm(false)}>
              <X size={20} style={{ color: '#8888aa' }} />
            </button>
          </div>

          {/* Search Activity */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-3.5" style={{ color: '#8888aa' }} />
            <input type="text" placeholder="Buscar actividad..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9" />
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto mb-4">
            {filtered.map((act) => (
              <button key={act.name} onClick={() => setSelected(act)}
                className="flex items-center gap-2 p-3 rounded-xl text-left transition-all"
                style={{
                  background: selected.name === act.name ? 'rgba(67,233,123,0.15)' : '#1a1a25',
                  border: selected.name === act.name ? '1px solid #43e97b' : '1px solid #2a2a3a',
                  color: selected.name === act.name ? '#43e97b' : '#f0f0ff',
                }}>
                <span className="text-xl">{act.emoji}</span>
                <span className="text-sm font-medium">{act.name}</span>
              </button>
            ))}
          </div>

          {/* Duration */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block" style={{ color: '#8888aa' }}>
              Duración (minutos)
            </label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
              min="1" max="480" className="input-field" />
          </div>

          {/* Intensity */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block" style={{ color: '#8888aa' }}>Intensidad</label>
            <div className="grid grid-cols-3 gap-2">
              {intensityOptions.map(opt => (
                <button key={opt.value} onClick={() => setIntensity(opt.value)}
                  className="py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: intensity === opt.value ? 'rgba(108,99,255,0.2)' : '#1a1a25',
                    border: intensity === opt.value ? '1px solid #6c63ff' : '1px solid #2a2a3a',
                    color: intensity === opt.value ? '#6c63ff' : '#8888aa',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl mb-4 text-center"
            style={{ background: 'rgba(67,233,123,0.08)', border: '1px solid rgba(67,233,123,0.2)' }}>
            <p className="text-3xl font-black" style={{ color: '#43e97b' }}>{calculateCalories()} kcal</p>
            <p className="text-sm" style={{ color: '#8888aa' }}>
              {selected.emoji} {selected.name} • {duration || 0} min • {intensityOptions.find(i => i.value === intensity)?.label}
            </p>
          </div>

          <button onClick={handleSave} disabled={saving || !duration}
            className="w-full py-3 rounded-xl font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #43e97b, #38d9a9)', color: '#0a0a0f' }}>
            {saving ? 'Guardando...' : '✅ Guardar actividad'}
          </button>
        </div>
      )}

      {/* Activity Logs */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-8" style={{ color: '#8888aa' }}>Cargando...</div>
        ) : logs.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-5xl mb-3">🏃</p>
            <p className="font-semibold mb-1" style={{ color: '#f0f0ff' }}>Sin actividad hoy</p>
            <p className="text-sm" style={{ color: '#8888aa' }}>¡Muévete y registra tu ejercicio!</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(67,233,123,0.15)' }}>
                <span className="text-2xl">
                  {ACTIVITIES.find(a => a.name === log.activity_name)?.emoji || '🏅'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold" style={{ color: '#f0f0ff' }}>{log.activity_name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs flex items-center gap-1" style={{ color: '#8888aa' }}>
                    <Clock size={11} /> {log.duration_minutes} min
                  </span>
                  <span className="text-xs capitalize" style={{ color: '#8888aa' }}>{log.intensity}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold" style={{ color: '#43e97b' }}>-{log.calories_burned}</p>
                <p className="text-xs" style={{ color: '#8888aa' }}>kcal</p>
              </div>
              <button onClick={() => handleDelete(log.id)}
                className="p-2 rounded-lg transition-colors hover:text-red-400"
                style={{ color: '#8888aa' }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
