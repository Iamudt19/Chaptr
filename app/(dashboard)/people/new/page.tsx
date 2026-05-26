'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

const RELATIONSHIPS = [
  { value: 'friend', label: 'Friend' },
  { value: 'family', label: 'Family' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other', label: 'Other' },
];

export default function NewPersonPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('friend');
  const [firstNote, setFirstNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Create person
      const personRes = await fetch('/api/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: name.trim(), relationship }),
      });

      if (!personRes.ok) {
        const err = await personRes.json();
        throw new Error(err.error || 'Failed to create person');
      }

      const person = await personRes.json();

      // Add first note if provided
      if (firstNote.trim()) {
        await fetch(`/api/people/${person.id}/logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ content: firstNote.trim() }),
        });
      }

      showToast(`${name}'s chapter created`, 'success');
      router.push(`/people/${person.id}`);
    } catch (e: any) {
      showToast(e.message || 'Something went wrong', 'error');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto animate-fade-in">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-chaptr-muted hover:text-chaptr-text transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      <div className="bg-chaptr-surface border border-chaptr-border rounded-[12px] p-6 shadow-xl">
        <h1 className="text-[17px] font-semibold text-chaptr-text mb-1">New chapter</h1>
        <p className="text-sm text-chaptr-muted mb-6">Add someone to your personal journal.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-chaptr-muted mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Their name"
              required
              autoFocus
              className="w-full px-4 py-2.5 text-sm text-chaptr-text bg-chaptr-bg border border-chaptr-border rounded-[8px] placeholder:text-chaptr-faint focus:outline-none focus:border-chaptr-text transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-chaptr-muted mb-1.5">Relationship</label>
            <div className="grid grid-cols-2 gap-2">
              {RELATIONSHIPS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRelationship(r.value)}
                  className={`px-3 py-2 text-sm rounded-[8px] border transition-all duration-200 ${
                    relationship === r.value
                      ? 'bg-chaptr-text text-chaptr-surface border-chaptr-text'
                      : 'bg-chaptr-surface text-chaptr-muted border-chaptr-border hover:border-chaptr-muted'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-chaptr-muted mb-1.5">
              First observation <span className="text-chaptr-faint font-normal">(optional)</span>
            </label>
            <textarea
              value={firstNote}
              onChange={(e) => setFirstNote(e.target.value)}
              placeholder="Anything you want to remember about them..."
              rows={3}
              className="w-full px-4 py-3 text-sm text-chaptr-text bg-chaptr-bg border border-chaptr-border rounded-[8px] placeholder:text-chaptr-faint focus:outline-none focus:border-chaptr-text transition-colors resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-chaptr-text text-chaptr-surface text-sm font-medium rounded-[8px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {loading ? 'Creating...' : 'Start chapter'}
          </button>
        </form>
      </div>
    </div>
  );
}
