'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'iamudt19@gmail.com';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        router.replace('/login');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-chaptr-bg flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-chaptr-text border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
