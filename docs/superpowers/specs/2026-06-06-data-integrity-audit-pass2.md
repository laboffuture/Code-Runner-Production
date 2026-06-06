# Data-Integrity Audit — Pass 2 (read-path consistency + mock-vs-real)

> **Date:** 2026-06-06 · **Scope:** P0 #1 (every student metric real & consistent across profile / leaderboard / teacher / owner) and P0 #2 (developer dashboard live-vs-mock). Read-only audit; no app code changed.

## Bottom line
Student **profile**, **leaderboard**, and **owner oversight** are mutually consistent — all three DISPLAY the stored `UserProgress.stats.*`. The **teacher** classroom roster + deep-dive are the lone outlier: they RE-DERIVE solved counts and curriculum level from `solvedProblemIds ∩ curriculum-band`, which can disagree with what the other three show for the same student. Same bug family as the already-fixed `ProfileStats` off-by-one, relocated into the teacher API.

## Severity summary
- **HIGH: 2** — H1 (teacher solved-count re-derivation), H2 (owner vs teacher "level" mean different things under the same label)
- **MED: 3** — M1 (acceptanceRate rounding), M2 (reset makes the drift permanent), M3 (dashboard hardcoded "ONLINE" dots)
- **LOW: 4** — Cloudinary banner, /rank Weekly placeholder, reset rating basis, static pipeline labels

## Canonical write path (source of truth)
`Coderunner-Backend/apps/runner/src/workers/code-submission.worker.ts` → `updateUserProgress()` + methods on `packages/shared/src/database/models/UserProgress.model.ts`. Everything is computed on write and stored:

| Metric | Rule | Location |
|--------|------|----------|
| `level` | `floor(experience/500)+1` | UserProgress.model.ts:191–194 |
| `rank` | ≥2000 MASTER / ≥1600 EXPERT / ≥1200 ADVANCED / else NOVICE (from contestRating) | model:178–188 |
| `acceptanceRate` | `parseFloat(((accepted/total)*100).toFixed(2))` | model:167–175 |
| XP (first solve) | hard 200 / medium 100 / else 50 | worker:254–256 |
| `contestRating` | +15 solve (cap 3000) / −2 fail (floor 800) | worker:284, 296 |
| `totalSolved` / `solvedProblemIds` | first solve only | worker:238–242 |

`updateUserProgress` runs for **every** submission incl. contest (worker:110).

## HIGH findings

### H1 — Teacher solved counts are re-derived; disagree with profile/leaderboard/oversight
- Profile reads stored: `users.routes.ts:190` → `ProfileStats.tsx:81`
- Leaderboard/rank read stored: `leaderboard.routes.ts:53` → `rank/page.tsx:171,291`
- Owner health reads stored: `oversight.routes.ts:101` → `StudentHealthPanel.tsx:125`
- **Teacher derives:** `teacher.routes.ts:49–69` (`deriveCompletion`), used at roster `:120–127` and deep-dive `:362`; band filter at `:81–83` / `:337–339`.
- **Divergence:** any first-solve whose `Problem.age_group` is null (optional field — `Problem.model.ts:76–79`), is contest-only, or belongs to the other band is counted by stored `stats.totalSolved` (3 surfaces) but **dropped** by the teacher derivation. Teacher shows a lower "TOTAL SOLVED" than the student's own profile and the owner panel for the identical student.
- **Fix:** keep the curriculum-scoped number but LABEL it "curriculum solved" (teacher already does this for `level`), and ALSO return stored `stats.totalSolved` so the teacher headline matches the other three surfaces.

### H2 — Owner "LEVELS (L1–L4)" = XP level; teacher "Students per Level" = curriculum level. Same label, different quantity.
- Owner: `oversight.routes.ts:27–31` uses `UserProgress.level` (XP level `floor(exp/500)+1`) clamped 1–4 → `GroupsOverviewPanel.tsx:123`.
- Teacher: `teacher.routes.ts:59` derives highest `level_number` reached (curriculum level) → `classrooms/[id]/page.tsx:261–271`.
- **Divergence:** any student ≥1500 XP collapses to "L4" on the owner panel regardless of curriculum progress, so the two per-classroom histograms routinely disagree.
- **Fix (recommended — consistency):** make `/oversight/groups` use the same curriculum-level derivation as the teacher (reuse `deriveCompletion`). **Cheap alternative:** relabel the owner bar "XP TIER" so the two are honestly different.

## MED findings
- **M1 — acceptanceRate rounding mismatch.** Owner `Math.round(s.acceptanceRate)` (`StudentHealthPanel.tsx:126`) vs raw 2-dp stored on profile (`ProfileStats.tsx:119,159`) and teacher (`students/[id]/page.tsx:151`, `classrooms/[id]/page.tsx:315`). Same student: "88%" vs "87.5%". **Fix:** one shared formatter.
- **M2 — Reset makes H1's drift permanent & reproducible.** `apps/api/src/services/progressReset.ts` `computeResetProgress` recomputes `stats.totalSolved` skipping surviving solved ids that lack band metadata (`:54–62`, `if (!meta) continue`), but keeps the full id list in `solvedProblemIds` (`:50,115`). After any reset, `solvedProblemIds.length` (teacher-derived) can exceed `stats.totalSolved` (profile/owner) and stay drifted. **Fix:** apply the same inclusion rule to both fields at reset.
- **M3 — Dashboard hardcodes MongoDB/Cloudinary/Frontend/Nginx as "ONLINE."** `admin/dashboard/page.tsx`: Mongo `status="online"`+"Connected" literals (`:305–310`), Cloudinary `status="online"`+"Active" (`:316–321`), Frontend `:228`, Nginx `:237`. `fetchAll` only pulls system/queues/docker/logs/errors (`:111–128`) — these dots are decorative and would stay green during a real Atlas/Cloudinary outage. **Fix:** drive from the real probes that already exist (`/admin/mongodb/stats` returns `connection.status`, `/admin/cloudinary/stats`, `/admin/nginx/metrics`), or mark them explicitly static.

## LOW findings
- **L1** — Cloudinary detail page "ACTIVE / All services online" banner hardcoded green (`admin/cloudinary/page.tsx:226–231`); the usage numbers below are real.
- **L2** — `/rank` "Weekly Champions" tab is a "available soon" placeholder (`rank/page.tsx:317–336`). Hide for launch or implement.
- **L3** — Reset recomputes `contestRating = 1000+15*totalSolved` (`progressReset.ts:67`), a different basis than the incremental live path; internally consistent (all readers agree), noted only because the rating can jump at reset.
- **L4** — Static pipeline labels: Runner concurrency "5"/"3" (`dashboard:335–336`), Nginx "Upstreams 2/Failover auto" (`:239–240`), API-2 "Standby/OK" (`:267–268`).

## Verified-clean
- `ProfileStats.tsx:34–38` level-progress math now matches the model rule (old "−500 XP" off-by-one fixed; reads stored `profile.level`, no re-derivation).
- Global leaderboard (`leaderboard.routes.ts:44–60`) and profile endpoint (`users.routes.ts:175–202`) pass stored values through. Rank position is a `countDocuments` (not a metric re-derivation).
- Novas/coins read stored `coins` everywhere (intentionally 0).
- Contest leaderboard displays server-computed scores from `ContestEntry` (worker:537–551), no re-scoring.
- `topicProgress.percentage` display-rounding identical on profile (`users.routes.ts:160`) and teacher (`teacher.routes.ts:328`).

## Mock-vs-real verdict (infra dashboard)
- **MongoDB** — dedicated `/admin/mongodb`: **LIVE** (real mongoose `listCollections` + `$bsonSize` sampling, `mongodb.routes.ts:18–80`). Dashboard pipeline card: **HARDCODED** (M3).
- **Cloudinary** — dedicated `/admin/cloudinary`: **LIVE numbers** (real Cloudinary Admin API, `cloudinary.routes.ts:38–48`) but **hardcoded** green status banner (L1). Dashboard card: **HARDCODED** (M3).
- **Redis** — **LIVE** (dashboard dot from `queues.health`; `/admin/redis/metrics` parses real `INFO` + queue depths, `admin.routes.ts:183–263`).
- **Railway** (`/admin/frontend`) — **LIVE-with-mock-fallback, and honest**: real Railway GraphQL when `RAILWAY_API_TOKEN` set (`admin.routes.ts:691–746`), else `_unavailable`; the page falls back to `Math.random()` series but shows a "· Using mock data" banner (`frontend/page.tsx:38–58,83`).
- **Queues/BullMQ, Docker pool, Runners** — **LIVE** data (real Redis keys / `runner:pool:stats`); Runner-1/Runner-2 split and concurrency numbers are static labels (L4).

## Launch-critical ordering
**H1 + H2 + M2** (teacher is the only surface re-deriving solved/level; a reset makes the drift permanent), then **M3** (fake green dots can mask a real outage). **M1** is a cheap shared-formatter fix worth folding in. Everything else is cosmetic or honest placeholders.
