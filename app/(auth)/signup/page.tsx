import type { Metadata } from 'next';
import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';
import LogoWordmark from '@/components/ui/LogoWordmark';

export const metadata: Metadata = { title: 'Create Account — Chaptr' };

export default function SignupPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      {/* Back to home */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-chaptr-muted hover:text-chaptr-text transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back to home
      </Link>

      {/* Brand */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <LogoWordmark heightClass="h-14" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-chaptr-text tracking-tight">Create your account</h1>
          <p className="text-sm text-chaptr-muted mt-1">Free to use. Private by design. No card required.</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-chaptr-surface border border-chaptr-border rounded-[20px] p-8 shadow-2xl backdrop-blur-xl">
        <AuthForm mode="signup" />
      </div>

      <p className="text-center text-xs text-chaptr-faint">
        No credit card required. All observations are encrypted and never shared.
      </p>
    </div>
  );
}
