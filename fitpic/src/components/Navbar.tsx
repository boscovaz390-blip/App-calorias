'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Camera, Activity, Droplets, BarChart2, Brain, User, LogOut } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/scan', icon: Camera, label: 'Escanear' },
  { href: '/activity', icon: Activity, label: 'Actividad' },
  { href: '/water', icon: Droplets, label: 'Agua' },
  { href: '/history', icon: BarChart2, label: 'Historial' },
  { href: '/plan', icon: Brain, label: 'Mi Plan' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-6 gap-2 z-50"
        style={{ background: '#0d0d14', borderRight: '1px solid #1e1e2e' }}>
        {/* Logo */}
        <Link href="/dashboard" className="mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #43e97b)' }}>
            F
          </div>
        </Link>

        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} title={label}
              className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group"
              style={{
                background: active ? 'rgba(108,99,255,0.2)' : 'transparent',
                color: active ? '#6c63ff' : '#8888aa',
              }}>
              {active && (
                <span className="absolute left-0 w-1 h-8 rounded-r-full" style={{ background: '#6c63ff' }} />
              )}
              <Icon size={20} />
              {/* Tooltip */}
              <span className="absolute left-14 px-2 py-1 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
                style={{ background: '#1a1a25', color: '#f0f0ff', border: '1px solid #2a2a3a' }}>
                {label}
              </span>
            </Link>
          );
        })}

        <div className="flex-1" />

        <Link href="/profile" title="Perfil"
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ color: pathname === '/profile' ? '#6c63ff' : '#8888aa' }}>
          <User size={20} />
        </Link>

        <button onClick={handleLogout} disabled={loggingOut} title="Cerrar sesión"
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:text-red-400"
          style={{ color: '#8888aa' }}>
          <LogOut size={20} />
        </button>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
        style={{ background: '#0d0d14', borderTop: '1px solid #1e1e2e' }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all"
              style={{ color: active ? '#6c63ff' : '#8888aa' }}>
              <Icon size={22} />
              <span className="text-xs font-medium" style={{ fontSize: '10px' }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
