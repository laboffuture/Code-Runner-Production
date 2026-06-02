# Novas — Phase 3 (Admin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline, panel-gated).
> Steps use checkbox (`- [ ]`) syntax.

**Goal:** Give DEVELOPERS the tools to operate the Novas store: manage the catalog, work the
school-pickup fulfillment list, and manually assign/adjust a student's Novas — all developer-gated,
all ledgered.

**Architecture:** One new developer-gated route file `admin-store.routes.ts` (auth + `developerMiddleware`),
mounted at `/admin` (alongside the existing admin monitoring routes; paths `/store/*` + `/novas/adjust`
don't collide). One new developer-only page `/admin/store` (auto-gated by the existing `/admin` layout).
The manual Novas adjust is the one coin-write that's LIVE this phase (developer-only, audited) — it's
how a developer grants/corrects Novas before contests go live; it runs in a transaction (coin $inc +
ledger), same atomicity bar as the Phase-2 redeem.

**Tech Stack:** Express (api), Mongoose transactions, Next.js 14 / React (web).

**Spec:** `docs/superpowers/specs/2026-06-02-novas-currency-store-scaffold-design.md` (§5 developer-only, §9.4).

---

## File Structure

- Create `apps/api/src/routes/admin-store.routes.ts` — developer-gated: catalog CRUD + fulfillment + adjust.
- Modify `apps/api/src/index.ts` — import + `app.use('/admin', adminStoreRoutes)`.
- Modify `Coderunner-Frontend/web/src/lib/api-client.ts` — add an `admin.store` method group.
- Create `Coderunner-Frontend/web/src/app/admin/store/page.tsx` — the developer store-ops page.

No shared-package change this phase (models exist from Phase 2) → no dist rebuild needed.

---

## Task 1: Admin store routes (catalog + fulfillment + adjust)

**Files:**
- Create: `Coderunner-Backend/apps/api/src/routes/admin-store.routes.ts`

- [ ] **Step 1: Create the route file**

```ts
import { Router, Request, Response } from 'express';
import { Models, getLogger } from '@code-runner/shared';
import { authMiddleware, developerMiddleware } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

const router = Router();
const logger = getLogger('admin-store-routes');

// Developer-only: every route here is the dev/ops team operating the Novas store.
// Teachers and students have NO access (no teacher-facing route exists).
router.use(authMiddleware);
router.use(developerMiddleware);

const CATEGORIES = ['sticker', 'merch', 'other'] as const;
type Category = (typeof CATEGORIES)[number];

// ── Catalog ──────────────────────────────────────────────────────────────────

// GET /admin/store/items — full catalog incl. inactive, newest first.
router.get('/store/items', async (_req: Request, res: Response) => {
  try {
    const items = await Models.StoreItem.find({}).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (error) {
    logger.error('Failed to list store items', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to list items' });
  }
});

// Validate + coerce an item body for create/update. Returns a clean field set or an error string.
function parseItemBody(body: any): { fields: Record<string, unknown> } | { error: string } {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name) return { error: 'A name is required' };
  const priceCoins = Number(body?.priceCoins);
  if (!Number.isFinite(priceCoins) || priceCoins < 0) return { error: 'priceCoins must be a number >= 0' };
  const category: Category = CATEGORIES.includes(body?.category) ? body.category : 'other';
  // stock: a non-negative integer, or null for unlimited.
  let stock: number | null = null;
  if (body?.stock !== null && body?.stock !== undefined && body?.stock !== '') {
    const s = Number(body.stock);
    if (!Number.isInteger(s) || s < 0) return { error: 'stock must be a non-negative integer or null' };
    stock = s;
  }
  return {
    fields: {
      name,
      description: typeof body?.description === 'string' ? body.description.trim() : '',
      imageUrl: typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : '',
      priceCoins,
      category,
      stock,
    },
  };
}

// POST /admin/store/items — create an item.
router.post('/store/items', async (req: Request, res: Response) => {
  try {
    const parsed = parseItemBody(req.body);
    if ('error' in parsed) return res.status(400).json({ error: 'Validation Error', message: parsed.error });
    const item = await Models.StoreItem.create({ ...parsed.fields, active: true });
    res.status(201).json({ item });
  } catch (error) {
    logger.error('Failed to create store item', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /admin/store/items/:id — update fields and/or active flag.
router.put('/store/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Validation Error', message: 'Invalid id' });
    const parsed = parseItemBody(req.body);
    if ('error' in parsed) return res.status(400).json({ error: 'Validation Error', message: parsed.error });
    const active = typeof req.body?.active === 'boolean' ? req.body.active : true;
    const item = await Models.StoreItem.findByIdAndUpdate(
      id,
      { $set: { ...parsed.fields, active } },
      { new: true }
    ).lean();
    if (!item) return res.status(404).json({ error: 'Not Found', message: 'Item not found' });
    res.json({ item });
  } catch (error) {
    logger.error('Failed to update store item', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// ── Fulfillment ──────────────────────────────────────────────────────────────

// GET /admin/store/orders?status=pending|collected|cancelled — the pickup list.
router.get('/store/orders', async (req: Request, res: Response) => {
  try {
    const status = String(req.query?.status || '');
    const filter = ['pending', 'collected', 'cancelled'].includes(status) ? { status } : {};
    const orders = await Models.StoreOrder.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ orders });
  } catch (error) {
    logger.error('Failed to list orders', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to list orders' });
  }
});

// POST /admin/store/orders/:id/collect — mark an order handed over at school.
router.post('/store/orders/:id/collect', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Validation Error', message: 'Invalid id' });
    const order = await Models.StoreOrder.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { $set: { status: 'collected', collectedAt: new Date(), fulfilledBy: req.user!.userId } },
      { new: true }
    ).lean();
    if (!order) return res.status(409).json({ error: 'Conflict', message: 'Order not found or not pending' });
    res.json({ order });
  } catch (error) {
    logger.error('Failed to mark collected', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ── Manual Novas adjust (developer grant/correction) ─────────────────────────

// POST /admin/novas/adjust { username, amount, reason } — atomically add/remove a
// user's Novas and record a ledger entry. The one coin-write live in scaffold; it is
// developer-only and audited. amount may be negative (a correction) but cannot push a
// balance below 0. Coin $inc + ledger write run in one transaction (no half-applied
// adjust), matching the Phase-2 redeem's atomicity bar.
router.post('/novas/adjust', async (req: Request, res: Response) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const amount = Number(req.body?.amount);
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
  if (!username) return res.status(400).json({ error: 'Validation Error', message: 'username is required' });
  if (!Number.isInteger(amount) || amount === 0) return res.status(400).json({ error: 'Validation Error', message: 'amount must be a non-zero integer' });
  if (!reason) return res.status(400).json({ error: 'Validation Error', message: 'reason is required' });

  const user = await Models.User.findOne({ username }).select('_id').lean<{ _id: mongoose.Types.ObjectId } | null>();
  if (!user) return res.status(404).json({ error: 'Not Found', message: 'No user with that username' });
  const userId = user._id;

  const session = await mongoose.startSession();
  try {
    let balanceAfter = 0;
    await session.withTransaction(async () => {
      // For a deduction, guard so the balance can't go below 0 (coins >= -amount).
      const floor = amount < 0 ? -amount : 0;
      const updated = await Models.UserProgress
        .findOneAndUpdate(
          { userId, coins: { $gte: floor } },
          { $inc: { coins: amount } },
          { new: true, projection: { coins: 1 }, session }
        )
        .lean<{ coins?: number } | null>();
      if (!updated) {
        // Either no progress doc, or the deduction would go negative.
        const err: any = new Error('Adjustment would make the balance negative (or no wallet exists).');
        err.statusCode = 400;
        throw err;
      }
      balanceAfter = updated.coins ?? 0;
      await Models.CoinTransaction.create(
        [{ userId, amount, type: 'adjust', reason, refType: 'admin', refId: req.user!.userId, balanceAfter }],
        { session }
      );
    });
    res.json({ username, amount, balanceAfter });
  } catch (error: any) {
    if (error?.statusCode === 400) return res.status(400).json({ error: 'Validation Error', message: error.message });
    logger.error('Failed to adjust novas', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to adjust balance' });
  } finally {
    await session.endSession();
  }
});

export default router;
```

- [ ] **Step 2: Mount it** — in `apps/api/src/index.ts`, add the import beside `storeRoutes`:

```ts
import adminStoreRoutes from './routes/admin-store.routes';
```

and mount it (after the existing admin mounts so paths are clearly grouped; place near `app.use('/store', storeRoutes);`):

```ts
app.use('/admin', adminStoreRoutes);
```

- [ ] **Step 3: Verify** — `cd Coderunner-Backend/apps/api && npm run typecheck` → exit 0.

## Task 2: api-client admin.store group

**Files:**
- Modify: `Coderunner-Frontend/web/src/lib/api-client.ts`

- [ ] **Step 1: Add a `store` sub-group inside the existing `admin:` object** (after `cloudinaryStats`):

```ts
    store: {
      listItems: () => apiClient.get('/admin/store/items'),
      createItem: (data: { name: string; description?: string; imageUrl?: string; priceCoins: number; category?: string; stock?: number | null }) =>
        apiClient.post('/admin/store/items', data),
      updateItem: (id: string, data: { name: string; description?: string; imageUrl?: string; priceCoins: number; category?: string; stock?: number | null; active?: boolean }) =>
        apiClient.put(`/admin/store/items/${id}`, data),
      listOrders: (status?: string) => apiClient.get(`/admin/store/orders${status ? `?status=${status}` : ''}`),
      collectOrder: (id: string) => apiClient.post(`/admin/store/orders/${id}/collect`, {}),
      adjustNovas: (data: { username: string; amount: number; reason: string }) =>
        apiClient.post('/admin/novas/adjust', data),
    },
```

## Task 3: The /admin/store developer page

**Files:**
- Create: `Coderunner-Frontend/web/src/app/admin/store/page.tsx`

- [ ] **Step 1: Create the page** — three sections (Items, Orders, Adjust). Auto developer-gated by
`/admin/layout.tsx`. Follows the admin page convention (`AdminHeader` + white sections, static Tailwind).

```tsx
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
```

## Task 4: Verify everything

- [ ] **Step 1: Typecheck** (each exit 0):

```bash
cd Coderunner-Backend/apps/api && npm run typecheck
cd Coderunner-Frontend/web && npx tsc --noEmit
```

- [ ] **Step 2: Confirm posture** — all six endpoints are auth+developer gated; a non-developer gets 403;
catalog/fulfillment are read+manage; the adjust is transactional (coin $inc + ledger), guards against a
negative balance, and is the only live coin write (developer-only, audited).

## Task 5: Judge panel + commit

- [ ] **Step 1: Run the 5-judge panel** (intent: "Novas Phase 3 — developer-only store admin: catalog
CRUD, school-pickup fulfillment (mark collected), and transactional manual Novas adjust; new
developer-gated /admin/store page"). Two rounds, rebuild-until-clean, zero surviving HIGHs.

- [ ] **Step 2: Commit** (after PASS):

```bash
git add Coderunner-Backend/apps/api/src Coderunner-Frontend/web/src docs/superpowers/plans
git commit -m "feat(novas): Phase 3 — developer store admin (catalog + fulfillment + adjust)"
```

---

## Self-Review

**Spec coverage (§5 developer-only routes, §9.4 developer access):** catalog CRUD → Task 1
(`GET/POST/PUT /admin/store/items`); fulfillment list + collect → Task 1 (`GET /admin/store/orders`,
`POST /admin/store/orders/:id/collect`); manual assign/modify → Task 1 (`POST /admin/novas/adjust`,
transactional); UI → Task 3; client → Task 2. Teachers excluded (developer gate only). No shared change.

**Placeholder scan:** none — all code is complete and runnable.

**Type consistency:** `StoreItem`/`StoreOrder`/`UserProgress`/`CoinTransaction`/`User` all from Phase 1–2
(unchanged); `CoinTransaction` adjust write uses `type:'adjust'` + `refType:'admin'` (both in the Phase-1
enum); `fulfilledBy` set to `req.user.userId` (matches the StoreOrder schema `fulfilledBy` ObjectId ref);
page interfaces mirror the API `{items}`/`{orders}` shapes; api-client `admin.store.*` paths match the
server routes exactly.

**Security note (for the panel):** the adjust endpoint is the one coin write live in scaffold —
justified because it's developer-only (auth+developerMiddleware), transactional, ledgered (`type:'adjust'`,
`refId`=acting developer), and guards against a negative balance. It is how a developer seeds/corrects
Novas to test the store before contests (earning) go live.
