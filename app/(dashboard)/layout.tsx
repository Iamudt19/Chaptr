'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, Plus, Menu } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/layout/ThemeToggle';
import LogoWordmark from '@/components/ui/LogoWordmark';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarRefresh] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        setChecking(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/login');
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-chaptr-text border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar refreshKey={sidebarRefresh} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar refreshKey={sidebarRefresh} />
          </div>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-chaptr-surface border-b border-chaptr-border px-4 h-12 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="text-chaptr-text">
          <Menu size={18} />
        </button>
        <div className="flex items-center">
          <LogoWordmark heightClass="h-6" />
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link href="/people/new" className="text-chaptr-text">
            <Plus size={18} />
          </Link>
        </div>
      </div>

      {/* Main content */}
      <main className="md:ml-60 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8 md:py-8 pt-20 md:pt-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-chaptr-surface border-t border-chaptr-border flex z-30">
        <Link
          href="/dashboard"
          className={`flex-1 flex flex-col items-center py-3 gap-1 text-[10px] font-medium ${
            pathname === '/dashboard' ? 'text-chaptr-text' : 'text-chaptr-muted'
          }`}
        >
          <Home size={18} />
          Home
        </Link>
        <Link
          href="/people/new"
          className="flex-1 flex flex-col items-center py-3 gap-1 text-[10px] font-medium text-chaptr-muted"
        >
          <Plus size={18} />
          Add
        </Link>
        <Link
          href="/dashboard"
          className={`flex-1 flex flex-col items-center py-3 gap-1 text-[10px] font-medium ${
            pathname.startsWith('/people') ? 'text-chaptr-text' : 'text-chaptr-muted'
          }`}
        >
          <Users size={18} />
          People
        </Link>
      </nav>
    </div>
  );
}
