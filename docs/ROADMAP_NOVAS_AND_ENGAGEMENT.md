# Coderunner — Master Worklist (Novas + Engagement + Launch)

> **Created:** 2026-06-02 · Living doc. The single source of truth for what we're building toward.
> **Audience reality:** B2B / school — students learn in a teacher's classroom. Every feature is
> filtered through **"does it help a kid learn or give the teacher signal?"** B2C interview-prep
> features (company tags, interview crash courses, premium paywall) are explicitly OUT.

---

## 0. Two-currency philosophy (the spine everything hangs off)

| Currency | Feel | Earned by | Spent on | Status |
|----------|------|-----------|----------|--------|
| **XP / Level** | easy, everyday | solving, daily check-in, daily challenge | unlocks characters (cosmetic), progression | ✅ exists |
| **Novas ✨** | rare, prestige | **weekly contests only** | the Store (physical merch, school pickup) | 🏗️ building |

**Rule:** XP is the *habit* engine (cheap, daily). Novas are the *prestige* engine (scarce, contest-only).
Daily mechanics pay **XP**, never Novas — so Novas stay rare. Developers only manage/assign Novas;
teachers have no Novas access.

---

## 1. LAUNCH — Tier 1 (this week, before 10 students)

| # | Item | Owner | Effort | Notes |
|---|------|-------|--------|-------|
| L1 | **Bulk student-creation script** (`create-students.ts`) | 🤖 | S | Mirrors registration exactly (User + hashed pwd + UserProgress). Only safe way to onboard 10 with tracking intact. |
| L2 | **Prod env config** | 🤖 (needs URLs) | S | `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`, `TRUST_PROXY_HOPS` for Railway-frontend ↔ your-server-backend. |
| L3 | **Two-host smoke test** | 🤖 + user | S | register→login→solve→teacher-sees-it across the real split. |
| L4 | **Rotate leaked secrets** | 🔐 user | — | Atlas, JWT_SECRET, Railway, Cloudinary, Redis. Can't be automated. |
| L5 | **Change generated account passwords** | 🔐 user | — | developer + teacher accounts. |

---

## 2. NOVAS scaffold (in progress — finish before/around launch)

Build the structure now, wire live later. Visible **sample** for the 10 students (Store preview +
profile "releasing soon"); earning + spending stay **OFF** behind flags. Each phase: plan → build →
judge-panel → commit.

| Phase | What | Status |
|-------|------|--------|
| **N1 — Wallet** | `coins` on UserProgress + `CoinTransaction` ledger + `GET /me/wallet` + header chip + profile teaser | ✅ **shipped (740af2f)** |
| **N2 — Store** | `StoreItem` + `StoreOrder` models, catalog/orders APIs, `/store` page + My Orders (Redeem = "Coming Soon") | ✅ **shipped (041137c)** |
| **N3 — Admin** | developer-only: catalog mgmt + school-pickup fulfillment list + **assign/modify Novas** tool | ✅ **shipped (5ddfb3f)** |
| **N4 — Contest hook** | dormant `awardNovas` + podium call-site in contest finalization + contest "Coming Soon" banner | ✅ **shipped (91e602b)** |

**Scaffold complete.** Everything is wired and clickable; live behavior stays off behind flags
(`NOVAS_EARNING_ENABLED`, `STORE_REDEMPTION_ENABLED` both default false). **Go-live = flip those two
flags** (after weekly contests exist + the store is stocked). A developer can seed/test Novas anytime
via `/admin/store` (the adjust tool is live).

Spec: `docs/superpowers/specs/2026-06-02-novas-currency-store-scaffold-design.md`

---

## 3. ENGAGEMENT features — shortlisted from LeetCode (B2B-fit, POST-launch)

Grouped into waves by engagement-per-effort. All are **additive layers** on the existing
curriculum/executor/XP/streak/contest core — not rebuilds.

### Wave 1 — Engagement spine (highest value, builds on what exists)
| # | Feature | LeetCode parallel | Fit / why | Pays | Effort |
|---|---------|-------------------|-----------|------|--------|
| E1 | **Daily check-in** | "daily check-in +1" | Habit loop; trivial to add | **XP** | S |
| E2 | **Daily Challenge + calendar + countdown** | DCC June 2026 | Strong daily draw; pairs with check-in + streak | **XP** | M |
| E3 | **Streak-freeze (redeemable)** | "time-travel-ticket" | The one *harmless* power-up; we already track streaks | spend (XP or Novas — TBD) | M |

### Wave 2 — Discovery & assignment (most teacher value)
| # | Feature | LeetCode parallel | Fit / why | Effort | Prereq |
|---|---------|-------------------|-----------|--------|--------|
| E4 | **Study Plans (teacher-assignable)** | "LeetCode 75", study plans | Curated problem playlists a **teacher can assign** — more valuable for us than LeetCode | M | — |
| E5 | **Topic tags + filtered browser** | tag list + counts | Structured discovery | M | needs a `tags[]` field on Problem (today only free-text `concepts`) |
| E6 | **Global problem list (acceptance% + search)** | the big problem table | Browse/search | M | **must reconcile with sequential-unlock** (locked previews vs browse-within-unlocked) — decide first |

### Wave 3 — Presentation polish (later)
| # | Feature | LeetCode parallel | Fit / why | Effort |
|---|---------|-------------------|-----------|--------|
| E7 | **Explore "learning tracks"** | Explore cards / crash courses | Reskin existing cheat-sheets + session intros as kid tracks w/ progress | M–L |
| E8 | **Quest skill-tree** | LeetCode Quest | Gamified overlay on existing levels; flashy but low *new* value | L |

### OUT (wrong audience — do NOT build)
Company tags / "Trending Companies", interview crash courses (Google/FB/Amazon prep), B2C
**Premium paywall / Weekly Premium**. These are LeetCode's interview-prep B2C DNA; they'd dilute the
school product.

---

## 4. Recommended sequence

1. **Now:** Novas N2–N4 + Launch L1–L5. (Nothing in §3 is this-week work.)
2. **Wave 1 (E1–E3):** the engagement spine — hangs off existing XP/streaks/Novas.
3. **Wave 2 (E4–E6):** discovery + teacher assignment — the classroom edge.
4. **Wave 3 (E7–E8):** polish.

## 5. Open decisions to settle before the relevant feature
- **E3 streak-freeze:** paid in XP (keeps Novas pure) or Novas (rarer)? *Lean: XP.*
- **E6 problem list:** how does open browse coexist with sequential unlock? *Lean: locked previews.*
- **E2 daily challenge:** drawn from already-unlocked pool, or a separate daily set? *Lean: unlocked pool, age-banded.*
