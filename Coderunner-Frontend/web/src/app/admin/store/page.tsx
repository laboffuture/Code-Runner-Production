'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, Plus, RefreshCw, Check } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import { api } from '@/lib/api-client';

interface Item {
  _id: string; name: string; description?: string; priceCoins: number;
  category: string; stock: number | null; active: boolean;
}
interface Order {
  _id: string; studentNameSnapshot: string; itemNameSnapshot: string;
  coinsSpent: number; status: string; createdAt: string;
}

export default function AdminStorePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // New-item form
  const [form, setForm] = useState({ name: '', description: '', priceCoins: '', category: 'sticker', stock: '' });
  // Adjust form
  const [adj, setAdj] = useState({ username: '', amount: '', reason: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [i, o] = await Promise.all([api.admin.store.listItems(), api.admin.store.listOrders()]);
      setItems((i as { items?: Item[] })?.items ?? []);
      setOrders((o as { orders?: Order[] })?.orders ?? []);
    } catch { /* keep prior */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 3000); };

  const createItem = async () => {
    try {
      await api.admin.store.createItem({
        name: form.name,
        description: form.description,
        priceCoins: Number(form.priceCoins),
        category: form.category,
        stock: form.stock === '' ? null : Number(form.stock),
      });
      setForm({ name: '', description: '', priceCoins: '', category: 'sticker', stock: '' });
      flash('Item created');
      load();
    } catch (e: any) { flash(e?.message || 'Create failed'); }
  };

  const toggleActive = async (it: Item) => {
    try {
      await api.admin.store.updateItem(it._id, {
        name: it.name, description: it.description, priceCoins: it.priceCoins,
        category: it.category, stock: it.stock, active: !it.active,
      });
      load();
    } catch (e: any) { flash(e?.message || 'Update failed'); }
  };

  const collect = async (id: string) => {
    try { await api.admin.store.collectOrder(id); flash('Marked collected'); load(); }
    catch (e: any) { flash(e?.message || 'Failed'); }
  };

  const adjust = async () => {
    try {
      const r = await api.admin.store.adjustNovas({
        username: adj.username, amount: Number(adj.amount), reason: adj.reason,
      }) as { balanceAfter: number };
      setAdj({ username: '', amount: '', reason: '' });
      flash(`New balance: ${r.balanceAfter}`);
    } catch (e: any) { flash(e?.message || 'Adjust failed'); }
  };

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-orbitron font-black text-gray-900 tracking-wider flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" /> NOVAS STORE — ADMIN
          </h1>
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-orbitron">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
        {msg && <div className="mb-4 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-rajdhani">{msg}</div>}

        {/* Adjust Novas */}
        <section className="mb-8 border-2 border-gray-200 rounded-xl p-5">
          <h2 className="font-orbitron font-bold text-gray-900 mb-3">Adjust a student's Novas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input value={adj.username} onChange={(e) => setAdj({ ...adj, username: e.target.value })} placeholder="username" className="px-3 py-2 border-2 border-gray-200 rounded-lg" />
            <input value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value })} placeholder="amount (+/-)" inputMode="numeric" className="px-3 py-2 border-2 border-gray-200 rounded-lg" />
            <input value={adj.reason} onChange={(e) => setAdj({ ...adj, reason: e.target.value })} placeholder="reason" className="px-3 py-2 border-2 border-gray-200 rounded-lg" />
            <button onClick={adjust} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-orbitron text-sm">Apply</button>
          </div>
        </section>

        {/* New item */}
        <section className="mb-8 border-2 border-gray-200 rounded-xl p-5">
          <h2 className="font-orbitron font-bold text-gray-900 mb-3">Add an item</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="name" className="md:col-span-2 px-3 py-2 border-2 border-gray-200 rounded-lg" />
            <input value={form.priceCoins} onChange={(e) => setForm({ ...form, priceCoins: e.target.value })} placeholder="price ✨" inputMode="numeric" className="px-3 py-2 border-2 border-gray-200 rounded-lg" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border-2 border-gray-200 rounded-lg">
              <option value="sticker">sticker</option>
              <option value="merch">merch</option>
              <option value="other">other</option>
            </select>
            <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="stock (blank=∞)" inputMode="numeric" className="px-3 py-2 border-2 border-gray-200 rounded-lg" />
            <button onClick={createItem} className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white font-orbitron text-sm"><Plus className="w-4 h-4" /> Add</button>
          </div>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="description (optional)" className="mt-3 w-full px-3 py-2 border-2 border-gray-200 rounded-lg" />
        </section>

        {/* Items */}
        <section className="mb-8">
          <h2 className="font-orbitron font-bold text-gray-900 mb-3">Catalog ({items.length})</h2>
          <div className="overflow-x-auto border-2 border-gray-200 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr><th className="text-left p-3 font-orbitron">NAME</th><th className="text-right p-3 font-orbitron">PRICE</th><th className="text-left p-3 font-orbitron">CATEGORY</th><th className="text-right p-3 font-orbitron">STOCK</th><th className="text-center p-3 font-orbitron">ACTIVE</th></tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it._id} className="border-t border-gray-100">
                    <td className="p-3 font-rajdhani font-bold text-gray-900">{it.name}</td>
                    <td className="p-3 text-right text-amber-600 font-bold">✨ {it.priceCoins}</td>
                    <td className="p-3 text-gray-600">{it.category}</td>
                    <td className="p-3 text-right text-gray-600">{it.stock === null ? '∞' : it.stock}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => toggleActive(it)} className={it.active ? 'px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-bold' : 'px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs font-bold'}>
                        {it.active ? 'ACTIVE' : 'HIDDEN'}
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && !loading && <tr><td colSpan={5} className="p-6 text-center text-gray-400 font-rajdhani">No items yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {/* Orders / fulfillment */}
        <section>
          <h2 className="font-orbitron font-bold text-gray-900 mb-3">Fulfillment ({orders.length})</h2>
          <div className="overflow-x-auto border-2 border-gray-200 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr><th className="text-left p-3 font-orbitron">STUDENT</th><th className="text-left p-3 font-orbitron">ITEM</th><th className="text-right p-3 font-orbitron">SPENT</th><th className="text-left p-3 font-orbitron">STATUS</th><th className="text-center p-3 font-orbitron">ACTION</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t border-gray-100">
                    <td className="p-3 font-rajdhani font-bold text-gray-900">{o.studentNameSnapshot}</td>
                    <td className="p-3 text-gray-600">{o.itemNameSnapshot}</td>
                    <td className="p-3 text-right text-amber-600 font-bold">✨ {o.coinsSpent}</td>
                    <td className="p-3 text-gray-600 uppercase">{o.status}</td>
                    <td className="p-3 text-center">
                      {o.status === 'pending' && (
                        <button onClick={() => collect(o._id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-orbitron"><Check className="w-3 h-3" /> Collected</button>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && !loading && <tr><td colSpan={5} className="p-6 text-center text-gray-400 font-rajdhani">No orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
