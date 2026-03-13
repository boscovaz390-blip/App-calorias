import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', color: '#f0f0ff' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥗</span>
            <span className="text-xl font-bold gradient-text">FitPic</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium rounded-xl transition-all hover:text-white"
              style={{ color: '#8888aa', border: '1px solid #2a2a3a' }}
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium rounded-xl transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #6c63ff, #43e97b)',
                color: '#fff',
              }}
            >
              Empezar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        {/* Background glow blobs */}
        <div
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: '#6c63ff' }}
        />
        <div
          className="absolute top-40 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: '#43e97b' }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{
              background: 'rgba(108, 99, 255, 0.15)',
              border: '1px solid rgba(108, 99, 255, 0.3)',
              color: '#6c63ff',
            }}
          >
            <span>✨</span>
            <span>IA para tu nutrición diaria</span>
          </div>

          {/* Logo + Title */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-6xl">🥗</span>
            <h1 className="text-7xl font-extrabold gradient-text tracking-tight">FitPic</h1>
          </div>

          {/* Tagline */}
          <h2
            className="text-2xl md:text-3xl font-semibold mb-6 leading-snug"
            style={{ color: '#ccccdd' }}
          >
            Toma una foto.{' '}
            <span className="gradient-text">Conoce tus calorías.</span>{' '}
            Transforma tu vida.
          </h2>

          <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: '#8888aa' }}>
            Analiza tus comidas con inteligencia artificial, lleva un registro de calorías, actividad
            física e hidratación. Todo desde tu teléfono, todo gratis.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 glow"
              style={{
                background: 'linear-gradient(135deg, #6c63ff, #43e97b)',
                color: '#fff',
              }}
            >
              🚀 Empezar Gratis
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl text-lg font-semibold transition-all hover:scale-105 hover:border-white"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #2a2a3a',
                color: '#f0f0ff',
              }}
            >
              Iniciar Sesión →
            </Link>
          </div>

          {/* Floating Phone Mockup */}
          <div className="flex justify-center">
            <div className="animate-float">
              <div
                className="w-64 rounded-3xl shadow-2xl glow"
                style={{
                  background: '#13131a',
                  border: '2px solid #2a2a3a',
                  padding: '16px',
                }}
              >
                {/* Phone status bar */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <span style={{ color: '#8888aa', fontSize: '11px' }}>9:41</span>
                  <div className="w-20 h-5 rounded-full flex items-center justify-center" style={{ background: '#1a1a25' }}>
                    <div className="w-12 h-2 rounded-full" style={{ background: '#2a2a3a' }} />
                  </div>
                  <div className="flex gap-1">
                    <span style={{ color: '#8888aa', fontSize: '11px' }}>📶</span>
                    <span style={{ color: '#8888aa', fontSize: '11px' }}>🔋</span>
                  </div>
                </div>

                {/* App header */}
                <div
                  className="rounded-2xl p-4 mb-3 text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(67,233,123,0.2))',
                    border: '1px solid rgba(108,99,255,0.2)',
                  }}
                >
                  <p className="text-xs font-semibold mb-1 gradient-text">Hoy — Meta diaria</p>
                  <p className="text-3xl font-bold" style={{ color: '#f0f0ff' }}>1,840</p>
                  <p className="text-xs mb-2" style={{ color: '#8888aa' }}>/ 2,200 kcal</p>
                  <div className="h-2 rounded-full" style={{ background: '#1a1a25' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{ width: '84%', background: 'linear-gradient(90deg, #6c63ff, #43e97b)' }}
                    />
                  </div>
                </div>

                {/* Food entries */}
                <div className="space-y-2 mb-3">
                  {[
                    { icon: '🍳', meal: 'Desayuno', food: 'Huevos revueltos', kcal: '320' },
                    { icon: '🍱', meal: 'Almuerzo', food: 'Arroz con pollo', kcal: '520' },
                  ].map((entry) => (
                    <div
                      key={entry.meal}
                      className="rounded-xl p-3 flex items-center gap-2"
                      style={{ background: '#1a1a25', border: '1px solid #2a2a3a' }}
                    >
                      <span className="text-xl">{entry.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-semibold" style={{ color: '#f0f0ff' }}>{entry.meal}</p>
                        <p className="text-xs" style={{ color: '#8888aa' }}>{entry.food}</p>
                      </div>
                      <span className="text-xs font-bold" style={{ color: '#43e97b' }}>{entry.kcal}</span>
                    </div>
                  ))}
                </div>

                {/* Camera CTA button */}
                <div className="text-center">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold w-full justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #6c63ff, #43e97b)',
                      color: '#fff',
                    }}
                  >
                    📷 Analizar comida con IA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { value: '10,000+', label: 'Usuarios activos', icon: '👥', color: '#6c63ff' },
              { value: '95%', label: 'Precisión de la IA', icon: '🤖', color: '#43e97b' },
              { value: '100%', label: 'Gratis para siempre', icon: '🎁', color: '#ff6584' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card text-center p-8 transition-all hover:scale-105"
                style={{ borderColor: stat.color + '33' }}
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-extrabold mb-1" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-sm" style={{ color: '#8888aa' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold mb-4">
              Todo lo que necesitas para{' '}
              <span className="gradient-text">transformarte</span>
            </h2>
            <p className="text-lg" style={{ color: '#8888aa' }}>
              Una app completa para tu bienestar, impulsada por inteligencia artificial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '📸',
                title: 'Análisis con IA',
                desc: 'Saca una foto a tu comida y nuestra IA detecta los ingredientes y calcula las calorías en segundos.',
                color: '#6c63ff',
              },
              {
                icon: '🔥',
                title: 'Conteo de Calorías',
                desc: 'Registra tus comidas diarias, visualiza tu progreso y mantente dentro de tus metas calóricas.',
                color: '#ff6584',
              },
              {
                icon: '💪',
                title: 'Actividad Física',
                desc: 'Registra tus entrenamientos y calcula las calorías quemadas para tener un balance completo.',
                color: '#43e97b',
              },
              {
                icon: '💧',
                title: 'Hidratación',
                desc: 'Lleva el conteo de tu consumo de agua diario y recibe recordatorios para mantenerte hidratado.',
                color: '#6c63ff',
              },
              {
                icon: '📊',
                title: 'Resúmenes Diarios',
                desc: 'Revisa un resumen completo de tu nutrición, actividad e hidratación al final de cada día.',
                color: '#43e97b',
              },
              {
                icon: '📈',
                title: 'Historial de Progreso',
                desc: 'Visualiza tu evolución semana a semana con gráficas claras y celebra tus logros.',
                color: '#ff6584',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="card p-6 hover:scale-105 transition-all"
                style={{ borderColor: feature.color + '22' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                  style={{
                    background: feature.color + '18',
                    border: `1px solid ${feature.color}33`,
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#f0f0ff' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8888aa' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-4">
            ¿Cómo <span className="gradient-text">funciona</span>?
          </h2>
          <p className="text-lg mb-14" style={{ color: '#8888aa' }}>
            Tres pasos para empezar tu transformación
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '📝',
                title: 'Crea tu perfil',
                desc: 'Ingresa tus datos y metas personales. Calculamos tu consumo calórico ideal.',
              },
              {
                step: '02',
                icon: '📷',
                title: 'Fotografía tu comida',
                desc: 'Toma una foto de tu plato y nuestra IA analiza los nutrientes automáticamente.',
              },
              {
                step: '03',
                icon: '📈',
                title: 'Mide tu progreso',
                desc: 'Visualiza estadísticas, cumple tus metas y celebra tus logros cada semana.',
              },
            ].map((step) => (
              <div key={step.step} className="card p-6 text-left">
                <div
                  className="text-xs font-bold mb-4 px-2 py-1 rounded-lg inline-block"
                  style={{
                    background: 'rgba(108,99,255,0.15)',
                    color: '#6c63ff',
                    border: '1px solid rgba(108,99,255,0.2)',
                  }}
                >
                  PASO {step.step}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#f0f0ff' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8888aa' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(67,233,123,0.15))',
              border: '1px solid rgba(108,99,255,0.3)',
            }}
          >
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 30% 50%, #6c63ff 0%, transparent 60%), radial-gradient(circle at 70% 50%, #43e97b 0%, transparent 60%)',
              }}
            />
            <div className="relative z-10">
              <div className="text-5xl mb-6">🚀</div>
              <h2 className="text-3xl font-extrabold mb-4">
                Empieza hoy, <span className="gradient-text">gratis</span>
              </h2>
              <p className="text-lg mb-8" style={{ color: '#8888aa' }}>
                Únete a más de 10,000 usuarios que ya están transformando sus hábitos con FitPic.
                Sin tarjeta de crédito, sin compromisos.
              </p>
              <Link
                href="/register"
                className="inline-block px-10 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 glow"
                style={{
                  background: 'linear-gradient(135deg, #6c63ff, #43e97b)',
                  color: '#fff',
                }}
              >
                Crear mi cuenta gratis →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-10 px-6 text-center"
        style={{ borderTop: '1px solid #2a2a3a' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🥗</span>
            <span className="text-xl font-bold gradient-text">FitPic</span>
          </div>
          <p className="text-sm mb-6" style={{ color: '#8888aa' }}>
            Toma una foto. Conoce tus calorías. Transforma tu vida.
          </p>
          <div className="flex justify-center gap-6 text-sm mb-6" style={{ color: '#555577' }}>
            <Link href="/login" className="hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Registrarse
            </Link>
          </div>
          <p className="text-xs" style={{ color: '#333355' }}>
            © {new Date().getFullYear()} FitPic. Hecho con ❤️ para tu bienestar.
          </p>
        </div>
      </footer>
    </div>
  );
}
