'use client';

import { getAvatarColor, getInitials } from '@/lib/avatar';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: { container: 'w-7 h-7', text: 'text-[10px]' },
  md: { container: 'w-9 h-9', text: 'text-xs' },
  lg: { container: 'w-12 h-12', text: 'text-sm' },
  xl: { container: 'w-16 h-16', text: 'text-lg' },
};

export default function Avatar({ name, imageUrl, size = 'md', className = '' }: AvatarProps) {
  const color = getAvatarColor(name);
  const initials = getInitials(name);
  const s = sizes[size];

  if (imageUrl) {
    return (
      <div
        className={`${s.container} rounded-full flex-shrink-0 overflow-hidden border border-chaptr-border/40 ${className}`}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails, hide it so the parent can fall back to initials
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${s.container} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${className}`}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      <span className={s.text}>{initials}</span>
    </div>
  );
}
