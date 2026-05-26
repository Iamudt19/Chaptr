'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, FileText, Star, Plus, ArrowRight, Sparkles, Cpu, ChevronDown, ChevronUp } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import TrustBadge from '@/components/ui/TrustBadge';
import StatCard from '@/components/ui/StatCard';
import CategoryPill from '@/components/ui/CategoryPill';
import { SkeletonCard, SkeletonLine } from '@/components/ui/Skeleton';
import { supabase } from '@/lib/supabase';
import { getGreeting, timeAgo, truncate } from '@/lib/utils';
import { getPersonPhoto } from '@/lib/personPhotos';
import type { Person, Log } from '@/types/database';

interface ActivityItem {
  log: Log;
  person: Person;
}

export default function DashboardPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [totalLogs, setTotalLogs] = useState(0);
  const [personPhotos, setPersonPhotos] = useState<Record<string, string | null>>({});
  const [intelOpen, setIntelOpen] = useState(false);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDashboard() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'there';
    setGreeting(getGreeting(name));

    // Load people
    const peopleRes = await fetch('/api/people', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!peopleRes.ok) { setLoading(false); return; }
    const peopleData: Person[] = await peopleRes.json();
    setPeople(peopleData);

    // Load photos for all people from localStorage
    const photos: Record<string, string | null> = {};
    peopleData.forEach((p) => { photos[p.id] = getPersonPhoto(p.id); });
    setPersonPhotos(photos);

    await loadActivity(session.access_token, peopleData);
    setLoading(false);
  }

  async function loadActivity(token: string, peopleList: Person[]) {
    // Fetch recent logs from all people
    const logPromises = peopleList.slice(0, 10).map(async (person) => {
      const res = await fetch(`/api/people/${person.id}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      const logs: Log[] = await res.json();
      return logs.slice(0, 3).map((log) => ({ log, person }));
    });

    const allActivity = (await Promise.all(logPromises)).flat();
    const sorted = allActivity
      .sort((a, b) => new Date(b.log.created_at).getTime() - new Date(a.log.created_at).getTime())
      .slice(0, 8);

    setActivity(sorted);
    setTotalLogs(allActivity.length);
  }

  const mostTrusted = people.find((p) => p.trust_level === 'High');

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLine className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonLine className="h-5 w-32" />
        {[1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-[#F0EFE9] dark:bg-[#242321] flex items-center justify-center mb-5 rounded-2xl">
          <Users size={24} className="text-chaptr-muted" />
        </div>
        <h2 className="text-[17px] font-semibold text-chaptr-text mb-2">Start your first chapter</h2>
        <p className="text-sm text-chaptr-muted max-w-xs mb-6">
          Add the people in your life and start logging what you observe. AI does the rest.
        </p>
        <Link
          href="/people/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-chaptr-text text-chaptr-surface text-sm font-medium rounded-[8px] hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Add your first person
        </Link>
      </div>
    );
  }

  const getVelocityStats = () => {
    let harmonyCount = 0;
    let frictionCount = 0;
    activity.forEach(act => {
      if (act.log.category === 'positive_trait') harmonyCount++;
      if (act.log.category === 'negative_trait') frictionCount++;
    });
    const total = harmonyCount + frictionCount;
    if (total === 0) return null; // no data yet
    const harmonyPct = Math.round((harmonyCount / total) * 100);
    const frictionPct = Math.round((frictionCount / total) * 100);
    return { harmonyCount, frictionCount, harmonyPct, frictionPct };
  };

  const velocity = getVelocityStats();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Dynamic Welcome Hero Panel */}
      <div className="relative overflow-hidden bg-chaptr-surface border border-chaptr-border rounded-[16px] p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-2xl">
        {/* Decorative ambient twilight blur */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none animate-pulse" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/40 dark:bg-amber-950/20 border border-amber-800/10 dark:border-amber-300/10">
            <Sparkles size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
            <span>Relationship Digest</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-chaptr-text tracking-tight">{greeting}</h1>
          <p className="text-sm text-chaptr-muted leading-relaxed max-w-md">
            You currently have <span className="font-semibold text-chaptr-text">{people.length} active {people.length === 1 ? 'chapter' : 'chapters'}</span> in your secure journal. AI has evaluated your network dynamics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setIntelOpen(!intelOpen)}
            className="flex items-center gap-1.5 px-4 py-3 bg-chaptr-surface/50 border border-chaptr-border/60 text-chaptr-text text-xs font-semibold rounded-[8px] hover:bg-chaptr-surface transition-all duration-200"
          >
            <Cpu size={14} className={intelOpen ? "text-amber-500 animate-pulse" : "text-chaptr-muted"} />
            <span>AI Intelligence</span>
            {intelOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <Link
            href="/people/new"
            className="flex items-center gap-1.5 px-5 py-3 btn-chaptr-primary text-xs font-semibold rounded-[8px] transition-all duration-200"
          >
            <Plus size={14} />
            New Chapter
          </Link>
        </div>
      </div>

      {/* Collapsible AI Network Intelligence (starts collapsed) */}
      {intelOpen && (
        <div className="bg-chaptr-surface border border-chaptr-border rounded-[16px] p-6 shadow-xl space-y-6 transition-all duration-300 animate-fade-in">
          <div className="flex items-center justify-between border-b border-chaptr-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-amber-500 dark:text-amber-400 animate-pulse" />
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-chaptr-muted">AI Network Intelligence</h2>
            </div>
            <span className="text-[10px] font-medium text-chaptr-faint">Security sync active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-chaptr-bg/30 border border-chaptr-border/40 rounded-[12px] p-5 flex flex-col justify-between gap-4">
              <div>
                <h4 className="text-[10px] font-bold text-chaptr-muted uppercase tracking-wider mb-2">Trust distribution health</h4>
                
                {/* Segmented Trust Progress bar */}
                <div className="h-3 w-full rounded-full bg-chaptr-border overflow-hidden flex">
                  <div 
                    style={{ width: `${Math.max(4, (people.filter(p => p.trust_level === 'High').length / people.length) * 100)}%` }} 
                    className="bg-[#166534] h-full" 
                    title="High Trust"
                  />
                  <div 
                    style={{ width: `${Math.max(4, (people.filter(p => p.trust_level === 'Medium').length / people.length) * 100)}%` }} 
                    className="bg-[#92400E] h-full" 
                    title="Medium Trust"
                  />
                  <div 
                    style={{ width: `${Math.max(4, (people.filter(p => p.trust_level === 'Low').length / people.length) * 100)}%` }} 
                    className="bg-[#991B1B] h-full" 
                    title="Low Trust"
                  />
                  <div 
                    style={{ width: `${Math.max(4, (people.filter(p => p.trust_level !== 'High' && p.trust_level !== 'Medium' && p.trust_level !== 'Low').length / people.length) * 100)}%` }} 
                    className="bg-[#4B5563] h-full" 
                    title="Uncertain/Default"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1 text-[10px] text-center text-chaptr-faint">
                <div>
                  <span className="block font-bold text-chaptr-text">{people.filter(p => p.trust_level === 'High').length}</span>
                  <span className="text-[#166534] font-semibold">High</span>
                </div>
                <div>
                  <span className="block font-bold text-chaptr-text">{people.filter(p => p.trust_level === 'Medium').length}</span>
                  <span className="text-[#92400E] font-semibold">Medium</span>
                </div>
                <div>
                  <span className="block font-bold text-chaptr-text">{people.filter(p => p.trust_level === 'Low').length}</span>
                  <span className="text-[#991B1B] font-semibold">Low</span>
                </div>
                <div>
                  <span className="block font-bold text-chaptr-text">{people.filter(p => p.trust_level !== 'High' && p.trust_level !== 'Medium' && p.trust_level !== 'Low').length}</span>
                  <span className="text-[#4B5563] font-semibold">Uncertain</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-[10px] font-bold text-chaptr-muted uppercase tracking-wider">Key Dynamics</h3>
              <div className="space-y-2 bg-chaptr-bg/30 border border-chaptr-border/40 rounded-[8px] p-3">
                {people.filter(p => p.trust_level === 'High').length > 0 ? (
                  <div className="flex items-start gap-2 text-xs text-chaptr-muted leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#166534] mt-1.5 flex-shrink-0" />
                    <p>
                      Your relationship with <span className="font-semibold text-chaptr-text">{people.filter(p => p.trust_level === 'High')[0].name}</span> holds the highest trust index. Maintain open dialogue.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-xs text-chaptr-muted leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4B5563] mt-1.5 flex-shrink-0" />
                    <p>No high-trust chapters detected yet. Keep logging behavioral dynamics to unlock deeper evaluations.</p>
                  </div>
                )}
                {people.some(p => p.trust_level === 'Low') ? (
                  <div className="flex items-start gap-2 text-xs text-chaptr-muted leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B] mt-1.5 flex-shrink-0 animate-pulse" />
                    <p>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">Boundary Watch</span>: Spotting weak trust markers in your chapter with <span className="font-semibold text-chaptr-text">{people.find(p => p.trust_level === 'Low')?.name}</span>. Evaluate boundary settings.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-xs text-chaptr-muted leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#166534] mt-1.5 flex-shrink-0" />
                    <p>Your boundary watch is clear. No high-risk relationship friction detected.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary Cards (Spans full width) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="People logged"
          value={people.length}
          icon={<Users size={14} />}
          className="hover:scale-[1.02] transition-transform duration-200 cursor-pointer animate-fade-in"
        />
        <StatCard
          label="Total incidents"
          value={totalLogs}
          icon={<FileText size={14} />}
          className="hover:scale-[1.02] transition-transform duration-200 cursor-pointer animate-fade-in"
        />
        <StatCard
          label="Most trusted"
          value={mostTrusted?.name ?? '—'}
          sub={mostTrusted ? 'High trust' : 'No high trust yet'}
          icon={<Star size={14} />}
          className="hover:scale-[1.02] transition-transform duration-200 cursor-pointer animate-fade-in"
        />
      </div>

      {/* Interaction Velocity — spans full width if exists */}
      {velocity && (
        <div className="bg-chaptr-surface border border-chaptr-border rounded-[12px] p-5 shadow-lg space-y-4 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between border-b border-chaptr-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500 dark:text-amber-400" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-chaptr-muted">Interaction Velocity</h3>
            </div>
            <span className="text-[10px] text-chaptr-faint font-medium">30-day index</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 flex flex-col items-center justify-center py-3 bg-chaptr-bg/30 border border-chaptr-border/40 rounded-[8px]">
              <span className="text-3xl font-extrabold text-chaptr-text">{velocity.harmonyPct}%</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-1 text-center">Harmony Index</span>
            </div>
            <div className="md:col-span-8 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-chaptr-muted">Harmony Markers</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{velocity.harmonyCount} logged</span>
                </div>
                <div className="h-1.5 w-full bg-chaptr-border rounded-full overflow-hidden">
                  <div style={{ width: `${velocity.harmonyPct}%` }} className="h-full bg-[#166534]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-chaptr-muted">Friction Flags</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">{velocity.frictionCount} logged</span>
                </div>
                <div className="h-1.5 w-full bg-chaptr-border rounded-full overflow-hidden">
                  <div style={{ width: `${velocity.frictionPct}%` }} className="h-full bg-[#991B1B]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Core Panels Grid: side-by-side layout on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column - Recent Activity Timeline wrapper */}
        <div className="bg-chaptr-surface border border-chaptr-border rounded-[12px] p-5 shadow-lg space-y-4">
          <h2 className="text-[15px] font-semibold text-chaptr-text">Recent activity</h2>

          {activity.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-chaptr-muted">No activity yet.</p>
              <p className="text-xs text-chaptr-faint mt-1">Open a chapter and log your first incident.</p>
            </div>
          ) : (
            <div className="divide-y divide-chaptr-border bg-chaptr-bg/30 border border-chaptr-border/40 rounded-[10px] overflow-hidden">
              {activity.map(({ log, person }) => (
                <Link
                  key={log.id}
                  href={`/people/${person.id}`}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-chaptr-surface/60 transition-colors"
                >
                  <Avatar name={person.name} imageUrl={personPhotos[person.id]} size="sm" className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-chaptr-text">{person.name}</span>
                      <CategoryPill category={log.category} />
                    </div>
                    <p className="text-sm text-chaptr-muted truncate">{truncate(log.content, 90)}</p>
                  </div>
                  <span className="text-[11px] text-chaptr-faint flex-shrink-0 mt-0.5">{timeAgo(log.created_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - All Chapters Grid */}
        <div className="bg-chaptr-surface border border-chaptr-border rounded-[12px] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-chaptr-border/40 pb-3">
            <h2 className="text-[15px] font-semibold text-chaptr-text">All active chapters</h2>
            <Link href="/people/new" className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline transition-all">
              <Plus size={12} />
              Add chapter
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {people.map((person) => (
              <Link
                key={person.id}
                href={`/people/${person.id}`}
                className="glass-card-interactive bg-chaptr-bg/30 border border-chaptr-border/40 rounded-[10px] p-4 flex items-center justify-between hover:border-amber-500/30 group relative"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={person.name} imageUrl={personPhotos[person.id]} size="lg" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-[14px] font-semibold text-chaptr-text truncate">{person.name}</p>
                      <TrustBadge level={person.trust_level} />
                    </div>
                    <p className="text-xs text-chaptr-muted capitalize">{person.relationship}</p>
                    {person.trust_reason && (
                      <p className="text-xs text-chaptr-faint mt-1 truncate">{truncate(person.trust_reason, 55)}</p>
                    )}
                  </div>
                </div>
                <ArrowRight size={14} className="text-chaptr-faint group-hover:text-amber-500 transition-colors flex-shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
