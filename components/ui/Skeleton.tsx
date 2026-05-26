'use client';

export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[#E8E6E1] dark:bg-[#242321] rounded animate-pulse ${className}`} />
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-chaptr-surface border border-chaptr-border rounded-[10px] p-5 space-y-3 ${className}`}>
      <SkeletonLine className="h-4 w-1/3" />
      <SkeletonLine className="h-6 w-1/2" />
      <SkeletonLine className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonPerson({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 ${className}`}>
      <div className="w-7 h-7 rounded-full bg-[#E8E6E1] dark:bg-[#242321] animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine className="h-3 w-3/4" />
        <SkeletonLine className="h-2 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonLogItem({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-3 py-4 border-b border-chaptr-border ${className}`}>
      <div className="w-1 rounded-full bg-[#E8E6E1] dark:bg-[#242321] animate-pulse" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-3 w-1/4" />
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}
