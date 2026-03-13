'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, Activity, Droplets, Brain, TrendingUp, Flame, Target, Plus, ChevronRight, Award } from 'lucide-react';
import CircularProgress from '@/components/CircularProgress';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardData {
  profile: {
    daily_calorie_goal: number;
    daily_water_goal: number;
    goal: string;
    weight_kg: number;
    target_weight_kg: number;
  };
  food_logs: Array<{ id: number; meal_type: string; food_name: string; calories: number; created_at: string }>;
  activity_logs: Array<{ id: number; activity_name: string; duration_minutes: number; calories_burned: number }>;
  water_total: number;
  totals: { calories_in: number; calories_burned: number; net_calories: number };
  last7Days: Array<{ date: string; calories_in: number; calories_burned: number }>;
}

const mealIcons: Record<string, string> = {
  breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎',
};

const goalLabels: Record<string, string> = {
  lose_weight: 'Perder peso', lose_weight_fast: 'Perder peso rápido',
  maintain: 'Mantener peso', gain_muscle: 'Ganar músculo', gain_weight: 'Aumentar peso',
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState<{ summary: string; score: number } | null>(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    const meRes = await fetch('/api/auth/me');
    if (!meRes.ok) { router.push('/login'); return; }
    const { user: u, needsOnboarding } = await meRes.json();
    if (needsOnboarding) { router.push('/onboarding'); return; }
    setUser(u);

    const dashRes = await fetch(`/api/dashboard?date=${today}`);
    if (dashRes.ok) setData(await dashRes.json());

    const sumRes = await fetch(`/api/ai/summary?date=${today}`);
    if (sumRes.ok) {
      const { summary: s } = await sumRes.json();
      if (s) setSummary({ summary: s.summary_text, score: s.score });
    }

    setLoading(false);
  }

  async function handleGenerateSummary() {
    setGeneratingSummary(true);
    const res = await fetch('/api/ai/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today }),
    });
    if (res.ok) {
      const result = await res.json();
      setSummary({ summary: result.summary, score: result.score });
    }
    setGeneratingSummary(false);
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '¡Buenos días';
    if (h < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#6c63ff', borderTopColor: 'transparent' }} />
          <p style={{ color: '#8888aa' }}>Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, totals, food_logs, activity_logs, water_total, last7Days } = data;
  const calorieGoal = profile?.daily_calorie_goal || 2000;
  const waterGoal = profile?.daily_water_goal || 2000;
  const calorieLeft = Math.max(0, calorieGoal - totals.calories_in);
  const waterPct = Math.round((water_total / waterGoal) * 100);

  const chartData = last7Days.map(d => ({
    day: new Date(d.date + 'T00:00:00').toLocaleDateString('es', { weekday: 'short' }),
    Calorías: d.calories_in,
    Quemadas: d.calories_burned,
  }));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#f0f0ff' }}>
            {greeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: '#8888aa' }} className="mt-1">
            {new Date().toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {profile?.goal && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
            style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.3)' }}>
            <Target size={14} />
            {goalLabels[profile.goal] || profile.goal}
          </div>
        )}
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Calories Card */}
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#8888aa' }} className="text-sm mb-1">Calorías netas</p>
              <p className="text-4xl font-bold" style={{ color: '#f0f0ff' }}>{totals.net_calories.toLocaleString()}</p>
              <p className="text-sm mt-1" style={{ color: '#8888aa' }}>
                <span style={{ color: '#43e97b' }}>{calorieLeft.toLocaleString()} kcal restantes</span> de {calorieGoal.toLocaleString()}
              </p>
            </div>
            <CircularProgress
              value={totals.calories_in}
              max={calorieGoal}
              size={90}
              strokeWidth={8}
              color="#6c63ff"
              label={`${Math.round((totals.calories_in / calorieGoal) * 100)}%`}
              sublabel="meta"
            />
          </div>
          {/* Macros bar */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl p-2" style={{ background: '#1a1a25' }}>
              <p className="text-xs" style={{ color: '#8888aa' }}>Consumidas</p>
              <p className="font-bold" style={{ color: '#ff6584' }}>{totals.calories_in}</p>
            </div>
            <div className="rounded-xl p-2" style={{ background: '#1a1a25' }}>
              <p className="text-xs" style={{ color: '#8888aa' }}>Quemadas</p>
              <p className="font-bold" style={{ color: '#43e97b' }}>{totals.calories_burned}</p>
            </div>
            <div className="rounded-xl p-2" style={{ background: '#1a1a25' }}>
              <p className="text-xs" style={{ color: '#8888aa' }}>Netas</p>
              <p className="font-bold" style={{ color: '#6c63ff' }}>{totals.net_calories}</p>
            </div>
          </div>
        </div>

        {/* Water Card */}
        <div className="card p-5 flex flex-col items-center justify-between">
          <p style={{ color: '#8888aa' }} className="text-sm w-full">Hidratación</p>
          <CircularProgress
            value={water_total}
            max={waterGoal}
            size={80}
            strokeWidth={7}
            color="#60a5fa"
            label={`${waterPct}%`}
          />
          <div className="text-center">
            <p className="font-bold" style={{ color: '#60a5fa' }}>{water_total} ml</p>
            <p className="text-xs" style={{ color: '#8888aa' }}>de {waterGoal} ml</p>
          </div>
          <Link href="/water" className="text-xs px-3 py-1.5 rounded-lg w-full text-center transition-all"
            style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>
            + Agregar agua
          </Link>
        </div>

        {/* Activity Card */}
        <div className="card p-5 flex flex-col justify-between">
          <p style={{ color: '#8888aa' }} className="text-sm">Actividad hoy</p>
          <div className="flex items-center gap-3 my-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(67,233,123,0.15)' }}>
              <Flame size={24} style={{ color: '#43e97b' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#43e97b' }}>{totals.calories_burned}</p>
              <p className="text-xs" style={{ color: '#8888aa' }}>kcal quemadas</p>
            </div>
          </div>
          <p className="text-sm" style={{ color: '#8888aa' }}>
            {activity_logs.length} actividad{activity_logs.length !== 1 ? 'es' : ''}
          </p>
          <Link href="/activity" className="text-xs px-3 py-1.5 rounded-lg w-full text-center mt-2 block"
            style={{ background: 'rgba(67,233,123,0.15)', color: '#43e97b' }}>
            + Agregar
          </Link>
        </div>
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* 7-day chart */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-semibold mb-4" style={{ color: '#f0f0ff' }}>Últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBurned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#43e97b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#43e97b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#f0f0ff' }}
                labelStyle={{ color: '#8888aa' }}
              />
              <Area type="monotone" dataKey="Calorías" stroke="#6c63ff" fill="url(#colorCal)" strokeWidth={2} />
              <Area type="monotone" dataKey="Quemadas" stroke="#43e97b" fill="url(#colorBurned)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8888aa' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#6c63ff' }} />Calorías
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8888aa' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#43e97b' }} />Quemadas
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: '#f0f0ff' }}>Acciones rápidas</h3>
          <div className="flex flex-col gap-3">
            <Link href="/scan" className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.2)' }}>
              <Camera size={20} style={{ color: '#6c63ff' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#f0f0ff' }}>Escanear comida</p>
                <p className="text-xs" style={{ color: '#8888aa' }}>Foto → Calorías con IA</p>
              </div>
              <ChevronRight size={16} className="ml-auto" style={{ color: '#8888aa' }} />
            </Link>
            <Link href="/activity" className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.2)' }}>
              <Activity size={20} style={{ color: '#43e97b' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#f0f0ff' }}>Registrar ejercicio</p>
                <p className="text-xs" style={{ color: '#8888aa' }}>Calcula calorías quemadas</p>
              </div>
              <ChevronRight size={16} className="ml-auto" style={{ color: '#8888aa' }} />
            </Link>
            <Link href="/water" className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <Droplets size={20} style={{ color: '#60a5fa' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#f0f0ff' }}>Agregar agua</p>
                <p className="text-xs" style={{ color: '#8888aa' }}>Controla tu hidratación</p>
              </div>
              <ChevronRight size={16} className="ml-auto" style={{ color: '#8888aa' }} />
            </Link>
            <Link href="/plan" className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.2)' }}>
              <Brain size={20} style={{ color: '#ff6584' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#f0f0ff' }}>Ver mi plan IA</p>
                <p className="text-xs" style={{ color: '#8888aa' }}>Recomendaciones personalizadas</p>
              </div>
              <ChevronRight size={16} className="ml-auto" style={{ color: '#8888aa' }} />
            </Link>
          </div>
        </div>
      </div>

      {/* Meals Today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: '#f0f0ff' }}>Comidas de hoy</h3>
            <Link href="/scan" className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff' }}>
              <Plus size={14} /> Agregar
            </Link>
          </div>
          {food_logs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">🍽️</p>
              <p style={{ color: '#8888aa' }} className="text-sm">Sin registros de comida hoy</p>
              <Link href="/scan" className="text-sm mt-2 inline-block" style={{ color: '#6c63ff' }}>
                Escanea tu primera comida →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {food_logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: '#1a1a25' }}>
                  <span className="text-xl">{mealIcons[log.meal_type] || '🍴'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#f0f0ff' }}>{log.food_name}</p>
                    <p className="text-xs capitalize" style={{ color: '#8888aa' }}>{log.meal_type}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#ff6584' }}>{log.calories} kcal</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activities Today */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: '#f0f0ff' }}>Actividad física hoy</h3>
            <Link href="/activity" className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(67,233,123,0.1)', color: '#43e97b' }}>
              <Plus size={14} /> Agregar
            </Link>
          </div>
          {activity_logs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">🏃</p>
              <p style={{ color: '#8888aa' }} className="text-sm">Sin actividad registrada hoy</p>
              <Link href="/activity" className="text-sm mt-2 inline-block" style={{ color: '#43e97b' }}>
                Registra tu ejercicio →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {activity_logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: '#1a1a25' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(67,233,123,0.15)' }}>
                    <Activity size={16} style={{ color: '#43e97b' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#f0f0ff' }}>{log.activity_name}</p>
                    <p className="text-xs" style={{ color: '#8888aa' }}>{log.duration_minutes} min</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#43e97b' }}>-{log.calories_burned} kcal</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily AI Summary */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6c63ff, #43e97b)' }}>
              <Brain size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: '#f0f0ff' }}>Resumen diario IA</h3>
              <p className="text-xs" style={{ color: '#8888aa' }}>Tu análisis personalizado del día</p>
            </div>
          </div>
          {summary && (
            <div className="flex items-center gap-2">
              <Award size={16} style={{ color: '#fbbf24' }} />
              <span className="font-bold" style={{ color: '#fbbf24' }}>{summary.score}/100</span>
            </div>
          )}
        </div>

        {summary ? (
          <div className="rounded-xl p-4" style={{ background: '#1a1a25', border: '1px solid #2a2a3a' }}>
            <p style={{ color: '#ccccdd', lineHeight: '1.7' }} className="text-sm whitespace-pre-wrap">{summary.summary}</p>
            <button onClick={handleGenerateSummary} disabled={generatingSummary}
              className="mt-3 text-sm px-4 py-2 rounded-lg transition-all"
              style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff' }}>
              {generatingSummary ? 'Actualizando...' : '↻ Actualizar resumen'}
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p style={{ color: '#8888aa' }} className="text-sm mb-4">
              Genera tu resumen IA personalizado del día para obtener análisis, consejos y motivación.
            </p>
            <button onClick={handleGenerateSummary} disabled={generatingSummary}
              className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #6c63ff, #43e97b)', color: 'white' }}>
              {generatingSummary ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                  Generando resumen...
                </span>
              ) : '✨ Generar resumen del día'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
