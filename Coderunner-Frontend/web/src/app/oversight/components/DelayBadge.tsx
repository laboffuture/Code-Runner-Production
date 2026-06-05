'use client';

export function DelayBadge({ delayHours, isBreached }: { delayHours: number; isBreached: boolean }) {
  const label = delayHours >= 24 ? `${Math.floor(delayHours / 24)}d` : `${Math.round(delayHours)}h`;
  const color = isBreached ? '#dc2626' : delayHours >= 12 ? '#d97706' : '#16a34a';
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-orbitron font-bold"
      style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}55` }}
    >
      {isBreached ? `BREACHED · ${label}` : label}
    </span>
  );
}
