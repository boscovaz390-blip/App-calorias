import Navbar from '@/components/Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      <Navbar />
      {/* Desktop: offset for sidebar; Mobile: offset for bottom nav */}
      <main className="md:ml-20 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
