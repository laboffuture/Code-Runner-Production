# Novas — Phase 1 (Wallet) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline, panel-gated)
> to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Novas wallet backbone — a per-student `coins` balance, an audit ledger, a
read API, and the student-facing teaser/chip — all zero-stated and behind a visibility flag.

**Architecture:** `coins` is a top-level field on `UserProgress` (mirrors `experience`/`contestRating`).
A new `CoinTransaction` model is the append-only ledger. Earning/spending stay OFF this phase — we only
add the field, the ledger model, a `GET /users/me/wallet` read, and UI that shows `✨ 0` + a "releasing
soon" teaser gated by a visibility flag.

**Tech Stack:** Mongoose (shared, compiled to dist), Express (api), Next.js 14 / React (web).

**Spec:** `docs/superpowers/specs/2026-06-02-novas-currency-store-scaffold-design.md`

---

## File Structure

- Create `packages/shared/src/utils/novas.config.ts` — backend flags + display constants (one source of truth).
- Modify `packages/shared/src/utils/index.ts` — export the new config from the utils barrel.
- Modify `packages/shared/src/database/models/UserProgress.model.ts` — add `coins` field.
- Create `packages/shared/src/database/models/CoinTransaction.model.ts` — the ledger model.
- Modify `packages/shared/src/database/models/index.ts` — export `CoinTransaction`.
- Modify `apps/api/src/routes/users.routes.ts` — add `GET /me/wallet`.
- Modify `Coderunner-Frontend/web/src/lib/api-client.ts` — add `api.users.getWallet`.
- Create `Coderunner-Frontend/web/src/lib/novas.ts` — frontend display + visibility flag.
- Create `Coderunner-Frontend/web/src/components/novas/NovasChip.tsx` — header balance chip.
- Create `Coderunner-Frontend/web/src/components/novas/NovasTeaserCard.tsx` — profile "releasing soon" card.
- Modify `Coderunner-Frontend/web/src/components/layout/Header.tsx` — mount `<NovasChip/>`.
- Modify `Coderunner-Frontend/web/src/app/(auth)/profile/page.tsx` — mount `<NovasTeaserCard/>`.

---

## Task 1: Backend flags + display constants

**Files:**
- Create: `Coderunner-Backend/packages/shared/src/utils/novas.config.ts`
- Modify: `Coderunner-Backend/packages/shared/src/utils/index.ts`

- [ ] **Step 1: Create the config**

```ts
// Novas (✨) — single source of truth for the currency's flags + display.
// Lets us flip the feature on or rename it from one place. Env-overridable in prod.
const flag = (v: string | undefined, def: boolean): boolean =>
  v === undefined ? def : v === 'true' || v === '1';

export const NOVAS = {
  // Display
  NAME: 'Novas',
  EMOJI: '✨',
  // Flags — scaffold posture: a VISIBLE sample, but earning + spending OFF.
  VISIBLE: flag(process.env.NOVAS_VISIBLE, true),
  EARNING_ENABLED: flag(process.env.NOVAS_EARNING_ENABLED, false),
  REDEMPTION_ENABLED: flag(process.env.STORE_REDEMPTION_ENABLED, false),
} as const;
```

- [ ] **Step 2: Export from the utils barrel**

Read `packages/shared/src/utils/index.ts`, then add (following its existing `export * from './x'` style):

```ts
export * from './novas.config';
```

- [ ] **Step 3: Verify** — `cd Coderunner-Backend/packages/shared && npm run typecheck` → exit 0.

## Task 2: `coins` on UserProgress

**Files:**
- Modify: `Coderunner-Backend/packages/shared/src/database/models/UserProgress.model.ts`

- [ ] **Step 1: Add to the `IUserProgress` interface** — directly after the `contestRating` field:

```ts
  contestRating: number;
  // Novas (✨) wallet balance. Earned via contests, spent in the store. Top-level
  // (not in stats) because it is a real-merch currency, not a learning metric — a
  // teacher progress-reset never touches it.
  coins: number;
```

- [ ] **Step 2: Add to the schema** — directly after the `contestRating` schema field:

```ts
    contestRating: { type: Number, default: 1000 },
    coins: { type: Number, default: 0 },
```

- [ ] **Step 3: Verify reset leaves it alone** — open `apps/api/src/services/progressReset.ts`; confirm
`performStudentReset` `Object.assign`s only the `ResetProgressFields` keys (solvedProblemIds, stats,
experience, level, contestRating, rank, streak, topicProgress, achievements, skills, calendars,
recentActivity) and NOT `coins`. No code change expected — this step is a read-only confirmation that
`coins` survives a reset (spec §4.1). If `coins` is somehow assigned there, STOP and reconsider.

## Task 3: CoinTransaction ledger model

**Files:**
- Create: `Coderunner-Backend/packages/shared/src/database/models/CoinTransaction.model.ts`
- Modify: `Coderunner-Backend/packages/shared/src/database/models/index.ts`

- [ ] **Step 1: Create the model** (mirrors `StudentAttempt.model.ts`)

```ts
import mongoose, { Schema, Document } from 'mongoose';

/**
 * Append-only ledger of every Novas (✨) movement — earn (contest), spend (store
 * order), or a developer adjust. Durable audit trail for real-merch disputes.
 */
export interface ICoinTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number; // +earn / -spend
  type: 'earn' | 'spend' | 'adjust';
  reason: string;
  refType?: 'contest' | 'order' | 'admin' | null;
  refId?: string | null;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const CoinTransactionSchema = new Schema<ICoinTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['earn', 'spend', 'adjust'], required: true },
    reason: { type: String, required: true },
    refType: { type: String, enum: ['contest', 'order', 'admin', null], default: null },
    refId: { type: String, default: null },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true, collection: 'coin_transactions' }
);

CoinTransactionSchema.index({ userId: 1, createdAt: -1 });

export const CoinTransaction =
  mongoose.models.CoinTransaction ||
  mongoose.model<ICoinTransaction>('CoinTransaction', CoinTransactionSchema);
```

- [ ] **Step 2: Export it** — append to `packages/shared/src/database/models/index.ts`:

```ts
export { CoinTransaction } from './CoinTransaction.model';
```

- [ ] **Step 3: Rebuild shared dist (DO_NOT_DISTURB #5)**

Run: `cd Coderunner-Backend/packages/shared && npm run build`
Expected: exit 0. Confirm: `grep -c coins dist/database/models/UserProgress.model.d.ts` ≥ 1 and
`dist/database/models/CoinTransaction.model.d.ts` exists.

## Task 4: `GET /users/me/wallet`

**Files:**
- Modify: `Coderunner-Backend/apps/api/src/routes/users.routes.ts`

- [ ] **Step 1: Add the route** — reuse the file's existing imports (`authMiddleware`, `Models`,
`logger`, `Request`/`Response`); place it near the other `/me/*` routes:

```ts
// GET /users/me/wallet — the caller's Novas balance + recent ledger entries.
// Earning/spending are off this phase, so this returns 0 / [] for everyone.
router.get('/me/wallet', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const progress = await Models.UserProgress
      .findOne({ userId })
      .select('coins')
      .lean<{ coins?: number } | null>();
    const recentTransactions = await Models.CoinTransaction
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ coins: progress?.coins ?? 0, recentTransactions });
  } catch (error) {
    logger.error('Failed to fetch wallet', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});
```

- [ ] **Step 2: Verify** — `cd Coderunner-Backend/apps/api && npm run typecheck` → exit 0.

## Task 5: Frontend api-client method

**Files:**
- Modify: `Coderunner-Frontend/web/src/lib/api-client.ts`

- [ ] **Step 1: Add to the `api.users` group** (beside `getStats`):

```ts
    getWallet: () => apiClient.get('/users/me/wallet'),
```

## Task 6: Frontend Novas config

**Files:**
- Create: `Coderunner-Frontend/web/src/lib/novas.ts`

- [ ] **Step 1: Create it** (frontend mirror — UI visibility only; web does not import the backend package)

```ts
// Novas (✨) — frontend display + visibility. UI-only mirror of the backend flag.
const flag = (v: string | undefined, def: boolean): boolean =>
  v === undefined ? def : v === 'true' || v === '1';

export const NOVAS = {
  NAME: 'Novas',
  EMOJI: '✨',
  VISIBLE: flag(process.env.NEXT_PUBLIC_NOVAS_VISIBLE, true),
} as const;
```

## Task 7: NovasChip (header balance)

**Files:**
- Create: `Coderunner-Frontend/web/src/components/novas/NovasChip.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { NOVAS } from '@/lib/novas';

// A small, always-visible balance pill (✨ N). Earning is off, so it shows 0 for
// now; it reads the real balance so it "just works" once Novas go live.
export function NovasChip() {
  const { user } = useAuth();
  const [coins, setCoins] = useState<number>(0);

  useEffect(() => {
    if (!user?.id || !NOVAS.VISIBLE) return;
    let alive = true;
    api.users
      .getWallet()
      .then((d) => { if (alive) setCoins((d as { coins?: number })?.coins ?? 0); })
      .catch(() => { /* wallet is best-effort chrome; ignore */ });
    return () => { alive = false; };
  }, [user?.id]);

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
```

- [ ] **Step 2: Mount it** — read `web/src/components/layout/Header.tsx`, place `<NovasChip/>` in the
authenticated-actions cluster (next to the profile/avatar area). Import:
`import { NovasChip } from '@/components/novas/NovasChip';`

## Task 8: NovasTeaserCard (profile "releasing soon")

**Files:**
- Create: `Coderunner-Frontend/web/src/components/novas/NovasTeaserCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client';

import { Sparkles } from 'lucide-react';
import { NOVAS } from '@/lib/novas';

// Student-facing teaser on the profile: Novas exist, here's your balance (0 now),
// and they're "releasing soon". The launch entry point for the feature.
export function NovasTeaserCard({ coins = 0 }: { coins?: number }) {
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
    </div>
  );
}
```

- [ ] **Step 2: Mount it** — read `web/src/app/(auth)/profile/page.tsx`, render `<NovasTeaserCard/>`
in the profile layout (near the stats cards). Import:
`import { NovasTeaserCard } from '@/components/novas/NovasTeaserCard';`

## Task 9: Verify everything

- [ ] **Step 1: Typecheck all touched packages** (all must exit 0):

```bash
cd Coderunner-Backend/packages/shared && npm run typecheck
cd Coderunner-Backend/apps/api && npm run typecheck
cd Coderunner-Frontend/web && npx tsc --noEmit
```

- [ ] **Step 2: Confirm zero-state** — `coins` defaults to 0; `GET /me/wallet` returns `{ coins: 0,
recentTransactions: [] }`; chip shows `✨ 0`; teaser shows "Releasing soon"; nothing earns or spends.

## Task 10: Judge panel + commit

- [ ] **Step 1: Run the 5-judge panel** on the working diff (intent: "Novas Phase 1 — wallet scaffold:
coins field + CoinTransaction ledger + GET /me/wallet + visibility-gated chip & profile teaser; earning
and spending off"). Rebuild-until-clean: zero surviving HIGHs.

- [ ] **Step 2: Commit** (after PASS):

```bash
git add Coderunner-Backend/packages/shared Coderunner-Backend/apps/api Coderunner-Frontend/web docs/superpowers/plans
git commit -m "feat(novas): Phase 1 — wallet scaffold (coins + ledger + /me/wallet + teaser)"
```

---

## Self-Review

**Spec coverage (Phase 1 slice of spec §4.1, §4.2, §5 wallet read, §6 chip+teaser, §3 flags, §8 zero-state):**
- §4.1 coins field + reset-safe → Task 2. §4.2 CoinTransaction → Task 3. §3 flags → Tasks 1 & 6.
- §5 `GET /me/wallet` → Task 4. §6 chip + profile teaser → Tasks 7–8. §8 zero-state → Task 9.
- Store/admin/contest-hook are later phases — intentionally out of this plan.

**Placeholder scan:** none — every code step has complete code; the two "read then mount" steps (7.2,
8.2) name the exact file + import + insertion region (the existing files are large; exact line resolved
at build, code to insert is given in full).

**Type consistency:** `coins: number` (Task 2) read as `coins?: number` defensively in the route (Task
4) and components (Tasks 7–8); `CoinTransaction` name consistent across Tasks 3–4; `NOVAS` shape
consistent backend (Task 1) vs frontend (Task 6, VISIBLE only — backend adds EARNING/REDEMPTION).
