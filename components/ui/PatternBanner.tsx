'use client';

import { X } from 'lucide-react';

interface PatternBannerProps {
  patternText: string;
  onDismiss: () => void;
}

export default function PatternBanner({ patternText, onDismiss }: PatternBannerProps) {
  return (
    <div className="flex items-start gap-3 bg-[#FFFBEB] border border-[#F59E0B]/30 rounded-[10px] px-4 py-3">
      <div className="w-2 h-2 rounded-full bg-[#D97706] mt-1.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#92400E] uppercase tracking-wide mb-0.5">
          Recurring pattern detected
        </p>
        <p className="text-sm text-[#78400E]">{patternText}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-[#92400E] hover:text-[#78400E] transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss pattern"
      >
        <X size={14} />
      </button>
    </div>
  );
}
