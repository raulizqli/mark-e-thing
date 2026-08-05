// apps/api/src/infrastructure/agents/agent-utils.ts

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function seededInt(seed: string, min: number, max: number): number {
  const range = max - min + 1;
  return min + (hashString(seed) % range);
}

export function monthName(date: Date): string {
  return date.toLocaleString('en-US', { month: 'long' });
}

export function currentSeason(date: Date): string {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function engagementRate(metrics: {
  reach: number;
  likes: number;
  comments: number;
  shares: number;
}): number {
  if (metrics.reach <= 0) return 0;
  return (
    ((metrics.likes + metrics.comments + metrics.shares) / metrics.reach) * 100
  );
}
