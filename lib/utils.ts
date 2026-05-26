export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} minute${m > 1 ? 's' : ''} ago`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} hour${h > 1 ? 's' : ''} ago`;
  }
  if (seconds < 172800) return 'Yesterday';
  if (seconds < 604800) {
    const d = Math.floor(seconds / 86400);
    return `${d} days ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';
  const firstName = name.split(' ')[0];
  return `${greeting}, ${firstName}`;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trim() + '…';
}
