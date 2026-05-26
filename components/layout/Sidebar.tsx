'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Plus, LogOut, Cpu } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { SkeletonPerson } from '@/components/ui/Skeleton';
import { supabase } from '@/lib/supabase';
import type { Person } from '@/types/database';
import ThemeToggle from './ThemeToggle';
import LogoWordmark from '@/components/ui/LogoWordmark';

interface SidebarProps {
  refreshKey?: number;
}

export default function Sidebar({ refreshKey }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setUser({
      email: session.user.email ?? '',
      name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'You',
    });

    const res = await fetch('/api/people', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setPeople(data);
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside className="w-60 h-screen bg-chaptr-surface border-r border-chaptr-border flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-chaptr-border flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <LogoWordmark heightClass="h-8" />
        </Link>
        <ThemeToggle />
      </div>

      {/* People section */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-5 mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#78756F] uppercase tracking-wider">
            People · {people.length}
          </span>
        </div>

        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3].map((i) => <SkeletonPerson key={i} className="mx-2" />)}
          </div>
        ) : people.length === 0 ? (
          <div className="px-5 py-4 text-center">
            <p className="text-xs text-[#78756F]">No chapters yet.</p>
            <p className="text-xs text-[#78756F]">Add your first person.</p>
          </div>
        ) : (
          <nav className="space-y-0.5 px-2">
            {people.map((person) => {
              const isActive = pathname === `/people/${person.id}`;
              return (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-[#F0EFE9] dark:bg-[#242321] text-chaptr-text'
                      : 'hover:bg-[#F7F6F3] dark:hover:bg-[#181715] text-chaptr-muted hover:text-chaptr-text'
                  }`}
                >
                  <Avatar name={person.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-chaptr-text">{person.name}</p>
                    <p className="text-[11px] text-chaptr-muted truncate capitalize">{person.relationship}</p>
                  </div>
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-70"
                    style={{
                      backgroundColor:
                        person.trust_level === 'High' ? '#166534' :
                        person.trust_level === 'Medium' ? '#92400E' :
                        person.trust_level === 'Low' ? '#991B1B' : '#4B5563'
                    }}
                  />
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      <div className="px-4 py-3 border-t border-chaptr-border">
        <Link
          href="/people/new"
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold btn-chaptr-primary rounded-[8px] justify-center"
        >
          <Plus size={14} />
          Add person
        </Link>
      </div>

      {/* User + AI badge */}
      <div className="px-4 py-3 border-t border-chaptr-border space-y-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#F0EFE9] dark:bg-[#242321] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-chaptr-text">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-chaptr-text truncate">{user?.name}</p>
            <p className="text-[10px] text-chaptr-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-chaptr-muted hover:text-chaptr-text transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut size={13} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-[#A0998F]">
          <Cpu size={10} />
          <span>AI-powered insights</span>
        </div>
      </div>
    </aside>
  );
}
