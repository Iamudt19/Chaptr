'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { getAvatarColor, getInitials } from '@/lib/avatar';
import { savePersonPhoto, removePersonPhoto } from '@/lib/personPhotos';

interface AvatarUploadProps {
  personId: string;
  name: string;
  imageUrl?: string | null;
  onPhotoChange: (newUrl: string | null) => void;
}

const SIZE_CLASS = 'w-20 h-20';
const TEXT_CLASS = 'text-2xl';

export default function AvatarUpload({ personId, name, imageUrl, onPhotoChange }: AvatarUploadProps) {
  const color = getAvatarColor(name);
  const initials = getInitials(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [hovered, setHovered] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Please choose a photo under 5 MB.');
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await savePersonPhoto(personId, file);
      onPhotoChange(dataUrl);
    } catch {
      alert('Failed to save photo. Try a smaller image.');
    } finally {
      setUploading(false);
      // reset input so same file can be picked again
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    removePersonPhoto(personId);
    onPhotoChange(null);
  }

  return (
    <div className="relative flex-shrink-0 group" style={{ width: 80, height: 80 }}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Avatar circle */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={uploading}
        className={`${SIZE_CLASS} rounded-full overflow-hidden flex items-center justify-center font-bold relative cursor-pointer border-2 border-chaptr-border/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500`}
        style={!imageUrl ? { backgroundColor: color.bg, color: color.text } : undefined}
        title="Click to upload a photo"
        aria-label="Upload person photo"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className={TEXT_CLASS}>{initials}</span>
        )}

        {/* Hover overlay */}
        {(hovered || uploading) && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-full backdrop-blur-[2px]">
            {uploading ? (
              <Loader2 size={20} className="text-white animate-spin" />
            ) : (
              <>
                <Camera size={18} className="text-white mb-0.5" />
                <span className="text-[9px] text-white/90 font-semibold tracking-wide">PHOTO</span>
              </>
            )}
          </div>
        )}
      </button>

      {/* Remove button — only shows when a custom photo exists */}
      {imageUrl && !uploading && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-700 transition-colors z-10 border border-white/20"
          title="Remove photo"
          aria-label="Remove photo"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}
