'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Scale,
  Activity,
  Target,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2,
  Zap,
  Flame,
  TrendingDown,
  TrendingUp,
  Minus,
  Dumbbell,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Gender = 'male' | 'female' | 'other';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Goal =
  | 'lose_weight'
  | 'lose_weight_fast'
  | 'maintain'
  | 'gain_muscle'
  | 'gain_weight';

interface FormData {
  name: string;
  age: string;
  gender: Gender | '';
  weight: string;
  height: string;
  targetWeight: string;
  activityLevel: ActivityLevel | '';
  goal: Goal | '';
  dietaryRestrictions: string;
  healthConditions: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVITY_OPTIONS: {
  value: ActivityLevel;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    value: 'sedentary',
    label: 'Sedentario',
    description: 'Trabajo de escritorio, poco movimiento',
    emoji: '🪑',
  },
  {
    value: 'light',
    label: 'Ligero',
    description: 'Ejercicio ligero 1-3 días/semana',
    emoji: '🚶',
  },
  {
    value: 'moderate',
    label: 'Moderado',
    description: 'Ejercicio moderado 3-5 días/semana',
    emoji: '🏃',
  },
  {
    value: 'active',
    label: 'Activo',
    description: 'Ejercicio intenso 6-7 días/semana',
    emoji: '💪',
  },
  {
    value: 'very_active',
    label: 'Muy Activo',
    description: 'Atleta o trabajo físico intenso',
    emoji: '🏋️',
  },
];

const GOAL_OPTIONS: {
  value: Goal;
  label: string;
  description: string;
  emoji: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'lose_weight',
    label: 'Perder peso',
    description: 'Déficit calórico moderado',
    emoji: '⚖️',
    icon: <TrendingDown size={20} />,
  },
  {
    value: 'lose_weight_fast',
    label: 'Perder peso rápido',
    description: 'Déficit calórico agresivo',
    emoji: '🔥',
    icon: <Flame size={20} />,
  },
  {
    value: 'maintain',
    label: 'Mantener peso',
    description: 'Equilibrio calórico',
    emoji: '🎯',
    icon: <Minus size={20} />,
  },
  {
    value: 'gain_muscle',
    label: 'Ganar músculo',
    description: 'Superávit + entrenamiento',
    emoji: '💪',
    icon: <Dumbbell size={20} />,
  },
  {
    value: 'gain_weight',
    label: 'Aumentar peso',
    description: 'Superávit calórico',
    emoji: '📈',
    icon: <TrendingUp size={20} />,
  },
];

const STEP_CONFIG = [
  { label: 'Perfil', icon: <User size={16} /> },
  { label: 'Medidas', icon: <Scale size={16} /> },
  { label: 'Estilo de vida', icon: <Activity size={16} /> },
  { label: 'Objetivos', icon: <Target size={16} /> },
  { label: 'Tu Plan', icon: <Sparkles size={16} /> },
];

// ─── BMI / Calorie Helpers ────────────────────────────────────────────────────

function calcBMI(weight: string, height: string): string | null {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  if (!w || !h) return null;
  const bmi = w / ((h / 100) * (h / 100));
  return bmi.toFixed(1);
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Bajo peso', color: '#6c63ff' };
  if (bmi < 25) return { label: 'Normal', color: '#43e97b' };
  if (bmi < 30) return { label: 'Sobrepeso', color: '#ffb347' };
  return { label: 'Obesidad', color: '#ff6584' };
}

function estimateTDEE(
  weight: string,
  height: string,
  age: string,
  gender: Gender | '',
  activityLevel: ActivityLevel | '',
): number | null {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseFloat(age);
  if (!w || !h || !a || !gender || !activityLevel) return null;

  // Mifflin-St Jeor
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * w + 6.25 * h - 5 * a + 5;
  } else {
    bmr = 10 * w + 6.25 * h - 5 * a - 161;
  }

  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * multipliers[activityLevel]);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState<FormData>({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    targetWeight: '',
    activityLevel: '',
    goal: '',
    dietaryRestrictions: '',
    healthConditions: '',
  });

  // ── Auth check on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.user?.onboardingCompleted) {
          router.push('/dashboard');
          return;
        }
        if (data.user?.name) {
          setForm((prev) => ({ ...prev, name: data.user.name }));
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // ── Navigation ───────────────────────────────────────────────────────────
  const goToStep = useCallback(
    (next: number) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(next);
        setAnimating(false);
      }, 220);
    },
    [animating],
  );

  const handleNext = () => {
    if (currentStep < 4) goToStep(currentStep + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    goToStep(5);

    try {
      const res = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          age: parseInt(form.age),
          gender: form.gender,
          weight: parseFloat(form.weight),
          height: parseFloat(form.height),
          targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : undefined,
          activityLevel: form.activityLevel,
          goal: form.goal,
          dietaryRestrictions: form.dietaryRestrictions || undefined,
          healthConditions: form.healthConditions || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Algo salió mal. Intenta de nuevo.');
        setSubmitting(false);
        return;
      }

      setCalorieGoal(data.calorieGoal ?? data.profile?.dailyCalorieGoal ?? null);
    } catch {
      setSubmitError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const bmi = calcBMI(form.weight, form.height);
  const bmiNum = bmi ? parseFloat(bmi) : null;
  const bmiInfo = bmiNum ? bmiCategory(bmiNum) : null;
  const tdee = estimateTDEE(form.weight, form.height, form.age, form.gender, form.activityLevel);

  // ── Validation per step ───────────────────────────────────────────────────
  const stepValid: Record<number, boolean> = {
    1: !!form.name && !!form.age && !!form.gender,
    2: !!form.weight && !!form.height,
    3: !!form.activityLevel,
    4: !!form.goal,
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: '#0a0a0f' }}
      >
        <Loader2 size={40} className="animate-spin" style={{ color: '#6c63ff' }} />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-8 px-4"
      style={{ background: '#0a0a0f' }}
    >
      {/* Header */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl font-bold" style={{ color: '#6c63ff' }}>
            FitPic
          </span>
          <Zap size={20} style={{ color: '#43e97b' }} />
        </div>

        {/* Progress bar */}
        {currentStep <= 4 && (
          <ProgressBar currentStep={currentStep} />
        )}
      </div>

      {/* Card */}
      <div
        className="w-full max-w-xl rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: '#13131a',
          border: '1px solid #2a2a3a',
          minHeight: 480,
        }}
      >
        {/* Decorative gradient orbs */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6c63ff, transparent)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #43e97b, transparent)' }}
        />

        {/* Step content with fade animation */}
        <div
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(10px)' : 'translateY(0)',
            transition: 'opacity 0.22s ease, transform 0.22s ease',
          }}
        >
          {currentStep === 1 && (
            <Step1
              form={form}
              setForm={setForm}
            />
          )}
          {currentStep === 2 && (
            <Step2
              form={form}
              setForm={setForm}
              bmi={bmi}
              bmiInfo={bmiInfo}
            />
          )}
          {currentStep === 3 && (
            <Step3
              form={form}
              setForm={setForm}
              tdee={tdee}
            />
          )}
          {currentStep === 4 && (
            <Step4
              form={form}
              setForm={setForm}
            />
          )}
          {currentStep === 5 && (
            <Step5
              submitting={submitting}
              calorieGoal={calorieGoal}
              submitError={submitError}
              form={form}
              onRetry={() => { setCurrentStep(4); }}
              onFinish={() => router.push('/dashboard')}
            />
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      {currentStep <= 4 && (
        <div className="w-full max-w-xl flex justify-between mt-6 gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: '#2a2a3a',
              color: '#fff',
            }}
          >
            <ChevronLeft size={18} />
            Atrás
          </button>

          <button
            onClick={handleNext}
            disabled={!stepValid[currentStep]}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: stepValid[currentStep]
                ? 'linear-gradient(135deg, #6c63ff, #43e97b)'
                : '#2a2a3a',
              color: '#fff',
              boxShadow: stepValid[currentStep]
                ? '0 4px 20px rgba(108, 99, 255, 0.35)'
                : 'none',
            }}
          >
            {currentStep === 4 ? 'Generar Plan' : 'Siguiente'}
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ currentStep }: { currentStep: number }) {
  const totalSteps = STEP_CONFIG.length;
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div>
      {/* Step labels */}
      <div className="flex justify-between mb-2">
        {STEP_CONFIG.map((step, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;
          return (
            <div key={step.label} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: isDone
                    ? '#43e97b'
                    : isActive
                    ? 'linear-gradient(135deg, #6c63ff, #43e97b)'
                    : '#2a2a3a',
                  color: isDone || isActive ? '#0a0a0f' : '#666',
                  boxShadow: isActive ? '0 0 12px rgba(108,99,255,0.5)' : 'none',
                }}
              >
                {isDone ? <CheckCircle size={16} /> : step.icon}
              </div>
              <span
                className="text-xs hidden sm:block"
                style={{ color: isActive ? '#fff' : isDone ? '#43e97b' : '#555' }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bar track */}
      <div
        className="h-1.5 rounded-full mt-1 overflow-hidden"
        style={{ background: '#2a2a3a' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #6c63ff, #43e97b)',
          }}
        />
      </div>
    </div>
  );
}

// ─── Step 1: Personal Info ────────────────────────────────────────────────────

function Step1({
  form,
  setForm,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-3xl mb-1">👋</p>
        <h2 className="text-2xl font-bold text-white">¡Hola! Cuéntanos sobre ti</h2>
        <p className="text-sm mt-1" style={{ color: '#666' }}>
          Paso 1 de 4 — Información personal
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>
          Tu nombre
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Escribe tu nombre"
          className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-white placeholder-gray-600"
          style={{
            background: '#0a0a0f',
            border: '1px solid #2a2a3a',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#6c63ff';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#2a2a3a';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>
          Edad
        </label>
        <input
          type="number"
          min={10}
          max={100}
          value={form.age}
          onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
          placeholder="Ej: 25"
          className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-white placeholder-gray-600"
          style={{
            background: '#0a0a0f',
            border: '1px solid #2a2a3a',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#6c63ff';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#2a2a3a';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: '#aaa' }}>
          Género
        </label>
        <div className="flex gap-3">
          {(
            [
              { value: 'male', label: 'Hombre', emoji: '♂️' },
              { value: 'female', label: 'Mujer', emoji: '♀️' },
              { value: 'other', label: 'Otro', emoji: '⚧️' },
            ] as { value: Gender; label: string; emoji: string }[]
          ).map((g) => {
            const selected = form.gender === g.value;
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, gender: g.value }))}
                className="flex-1 flex flex-col items-center gap-1 py-4 rounded-xl font-medium transition-all duration-200"
                style={{
                  background: selected
                    ? 'linear-gradient(135deg, rgba(108,99,255,0.25), rgba(67,233,123,0.15))'
                    : '#0a0a0f',
                  border: `1px solid ${selected ? '#6c63ff' : '#2a2a3a'}`,
                  color: selected ? '#fff' : '#666',
                  boxShadow: selected ? '0 0 12px rgba(108,99,255,0.2)' : 'none',
                }}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-sm">{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Body Measurements ────────────────────────────────────────────────

function Step2({
  form,
  setForm,
  bmi,
  bmiInfo,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  bmi: string | null;
  bmiInfo: { label: string; color: string } | null;
}) {
  const inputStyle = {
    background: '#0a0a0f',
    border: '1px solid #2a2a3a',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#6c63ff';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.15)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#2a2a3a';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-3xl mb-1">📏</p>
        <h2 className="text-2xl font-bold text-white">Medidas corporales</h2>
        <p className="text-sm mt-1" style={{ color: '#666' }}>
          Paso 2 de 4 — Tus datos físicos
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Weight */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>
            Peso (kg)
          </label>
          <input
            type="number"
            min={20}
            max={300}
            step={0.1}
            value={form.weight}
            onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
            placeholder="70.0"
            className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-white placeholder-gray-600"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>
            Altura (cm)
          </label>
          <input
            type="number"
            min={100}
            max={250}
            value={form.height}
            onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))}
            placeholder="170"
            className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-white placeholder-gray-600"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      {/* Target Weight */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>
          Peso objetivo (kg){' '}
          <span className="text-xs" style={{ color: '#555' }}>
            — opcional
          </span>
        </label>
        <input
          type="number"
          min={20}
          max={300}
          step={0.1}
          value={form.targetWeight}
          onChange={(e) => setForm((p) => ({ ...p, targetWeight: e.target.value }))}
          placeholder="Ej: 65.0"
          className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-white placeholder-gray-600"
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* BMI Preview */}
      {bmi && bmiInfo && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{
            background: 'rgba(108,99,255,0.08)',
            border: '1px solid #2a2a3a',
          }}
        >
          <div>
            <p className="text-xs font-medium" style={{ color: '#666' }}>
              Tu IMC estimado
            </p>
            <p className="text-2xl font-bold text-white">{bmi}</p>
          </div>
          <div
            className="px-3 py-1.5 rounded-lg text-sm font-semibold"
            style={{
              background: `${bmiInfo.color}22`,
              color: bmiInfo.color,
              border: `1px solid ${bmiInfo.color}44`,
            }}
          >
            {bmiInfo.label}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Lifestyle ────────────────────────────────────────────────────────

function Step3({
  form,
  setForm,
  tdee,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  tdee: number | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-3xl mb-1">🏃</p>
        <h2 className="text-2xl font-bold text-white">Nivel de actividad</h2>
        <p className="text-sm mt-1" style={{ color: '#666' }}>
          Paso 3 de 4 — Tu estilo de vida
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ACTIVITY_OPTIONS.map((opt) => {
          const selected = form.activityLevel === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, activityLevel: opt.value }))}
              className="flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-200 w-full"
              style={{
                background: selected
                  ? 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(67,233,123,0.1))'
                  : '#0a0a0f',
                border: `1px solid ${selected ? '#6c63ff' : '#2a2a3a'}`,
                boxShadow: selected ? '0 0 16px rgba(108,99,255,0.18)' : 'none',
              }}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <div className="flex-1">
                <p
                  className="font-semibold text-sm"
                  style={{ color: selected ? '#fff' : '#ccc' }}
                >
                  {opt.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: selected ? '#aaa' : '#555' }}>
                  {opt.description}
                </p>
              </div>
              {selected && (
                <CheckCircle size={20} style={{ color: '#43e97b', flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* TDEE preview */}
      {tdee && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{
            background: 'rgba(67,233,123,0.07)',
            border: '1px solid rgba(67,233,123,0.2)',
          }}
        >
          <div>
            <p className="text-xs font-medium" style={{ color: '#666' }}>
              Calorías de mantenimiento estimadas
            </p>
            <p className="text-2xl font-bold" style={{ color: '#43e97b' }}>
              {tdee.toLocaleString()} kcal/día
            </p>
          </div>
          <Flame size={28} style={{ color: '#43e97b', opacity: 0.7 }} />
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Goals ────────────────────────────────────────────────────────────

function Step4({
  form,
  setForm,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const textareaStyle = {
    background: '#0a0a0f',
    border: '1px solid #2a2a3a',
    resize: 'none' as const,
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#6c63ff';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.15)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#2a2a3a';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-3xl mb-1">🎯</p>
        <h2 className="text-2xl font-bold text-white">Tu objetivo principal</h2>
        <p className="text-sm mt-1" style={{ color: '#666' }}>
          Paso 4 de 4 — Metas y preferencias
        </p>
      </div>

      {/* Goal selection */}
      <div className="flex flex-col gap-2">
        {GOAL_OPTIONS.map((opt) => {
          const selected = form.goal === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, goal: opt.value }))}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 w-full"
              style={{
                background: selected
                  ? 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.1))'
                  : '#0a0a0f',
                border: `1px solid ${selected ? '#6c63ff' : '#2a2a3a'}`,
                boxShadow: selected ? '0 0 14px rgba(108,99,255,0.18)' : 'none',
              }}
            >
              <span className="text-xl">{opt.emoji}</span>
              <div className="flex-1">
                <p
                  className="font-semibold text-sm"
                  style={{ color: selected ? '#fff' : '#ccc' }}
                >
                  {opt.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: selected ? '#aaa' : '#555' }}>
                  {opt.description}
                </p>
              </div>
              {selected && (
                <CheckCircle size={18} style={{ color: '#43e97b', flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Dietary restrictions */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>
          Restricciones dietéticas{' '}
          <span className="text-xs" style={{ color: '#555' }}>
            — opcional
          </span>
        </label>
        <textarea
          rows={2}
          value={form.dietaryRestrictions}
          onChange={(e) => setForm((p) => ({ ...p, dietaryRestrictions: e.target.value }))}
          placeholder="Ej: vegetariano, sin gluten, sin lactosa…"
          className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-white placeholder-gray-600"
          style={textareaStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Health conditions */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>
          Condiciones de salud{' '}
          <span className="text-xs" style={{ color: '#555' }}>
            — opcional
          </span>
        </label>
        <textarea
          rows={2}
          value={form.healthConditions}
          onChange={(e) => setForm((p) => ({ ...p, healthConditions: e.target.value }))}
          placeholder="Ej: diabetes tipo 2, hipertensión, hipotiroidismo…"
          className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-white placeholder-gray-600"
          style={textareaStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}

// ─── Step 5: Processing / Result ──────────────────────────────────────────────

function Step5({
  submitting,
  calorieGoal,
  submitError,
  form,
  onRetry,
  onFinish,
}: {
  submitting: boolean;
  calorieGoal: number | null;
  submitError: string;
  form: FormData;
  onRetry: () => void;
  onFinish: () => void;
}) {
  // Loading state
  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(108,99,255,0.15)' }}
          >
            <Loader2 size={40} className="animate-spin" style={{ color: '#6c63ff' }} />
          </div>
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: '#6c63ff' }}
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Generando tu plan con IA</h2>
          <p style={{ color: '#666' }} className="text-sm">
            Calculando tus necesidades calóricas personalizadas…
          </p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: '#6c63ff',
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40% { transform: translateY(-8px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (submitError) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
        <span className="text-5xl">😓</span>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Algo salió mal</h2>
          <p className="text-sm" style={{ color: '#ff6584' }}>
            {submitError}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
          }}
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  // Success state
  if (calorieGoal) {
    const goalOption = GOAL_OPTIONS.find((g) => g.value === form.goal);
    const activityOption = ACTIVITY_OPTIONS.find((a) => a.value === form.activityLevel);

    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-white">¡Tu plan está listo!</h2>
          <p className="text-sm mt-1" style={{ color: '#666' }}>
            Hola {form.name}, aquí está tu plan personalizado
          </p>
        </div>

        {/* Calorie goal — hero card */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(67,233,123,0.15))',
            border: '1px solid rgba(108,99,255,0.4)',
          }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: '#aaa' }}>
            Tu objetivo calórico diario
          </p>
          <p
            className="text-5xl font-black"
            style={{
              background: 'linear-gradient(135deg, #6c63ff, #43e97b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {calorieGoal.toLocaleString()}
          </p>
          <p className="text-lg font-semibold mt-1" style={{ color: '#aaa' }}>
            kcal / día
          </p>
        </div>

        {/* Summary chips */}
        <div className="grid grid-cols-2 gap-3">
          {goalOption && (
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: '#0a0a0f', border: '1px solid #2a2a3a' }}
            >
              <span className="text-xl">{goalOption.emoji}</span>
              <div>
                <p className="text-xs" style={{ color: '#555' }}>
                  Objetivo
                </p>
                <p className="text-sm font-semibold text-white">{goalOption.label}</p>
              </div>
            </div>
          )}
          {activityOption && (
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: '#0a0a0f', border: '1px solid #2a2a3a' }}
            >
              <span className="text-xl">{activityOption.emoji}</span>
              <div>
                <p className="text-xs" style={{ color: '#555' }}>
                  Actividad
                </p>
                <p className="text-sm font-semibold text-white">{activityOption.label}</p>
              </div>
            </div>
          )}
          {form.weight && (
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: '#0a0a0f', border: '1px solid #2a2a3a' }}
            >
              <span className="text-xl">⚖️</span>
              <div>
                <p className="text-xs" style={{ color: '#555' }}>
                  Peso actual
                </p>
                <p className="text-sm font-semibold text-white">{form.weight} kg</p>
              </div>
            </div>
          )}
          {form.targetWeight && (
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: '#0a0a0f', border: '1px solid #2a2a3a' }}
            >
              <span className="text-xl">🏁</span>
              <div>
                <p className="text-xs" style={{ color: '#555' }}>
                  Peso objetivo
                </p>
                <p className="text-sm font-semibold text-white">{form.targetWeight} kg</p>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onFinish}
          className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #6c63ff, #43e97b)',
            boxShadow: '0 6px 24px rgba(108,99,255,0.4)',
          }}
        >
          ¡Empezar mi viaje! 🚀
        </button>
      </div>
    );
  }

  // Fallback (shouldn't normally reach here)
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <Loader2 size={36} className="animate-spin" style={{ color: '#6c63ff' }} />
      <p style={{ color: '#666' }}>Preparando tu plan…</p>
    </div>
  );
}
