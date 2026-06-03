'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Package, ChevronLeft } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NOVAS } from '@/lib/novas';
import { useNovasBalance } from '@/lib/useNovasBalance';
import { Header } from '@/components/layout/Header';
import FloatingParticles from '@/components/ui/FloatingParticles';

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
  const { theme } = useTheme();
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
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${theme.wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Floating particles */}
      <FloatingParticles color={theme.colors.primary} />

      <div className="relative z-10">
        <Header />

        <main className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Page header — back button + title + balance, matching the contest/profile pages */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 shrink-0"
              style={{
                border: `1.5px solid ${theme.colors.light}99`,
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-orbitron font-black mb-2 tracking-wider text-white flex items-center gap-3">
                <Sparkles className="w-8 h-8" style={{ color: theme.colors.primary }} />
                {NOVAS.NAME} STORE
              </h1>
              <p className="font-rajdhani text-gray-200">
                Win {NOVAS.NAME} in contests, redeem rewards — collect at school.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-50 px-4 py-2 text-amber-700 font-orbitron font-bold shrink-0">
              <span aria-hidden>{NOVAS.EMOJI}</span><span>{coins}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: theme.colors.primary }} />
            </div>
          ) : (
            <>
              {items.length === 0 ? (
                <div
                  className="bg-white border-2 rounded-xl p-12 text-center"
                  style={{ borderColor: `${theme.colors.light}66` }}
                >
                  <Package className="w-14 h-14 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-rajdhani">The store is being stocked. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {items.map((it) => (
                    <div
                      key={it._id}
                      className="bg-white border-2 rounded-xl p-4 flex flex-col transition-all duration-300 hover:shadow-lg"
                      style={{ borderColor: `${theme.colors.light}66` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = theme.colors.primary; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${theme.colors.light}66`; }}
                    >
                      <div
                        className="aspect-square rounded-lg flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${theme.colors.light}1a` }}
                      >
                        <Sparkles className="w-10 h-10 text-amber-400" />
                      </div>
                      <h3 className="font-orbitron font-bold text-gray-900 text-sm">{it.name}</h3>
                      {it.description && <p className="text-xs text-gray-600 font-rajdhani mt-1 flex-1">{it.description}</p>}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-amber-600 font-bold">{NOVAS.EMOJI} {it.priceCoins}</span>
                        <button
                          disabled
                          title="Redemptions open soon"
                          className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-500 text-xs font-orbitron tracking-wider cursor-not-allowed"
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
                <div
                  className="bg-white border-2 rounded-xl px-4 py-6 text-center"
                  style={{ borderColor: `${theme.colors.light}66` }}
                >
                  <p className="text-gray-500 font-rajdhani text-sm">No orders yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {orders.map((o) => (
                    <div
                      key={o._id}
                      className="flex items-center justify-between bg-white border-2 rounded-lg px-4 py-3"
                      style={{ borderColor: `${theme.colors.light}66` }}
                    >
                      <span className="text-gray-900 font-rajdhani font-bold">{o.itemNameSnapshot}</span>
                      <span className="text-xs text-gray-500 font-rajdhani uppercase tracking-wider">{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
