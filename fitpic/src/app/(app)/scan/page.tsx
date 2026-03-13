'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, X, CheckCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface FoodAnalysis {
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  portion_size: string;
  confidence: 'high' | 'medium' | 'low';
  tips: string;
  alternatives?: string;
}

const confidenceConfig = {
  high: { label: 'Alta confianza', color: '#43e97b', bg: 'rgba(67,233,123,0.1)' },
  medium: { label: 'Confianza media', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  low: { label: 'Baja confianza', color: '#ff6584', bg: 'rgba(255,101,132,0.1)' },
};

const mealTypes = [
  { value: 'breakfast', label: '🌅 Desayuno' },
  { value: 'lunch', label: '☀️ Almuerzo' },
  { value: 'dinner', label: '🌙 Cena' },
  { value: 'snack', label: '🍎 Snack' },
];

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [error, setError] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
    setAnalysis(null);
    setError('');
    setSaved(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const analyzeImage = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await fetch('/api/food/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Error al analizar la imagen');
      const { analysis: result } = await res.json();
      setAnalysis(result);
    } catch (err) {
      setError('No se pudo analizar la imagen. Intenta con otra foto más clara.');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveFood = async () => {
    if (!analysis) return;
    setSaving(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/food/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          meal_type: mealType,
          food_name: analysis.food_name,
          calories: analysis.calories,
          protein_g: analysis.protein_g,
          carbs_g: analysis.carbs_g,
          fat_g: analysis.fat_g,
          fiber_g: analysis.fiber_g,
          ai_analysis: JSON.stringify(analysis),
        }),
      });

      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch {
      setError('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setImage(null);
    setImageFile(null);
    setAnalysis(null);
    setError('');
    setSaved(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#f0f0ff' }}>
          📸 Escanear Comida
        </h1>
        <p style={{ color: '#8888aa' }} className="mt-1">
          Toma o sube una foto y la IA calculará las calorías al instante
        </p>
      </div>

      {/* Upload Area */}
      {!image ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className="rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer p-12 text-center"
          style={{
            borderColor: dragging ? '#6c63ff' : '#2a2a3a',
            background: dragging ? 'rgba(108,99,255,0.05)' : '#13131a',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(108,99,255,0.15)' }}>
              <Camera size={36} style={{ color: '#6c63ff' }} />
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color: '#f0f0ff' }}>
                Toca para tomar o subir una foto
              </p>
              <p style={{ color: '#8888aa' }} className="text-sm mt-1">
                JPG, PNG, WEBP • Arrastra y suelta también funciona
              </p>
            </div>
            <button className="px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #6c63ff, #5a52e8)', color: 'white' }}>
              <span className="flex items-center gap-2">
                <Upload size={16} /> Subir imagen
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden relative" style={{ background: '#13131a', border: '1px solid #2a2a3a' }}>
          <div className="relative w-full h-72">
            <Image src={image} alt="Comida" fill style={{ objectFit: 'cover' }} />
            <button onClick={reset}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {/* Meal Type Selector */}
      {image && !saved && (
        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block" style={{ color: '#8888aa' }}>
            ¿Qué comida es?
          </label>
          <div className="grid grid-cols-4 gap-2">
            {mealTypes.map((type) => (
              <button key={type.value} onClick={() => setMealType(type.value)}
                className="py-2 px-2 rounded-xl text-sm font-medium transition-all text-center"
                style={{
                  background: mealType === type.value ? 'rgba(108,99,255,0.2)' : '#1a1a25',
                  border: mealType === type.value ? '1px solid #6c63ff' : '1px solid #2a2a3a',
                  color: mealType === type.value ? '#6c63ff' : '#8888aa',
                }}>
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {image && !analysis && !saved && (
        <button onClick={analyzeImage} disabled={analyzing}
          className="w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #43e97b)', color: 'white' }}>
          {analyzing ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 size={22} className="animate-spin" />
              Analizando con IA...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              ✨ Analizar calorías con IA
            </span>
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)' }}>
          <AlertCircle size={18} style={{ color: '#ff6584' }} />
          <p className="text-sm" style={{ color: '#ff6584' }}>{error}</p>
        </div>
      )}

      {/* Analysis Result */}
      {analysis && !saved && (
        <div className="mt-4 animate-fadeIn">
          <div className="card p-5">
            {/* Food Name & Confidence */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#f0f0ff' }}>{analysis.food_name}</h2>
                <p className="text-sm mt-0.5" style={{ color: '#8888aa' }}>{analysis.portion_size}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: confidenceConfig[analysis.confidence].bg,
                  color: confidenceConfig[analysis.confidence].color,
                }}>
                {confidenceConfig[analysis.confidence].label}
              </span>
            </div>

            {/* Calories - Big */}
            <div className="text-center py-5 rounded-xl mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(67,233,123,0.1))' }}>
              <p className="text-6xl font-black" style={{ color: '#f0f0ff' }}>{analysis.calories}</p>
              <p className="text-lg" style={{ color: '#8888aa' }}>calorías</p>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Proteína', value: analysis.protein_g, unit: 'g', color: '#ff6584' },
                { label: 'Carbos', value: analysis.carbs_g, unit: 'g', color: '#fbbf24' },
                { label: 'Grasas', value: analysis.fat_g, unit: 'g', color: '#a78bfa' },
                { label: 'Fibra', value: analysis.fiber_g, unit: 'g', color: '#43e97b' },
              ].map((macro) => (
                <div key={macro.label} className="text-center p-3 rounded-xl" style={{ background: '#1a1a25' }}>
                  <p className="text-lg font-bold" style={{ color: macro.color }}>{macro.value}{macro.unit}</p>
                  <p className="text-xs" style={{ color: '#8888aa' }}>{macro.label}</p>
                </div>
              ))}
            </div>

            {/* Tips */}
            {analysis.tips && (
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(67,233,123,0.08)', border: '1px solid rgba(67,233,123,0.2)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#43e97b' }}>💡 Consejo nutricional</p>
                <p className="text-sm" style={{ color: '#ccccdd' }}>{analysis.tips}</p>
              </div>
            )}

            {analysis.alternatives && (
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#6c63ff' }}>🔄 Alternativa más saludable</p>
                <p className="text-sm" style={{ color: '#ccccdd' }}>{analysis.alternatives}</p>
              </div>
            )}

            {/* Save Button */}
            <button onClick={saveFood} disabled={saving}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, #6c63ff, #43e97b)', color: 'white' }}>
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" /> Guardando...
                </span>
              ) : '✅ Guardar en mi diario'}
            </button>
          </div>
        </div>
      )}

      {/* Saved State */}
      {saved && (
        <div className="mt-4 p-6 rounded-xl text-center animate-fadeIn"
          style={{ background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.3)' }}>
          <CheckCircle size={48} className="mx-auto mb-3" style={{ color: '#43e97b' }} />
          <p className="text-xl font-bold" style={{ color: '#43e97b' }}>¡Guardado exitosamente!</p>
          <p className="text-sm mt-1" style={{ color: '#8888aa' }}>Redirigiendo al dashboard...</p>
        </div>
      )}

      {/* Tips at bottom */}
      {!image && (
        <div className="mt-6 grid grid-cols-1 gap-3">
          {[
            { icon: '📱', text: 'Toma la foto desde arriba para mejor precisión' },
            { icon: '💡', text: 'Asegúrate de buena iluminación' },
            { icon: '🎯', text: 'Incluye todo el plato en la foto' },
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#13131a' }}>
              <span className="text-xl">{tip.icon}</span>
              <p className="text-sm" style={{ color: '#8888aa' }}>{tip.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
