'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, MessageSquare, Trash2, Loader2, Send } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import AvatarUpload from '@/components/ui/AvatarUpload';
import TrustBadge from '@/components/ui/TrustBadge';
import TraitPill from '@/components/ui/TraitPill';
import PatternBanner from '@/components/ui/PatternBanner';
import CharacterCard from '@/components/people/CharacterCard';
import LogItem from '@/components/people/LogItem';
import LogModal from '@/components/people/LogModal';
import JudgementResult from '@/components/people/JudgementResult';
import { SkeletonCard, SkeletonLine, SkeletonLogItem } from '@/components/ui/Skeleton';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { getPersonPhoto } from '@/lib/personPhotos';
import type { PersonWithDetails, Pattern } from '@/types/database';
import type { JudgementResponse } from '@/lib/ai';

const RELATIONSHIP_LABELS: Record<string, string> = {
  friend: 'Friend',
  family: 'Family',
  colleague: 'Colleague',
  other: 'Other',
};

export default function PersonPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const personId = params.id as string;

  const [person, setPerson] = useState<PersonWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Person photo (stored in localStorage)
  const [personPhoto, setPersonPhoto] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // AI Judgement
  const [question, setQuestion] = useState('');
  const [askingAI, setAskingAI] = useState(false);
  const [judgement, setJudgement] = useState<JudgementResponse | null>(null);

  // Keyboard shortcut: N to open log modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setLogModalOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadPerson = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`/api/people/${personId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      if (res.status === 404) router.replace('/dashboard');
      setLoading(false);
      return;
    }

    const data = await res.json();
    setPerson(data);
    setLoading(false);
  }, [personId, router]);

  useEffect(() => {
    loadPerson();
  }, [loadPerson]);

  // Load photo from localStorage once personId is available
  useEffect(() => {
    if (personId) {
      setPersonPhoto(getPersonPhoto(personId));
    }
  }, [personId]);

  async function dismissPattern(patternId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch(`/api/patterns/${patternId}/dismiss`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    setPerson((prev) =>
      prev ? { ...prev, patterns: prev.patterns.filter((p: Pattern) => p.id !== patternId) } : prev
    );
  }

  async function handleDelete() {
    if (!confirm(`Delete ${person?.name}'s chapter? This cannot be undone.`)) return;

    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch(`/api/people/${personId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    showToast(`${person?.name}'s chapter deleted`, 'info');
    router.push('/dashboard');
  }

  async function handleAskAI(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || askingAI) return;

    setAskingAI(true);
    setJudgement(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const res = await fetch(`/api/people/${personId}/judgement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'AI unavailable');
      }

      const result = await res.json();
      setJudgement(result);
    } catch (e: any) {
      showToast(e.message || 'AI could not respond', 'error');
    } finally {
      setAskingAI(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SkeletonLine className="h-6 w-48" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E8E6E1] animate-pulse" />
          <div className="space-y-2">
            <SkeletonLine className="h-6 w-32" />
            <SkeletonLine className="h-4 w-24" />
          </div>
        </div>
        <SkeletonCard />
        <SkeletonCard />
        {[1,2,3].map(i => <SkeletonLogItem key={i} />)}
      </div>
    );
  }

  if (!person) return null;

  const activePatterns = person.patterns.filter((p) => !p.dismissed);
  const positiveTraits = person.positive_traits ?? [];
  const negativeTraits = person.negative_traits ?? [];

  const filteredLogs = person.logs.filter((log) => {
    const matchesSearch = log.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-[#78756F] hover:text-[#1A1917] transition-colors"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      {/* Header */}
      <div className="bg-chaptr-surface border border-chaptr-border rounded-[10px] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Clickable photo upload avatar */}
            <AvatarUpload
              personId={personId}
              name={person.name}
              imageUrl={personPhoto}
              onPhotoChange={setPersonPhoto}
            />
            <div>
              <h1 className="text-[22px] font-semibold text-chaptr-text leading-tight">{person.name}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs text-chaptr-muted bg-chaptr-bg border border-chaptr-border px-2.5 py-1 rounded-full capitalize">
                  {RELATIONSHIP_LABELS[person.relationship] ?? person.relationship}
                </span>
                <TrustBadge level={person.trust_level} />
              </div>
              {person.trust_reason && (
                <p className="text-xs text-chaptr-muted mt-2 max-w-xs leading-relaxed">{person.trust_reason}</p>
              )}
              <p className="text-[10px] text-chaptr-faint mt-2 flex items-center gap-1">
                <span>📷</span> Click avatar to add a photo
              </p>
            </div>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-chaptr-faint hover:text-[#991B1B] dark:hover:text-[#EF4444] transition-colors mt-1"
            title="Delete chapter"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-chaptr-border">
          <button
            id="log-incident-btn"
            onClick={() => setLogModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 btn-chaptr-primary text-sm font-semibold rounded-[6px] transition-all"
          >
            <Plus size={13} />
            Log incident
            <span className="text-[10px] opacity-60 ml-1">N</span>
          </button>
          <button
            onClick={() => document.getElementById('ask-ai-input')?.focus()}
            className="flex items-center gap-2 px-4 py-2 bg-chaptr-bg/30 border border-chaptr-border/60 text-chaptr-text text-sm font-semibold rounded-[6px] hover:bg-chaptr-surface/50 transition-all"
          >
            <MessageSquare size={13} />
            Ask AI
          </button>
        </div>
      </div>

      {/* Pattern alerts */}
      {activePatterns.length > 0 && (
        <div className="space-y-2">
          {activePatterns.map((pattern) => (
            <PatternBanner
              key={pattern.id}
              patternText={pattern.pattern_text}
              onDismiss={() => dismissPattern(pattern.id)}
            />
          ))}
        </div>
      )}

      {/* Character summary */}
      <CharacterCard
        person={person}
        onUpdated={(updated) => setPerson((prev) => prev ? { ...prev, ...updated } : prev)}
      />

      {/* Trait grid */}
      {(positiveTraits.length > 0 || negativeTraits.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {positiveTraits.length > 0 && (
            <div className="bg-chaptr-surface border border-chaptr-border rounded-[10px] p-4">
              <p className="text-[11px] font-semibold text-chaptr-muted uppercase tracking-wide mb-3">Strengths</p>
              <div className="flex flex-wrap gap-1.5">
                {positiveTraits.map((trait) => (
                  <TraitPill key={trait} trait={trait} variant="positive" />
                ))}
              </div>
            </div>
          )}
          {negativeTraits.length > 0 && (
            <div className="bg-chaptr-surface border border-chaptr-border rounded-[10px] p-4">
              <p className="text-[11px] font-semibold text-chaptr-muted uppercase tracking-wide mb-3">Areas to watch</p>
              <div className="flex flex-wrap gap-1.5">
                {negativeTraits.map((trait) => (
                  <TraitPill key={trait} trait={trait} variant="negative" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ask AI */}
      <div className="bg-chaptr-surface border border-chaptr-border rounded-[10px] p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={14} className="text-chaptr-muted" />
          <h3 className="text-[15px] font-semibold text-chaptr-text">Ask AI about {person.name}</h3>
        </div>

        <form onSubmit={handleAskAI} className="flex items-center gap-2">
          <input
            id="ask-ai-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask anything about ${person.name}...`}
            className="flex-1 px-4 py-2.5 text-sm text-chaptr-text bg-chaptr-bg border border-chaptr-border rounded-[8px] placeholder:text-chaptr-faint focus:outline-none focus:border-chaptr-text transition-colors"
          />
          <button
            type="submit"
            disabled={!question.trim() || askingAI || person.logs.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 btn-chaptr-primary text-sm font-semibold rounded-[8px] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            {askingAI ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {askingAI ? 'Thinking...' : 'Ask'}
          </button>
        </form>

        {person.logs.length === 0 && (
          <p className="text-xs text-chaptr-faint mt-2">Log at least one incident to use AI judgements.</p>
        )}

        {judgement && <JudgementResult result={judgement} question={question} />}
      </div>

      {/* Incident log / Timeline */}
      <div className="bg-chaptr-surface border border-chaptr-border rounded-[10px] p-5">
        {/* Timeline search & header panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-4 border-b border-chaptr-border">
          <h3 className="text-[15px] font-semibold text-chaptr-text">
            Incident log
            {person.logs.length > 0 && (
              <span className="ml-2 text-xs font-normal text-chaptr-muted">{person.logs.length} entries</span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents..."
              className="px-3 py-1.5 text-xs text-chaptr-text bg-chaptr-bg border border-chaptr-border rounded-[6px] placeholder:text-chaptr-faint focus:outline-none focus:border-chaptr-text transition-colors w-40 md:w-48"
            />
            <button
              onClick={() => setLogModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 btn-chaptr-primary text-xs font-semibold rounded-[6px] transition-all"
            >
              <Plus size={11} />
              Add
            </button>
          </div>
        </div>

        {/* Category Filters */}
        {person.logs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 pb-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'positive_trait', label: 'Positives' },
              { value: 'negative_trait', label: 'Negatives' },
              { value: 'trust_event', label: 'Trust Events' },
              { value: 'pattern', label: 'Patterns' },
              { value: 'one_off', label: 'Others' },
            ].map((filter) => {
              const active = categoryFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => setCategoryFilter(filter.value)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-amber-600 dark:bg-amber-500 text-white border-amber-600 dark:border-amber-500 shadow-md'
                      : 'bg-chaptr-bg/30 text-chaptr-muted border-chaptr-border hover:bg-chaptr-surface/40 hover:text-chaptr-text'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        )}

        {person.logs.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-chaptr-muted">No incidents logged yet.</p>
            <p className="text-xs text-chaptr-faint mt-1">Click "Log incident" to start recording what you observe.</p>
            <button
              onClick={() => setLogModalOpen(true)}
              className="mt-4 flex items-center gap-1.5 text-sm text-chaptr-text font-medium hover:underline mx-auto"
            >
              <Plus size={13} />
              Log first incident
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-chaptr-muted">No matching incidents found.</p>
            <p className="text-xs text-chaptr-faint mt-1">Try resetting your search query or filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
              className="mt-4 text-xs text-chaptr-text font-medium hover:underline mx-auto block"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div>
            {filteredLogs.map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>

      {/* Log Modal */}
      <LogModal
        personId={personId}
        personName={person.name}
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        onAdded={loadPerson}
      />
    </div>
  );
}
