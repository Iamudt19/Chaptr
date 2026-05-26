'use client';

import type { LogCategory } from '@/types/database';

interface CategoryPillProps {
  category: LogCategory;
  className?: string;
}

const CATEGORY_STYLES: Record<LogCategory, { bg: string; text: string; label: string }> = {
  positive_trait: { bg: 'bg-[#F0FDF4]', text: 'text-[#0F6E56]', label: 'Positive trait' },
  negative_trait: { bg: 'bg-[#FFF7ED]', text: 'text-[#993C1D]', label: 'Negative trait' },
  trust_event: { bg: 'bg-[#EEF2FF]', text: 'text-[#534AB7]', label: 'Trust event' },
  pattern: { bg: 'bg-[#FFFBEB]', text: 'text-[#92400E]', label: 'Pattern' },
  one_off: { bg: 'bg-[#F3F4F6]', text: 'text-[#5F5E5A]', label: 'One-off' },
};

export default function CategoryPill({ category, className = '' }: CategoryPillProps) {
  const s = CATEGORY_STYLES[category];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${s.bg} ${s.text} ${className}`}
    >
      {s.label}
    </span>
  );
}
