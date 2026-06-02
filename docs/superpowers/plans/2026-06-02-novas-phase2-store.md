# Novas — Phase 2 (Store) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline, panel-gated).
> Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the Store: a catalog of physical rewards students browse, a "my orders" view, and the
server-authoritative atomic redeem endpoint — with redemption gated OFF (Redeem shows "Coming Soon"),
seeded with clearly-labelled sample items so the page looks alive.

**Architecture:** Two new shared models (`StoreItem`, `StoreOrder`). A new `/store` route group:
read-only catalog + caller's orders (live now) and `POST /store/orders` (the atomic spend — built now,
returns a clean "coming soon" 503 while `NOVAS.REDEMPTION_ENABLED` is false). A `/store` page renders
the catalog + my-orders with a disabled "Coming Soon" Redeem. An idempotent seed script inserts sample
items. Earning is still off (Phase 4), so real balances stay 0 — the spend path is reviewed now but
dormant.

**Tech Stack:** Mongoose (shared→dist), Express (api), Next.js 14 / React (web).

**Spec:** `docs/superpowers/specs/2026-06-02-novas-currency-store-scaffold-design.md` (§4.3, §4.4, §5, §6).

---

## File Structure

- Create `packages/shared/src/database/models/StoreItem.model.ts` — catalog item.
- Create `packages/shared/src/database/models/StoreOrder.model.ts` — a redemption/pickup order.
- Modify `packages/shared/src/database/models/index.ts` — export both.
- Create `apps/api/src/routes/store.routes.ts` — `/store` group (catalog, my-orders, redeem).
- Modify `apps/api/src/index.ts` — import + mount `app.use('/store', storeRoutes)`.
- Create `apps/api/scripts/seed-store-items.ts` — idempotent sample-item seeder (user-run).
- Modify `Coderunner-Frontend/web/src/lib/api-client.ts` — add `api.store` group.
- Create `Coderunner-Frontend/web/src/app/store/page.tsx` — the store page.
- Modify `Coderunner-Frontend/web/src/components/layout/Header.tsx` — flag-gated STORE nav link.
- Modify `Coderunner-Frontend/web/src/components/novas/NovasTeaserCard.tsx` — "Browse store" link.

---

## Task 1: StoreItem model

**Files:**
- Create: `Coderunner-Backend/packages/shared/src/database/models/StoreItem.model.ts`

- [ ] **Step 1: Create the model**

```ts
import mongoose, { Schema, Document } from 'mongoose';

/**
 * A physical reward a student can redeem Novas (✨) for and collect at school.
 * Managed by developers (Phase 3). `stock: null` = unlimited.
 */
export interface IStoreItem extends Document {
  name: string;
  description?: string;
  imageUrl?: string;
  priceCoins: number;
  category: 'sticker' | 'merch' | 'other';
  stock: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoreItemSchema = new Schema<IStoreItem>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    priceCoins: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ['sticker', 'merch', 'other'], default: 'other' },
    stock: { type: Number, default: null }, // null = unlimited
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'store_items' }
);

StoreItemSchema.index({ active: 1, priceCoins: 1 });

export const StoreItem =
  mongoose.models.StoreItem || mongoose.model<IStoreItem>('StoreItem', StoreItemSchema);
```

## Task 2: StoreOrder model

**Files:**
- Create: `Coderunner-Backend/packages/shared/src/database/models/StoreOrder.model.ts`

- [ ] **Step 1: Create the model** (name + item-name are snapshotted so the fulfillment list is stable)

```ts
import mongoose, { Schema, Document } from 'mongoose';

/**
 * One redemption order: a student spent Novas (✨) on an item, to be handed over
 * at school by name. Snapshots the student + item name so the developer's
 * fulfillment list stays correct even if the user or item later changes.
 */
export interface IStoreOrder extends Document {
  userId: mongoose.Types.ObjectId;
  studentNameSnapshot: string;
  itemId: mongoose.Types.ObjectId;
  itemNameSnapshot: string;
  coinsSpent: number;
  status: 'pending' | 'collected' | 'cancelled';
  collectedAt?: Date | null;
  fulfilledBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const StoreOrderSchema = new Schema<IStoreOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentNameSnapshot: { type: String, required: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'StoreItem', required: true },
    itemNameSnapshot: { type: String, required: true },
    coinsSpent: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'collected', 'cancelled'], default: 'pending', index: true },
    collectedAt: { type: Date, default: null },
    fulfilledBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, collection: 'store_orders' }
);

StoreOrderSchema.index({ userId: 1, createdAt: -1 });
StoreOrderSchema.index({ status: 1, createdAt: -1 });

export const StoreOrder =
  mongoose.models.StoreOrder || mongoose.model<IStoreOrder>('StoreOrder', StoreOrderSchema);
```

## Task 3: Export models + rebuild dist

**Files:**
- Modify: `Coderunner-Backend/packages/shared/src/database/models/index.ts`

- [ ] **Step 1: Add exports** (append after `CoinTransaction`)

```ts
export { StoreItem } from './StoreItem.model';
export { StoreOrder } from './StoreOrder.model';
```

- [ ] **Step 2: Rebuild shared dist (DO_NOT_DISTURB #5)**

Run: `cd Coderunner-Backend/packages/shared && npm run build`
Expected: exit 0. Confirm: `ls dist/database/models/StoreItem.model.js dist/database/models/StoreOrder.model.js` both exist.

## Task 4: Store routes (catalog + my-orders + atomic redeem)

**Files:**
- Create: `Coderunner-Backend/apps/api/src/routes/store.routes.ts`

- [ ] **Step 1: Create the route file**

```ts
import { Router, Request, Response } from 'express';
import { Models, getLogger, NOVAS } from '@code-runner/shared';
import { authMiddleware } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

const router = Router();
const logger = getLogger('store-routes');

// Everything here requires a logged-in user.
router.use(authMiddleware);

// GET /store/items — the active catalog (everyone sees the same store).
router.get('/items', async (_req: Request, res: Response) => {
  try {
    const items = await Models.StoreItem.find({ active: true }).sort({ priceCoins: 1 }).lean();
    res.json({ items });
  } catch (error) {
    logger.error('Failed to fetch store items', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: 'Failed to fetch store items' });
  }
});

// GET /store/my-orders — the caller's own orders, newest first.
router.get('/my-orders', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const orders = await Models.StoreOrder.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ orders });
  } catch (error) {
    logger.error('Failed to fetch orders', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /store/orders { itemId } — redeem Novas for an item (order now, collect at
// school). Gated by NOVAS.REDEMPTION_ENABLED: while off (scaffold) it returns a clean
// "coming soon" 503 and touches nothing. The spend below is server-authoritative:
// the price is re-read server-side (never trust the client), and the balance debit is
// an atomic conditional $inc that can't go negative or double-spend under concurrency.
router.post('/orders', async (req: Request, res: Response) => {
  try {
    if (!NOVAS.REDEMPTION_ENABLED) {
      return res.status(503).json({
        error: 'Coming soon',
        message: 'The store is not open for redemptions yet.',
      });
    }

    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const itemId = String(req.body?.itemId || '');
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'Validation Error', message: 'A valid itemId is required' });
    }

    const item = await Models.StoreItem
      .findOne({ _id: itemId, active: true })
      .lean<{ _id: mongoose.Types.ObjectId; name: string; priceCoins: number; stock: number | null } | null>();
    if (!item) return res.status(404).json({ error: 'Not Found', message: 'Item not available' });
    const price = item.priceCoins;

    // Atomic balance check + debit; the returned doc carries the post-debit balance
    // for this exact operation (so the ledger entry is accurate under concurrency).
    const debited = await Models.UserProgress
      .findOneAndUpdate(
        { userId, coins: { $gte: price } },
        { $inc: { coins: -price } },
        { new: true, projection: { coins: 1 } }
      )
      .lean<{ coins?: number } | null>();
    if (!debited) {
      return res.status(400).json({ error: 'Insufficient balance', message: 'Not enough Novas.' });
    }
    const balanceAfter = debited.coins ?? 0;

    // If the item is stock-limited, atomically claim one unit; refund on a sell-out race.
    if (item.stock !== null) {
      const claim = await Models.StoreItem.updateOne(
        { _id: item._id, stock: { $gte: 1 } },
        { $inc: { stock: -1 } }
      );
      if (claim.matchedCount === 0) {
        await Models.UserProgress.updateOne({ userId }, { $inc: { coins: price } }); // refund
        return res.status(409).json({ error: 'Out of stock', message: 'That item just sold out.' });
      }
    }

    const user = await Models.User.findById(userId).select('username').lean<{ username?: string } | null>();

    const order = await Models.StoreOrder.create({
      userId,
      studentNameSnapshot: user?.username ?? 'Unknown',
      itemId: item._id,
      itemNameSnapshot: item.name,
      coinsSpent: price,
      status: 'pending',
    });

    await Models.CoinTransaction.create({
      userId,
      amount: -price,
      type: 'spend',
      reason: `Store order: ${item.name}`,
      refType: 'order',
      refId: String(order._id),
      balanceAfter,
    });

    res.status(201).json({ order, coins: balanceAfter });
  } catch (error) {
    logger.error('Failed to create store order', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export default router;
```

- [ ] **Step 2: Mount the router** — in `apps/api/src/index.ts`, add the import beside the other route
imports (near `import contestsRoutes from './routes/contests.routes';`):

```ts
import storeRoutes from './routes/store.routes';
```

and mount it beside the other `app.use(...)` route mounts (near `app.use('/contests', contestsRoutes);`):

```ts
app.use('/store', storeRoutes);
```

- [ ] **Step 3: Verify** — `cd Coderunner-Backend/apps/api && npm run typecheck` → exit 0.

## Task 5: Sample-items seed script (idempotent, user-run)

**Files:**
- Create: `Coderunner-Backend/apps/api/scripts/seed-store-items.ts`

- [ ] **Step 1: Create the script** (upsert by name → safe to run repeatedly; mirrors `list-users.ts` connect pattern)

```ts
/**
 * Seed a few clearly-labelled SAMPLE store items so the store preview looks alive.
 * Idempotent: upserts by name. Run: npx tsx apps/api/scripts/seed-store-items.ts
 * (from Coderunner-Backend, with .env.local present).
 */
import { connectToDatabase, Models } from '@code-runner/shared';

const SAMPLE_ITEMS = [
  { name: '[Sample] Sticker Pack',    description: 'A set of Coderunner character stickers.', priceCoins: 20,  category: 'sticker' as const, stock: null },
  { name: '[Sample] Astra Sticker',   description: 'Astra the AI Agent, in vinyl.',           priceCoins: 15,  category: 'sticker' as const, stock: null },
  { name: '[Sample] Laptop Cover',    description: 'A Coderunner-branded laptop cover.',       priceCoins: 300, category: 'merch' as const,   stock: 10   },
  { name: '[Sample] Enamel Pin',      description: 'A collectible Novas ✨ enamel pin.',        priceCoins: 120, category: 'merch' as const,   stock: 25   },
];

async function seed() {
  await connectToDatabase();
  console.log('✅ Connected. Seeding sample store items…\n');
  for (const item of SAMPLE_ITEMS) {
    await Models.StoreItem.updateOne(
      { name: item.name },
      { $set: { ...item, active: true } },
      { upsert: true }
    );
    console.log(`   • ${item.name} (✨${item.priceCoins})`);
  }
  const count = await Models.StoreItem.countDocuments({ active: true });
  console.log(`\n✅ Done. ${count} active store item(s).`);
  process.exit(0);
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
```

- [ ] **Step 2: Verify it typechecks** — `cd Coderunner-Backend/apps/api && npm run typecheck` → exit 0.
(Do NOT run it now — it writes to the user's Atlas DB; running is the user's call, noted at handoff.)

## Task 6: Frontend api-client store group

**Files:**
- Modify: `Coderunner-Frontend/web/src/lib/api-client.ts`

- [ ] **Step 1: Add the `store` group** (place after the `users:` group, before `leaderboard:`)

```ts
  // Store (Novas)
  store: {
    getItems: () => apiClient.get('/store/items'),
    getMyOrders: () => apiClient.get('/store/my-orders'),
  },
```

## Task 7: The /store page

**Files:**
- Create: `Coderunner-Frontend/web/src/app/store/page.tsx`

- [ ] **Step 1: Create the page** (catalog grid + my-orders; Redeem disabled = "Coming Soon")

```tsx
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
```

## Task 8: Flag-gated STORE nav link

**Files:**
- Modify: `Coderunner-Frontend/web/src/components/layout/Header.tsx`

- [ ] **Step 1: Import NOVAS** — add beside the other lib imports:

```ts
import { NOVAS } from '@/lib/novas';
```

- [ ] **Step 2: Add the nav item conditionally** — the nav renders from an inline array
`[{ href: '/home', label: 'HOME' }, { href: '/compiler', label: 'COMPILER' }, { href: '/rank', label: 'LEADERBOARD' }, { href: '/contest', label: 'CONTEST' }]`. Append a Store entry gated by the flag by replacing that array literal with:

```tsx
          {[
            { href: '/home', label: 'HOME' },
            { href: '/compiler', label: 'COMPILER' },
            { href: '/rank', label: 'LEADERBOARD' },
            { href: '/contest', label: 'CONTEST' },
            ...(NOVAS.VISIBLE ? [{ href: '/store', label: 'STORE' }] : []),
          ].map((item) => (
```

## Task 9: "Browse store" link on the teaser

**Files:**
- Modify: `Coderunner-Frontend/web/src/components/novas/NovasTeaserCard.tsx`

- [ ] **Step 1: Add a link** under the teaser paragraph (import `Link` from `next/link` at top:
`import Link from 'next/link';`), after the `<p>…Coming soon!</p>`:

```tsx
      <Link href="/store" className="mt-3 inline-block text-sm font-semibold text-amber-600 hover:text-amber-700">
        Browse the store →
      </Link>
```

## Task 10: Verify everything

- [ ] **Step 1: Typecheck all** (each exit 0):

```bash
cd Coderunner-Backend/packages/shared && npm run typecheck
cd Coderunner-Backend/apps/api && npm run typecheck
cd Coderunner-Frontend/web && npx tsc --noEmit
```

- [ ] **Step 2: Confirm scaffold posture** — `NOVAS.REDEMPTION_ENABLED` is false → `POST /store/orders`
returns the 503 "coming soon" and never debits; the `/store` page Redeem buttons are disabled = "Coming
Soon"; catalog/my-orders are live reads (empty until the seed is run). No earning anywhere.

## Task 11: Judge panel + commit

- [ ] **Step 1: Run the 5-judge panel** (intent: "Novas Phase 2 — store scaffold: StoreItem + StoreOrder
models; /store catalog + my-orders reads + server-authoritative atomic redeem gated OFF by
REDEMPTION_ENABLED; sample-items seed; /store page with Redeem=Coming Soon; flag-gated nav"). Rebuild
shared dist if any shared file changes during fixes. Zero surviving HIGHs.

- [ ] **Step 2: Commit** (after PASS):

```bash
git add Coderunner-Backend/packages/shared/src Coderunner-Backend/apps/api/src Coderunner-Backend/apps/api/scripts Coderunner-Frontend/web/src docs/superpowers/plans
git commit -m "feat(novas): Phase 2 — store scaffold (catalog + orders + gated redeem)"
```

---

## Self-Review

**Spec coverage:** §4.3 StoreItem → Task 1; §4.4 StoreOrder → Task 2; §5 catalog/my-orders/atomic redeem
(server-authoritative price, conditional $inc, no double-spend, gated 503) → Task 4; §6 /store page +
Redeem "Coming Soon" + My Orders + nav → Tasks 7–9; §8 sample items → Task 5; flags → reuses Phase 1
`NOVAS`. Admin catalog mgmt + fulfillment + collect = Phase 3 (out of scope here).

**Placeholder scan:** none — every code step is complete. The seed script is real, runnable code.

**Type consistency:** `StoreItem`/`StoreOrder` names consistent across model→barrel→routes; the redeem
reads `item.priceCoins`/`item.stock` matching the Task-1 interface; `findOneAndUpdate(... {new:true,
projection:{coins:1}}).lean<{coins?:number}|null>()` matches the Phase-1 `coins` field; `CoinTransaction`
fields (amount/type/reason/refType/refId/balanceAfter) match the Phase-1 model; the page's `StoreItem`
/`StoreOrder` TS interfaces mirror the API shapes (`items[]`, `orders[]`).

**Concurrency note (for the panel):** the debit uses `findOneAndUpdate({coins:{$gte:price}}, {$inc:-price},
{new:true})` so balance can't go negative and the returned balance is the per-op post-debit value; stock
uses a conditional `$inc` with a refund on the sell-out race. Redemption is OFF this phase, so this path
is dormant but reviewed now.
