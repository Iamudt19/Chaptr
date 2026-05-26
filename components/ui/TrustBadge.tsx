'use client';

import type { TrustLevel } from '@/types/database';

interface TrustBadgeProps {
  level: TrustLevel;
  className?: string;
}

const TRUST_STYLES: Record<TrustLevel, { bg: string; text: string; dot: string }> = {
  High: { bg: 'bg-[#F0FDF4]', text: 'text-[#166534]', dot: 'bg-[#166534]' },
  Medium: { bg: 'bg-[#FFFBEB]', text: 'text-[#92400E]', dot: 'bg-[#92400E]' },
  Low: { bg: 'bg-[#FEF2F2]', text: 'text-[#991B1B]', dot: 'bg-[#991B1B]' },
  Uncertain: { bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', dot: 'bg-[#4B5563]' },
};

export default function TrustBadge({ level, className = '' }: TrustBadgeProps) {
  const styles = TRUST_STYLES[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {level}
    </span>
  );
}
