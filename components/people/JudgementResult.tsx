'use client';

import { AlertTriangle, BarChart2, Eye, Lightbulb } from 'lucide-react';
import type { JudgementResponse } from '@/lib/ai';

interface JudgementResultProps {
  result: JudgementResponse;
  question: string;
}

const BIAS_STYLES = {
  too_harsh: { bg: 'bg-[#FEF3C7] dark:bg-amber-950/20', text: 'text-[#92400E] dark:text-amber-300', label: 'Watch your bias — you might be too harsh' },
  too_lenient: { bg: 'bg-[#EFF6FF] dark:bg-blue-950/20', text: 'text-[#1E40AF] dark:text-blue-300', label: 'Watch your bias — you might be too lenient' },
  balanced: { bg: 'bg-[#F0FDF4] dark:bg-emerald-950/20', text: 'text-[#166534] dark:text-emerald-300', label: 'Your perspective seems balanced' },
};

export default function JudgementResult({ result, question }: JudgementResultProps) {
  const biasStyle = BIAS_STYLES[result.bias_check] ?? BIAS_STYLES.balanced;

  return (
    <div className="space-y-3 mt-4">
      <p className="text-xs text-chaptr-muted italic">"{question}"</p>

      {/* Pattern */}
      <div className="bg-[#EEEDFE] dark:bg-indigo-950/20 border border-[#534AB7]/20 dark:border-indigo-900/10 rounded-[10px] p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 size={13} className="text-[#534AB7] dark:text-indigo-300" />
          <span className="text-[11px] font-semibold text-[#534AB7] dark:text-indigo-300 uppercase tracking-wide">What the history shows</span>
        </div>
        <p className="text-sm text-chaptr-text">{result.pattern}</p>
      </div>

      {/* Relevant incidents */}
      {result.relevant_incidents?.length > 0 && (
        <div className="bg-chaptr-bg border border-chaptr-border rounded-[10px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={13} className="text-chaptr-muted" />
            <span className="text-[11px] font-semibold text-chaptr-muted uppercase tracking-wide">Relevant incidents</span>
          </div>
          <ul className="space-y-1.5">
            {result.relevant_incidents.map((incident, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-chaptr-text">
                <span className="text-chaptr-faint mt-0.5">·</span>
                <span>{incident}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* My read */}
      <div className="bg-[#1A1917] rounded-[10px] p-4">
        <span className="text-[11px] font-semibold text-[#A0998F] uppercase tracking-wide block mb-2">My honest read</span>
        <p className="text-sm text-white leading-relaxed">{result.my_read}</p>
      </div>

      {/* Bias check */}
      <div className={`${biasStyle.bg} rounded-[10px] p-3 flex items-start gap-2`}>
        <AlertTriangle size={13} className={`${biasStyle.text} mt-0.5 flex-shrink-0`} />
        <div>
          <p className={`text-[11px] font-semibold ${biasStyle.text} uppercase tracking-wide`}>
            {biasStyle.label}
          </p>
          <p className={`text-xs ${biasStyle.text} mt-0.5 opacity-80`}>{result.bias_note}</p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-[#F0FDF4] dark:bg-emerald-950/20 border border-[#0F6E56]/20 dark:border-emerald-900/10 rounded-[10px] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={13} className="text-[#0F6E56] dark:text-emerald-400" />
          <span className="text-[11px] font-semibold text-[#0F6E56] dark:text-emerald-400 uppercase tracking-wide">Recommendation</span>
        </div>
        <p className="text-sm text-chaptr-text">{result.recommendation}</p>
      </div>
    </div>
  );
}
