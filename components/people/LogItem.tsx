'use client';

import { timeAgo } from '@/lib/utils';
import CategoryPill from '@/components/ui/CategoryPill';
import type { Log } from '@/types/database';

interface LogItemProps {
  log: Log;
}

const BORDER_COLORS: Record<string, string> = {
  positive_trait: '#0F6E56',
  negative_trait: '#993C1D',
  trust_event: '#534AB7',
  pattern: '#D97706',
  one_off: '#9CA3AF',
};

export default function LogItem({ log }: LogItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-chaptr-border/40 last:border-0">
      <div
        className="w-0.5 rounded-full flex-shrink-0 min-h-[40px]"
        style={{ backgroundColor: BORDER_COLORS[log.category] ?? '#9CA3AF' }}
      />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <time className="text-[11px] text-[#A0998F] font-medium">{timeAgo(log.created_at)}</time>
          <CategoryPill category={log.category} />
        </div>
        <p className="text-sm text-chaptr-text leading-relaxed">{log.content}</p>
      </div>
    </div>
  );
}
