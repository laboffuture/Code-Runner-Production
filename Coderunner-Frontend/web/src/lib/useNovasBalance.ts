'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { NOVAS } from '@/lib/novas';

// Reads the caller's Novas (✨) balance from /me/wallet. Best-effort chrome:
// returns 0 until it resolves and swallows errors. Shared by the header chip and
// the profile teaser so both show the real balance the moment earning ships.
export function useNovasBalance(): number {
  const { user } = useAuth();
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    if (!user?.id || !NOVAS.VISIBLE) return;
    let alive = true;
    api.users
      .getWallet()
      .then((d) => { if (alive) setCoins((d as { coins?: number })?.coins ?? 0); })
      .catch(() => { /* best-effort chrome; ignore */ });
    return () => { alive = false; };
  }, [user?.id]);

  return coins;
}
