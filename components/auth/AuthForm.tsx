'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-[#FEF2F2] border border-[#991B1B]/20 rounded-[8px] px-4 py-3">
          <p className="text-sm text-[#991B1B]">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-medium text-chaptr-muted mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full px-4 py-2.5 text-sm text-chaptr-text bg-chaptr-bg border border-chaptr-border rounded-[8px] placeholder:text-chaptr-faint focus:outline-none focus:border-chaptr-text transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-chaptr-muted mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-2.5 text-sm text-chaptr-text bg-chaptr-bg border border-chaptr-border rounded-[8px] placeholder:text-chaptr-faint focus:outline-none focus:border-chaptr-text transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-chaptr-muted mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-2.5 pr-10 text-sm text-chaptr-text bg-chaptr-bg border border-chaptr-border rounded-[8px] placeholder:text-chaptr-faint focus:outline-none focus:border-chaptr-text transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-chaptr-faint hover:text-chaptr-muted"
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-chaptr-text text-chaptr-surface text-sm font-medium rounded-[8px] hover:opacity-90 disabled:opacity-50 transition-all duration-200"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-chaptr-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-xs text-chaptr-muted bg-chaptr-surface">or</span>
        </div>
      </div>

      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="flex items-center justify-center gap-2.5 w-full py-2.5 bg-chaptr-surface border border-chaptr-border text-sm font-medium text-chaptr-text rounded-[8px] hover:bg-chaptr-bg disabled:opacity-50 transition-all duration-200"
      >
        {googleLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        Continue with Google
      </button>

      <p className="text-center text-sm text-chaptr-muted">
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <Link href="/signup" className="text-chaptr-text font-medium hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-chaptr-text font-medium hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
