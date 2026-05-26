'use client';

import { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import TraitPill from '@/components/ui/TraitPill';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import type { Person } from '@/types/database';

interface CharacterCardProps {
  person: Person;
  onUpdated: (p: Person) => void;
}

export default function CharacterCard({ person, onUpdated }: CharacterCardProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleRegenerate() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(`/api/people/${person.id}/summary`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }

      const updated = await res.json();
      onUpdated(updated);
      showToast('Summary regenerated', 'success');
    } catch (e: any) {
      showToast(e.message || 'Could not regenerate summary', 'error');
    } finally {
      setLoading(false);
    }
  }

  const hasSummary = !!person.character_summary;

  return (
    <div className="bg-chaptr-surface border border-chaptr-border rounded-[10px] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-chaptr-text">Character summary</h3>
        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-chaptr-muted hover:text-chaptr-text transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
          Regenerate
        </button>
      </div>

      {hasSummary ? (
        <>
          <p className="text-sm text-chaptr-text leading-relaxed">{person.character_summary}</p>

          {person.strengths?.length ? (
            <div>
              <p className="text-[11px] font-semibold text-chaptr-muted uppercase tracking-wide mb-2">Strengths</p>
              <div className="flex flex-wrap gap-1.5">
                {person.strengths.map((s) => (
                  <TraitPill key={s} trait={s} variant="positive" />
                ))}
              </div>
            </div>
          ) : null}

          {person.watchouts?.length ? (
            <div>
              <p className="text-[11px] font-semibold text-chaptr-muted uppercase tracking-wide mb-2">Watch-outs</p>
              <div className="flex flex-wrap gap-1.5">
                {person.watchouts.map((w) => (
                  <TraitPill key={w} trait={w} variant="negative" />
                ))}
              </div>
            </div>
          ) : null}

          <p className="text-[11px] text-chaptr-faint">
            Last updated {formatDate(person.updated_at)}
          </p>
        </>
      ) : (
        <div className="py-4 text-center">
          <p className="text-sm text-chaptr-muted">No summary yet.</p>
          <p className="text-xs text-chaptr-faint mt-1">Log at least one incident, then click Regenerate.</p>
        </div>
      )}
    </div>
  );
}
