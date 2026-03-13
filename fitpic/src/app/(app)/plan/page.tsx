'use client';

import { useState, useEffect } from 'react';
import { Brain, RefreshCw, Target, Zap, Calendar } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function PlanPage() {
  const [plan, setPlan] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ daily_calorie_goal: number; goal: string; weight_kg: number } | null>(null);

  useEffect(() => {
    loadPlan();
    loadProfile();
  }, []);

  async function loadPlan() {
    const res = await fetch('/api/ai/plan');
    if (res.ok) {
      const data = await res.json();
      setPlan(data.plan);
      setGeneratedAt(data.generated_at);
    }
    setLoading(false);
  }

  async function loadProfile() {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const { profile: p } = await res.json();
      setProfile(p);
    }
  }

  const goalLabels: Record<string, { label: string; color: string; emoji: string }> = {
    lose_weight: { label: 'Perder peso', color: '#60a5fa', emoji: '📉' },
    lose_weight_fast: { label: 'Perder peso rápido', color: '#ff6584', emoji: '🔥' },
    maintain: { label: 'Mantener peso', color: '#43e97b', emoji: '⚖️' },
    gain_muscle: { label: 'Ganar músculo', color: '#a78bfa', emoji: '💪' },
    gain_weight: { label: 'Aumentar peso', color: '#fbbf24', emoji: '📈' },
  };

  const goalInfo = profile?.goal ? goalLabels[profile.goal] : null;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#f0f0ff' }}>
            🧠 Mi Plan IA
          </h1>
          <p style={{ color: '#8888aa' }} className="mt-1">
            Plan de acción personalizado generado por inteligencia artificial
          </p>
        </div>
      </div>

      {/* Profile Summary */}
      {profile && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {goalInfo && (
            <div className="card p-4 text-center col-span-1">
              <p className="text-2xl mb-1">{goalInfo.emoji}</p>
              <p className="text-xs font-semibold" style={{ color: goalInfo.color }}>{goalInfo.label}</p>
            </div>
          )}
          <div className="card p-4 text-center">
            <Target size={20} className="mx-auto mb-1" style={{ color: '#6c63ff' }} />
            <p className="text-lg font-bold" style={{ color: '#f0f0ff' }}>{profile.daily_calorie_goal}</p>
            <p className="text-xs" style={{ color: '#8888aa' }}>kcal/día</p>
          </div>
          <div className="card p-4 text-center">
            <Zap size={20} className="mx-auto mb-1" style={{ color: '#fbbf24' }} />
            <p className="text-lg font-bold" style={{ color: '#f0f0ff' }}>{profile.weight_kg}</p>
            <p className="text-xs" style={{ color: '#8888aa' }}>kg actuales</p>
          </div>
        </div>
      )}

      {/* Plan Card */}
      <div className="card p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: '1px solid #2a2a3a' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #43e97b)' }}>
            <Brain size={24} style={{ color: 'white' }} />
          </div>
          <div>
            <h2 className="font-bold text-lg" style={{ color: '#f0f0ff' }}>Tu Plan Personalizado</h2>
            {generatedAt && (
              <p className="text-xs flex items-center gap-1" style={{ color: '#8888aa' }}>
                <Calendar size={11} />
                Generado: {new Date(generatedAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#6c63ff', borderTopColor: 'transparent' }} />
            <p style={{ color: '#8888aa' }}>Cargando tu plan personalizado...</p>
          </div>
        ) : plan ? (
          <MarkdownRenderer content={plan} />
        ) : (
          <div className="text-center py-12">
            <Brain size={48} className="mx-auto mb-4" style={{ color: '#8888aa' }} />
            <p className="font-semibold mb-2" style={{ color: '#f0f0ff' }}>Plan no disponible</p>
            <p className="text-sm mb-4" style={{ color: '#8888aa' }}>
              Completa el cuestionario de salud para generar tu plan
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <p className="text-xs" style={{ color: '#fbbf24' }}>
          ⚠️ Este plan es una guía generada por IA basada en tu perfil. Para cambios significativos en tu dieta o rutina de ejercicios, consulta con un profesional de la salud.
        </p>
      </div>
    </div>
  );
}
