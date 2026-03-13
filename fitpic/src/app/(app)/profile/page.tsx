'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Target, Activity, Droplets, Edit3, Save, X } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
}

interface ProfileData {
  age: number;
  gender: string;
  weight_kg: number;
  height_cm: number;
  activity_level: string;
  goal: string;
  dietary_restrictions: string;
  daily_calorie_goal: number;
  daily_water_goal: number;
  target_weight_kg: number;
}

const activityLabels: Record<string, string> = {
  sedentary: 'Sedentario', light: 'Actividad leve', moderate: 'Moderado',
  active: 'Activo', very_active: 'Muy activo',
};

const goalLabels: Record<string, { label: string; emoji: string }> = {
  lose_weight: { label: 'Perder peso', emoji: '📉' },
  lose_weight_fast: { label: 'Perder peso rápido', emoji: '🔥' },
  maintain: { label: 'Mantener peso', emoji: '⚖️' },
  gain_muscle: { label: 'Ganar músculo', emoji: '💪' },
  gain_weight: { label: 'Aumentar peso', emoji: '📈' },
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const res = await fetch('/api/auth/me');
    if (!res.ok) { router.push('/login'); return; }
    const { user: u, profile: p } = await res.json();
    setUser(u);
    setProfile(p);
    if (p) setEditData(p);
    setLoading(false);
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const bmi = profile ? profile.weight_kg / Math.pow(profile.height_cm / 100, 2) : 0;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Bajo peso', color: '#60a5fa' };
    if (bmi < 25) return { label: 'Peso normal', color: '#43e97b' };
    if (bmi < 30) return { label: 'Sobrepeso', color: '#fbbf24' };
    return { label: 'Obesidad', color: '#ff6584' };
  };

  const bmiCategory = getBMICategory(bmi);
  const goalInfo = profile?.goal ? goalLabels[profile.goal] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#6c63ff', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#f0f0ff' }}>👤 Mi Perfil</h1>

      {/* User Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #43e97b)', color: 'white' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#f0f0ff' }}>{user?.name}</h2>
            <p style={{ color: '#8888aa' }}>{user?.email}</p>
            {goalInfo && (
              <span className="inline-flex items-center gap-1 text-sm mt-1 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(108,99,255,0.15)', color: '#a78bfa' }}>
                {goalInfo.emoji} {goalInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {profile && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target size={16} style={{ color: '#6c63ff' }} />
                <span className="text-sm font-semibold" style={{ color: '#f0f0ff' }}>Meta calórica</span>
              </div>
              <p className="text-2xl font-black" style={{ color: '#6c63ff' }}>{profile.daily_calorie_goal}</p>
              <p className="text-xs" style={{ color: '#8888aa' }}>kcal por día</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Droplets size={16} style={{ color: '#60a5fa' }} />
                <span className="text-sm font-semibold" style={{ color: '#f0f0ff' }}>Meta de agua</span>
              </div>
              <p className="text-2xl font-black" style={{ color: '#60a5fa' }}>{profile.daily_water_goal}</p>
              <p className="text-xs" style={{ color: '#8888aa' }}>ml por día</p>
            </div>
          </div>

          {/* BMI Card */}
          <div className="card p-5 mb-6">
            <h3 className="font-semibold mb-4" style={{ color: '#f0f0ff' }}>📊 Tu IMC</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-black" style={{ color: bmiCategory.color }}>{bmi.toFixed(1)}</p>
                <p className="text-sm font-semibold mt-1" style={{ color: bmiCategory.color }}>{bmiCategory.label}</p>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: '#8888aa' }}>{profile.weight_kg} kg</p>
                <p className="text-sm" style={{ color: '#8888aa' }}>{profile.height_cm} cm</p>
                {profile.target_weight_kg && (
                  <p className="text-sm mt-1" style={{ color: '#43e97b' }}>→ {profile.target_weight_kg} kg meta</p>
                )}
              </div>
            </div>
            {/* BMI Scale */}
            <div className="mt-4">
              <div className="flex rounded-full overflow-hidden h-2">
                <div className="flex-1" style={{ background: '#60a5fa' }} />
                <div className="flex-1" style={{ background: '#43e97b' }} />
                <div className="flex-1" style={{ background: '#fbbf24' }} />
                <div className="flex-1" style={{ background: '#ff6584' }} />
              </div>
              <div className="flex justify-between text-xs mt-1" style={{ color: '#8888aa' }}>
                <span>&lt;18.5</span><span>18.5</span><span>25</span><span>30+</span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: '#f0f0ff' }}>Datos personales</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Edad', value: `${profile.age} años` },
                { label: 'Género', value: profile.gender === 'male' ? 'Masculino' : profile.gender === 'female' ? 'Femenino' : 'Otro' },
                { label: 'Peso', value: `${profile.weight_kg} kg` },
                { label: 'Altura', value: `${profile.height_cm} cm` },
                { label: 'Actividad', value: activityLabels[profile.activity_level] || profile.activity_level },
                { label: 'Objetivo', value: goalLabels[profile.goal]?.label || profile.goal },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: '#1a1a25' }}>
                  <p className="text-xs mb-0.5" style={{ color: '#8888aa' }}>{label}</p>
                  <p className="font-semibold text-sm" style={{ color: '#f0f0ff' }}>{value}</p>
                </div>
              ))}
            </div>

            {profile.dietary_restrictions && (
              <div className="mt-3 p-3 rounded-xl" style={{ background: '#1a1a25' }}>
                <p className="text-xs mb-0.5" style={{ color: '#8888aa' }}>Restricciones alimentarias</p>
                <p className="text-sm" style={{ color: '#f0f0ff' }}>{profile.dietary_restrictions}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button onClick={() => router.push('/onboarding')}
          className="w-full py-3 rounded-xl font-semibold transition-all"
          style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.3)' }}>
          ✏️ Actualizar perfil y recalcular plan
        </button>
        <button onClick={handleLogout}
          className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          style={{ background: 'rgba(255,101,132,0.1)', color: '#ff6584', border: '1px solid rgba(255,101,132,0.2)' }}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
