'use client';

interface TraitPillProps {
  trait: string;
  count?: number;
  variant?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

const VARIANT_STYLES = {
  positive: 'bg-[#E1F5EE] text-[#0F6E56]',
  negative: 'bg-[#FAECE7] text-[#993C1D]',
  neutral: 'bg-[#F3F4F6] text-[#5F5E5A]',
};

export default function TraitPill({ trait, count, variant = 'neutral', className = '' }: TraitPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${VARIANT_STYLES[variant]} ${className}`}
    >
      {trait}
      {count !== undefined && count > 1 && (
        <span className="opacity-60 font-normal">×{count}</span>
      )}
    </span>
  );
}
