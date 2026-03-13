'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas. Intenta de nuevo.');
        return;
      }

      if (data.needsOnboarding) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Card */}
      <div
        className="glass rounded-3xl p-8 glow"
        style={{ border: '1px solid rgba(108, 99, 255, 0.2)' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-4xl">🥗</span>
            <span className="text-3xl font-extrabold gradient-text">FitPic</span>
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ color: '#f0f0ff' }}>
            Bienvenido de vuelta
          </h1>
          <p className="text-sm" style={{ color: '#8888aa' }}>
            Inicia sesión para continuar tu progreso
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2"
            style={{
              background: 'rgba(255, 101, 132, 0.12)',
              border: '1px solid rgba(255, 101, 132, 0.3)',
              color: '#ff6584',
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
              style={{ color: '#ccccdd' }}
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: '#ccccdd' }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl text-base font-bold transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2"
            style={{
              background: 'linear-gradient(135deg, #6c63ff, #43e97b)',
              color: '#fff',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: '#2a2a3a' }} />
          <span className="text-xs" style={{ color: '#555577' }}>
            ¿No tienes cuenta?
          </span>
          <div className="flex-1 h-px" style={{ background: '#2a2a3a' }} />
        </div>

        {/* Register link */}
        <Link
          href="/register"
          className="block w-full py-3 rounded-2xl text-base font-semibold text-center transition-all hover:scale-[1.02]"
          style={{
            background: 'rgba(108, 99, 255, 0.1)',
            border: '1px solid rgba(108, 99, 255, 0.25)',
            color: '#6c63ff',
          }}
        >
          Crear cuenta gratis
        </Link>
      </div>

      {/* Back to home */}
      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-sm transition-colors hover:text-white"
          style={{ color: '#555577' }}
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
