'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Package } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { NOVAS } from '@/lib/novas';
import { useNovasBalance } from '@/lib/useNovasBalance';
import { Header } from '@/components/layout/Header';

interface StoreItem {
  _id: string;
  name: string;
  description?: string;
  priceCoins: number;
  category: string;
  stock: number | null;
}
interface StoreOrder {
  _id: string;
  itemNameSnapshot: string;
  coinsSpent: number;
  status: string;
  createdAt: string;
}

export default function StorePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const coins = useNovasBalance();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login?redirect=/store');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;
    Promise.all([api.store.getItems(), api.store.getMyOrders()])
      .then(([i, o]) => {
        if (!alive) return;
        setItems((i as { items?: StoreItem[] })?.items ?? []);
        setOrders((o as { orders?: StoreOrder[] })?.orders ?? []);
      })
      .catch(() => { /* leave empty state */ })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e17] to-[#111827]">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-amber-400" />
            <div>
              <h1 className="font-orbitron font-black text-2xl text-white tracking-wider">{NOVAS.NAME} STORE</h1>
              <p className="text-sm text-gray-400 font-rajdhani">Win {NOVAS.NAME} in contests, redeem rewards — collect at school.</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-50/10 px-3 py-1.5 text-amber-300 font-semibold">
            <span aria-hidden>{NOVAS.EMOJI}</span><span>{coins}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          </div>
        ) : (
          <>
            {items.length === 0 ? (
              <div className="text-center py-16 text-gray-400 font-rajdhani">
                <Package className="w-14 h-14 mx-auto mb-3 opacity-40" />
                The store is being stocked. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {items.map((it) => (
                  <div key={it._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
                    <div className="aspect-square rounded-lg bg-white/5 flex items-center justify-center mb-3">
                      <Sparkles className="w-10 h-10 text-amber-400/50" />
                    </div>
                    <h3 className="font-orbitron font-bold text-white text-sm">{it.name}</h3>
                    {it.description && <p className="text-xs text-gray-400 font-rajdhani mt-1 flex-1">{it.description}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-amber-300 font-bold">{NOVAS.EMOJI} {it.priceCoins}</span>
                      <button
                        disabled
                        title="Redemptions open soon"
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300/70 text-xs font-orbitron tracking-wider cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 className="font-orbitron font-bold text-white tracking-wider mt-10 mb-3">MY ORDERS</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500 font-rajdhani text-sm">No orders yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {orders.map((o) => (
                  <div key={o._id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                    <span className="text-white font-rajdhani">{o.itemNameSnapshot}</span>
                    <span className="text-xs text-gray-400 font-rajdhani uppercase tracking-wider">{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
