# Novas ✨ — Currency + Store + Contest Reward — Scaffold Design

> **Status:** Design approved in conversation (2026-06-02). Build = **scaffold now, wire live later.**
> **Build discipline:** tsc-clean across every touched package; judge-panel-gated before each commit.

---

## 1. Concept

**Novas (✨)** are a rare, prestigious in-app currency for Coderunner students.

- **Earned only through weekly contests** — solving the weekly contest challenge awards Novas; top
  finishers get a placement bonus. Scarcity (one hard contest a week) is the whole point.
- **Spent in a Store** on **physical** rewards (stickers, character stickers, laptop covers …) that a
  student **orders in-app and collects at school, by name** — no mailing, no addresses, no shipping.
- **Characters are unrelated.** The existing character/theme system (`character-themes.ts`,
  level-gated Astra/Nila/Kenji/Leo) is untouched. Novas never buy characters.

**Display name:** "Novas" with a ✨ icon. **Under the hood the field is the neutral `coins`** so the
label/icon can be changed app-wide from one place at any time.

**Relationship to existing signals:** XP/level = *mastery* (earned by solving, can't be bought).
Novas = *reward currency* (earned by contest performance, spent on merch). Kept fully separate.

## 2. Scope of THIS work — scaffold, not launch

Build the real structural backbone (DB models, API routes, UI shells) so the feature can be clicked
through and *felt*, with **"Coming Soon"** states where the live logic isn't connected yet, and a
**clean zero-state everywhere** ("no one has participated yet", 0 balances, empty leaderboard, no
dummy data).

**Built for real now (the skeleton):** data models, wallet read API, store catalog + orders models
and APIs, admin catalog/fulfillment APIs, the dormant earning service + call-site, all UI pages and
the header chip, a reusable Coming-Soon / empty-state component, and three feature flags.

**Deliberately NOT live now (non-goals):**
- Actual Nova *earning* (gated off — contests aren't running).
- Actual *redemption*/spending (Redeem button shows "Coming Soon").
- Weekly-contest scheduling/automation.
- Inventory ops beyond a simple stock number; notifications; analytics.

## 3. Feature flags (the on/off switches)

A single config module (`novas.config.ts` in shared, env-overridable) exposes:

| Flag | Scaffold value | Meaning |
|------|----------------|---------|
| `NOVAS_VISIBLE` | `true` | show the Novas UI (chip, store, contest area) to students |
| `NOVAS_EARNING_ENABLED` | `false` | the contest hook actually awards Novas |
| `STORE_REDEMPTION_ENABLED` | `false` | the Redeem action actually spends Novas + creates an order |

This makes the structure real and testable while live behaviour stays off until you flip a switch.

## 4. Data models (`packages/shared` — rebuild dist after edit)

### 4.1 Wallet — on `UserProgress`
- Add top-level **`coins: number`** (default `0`), alongside `experience`/`level`/`contestRating`.
- **Reset interaction (decision):** a teacher progress-reset does **NOT** zero `coins` — Novas map to
  real-world merch a student genuinely earned, so they survive a learning-progress reset. (Flagged
  for your review in §9.)

### 4.2 `CoinTransaction` (new model — the ledger)
Every earn/spend is recorded for audit (essential once real merch is involved).
```
{ userId, amount (+earn / −spend), type: 'earn'|'spend'|'adjust',
  reason: string, refType?: 'contest'|'order'|'admin', refId?: string,
  balanceAfter: number, createdAt }
```

### 4.3 `StoreItem` (new model — the catalog)
```
{ name, description, imageUrl, priceCoins, category: 'sticker'|'merch'|'other',
  stock: number | null (null = unlimited), active: boolean, createdAt }
```

### 4.4 `StoreOrder` (new model — redemption / pickup)
```
{ userId, studentNameSnapshot, itemId, itemNameSnapshot, coinsSpent,
  status: 'pending'|'collected'|'cancelled', createdAt, collectedAt?, fulfilledBy? }
```
Name + item-name are **snapshotted** so the school's fulfillment list stays stable if a user or item
later changes.

## 5. API surface (`apps/api`)

**Student (auth required, own data only):**
- `GET /me/wallet` → `{ coins, recentTransactions[] }` (returns `0` / `[]` now).
- `GET /store/items` → active catalog (example items or empty).
- `GET /me/orders` → caller's orders (empty now).
- `POST /store/orders { itemId }` → **atomic** redeem: re-read price server-side, conditional
  decrement `UserProgress.updateOne({ userId, coins: { $gte: price } }, { $inc: { coins: -price } })`
  (matchedCount 0 ⇒ insufficient balance, reject; no negative / no double-spend), then create
  `StoreOrder` + `CoinTransaction`. **Guarded by `STORE_REDEMPTION_ENABLED`** → returns a clean
  "coming soon" 503 while off.

**Admin / developer (developer-gated):**
- `POST` / `PUT` `/admin/store/items` → manage catalog.
- `GET /admin/store/orders` → fulfillment list (item + student name + status).
- `POST /admin/store/orders/:id/collect` → mark **Collected** (records `fulfilledBy`, `collectedAt`).

**Earning service (server-side only, never a client route):**
- `awardNovas(userId, amount, reason, refType, refId)` → atomic `$inc` on `coins` + writes a
  `CoinTransaction`. Called from the contest grading path (the submission worker, when a contest
  submission is accepted). **Guarded by `NOVAS_EARNING_ENABLED`** → no-op while off.

## 6. Frontend (`web/src`)

- **Header Novas chip** — `✨ 0`, always visible (reads `/me/wallet`), respects `NOVAS_VISIBLE`.
- **`/store`** — catalog grid with price tags; **Redeem button → "Coming Soon"** (disabled).
- **My Orders** — a section on the `/store` page — empty state ("No orders yet").
- **Contest area** — **"Coming Soon — next contest dropping soon,"** empty leaderboard, **"No one has
  participated yet,"** 0 participants.
- **Admin store page** (developer) — catalog add/edit + fulfillment list (empty now).
- **Reusable `<ComingSoon>` / empty-state component** shared across all dormant bits.
- Nav entries for Store (and Contest), all behind `NOVAS_VISIBLE`.

## 7. Security & integrity

- **Spend is server-authoritative:** price re-read from `StoreItem`; client sends only `itemId`.
- **No negative balance / no double-spend:** atomic conditional `$inc` (§5).
- **Earning is server-side only** via `awardNovas` from the trusted grading path — never a client
  endpoint; amounts are constants, not client input.
- **Ownership:** students read only their own wallet/orders; all catalog + fulfillment routes are
  developer-gated.
- **Ledger** gives a full audit trail for disputes ("I ordered but didn't collect it").
- Tailwind: static color classes only; no debug logs; shared `dist` rebuilt after model edits.

## 8. Zero-state rules

No seeded balances, no fake winners, no fake participation. Counters render `0`; lists render their
empty state. Store may show **a few clearly-labelled example items** so the page looks alive (or be
fully empty — §9).

## 9. Decisions defaulted (please confirm on review)

1. **Reset:** Novas survive a teacher progress-reset (real-merch value). *Default: survive.*
2. **Launch visibility:** the 10 launch students **see** the Coming-Soon Store/Contest; `NOVAS_VISIBLE`
   can hide it in one place. *Default: visible (builds anticipation).*
3. **Example items:** seed a few clearly-labelled example `StoreItem`s. *Default: yes.*
4. **Owner:** developer/admin owns catalog + fulfillment. *Default: developer.*
5. **Earning amounts:** base + placement bonus are **constants** (e.g. solve `+10`; 1st/2nd/3rd
   `+50/+30/+20`), easily tuned later — not finalized now. *Default: those placeholders.*

## 10. Testing

- `npx tsc --noEmit` clean: shared, api, runner, web.
- Framework-free assert for the atomic spend (balance guard: can't overspend; ledger balances).
- 5-judge panel before each commit: correctness of the atomic spend, security (server-authoritative
  price + ownership + developer gates), real-env (flags off = inert; dist rebuilt), architecture (no
  contract drift; flags isolate dormant code), simplicity.

## 11. Build phasing (for the plan)

1. **Wallet** — `coins` + `CoinTransaction` + `/me/wallet` + header chip + flags. (smallest, end-to-end)
2. **Store** — `StoreItem`/`StoreOrder` + catalog/orders APIs + `/store` page + My Orders (Redeem = Coming Soon).
3. **Admin** — catalog management + fulfillment list/collect.
4. **Contest hook** — `awardNovas` + dormant call-site + contest "Coming Soon" area.

Each phase is independently testable, tsc-clean, and panel-gated.

## 12. Success criteria

1. A student can open the app, see **✨ 0** in the header, browse the Store, and see Redeem as
   "Coming Soon".
2. The Contest area shows "Coming Soon / no one has participated yet" with an empty leaderboard.
3. An admin can add an item and see an (empty) fulfillment list.
4. Every flag-off path is inert; nothing awards or spends Novas yet.
5. All four packages `tsc --noEmit` clean; panel returns PASS.
