'use client';

import { useAuth } from '@/contexts/AuthContext';
import { NOVAS } from '@/lib/novas';
import { useNovasBalance } from '@/lib/useNovasBalance';

// A small, always-visible balance pill (✨ N). Earning is off, so it shows 0 for
// now; it reads the real balance so it "just works" once Novas go live.
export function NovasChip() {
  const { user } = useAuth();
  const coins = useNovasBalance();

  if (!NOVAS.VISIBLE || !user?.id) return null;

  return (
    <span
      title={`${NOVAS.NAME} — releasing soon`}
      className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700"
    >
      <span aria-hidden>{NOVAS.EMOJI}</span>
      <span>{coins}</span>
    </span>
  );
}
