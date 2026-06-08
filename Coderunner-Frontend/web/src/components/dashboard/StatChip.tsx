'use client';

/**
 * Colored summary stat chip (count + label) used across the admin/oversight
 * health panels. The color is a semantic hex (green=good, amber=warning,
 * red=bad, sky=info) applied via inline style — deliberately NOT an interpolated
 * Tailwind class (DO_NOT_DISTURB rule 8) — so any hex works without a static
 * class map.
 */
export function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="flex-1 rounded-xl px-4 py-3 text-center"
      style={{ backgroundColor: `${color}1a`, border: `1px solid ${color}55` }}
    >
      <p className="text-2xl font-orbitron font-black" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] font-orbitron tracking-widest mt-1" style={{ color }}>
        {label}
      </p>
    </div>
  );
}
