'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { NOVAS } from '@/lib/novas';
import { useNovasBalance } from '@/lib/useNovasBalance';

// Student-facing teaser on the profile: Novas exist, here's your balance (0 now),
// and they're "releasing soon". The launch entry point for the feature. Self-fetches
// the balance (same source as the header chip) so it lights up when earning ships.
export function NovasTeaserCard() {
  const coins = useNovasBalance();
  if (!NOVAS.VISIBLE) return null;
  return (
    <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="font-orbitron font-bold text-gray-900 tracking-wider">{NOVAS.NAME}</h3>
        </div>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
          Releasing soon
        </span>
      </div>
      <div className="mt-3 text-3xl font-orbitron font-black text-amber-600">
        {NOVAS.EMOJI} {coins}
      </div>
      <p className="mt-1 text-sm text-gray-500 font-rajdhani">
        Win {NOVAS.NAME} in weekly contests and spend them in the store. Coming soon!
      </p>
      <Link href="/store" className="mt-3 inline-block text-sm font-semibold text-amber-600 hover:text-amber-700">
        Browse the store →
      </Link>
    </div>
  );
}
