'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({ label, value, sub, icon, className = '' }: StatCardProps) {
  return (
    <div
      className={`bg-chaptr-surface border border-chaptr-border rounded-[10px] p-5 flex flex-col gap-2 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-chaptr-muted font-medium uppercase tracking-wide">{label}</span>
        {icon && <span className="text-chaptr-muted">{icon}</span>}
      </div>
      <div>
        <p className="text-2xl font-semibold text-chaptr-text leading-none">{value}</p>
        {sub && <p className="text-xs text-chaptr-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}
