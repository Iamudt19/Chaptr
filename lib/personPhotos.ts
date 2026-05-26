/**
 * Lightweight local photo storage for person avatars.
 * Stores compressed base64 thumbnails in localStorage keyed by person ID.
 * No backend changes needed — fully client-side.
 */

const STORAGE_PREFIX = 'chaptr_photo_';
const MAX_SIZE = 200; // px — thumbnail size for performance

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function savePersonPhoto(personId: string, file: File): Promise<string> {
  const dataUrl = await compressImage(file);
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${personId}`, dataUrl);
  } catch {
    // localStorage full — clear oldest and retry
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
    if (keys.length > 0) localStorage.removeItem(keys[0]);
    localStorage.setItem(`${STORAGE_PREFIX}${personId}`, dataUrl);
  }
  return dataUrl;
}

export function getPersonPhoto(personId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${STORAGE_PREFIX}${personId}`);
}

export function removePersonPhoto(personId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${personId}`);
}
