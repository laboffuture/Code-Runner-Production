# Pre-Launch Checklist — Coderunner

> **Living document.** Single source of truth for what must happen before launch. Maintained by Claude as the user adds items; supersedes the stale `PROJECT_STATUS.md` for launch tracking.
>
> **Created:** 2026-06-04 · **Launch target:** the week of ~June 15, 2026 (≈1.5 weeks out).
>
> **Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked/needs decision.
> Priorities: **P0** = launch-critical (data correctness / blocking) · **P1** = core UX + oversight build · **P2** = polish/last.

---

## P0 — Data correctness & reliability (launch-critical)

### 1. `[~]` Data-integrity audit + fixes
Every student metric (XP, acceptance rate, problems solved, sessions, rank) must be **real** and **consistent** across profile / leaderboard / teacher / admin. "Detail check by implementing it."

**Audit findings (pass 1 — 2026-06-04):**
- `[x]` **Write-path math is real & correct** — `code-submission.worker.ts:191–304`: solved/easy/medium/hard, submissions, XP (50/100/200 by difficulty, first-solve-only), contestRating (+15 solve / −2 fail, clamp 800–3000), acceptanceRate, level, rank all computed per graded submit.
- `[x]` **Backend `/leaderboard/global`** (`leaderboard.routes.ts`) — real aggregation, email hidden.
- `[x]` **`/rank` full page** (`rank/page.tsx`) — uses the real API.
- `[x]` **FIXED (236b0a4): Header leaderboard popover** (`components/lists/Leaderboard.tsx`) — was 100% mock (6 hardcoded users, `currentUserRank=6`). **D1 = wire to real API:** now fetches `/leaderboard/global`, derives rank from the logged-in user's position via `useAuth`, with loading/error/empty states. Mirrors the `/rank` path. Judge panel PASS.
- `[x]` **FIXED (236b0a4): `ProfileStats.tsx` level-progress off-by-one** — now `currentLevelXP = (level-1)*500`, `nextLevelXP = level*500` (model: `level = floor(exp/500)+1`). Level-1 student no longer shows "−500 XP earned" at 0%. Judge panel PASS.
- `[ ]` **`/rank` "Weekly Champions" tab** is a "coming soon" placeholder → hide for launch or implement.
- `[ ]` **Audit pass 2 (not yet done):** profile/teacher read endpoints (`users.routes.ts`, `teacher.routes.ts`) expose the same numbers for the same student; Novas/coins surfaces real.

### 2. `[ ]` Developer dashboard — real vs mock
Verify the infra widgets on the developer dashboard (`admin/frontend` etc.) show **live** data, not placeholder: MongoDB, Railway, Redis, Cloudinary. (`admin/frontend/page.tsx` tripped the mock scan — confirm.)

### 3. `[!]` Reliability — front/back/runner auto-stop & timeout
When running the project, all three (front + back + runner) suddenly stop / time out / the server auto-stops. Reproduce → root-cause (PM2 restart loop? dev-server crash? runner hitting a memory/pids cap and cascading? request timeout?) → fix. **Blocked on:** how the user runs it + what they see when it dies (*decision D4*).

---

## P1 — Core UX & oversight build

### 4. `[x]` Arena re-entry — **SHIPPED (49e7a96)**
Red "← ARENA" button in the problem-page header → `/sessions/<id>/introduction?returnTo=<problem_id>`; the introduction page already honors `returnTo`, so "Start Training" returns the student to the same problem. Frontend panel PASS. Did not touch the unlock gate.

### 5. `[ ]` Admin oversight page
A monitoring surface for an admin/owner persona, watching all three roles:
- **Student** — % involvement/engagement in Coderunner.
- **Teacher** — accountability: are they actually opening student profiles / discussing the answer guides? (needs new teacher-activity tracking).
- **Developer** — are reported bugs actually being looked at and **closed**? (needs a ticket lifecycle).
- **5a. `[ ]` Student "I'm stuck / Need help" button** — global, always-visible in the student app; opens a free-text message box; message goes **directly to admin**. *(name TBD — decision D6)*
- **5b. `[ ]` Shared issue/ticket model** — student-help messages (5a) and bug reports (→ developer) likely share one `message → inbox → status (open/handled)` backbone; the open/handled status is what the admin page monitors for accountability.

> **Decision D2:** is "admin" a **new oversight tier above** student/teacher/developer, or an **expansion of the existing developer dashboard**? This + the new tracking (teacher-activity events, ticket lifecycle) make #5 the biggest build on the list — "instrument first, then monitor."

---

## Process — governs all work hereafter

### 6. `[ ]` Domain-specialized review panels
Upgrade the judge-panel so the reviewers **match the work**: frontend work → frontend-design panel; infra/docker → infra panel; architecture → architecture panel. 4–5 specialists per job; stand each one up the first time it's needed (reliability fix → infra panel; glow → frontend panel). *(decision D5: replace generalists per job, or keep security+correctness always-on and swap the other seats?)*

---

## P2 — Polish & last

### 7. `[ ]` Corner-glow on the two images
Add a glow at/around the corners of the two recently-changed images. NOTE: commit `200f503` removed the drop-shadow/glow from the mission cards — confirm whether these are the same images and what "corner glow" should look like.

### 7b. `[ ]` Astra inside-backdrop art — not finalized
Trialed 3 candidate images locally for Astra's `internal` levels backdrop (preview-override method); none approved yet. The art is **not 100% done** — revisit and finalize, then upload to Cloudinary + remove any local override. Candidate files may still sit untracked under `public/assets/view/astra/`.

### 8. `[ ]` "Develop certain pages better"
User to specify which pages and how. Placeholder until then.

### 9. `[ ]` Detailed code/company documentation — **LAST**
Comprehensive documentation of the codebase. Explicitly scheduled last.

---

## Shipped (this launch cycle)
- `[x]` **Real header leaderboard + ProfileStats XP fix** — commit `236b0a4` (D1 wire, D3 fix-now).
- `[x]` **Per-character view art wired (presentation-only)** — commit `e38aa74`. 20 masters normalized to `view/<char>/{basic,advanced,internal,profile,banner}.png`; `/home` cards reframed **Basic/Advanced**, `/levels` inside backdrop, header emblem; 16 render images on Cloudinary (banner = download-only, deferred). Age-group data axis untouched. Frontend-seated panel PASS.

## User-owned (cannot be done from code)
- `[ ]` Rotate leaked credentials (Atlas, JWT_SECRET, Railway, Cloudinary, Redis) in their dashboards.
- `[ ]` Change generated account passwords (developer, teacher).

---

## Open decisions (waiting on the user)
- ~~**D1** — Fake header leaderboard~~ → **RESOLVED: wired to real API** (`236b0a4`).
- ~~**D3** — Audit posture~~ → **RESOLVED: fixed the two clear-cut bugs now** (`236b0a4`).
- ~~**D5** — Panels~~ → **RESOLVED: seat the existing 5-judge gate with frontend specialists per job** (security + real-environment always-on).
- ~~Age-split reframe~~ → **RESOLVED: presentation-only** (Basic/Advanced labels + art; data axis untouched).
- **D2** — "Admin page": new oversight role/tier, or expand the developer dashboard?
- **D3** — Audit posture: finish audit → approve → fix in priority order (rec), or fix clear-cut items (header mock, XP off-by-one) as found?
- **D4** — Reliability repro: how do you run it when it dies, and what do you see (crash/error vs silent exit/timeout)? Point to a log.
- **D5** — Panels: replace generalists per job, or augment two always-on gates (security + correctness)?
- **D6** — Help-button name (suggestions: "Need Help?", "I'm Stuck", "Report a Problem").
