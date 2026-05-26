'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

interface LogModalProps {
  personId: string;
  personName: string;
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function LogModal({ personId, personName, isOpen, onClose, onAdded }: LogModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(`/api/people/${personId}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      showToast('Incident logged', 'success');
      onAdded();
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Failed to log incident', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-chaptr-surface border border-chaptr-border rounded-[12px] w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-chaptr-border">
          <div>
            <h2 className="text-[15px] font-semibold text-chaptr-text">Log incident</h2>
            <p className="text-xs text-chaptr-muted mt-0.5">Adding to {personName}'s chapter</p>
          </div>
          <button
            onClick={onClose}
            className="text-chaptr-muted hover:text-chaptr-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What happened? Write naturally — AI will categorize it for you."
            rows={4}
            className="w-full text-sm text-chaptr-text placeholder:text-chaptr-faint bg-chaptr-bg border border-chaptr-border rounded-[8px] px-4 py-3 resize-none focus:outline-none focus:border-chaptr-text transition-colors leading-relaxed"
          />
          <p className="text-[11px] text-chaptr-faint mt-2">
            AI will extract traits and detect patterns automatically.
          </p>

          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-chaptr-muted hover:text-chaptr-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="flex items-center gap-2 px-4 py-2 bg-chaptr-text text-chaptr-surface text-sm font-medium rounded-[6px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : null}
              {loading ? 'Analyzing...' : 'Log it'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
