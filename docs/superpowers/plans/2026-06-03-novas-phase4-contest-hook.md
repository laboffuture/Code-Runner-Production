# Novas — Phase 4 (Contest Hook) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline, panel-gated).
> Steps use checkbox (`- [ ]`) syntax.

**Goal:** Wire the dormant earning hook — a single `awardNovas` service called from the contest
placement path — plus a "coming soon" Novas banner on the contest page. Earning stays OFF
(`NOVAS_EARNING_ENABLED` default false → `awardNovas` is a no-op), so this is the last dormant piece;
flipping the flag at go-live turns Novas earning on with no further code.

**Architecture:** `awardNovas(userId, amount, reason, refId?)` lives in `packages/shared` (the single
earning gateway, reusable by api + runner). It gates on the flag, then does an atomic coin `$inc` +
`CoinTransaction(type:'earn', refType:'contest')` in one transaction (consistent with the Phase-2/3
atomicity bar), and never throws (a failed award must not break contest finalization). The api calls it
from `applyRatingUpdates` to award the podium (rank 1/2/3 → 50/30/20 Novas) when a contest ends. The
contest page gains an additive, `NOVAS.VISIBLE`-gated "coming soon" banner.

**Tech Stack:** Mongoose transactions (shared→dist), Express (api), Next.js 14 / React (web).

**Spec:** `docs/superpowers/specs/2026-06-02-novas-currency-store-scaffold-design.md` (§5 awardNovas, §6 contest area).

**Design note:** Per the user's model, **XP** rewards participation/finishing (already exists); **Novas**
reward *achievement* — i.e. contest placement. So the hook awards the podium only, keeping Novas rare.

---

## File Structure

- Create `packages/shared/src/services/novas.service.ts` — `awardNovas` (the earning gateway).
- Create `packages/shared/src/services/index.ts` — services barrel.
- Modify `packages/shared/src/index.ts` — `export * from './services'`.
- Modify `apps/api/src/routes/contests.routes.ts` — call `awardNovas` for the podium in `applyRatingUpdates`.
- Modify `Coderunner-Frontend/web/src/app/contest/page.tsx` — additive `NOVAS.VISIBLE`-gated banner.

---

## Task 1: awardNovas service

**Files:**
- Create: `Coderunner-Backend/packages/shared/src/services/novas.service.ts`

- [ ] **Step 1: Create the service**

```ts
import mongoose from 'mongoose';
import { UserProgress, CoinTransaction } from '../database/models';
import { NOVAS } from '../utils/novas.config';
import { getLogger } from '../utils/logger.utils';

const logger = getLogger('novas-service');

/**
 * Award Novas (✨) to a student. The single earning gateway — by design Novas are earned
 * ONLY from contests. Gated by NOVAS.EARNING_ENABLED: while off (scaffold) this is a
 * no-op, so the contest hooks that call it stay dormant until earning goes live.
 *
 * Atomic + audited: the coin $inc and the CoinTransaction ledger row commit together in
 * one transaction (no coins without a ledger entry), matching the redeem/adjust bar.
 * Best-effort: never throws — a failed award must not break contest finalization; it logs
 * and returns false. Earning only adds, so amount must be a positive integer.
 */
export async function awardNovas(
  userId: string,
  amount: number,
  reason: string,
  refId?: string
): Promise<boolean> {
  if (!NOVAS.EARNING_ENABLED) return false; // dormant until go-live
  if (!mongoose.Types.ObjectId.isValid(userId)) return false;
  if (!Number.isInteger(amount) || amount <= 0) return false;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const updated = await UserProgress
        .findOneAndUpdate(
          { userId },
          { $inc: { coins: amount } },
          { new: true, projection: { coins: 1 }, session }
        )
        .lean<{ coins?: number } | null>();
      if (!updated) {
        // No wallet for this user (a registered student always has one) — skip cleanly.
        const err: any = new Error('No UserProgress for awardNovas target');
        err.skip = true;
        throw err;
      }
      const balanceAfter = updated.coins ?? 0;
      await CoinTransaction.create(
        [{ userId, amount, type: 'earn', reason, refType: 'contest', refId: refId ?? null, balanceAfter }],
        { session }
      );
    });
    return true;
  } catch (error: any) {
    if (!error?.skip) {
      logger.error('awardNovas failed', {
        userId, amount,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return false;
  } finally {
    await session.endSession();
  }
}
```

## Task 2: services barrel + shared export + dist rebuild

**Files:**
- Create: `Coderunner-Backend/packages/shared/src/services/index.ts`
- Modify: `Coderunner-Backend/packages/shared/src/index.ts`

- [ ] **Step 1: Create the barrel**

```ts
export * from './novas.service';
```

- [ ] **Step 2: Export services from the package root** — append to `packages/shared/src/index.ts`:

```ts
// Export services
export * from './services';
```

- [ ] **Step 3: Rebuild shared dist (DO_NOT_DISTURB #5)**

Run: `cd Coderunner-Backend/packages/shared && npm run build`
Expected: exit 0. Confirm: `grep -c awardNovas dist/services/novas.service.d.ts` ≥ 1 and
`grep -c awardNovas dist/index.d.ts` ≥ 1.

## Task 3: Award the podium in applyRatingUpdates

**Files:**
- Modify: `Coderunner-Backend/apps/api/src/routes/contests.routes.ts`

- [ ] **Step 1: Import awardNovas** — change the existing shared import:

```ts
import { Models, getLogger, awardNovas } from '@code-runner/shared';
```

- [ ] **Step 2: Award the podium** — inside `applyRatingUpdates`'s ranked loop, AFTER the existing
`Models.UserProgress.updateOne(... $inc contestRating/experience ...)` and clamps (right before the
loop's closing brace), add:

```ts
    // Novas (✨) for the podium — the prestige, contest-only reward (XP already covers
    // participation/finishing). Dormant: awardNovas no-ops until NOVAS_EARNING_ENABLED.
    const novaBonus = i === 0 ? 50 : i === 1 ? 30 : i === 2 ? 20 : 0;
    if (novaBonus > 0) {
      await awardNovas(entry.userId.toString(), novaBonus, `Contest placement: rank ${i + 1}`, contestId.toString());
    }
```

- [ ] **Step 3: Verify** — `cd Coderunner-Backend/apps/api && npm run typecheck` → exit 0.

## Task 4: Contest page "coming soon" banner (additive)

**Files:**
- Modify: `Coderunner-Frontend/web/src/app/contest/page.tsx`

- [ ] **Step 1: Imports** — add `Sparkles` to the existing lucide import and import NOVAS:

```ts
import { Trophy, Clock, Users, Zap, Calendar, ChevronLeft, Lock, Star, Sparkles } from 'lucide-react';
import { NOVAS } from '@/lib/novas';
```

- [ ] **Step 2: Add the banner** — directly AFTER the page-header `<div className="mb-8 flex items-center gap-4">…</div>` block (the one containing "CONTEST ARENA") and BEFORE the `{/* Login notice */}` block, insert:

```tsx
          {/* Novas (✨) — coming soon. Additive teaser; does not change contest behavior. */}
          {NOVAS.VISIBLE && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Sparkles className="w-5 h-5 shrink-0 text-amber-500" />
              <p className="font-rajdhani text-amber-800">
                <span className="font-orbitron font-bold">Win {NOVAS.NAME} {NOVAS.EMOJI}</span> by placing in contests — spend them in the store. Rewards coming soon!
              </p>
            </div>
          )}
```

- [ ] **Step 3: Verify** — `cd Coderunner-Frontend/web && npx tsc --noEmit` → exit 0.

## Task 5: Verify everything

- [ ] **Step 1: Typecheck all** (each exit 0):

```bash
cd Coderunner-Backend/packages/shared && npm run typecheck
cd Coderunner-Backend/apps/api && npm run typecheck
cd Coderunner-Backend/apps/runner && npm run typecheck
cd Coderunner-Frontend/web && npx tsc --noEmit
```

(Runner is typechecked too: it consumes `@code-runner/shared`, and the new `awardNovas` export must
not break its build even though the runner doesn't call it yet.)

- [ ] **Step 2: Confirm dormancy** — `NOVAS.EARNING_ENABLED` is false → `awardNovas` returns false
before any DB write; the podium hook calls it but nothing is awarded; the contest banner shows only
the "coming soon" copy. No live earning. No existing contest behavior changed (banner is additive).

## Task 6: Judge panel + commit

- [ ] **Step 1: Run the 5-judge panel** (intent: "Novas Phase 4 — dormant contest earning hook:
`awardNovas` shared service (flag-gated no-op, atomic coin+ledger transaction, never throws) called for
the podium in applyRatingUpdates; additive coming-soon banner on the contest page"). Rebuild shared dist
if a shared file changes during fixes. Two rounds, zero surviving HIGHs.

- [ ] **Step 2: Commit** (after PASS):

```bash
git add Coderunner-Backend/packages/shared/src Coderunner-Backend/apps/api/src Coderunner-Frontend/web/src docs/superpowers/plans
git commit -m "feat(novas): Phase 4 — dormant contest earning hook (awardNovas + podium + banner)"
```

---

## Self-Review

**Spec coverage (§5 awardNovas earning service, §6 contest coming-soon area):** awardNovas → Task 1-2;
podium call-site in the contest grading/finalization path → Task 3; contest "coming soon" → Task 4.
Earning stays flag-gated off (dormant). This completes the scaffold (N1 wallet, N2 store, N3 admin, N4
hook).

**Placeholder scan:** none — all code complete and runnable.

**Type consistency:** `awardNovas(userId: string, amount: number, reason: string, refId?: string)`
called with `entry.userId.toString()` + `contestId.toString()` (both ObjectIds → strings); the
`CoinTransaction` write uses `type:'earn'` + `refType:'contest'` (both in the Phase-1 enum) +
`balanceAfter` (matches the model); `UserProgress.coins` is the Phase-1 field; the banner reads
`NOVAS.NAME`/`NOVAS.EMOJI`/`NOVAS.VISIBLE` (the Phase-1 frontend config). The service imports models by
name from `../database/models` (the barrel) and the flag/logger from `../utils`.

**Resilience note (for the panel):** awardNovas is transactional (coin+ledger atomic) AND never throws
(internal try/catch), so it can sit in the contest-finalization loop without risking the rating updates;
a missing-wallet target is skipped cleanly via the `skip` flag (no error log). It is a no-op until the
flag flips, so the podium hook is fully dormant now.
