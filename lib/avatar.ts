const COLORS = [
  { bg: '#EEEDFE', text: '#534AB7' }, // purple
  { bg: '#E1F5EE', text: '#0F6E56' }, // teal
  { bg: '#FAEEDA', text: '#854F0B' }, // amber
  { bg: '#FAECE7', text: '#993C1D' }, // coral
  { bg: '#E6F1FB', text: '#185FA5' }, // blue
  { bg: '#FBEAF0', text: '#993556' }, // pink
];

export function getAvatarColor(name: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColorHex(name: string): string {
  const color = getAvatarColor(name);
  return color.bg;
}
