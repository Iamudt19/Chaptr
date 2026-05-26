'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Shield, Cpu, Sparkles, Activity,
  BookOpen, TrendingUp, Lock, ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/layout/ThemeToggle';
import LogoWordmark from '@/components/ui/LogoWordmark';

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitting(true);
    setError('');

    const { error: sbError } = await supabase
      .from('contact_submissions')
      .insert({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        message: formData.message.trim(),
      });

    setSubmitting(false);

    if (sbError) {
      setError('Something went wrong. Please try again or email us directly.');
      return;
    }

    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  if (submitted) {
    return (
      <div className="bg-chaptr-surface border border-chaptr-border p-8 rounded-[20px] shadow-xl text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 bg-emerald-100/80 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
        </div>
        <h3 className="text-lg font-bold text-chaptr-text">Message sent!</h3>
        <p className="text-sm text-chaptr-muted max-w-sm mx-auto leading-relaxed">
          Thank you for reaching out. Udit will receive your message instantly and get back to you as soon as possible.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline pt-2 block mx-auto"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-chaptr-surface border border-chaptr-border p-6 md:p-8 rounded-[20px] shadow-xl space-y-4">
      <h3 className="text-base font-bold text-chaptr-text mb-2">Send a message</h3>
      
      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-chaptr-muted uppercase tracking-wider">Your Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
          className="w-full px-4 py-2.5 text-sm text-chaptr-text bg-chaptr-bg border border-chaptr-border rounded-[8px] placeholder:text-chaptr-faint focus:outline-none focus:border-chaptr-text transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-chaptr-muted uppercase tracking-wider">Email Address</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@example.com"
          className="w-full px-4 py-2.5 text-sm text-chaptr-text bg-chaptr-bg border border-chaptr-border rounded-[8px] placeholder:text-chaptr-faint focus:outline-none focus:border-chaptr-text transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-chaptr-muted uppercase tracking-wider">Your Message</label>
        <textarea
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="How can we help you?"
          className="w-full px-4 py-2.5 text-sm text-chaptr-text bg-chaptr-bg border border-chaptr-border rounded-[8px] placeholder:text-chaptr-faint focus:outline-none focus:border-chaptr-text transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !formData.name || !formData.email || !formData.message}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 btn-chaptr-primary text-xs font-bold rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
      >
        {submitting ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <span>Sending...</span>
          </>
        ) : (
          <>
            <span>Send Message</span>
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400 text-center">{error}</p>
      )}
    </form>
  );
}

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Interaction Logging',
    desc: 'Record observations about anyone in your network — colleagues, collaborators, or contacts. Structured notes that build over time.',
    accent: 'from-amber-500/20 to-amber-600/5',
  },
  {
    icon: Cpu,
    title: 'AI Profile Generation',
    desc: 'Automatically synthesise your logs into a structured character profile — behavioural traits, communication style, and reliability signals.',
    accent: 'from-blue-500/20 to-blue-600/5',
  },
  {
    icon: TrendingUp,
    title: 'Behavioural Pattern Tracking',
    desc: 'Surface recurring trends across all your interactions. Understand consistency, trust signals, and flag anomalies before they matter.',
    accent: 'from-emerald-500/20 to-emerald-600/5',
  },
  {
    icon: Activity,
    title: 'Interaction Health Score',
    desc: 'A dynamic ratio of positive and negative interactions over time — giving you a quantified view of any relationship\'s trajectory.',
    accent: 'from-orange-500/20 to-orange-600/5',
  },
  {
    icon: Shield,
    title: 'End-to-End Privacy',
    desc: 'Your data lives in your private, encrypted database. Chaptr never trains on your notes and never shares them with third parties.',
    accent: 'from-violet-500/20 to-violet-600/5',
  },
  {
    icon: Lock,
    title: 'Secure Journal Architecture',
    desc: 'Built on row-level security with Supabase. Each account is fully isolated — no cross-user data access by design.',
    accent: 'from-rose-500/20 to-rose-600/5',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Add a person to your network',
    desc: 'Create a profile for anyone — add context, tags, and a brief description of your relationship with them.',
  },
  {
    step: '02',
    title: 'Log your interactions',
    desc: 'After any notable interaction, write a short note. No formatting required — just what happened and what you observed.',
  },
  {
    step: '03',
    title: 'Let AI do the analysis',
    desc: 'Chaptr\'s AI reads your logs and generates a structured character profile, behavioural patterns, and a health score for each person.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      // Hide when scrolling down past 80px, show when scrolling up
      if (currentY > 80) {
        setNavHidden(currentY > lastY);
      } else {
        setNavHidden(false);
      }
      lastY = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#explore-dropdown-container')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [menuOpen]);

  return (
    <div className="min-h-screen text-chaptr-text flex flex-col font-sans">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 px-6 h-20 flex items-center justify-between transition-all duration-500 ease-in-out ${
        navHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}>
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <LogoWordmark heightClass="h-12 md:h-14" />
        </Link>

        {/* Links and Actions grouped together in top right */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Explore Dropdown Menu */}
          <div id="explore-dropdown-container" className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-chaptr-muted hover:text-chaptr-text transition-colors bg-chaptr-surface border border-chaptr-border/40 rounded-full shadow-sm hover:shadow-md"
            >
              Explore
              <ChevronDown
                size={13}
                className={`transition-transform duration-300 ${menuOpen ? 'rotate-180' : 'rotate-0'}`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-chaptr-surface backdrop-blur-xl border border-chaptr-border rounded-[16px] shadow-2xl p-2 z-50 animate-fade-in flex flex-col">
                <a
                  href="#features"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-chaptr-muted hover:text-chaptr-text hover:bg-chaptr-border/20 rounded-[10px] transition-all"
                >
                  <Sparkles size={13} className="text-amber-500" />
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-chaptr-muted hover:text-chaptr-text hover:bg-chaptr-border/20 rounded-[10px] transition-all"
                >
                  <Cpu size={13} className="text-blue-500" />
                  How it works
                </a>
                <a
                  href="#about"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-chaptr-muted hover:text-chaptr-text hover:bg-chaptr-border/20 rounded-[10px] transition-all"
                >
                  <BookOpen size={13} className="text-emerald-500" />
                  About
                </a>
                <a
                  href="#contact"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-chaptr-muted hover:text-chaptr-text hover:bg-chaptr-border/20 rounded-[10px] transition-all"
                >
                  <Lock size={13} className="text-rose-500" />
                  Contact Us
                </a>
              </div>
            )}
          </div>


          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!loadingSession && (
              session ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-1.5 px-4 py-2 btn-chaptr-primary text-xs font-bold rounded-[8px]"
                >
                  Dashboard <ArrowRight size={12} />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-4 py-2 text-xs font-semibold text-chaptr-muted hover:text-chaptr-text transition-colors">
                    Sign In
                  </Link>
                  <Link href="/signup" className="px-4 py-2 btn-chaptr-primary text-xs font-bold rounded-[8px]">
                    Get Started
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 pt-16 overflow-hidden">
        {/* ambient glow */}
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-amber-500/6 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10 animate-fade-in">

          {/* Large wordmark hero logo */}
          <div className="flex justify-center">
            <LogoWordmark heightClass="h-16 md:h-20" />
          </div>

          {/* badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-950/30 border border-amber-700/15 dark:border-amber-300/15">
            <Sparkles size={10} className="animate-pulse" />
            Relationship Intelligence Platform
          </div>

          {/* headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-chaptr-text leading-[1.08]">
            Your private intelligence layer<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 dark:from-amber-400 dark:via-amber-300 dark:to-orange-400">
              for every professional relationship.
            </span>
          </h1>

          {/* subheadline */}
          <p className="text-lg md:text-xl text-chaptr-muted leading-relaxed max-w-2xl mx-auto font-light">
            Log interactions. Track behavioural patterns. Generate AI-powered character profiles.
            Chaptr gives you structured clarity on the people in your network — privately.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="flex items-center gap-2 px-8 py-4 btn-chaptr-primary text-sm font-bold rounded-[12px] shadow-xl"
            >
              Start for free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 bg-chaptr-surface/80 border border-chaptr-border text-chaptr-text text-sm font-semibold rounded-[12px] hover:bg-chaptr-surface transition-all backdrop-blur"
            >
              Sign in to your account
            </Link>
          </div>

          <p className="text-xs text-chaptr-faint">No credit card required · End-to-end encrypted · Your data stays yours</p>
        </div>

        {/* scroll cue */}
        <a href="#features" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-chaptr-faint hover:text-chaptr-muted transition-colors animate-bounce">
          <span className="text-[10px] tracking-widest uppercase font-semibold">Scroll</span>
          <ChevronDown size={16} />
        </a>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Platform Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold text-chaptr-text">Everything you need to understand your network.</h2>
            <p className="text-chaptr-muted max-w-xl mx-auto leading-relaxed">
              Six core tools — built to give you structured, AI-powered insight into the people that shape your professional world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
              <div
                key={title}
                className="relative bg-chaptr-surface border border-chaptr-border rounded-[16px] p-6 space-y-3 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-chaptr-bg border border-chaptr-border flex items-center justify-center mb-4">
                    <Icon size={18} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-[16px] font-bold text-chaptr-text">{title}</h3>
                  <p className="text-sm text-chaptr-muted leading-relaxed mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6 bg-chaptr-surface/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Workflow</p>
            <h2 className="text-3xl md:text-4xl font-bold text-chaptr-text">From observation to insight in three steps.</h2>
            <p className="text-chaptr-muted max-w-lg mx-auto leading-relaxed">Chaptr is designed for people who value clarity. No configuration required — start logging and let the platform do the rest.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="bg-chaptr-surface border border-chaptr-border rounded-[16px] p-7 space-y-4 hover:shadow-xl transition-all duration-300 group">
                <div className="text-5xl font-black text-amber-500/25 dark:text-amber-400/20 group-hover:text-amber-500/45 transition-colors font-mono">
                  {item.step}
                </div>
                <h3 className="text-[17px] font-bold text-chaptr-text">{item.title}</h3>
                <p className="text-sm text-chaptr-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy Architecture Strip ──────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Lock, label: 'Row-Level Security', desc: 'Your database rows are isolated by user ID — cryptographically enforced.' },
              { icon: Shield, label: 'Zero Data Sharing', desc: 'Your notes are never used to train AI models or shared with any third party.' },
              { icon: Cpu, label: 'Encrypted Storage', desc: 'All data is encrypted at rest and in transit via Supabase\'s enterprise-grade infrastructure.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 bg-chaptr-surface border border-chaptr-border rounded-[14px] p-5">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-100/40 dark:bg-amber-950/30 flex items-center justify-center">
                  <Icon size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-chaptr-text">{label}</p>
                  <p className="text-xs text-chaptr-muted mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA Banner ────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-chaptr-surface border border-chaptr-border rounded-[24px] p-12 text-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-blue-500/10 pointer-events-none" />
            <div className="relative space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-chaptr-text">
                Start building clarity today.
              </h2>
              <p className="text-chaptr-muted leading-relaxed max-w-md mx-auto">
                Free to use. No billing required. Your account is fully private and encrypted from the moment you sign up.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-8 py-4 btn-chaptr-primary text-sm font-bold rounded-[12px] shadow-xl"
                >
                  Create your free account <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About Section ─────────────────────────────────────────────────── */}
      <section id="about" className="py-28 px-6 bg-chaptr-surface/20 border-t border-chaptr-border/40">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Our Philosophy</p>
            <h2 className="text-3xl md:text-4xl font-bold text-chaptr-text">Built for intentional, high-trust networking.</h2>
            <p className="text-chaptr-muted leading-relaxed">
              We believe that the quality of your professional life is defined by the quality of your relationships. 
              Chaptr was designed to help high-performing professionals, founders, and leaders build structured, bias-free, and highly intentional networks.
            </p>
            <p className="text-chaptr-muted leading-relaxed">
              By combining encrypted logging with private, locally-secured database architectures, Chaptr ensures your critical relationship insights remain entirely yours — completely secure, structured, and private.
            </p>
          </div>
          <div className="relative bg-gradient-to-br from-amber-500/10 to-transparent p-8 rounded-[20px] border border-chaptr-border">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-xs font-bold text-amber-600">✓</span>
                <p className="text-sm font-semibold text-chaptr-text">100% private & secure database isolation</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-xs font-bold text-amber-600">✓</span>
                <p className="text-sm font-semibold text-chaptr-text">Advanced pattern matching engine</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-xs font-bold text-amber-600">✓</span>
                <p className="text-sm font-semibold text-chaptr-text">No data tracking or AI model training</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Us Section ─────────────────────────────────────────────── */}
      <section id="contact" className="py-24 px-6 bg-chaptr-surface/10 border-t border-chaptr-border/40">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Creator details & Social links */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Get in touch</p>
              <h2 className="text-3xl font-bold text-chaptr-text">Contact the creator</h2>
              <p className="text-chaptr-muted leading-relaxed text-sm">
                Chaptr is built with intention by Udit Kumar. Whether you have questions, feedback, feature ideas, or want to collaborate, feel free to reach out directly.
              </p>
              <div className="flex flex-col gap-2.5 pt-2 text-sm text-chaptr-muted">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Phone:</span>
                  <a href="tel:+919123119694" className="hover:text-chaptr-text transition-colors font-medium">+91 91231 19694</a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Email:</span>
                  <a href="mailto:iamudt19@gmail.com" className="hover:text-chaptr-text transition-colors font-medium">iamudt19@gmail.com</a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://github.com/Iamudt19" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-chaptr-surface border border-chaptr-border rounded-[10px] text-xs font-semibold text-chaptr-text hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/iamudit02" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-chaptr-surface border border-chaptr-border rounded-[10px] text-xs font-semibold text-chaptr-text hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/_iamudit_02?igsh=OGJ6ZGNycmxneG14" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-chaptr-surface border border-chaptr-border rounded-[10px] text-xs font-semibold text-chaptr-text hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                Instagram
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 w-full">
            <ContactForm />
          </div>

        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-chaptr-border/40 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <LogoWordmark heightClass="h-9" />
          <p className="text-xs text-chaptr-faint text-center">
            © {new Date().getFullYear()} Chaptr · Relationship Intelligence Platform · All data encrypted
          </p>
          <div className="flex items-center gap-4 text-xs text-chaptr-faint">
            <Link href="/login" className="hover:text-chaptr-muted transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-chaptr-muted transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
