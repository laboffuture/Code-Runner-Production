# Coderunner — Project Status & Roadmap

> Living document. Captures **what has been done**, **what is in progress**, and **what is planned next**, in detail.
>
> **Last updated:** 2026-06-01
> **Scope of this document:** the hardening + feature work carried out across the recent engineering sessions, plus the forward roadmap.

---

## 1. What Coderunner Is

Coderunner is a coding-education platform for children, split into two age bands (**11–14** and **15–18**). Students solve programming problems in an in-browser editor against a sandboxed execution backend; their progress, streaks, levels and topic mastery are tracked. Teachers run classrooms and monitor how students actually learn (not just whether they passed). A separate build/infra team monitors the system.

**Deployment model:** backend runs on its own server; frontend is deployed on Railway.

---

## 2. Architecture Snapshot

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 14 (App Router), React 18, TailwindCSS, Monaco Editor, recharts, lucide-react |
| **API** | Express, JWT auth, role-based middleware |
| **Execution** | BullMQ + Redis queue → runner workers → Docker containers (CLI via `execAsync`) |
| **Data** | MongoDB Atlas via Mongoose |
| **Shared** | npm-workspaces monorepo; `@code-runner/shared` compiled to `dist` (must be rebuilt after edits) |
| **Process mgmt** | PM2 (2× api + 2× runner), Nginx |

**Repository layout (single git repo at project root):**
```
PRODUCTION/
├── Coderunner-Backend/
│   ├── apps/api/        # Express API
│   ├── apps/runner/     # Queue workers + Docker executors
│   └── packages/shared/ # Models, types, logger (compiled to dist/)
└── Coderunner-Frontend/
    └── web/             # Next.js app
```

### Roles (3-role model)
| Role | Who | Where they land |
|------|-----|-----------------|
| `student` | the kids | learning app / problem solving |
| `teacher` | classroom owner/admin | `/teacher` — "Classroom Insight" |
| `developer` | build/infra team | `/admin/dashboard` — infra monitoring only |

> The word "admin" was **repurposed**: legacy `admin` accounts were migrated to `developer`. "Teacher" is the classroom-admin role.

---

## 3. Completed Work

Grouped by milestone, in roughly the order delivered.

### ✅ M0 — Security Hardening
| Item | What changed | Status |
|------|--------------|--------|
| **Committed secrets** | Identified leaked credentials in the repo/history. | **Flagged — rotation is user-owned** (see §6). |
| **Docker sandbox** | Added `--pids-limit 64 --cap-drop ALL --security-opt no-new-privileges --memory-swap 128m`; `release()` now force-removes runaway containers. | Done |
| **Endpoint data exposure / IDOR** | Removed `/test-cases/all` (leaked answers); ownership checks on `/result/:jobId`; `/submit/grade` now requires auth and derives `userId` from the token; `progress` GET/POST require auth + token-derived user; dropped `email` from leaderboard populate; removed `[DEBUG]` logs. | Done |
| **Login brute-force** | `authLimiter` rate limiter on `login`/`register`. | Done |
| **Password hygiene** | `passwordHash` set to `select: false`; login uses explicit `.select('+passwordHash')`. | Done |
| **Admin bootstrap script** | `create-admin.ts` reads `ADMIN_PASSWORD` / `ADMIN_ROLE` from env (no hardcoded `admin123`). | Done |

### ✅ M1 — Stability & Correctness
| Item | What changed | Status |
|------|--------------|--------|
| **Particle-animation freeze** | Root cause: never-cancelled `requestAnimationFrame` loops across ~9 pages. Fixed via a single shared `FloatingParticles` component that cancels on unmount. **Visuals preserved exactly (still 800 particles).** | Done |
| **Login / onboarding flow** | Enforce onboarding completion; create `UserProgress` at registration; require login to grade; guard the solve page. | Done |
| **Progress tracking** | (a) anonymous-progress loss closed (must be logged in to grade); (b) level-unlock count bug fixed and kept **open for launch**, flagged **TEMPORARY**; (c) activity chart mislabel fixed — now computes true solved-over-time from `solvedCalendar`. | Done (server-side enforcement still pending — see §5) |

### ✅ M2 — Dead Code & Type-Debt
| Item | What changed | Status |
|------|--------------|--------|
| **Dead code removal** | Frontend: WebGL, `lib/database`, cheatsheet variants, loading components, 8 unused admin modals, `ui/chart`, `ui/calendar`, `profile/RecentActivity`, `use3DTransition`. Backend: `railway.client`, test scripts, dead shared exports/types, `dockerode`/`axios` deps. (Only provably-unused code removed.) | Done |
| **Type-debt** | Cleared **all** TypeScript errors (API + runner + web). | Done |
| **Strict builds** | Flipped `next.config typescript.ignoreBuildErrors` → **false** (eslint `ignoreDuringBuilds` kept true). Build is green. | Done |

### ✅ M3 — Roles & Access Model
| Item | What changed | Status |
|------|--------------|--------|
| **3-role model** | `User.role` is now `'student' \| 'teacher' \| 'developer'`; added `classroomId`. | Done |
| **Middleware** | `adminMiddleware` → `developerMiddleware`; new `teacherMiddleware`. | Done |
| **Migration** | Legacy `admin` accounts → `developer`. | Done |
| **Routing** | Root gate routes `developer` → `/admin/dashboard`, `teacher` → `/teacher`; Header links per role; developer dashboard made infra-only (student data removed) + logout added. | Done |

### ✅ M4 — Teacher "Classroom Insight" Platform
| Item | What changed | Status |
|------|--------------|--------|
| **Classroom model** | `Classroom { name, age_group, joinCode (unique), teacherIds[], createdBy }`. | Done |
| **Teacher APIs** | Create/list classrooms, classroom roster + chart overview, add student by username, student deep-dive (ownership-checked). | Done |
| **Self-serve** | Teachers create their own classroom and get a join code. | Done |
| **Student join-by-code** | `POST /me/join-classroom { code }` + `/join-class` page. | Done |
| **Teacher UI** | `TeacherShell` (dark sidebar) + master-detail; classroom dashboard (summary cards, momentum/difficulty/level charts, roster table, add-student, join code) with a slide-over student drawer; full student deep-dive page (stats, problem chart, activity calendar, topic progress weak-first, grouped recent activity). | Done |
| **Sequential session unlock** | Sessions unlock in order (complete session N → unlock N+1); Code Convergence gated behind all sessions complete. | Done (client-side; server enforcement pending — see §5) |

### ✅ M5 — Integrity Engine (Phase 3)
The integrity engine helps a teacher understand **how** a student solved a problem and surfaces solves worth a closer look. **All flags are heuristics, never accusations.**

| Sub-phase | What changed | Status |
|-----------|--------------|--------|
| **3a — Attempt log + capture** | New `StudentAttempt` model (per graded submit): `accepted`, `status`, `firstSolve`, `timeOnProblemMs`, `runsBeforeSubmit`, `pasteCount`, `pasteChars`, `codeLength`, and `flags`. Runner computes flags and records each attempt; API forwards `metrics` from the editor. | Done |
| **📋 Paste capture** | Monaco `onDidPaste` threaded `CodeEditor → CodeEditorSection → EditorPanel → CompilerUI`; paste volume accumulated per problem (reset on switch) and sent in submit metrics. Enables the `largePaste` flag. | Done |
| **3d — Surfacing** | Roster badge with flagged count; drawer "Integrity Signals" list (flag icons + compact "why"); full-profile "Integrity Signals" card with per-flag chips + explicit *"conversation, not accusation"* disclaimer. Shared `lib/integrity.ts` helper. | Done |

**Signal set currently live:**
- ⚡ **solved-too-fast** — accepted in under ~15s on the page
- 🔁 **no-iteration** — passed first try with ≤1 test run
- 📋 **large-paste** — a big share of the final code arrived via paste

---

## 4. In Progress

_Nothing actively mid-edit._ The integrity capture + surfacing work is committed and the tree is clean (`tsc --noEmit`: web 0, api 0).

Recent commits:
- `26e27cf` feat(integrity): surface attempt flags in the teacher UI
- `e073a01` feat(integrity): capture paste events (enables large-paste flag)
- `0103824` Phase 3a — attempt log + capture

---

## 5. Roadmap — What's Next (detailed)

### 🔜 Phase 3c — Code Similarity (👯) — *last piece of the integrity engine*
**Goal:** flag near-duplicate solutions within a classroom (copy between students, or paste of a known external solution).

**Design intent (must stay off the hot path):**
- Run as a **scheduled background job** (nightly) and/or **on-demand per classroom** — *not* inline on submit, to keep runners free.
- Fingerprint accepted submissions (e.g. normalized-token / winnowing k-gram fingerprints), store fingerprints per problem, compare within a classroom.
- Surface as a 👯 signal with the matched peer + similarity score, framed the same way as other flags (heuristic, not proof).

**Open decisions before coding:**
1. Trigger: nightly cron vs. on-demand button vs. both.
2. Fingerprint algorithm + similarity threshold.
3. Storage: new collection vs. extend `StudentAttempt`.
4. UI: where the 👯 pair shows (drawer + deep-dive).

> Action: write the detailed design doc first, then implement.

### 🔜 Server-Side Enforcement (correctness/security hardening)
Two things are currently **client-side only** and need server enforcement before/just after launch:
1. **Level unlock** — flagged TEMPORARY; currently open. Enforce server-side gating.
2. **Session unlock** — sequential unlock is enforced in the UI only; add server-side checks so it can't be bypassed via the API.

### 🔜 CI/CD + Containerization
- Add a CI pipeline (typecheck + lint + build gates; strict TS already on).
- Author `docker-compose` for reproducible local + deploy environments.

### 🔜 Asset Cleanup
- Purge unused assets (~150 MB) to slim the repo/build.

### 🧭 Candidate Future Work (not yet scheduled)
- Teacher classroom-card UI refinement (user to review live and specify).
- Multi-teacher per classroom polish.
- Automated tests around grading, progress, and integrity flag computation.
- Observability/alerting on the developer (infra) dashboard.

---

## 6. Action Items Owned by the User (cannot be done from code)

> **🔐 Rotate all leaked credentials in their respective dashboards** — these were committed and must be rotated by a human with dashboard access:
> - MongoDB Atlas user `code-runner-admin` password
> - `JWT_SECRET`
> - Railway token
> - Atlas API keys
> - Cloudinary secret
> - Redis password
>
> **👤 Change generated account passwords** (created during setup):
> - developer account
> - teacher account

---

## 7. Conventions & Gotchas (for whoever picks this up)

- **Shared package**: `@code-runner/shared` is consumed from `dist`. After editing anything in `packages/shared`, **rebuild it** or the API/runner will run stale code.
- **Tailwind JIT**: no interpolated color class names — use full static class strings or lookup maps.
- **TypeScript is authoritative for correctness**: run `npx tsc --noEmit`. The editor/LSP shows **false JSX-parse errors** on `.tsx` files — ignore them; trust `tsc`.
- **Do NOT run a production `next build` against the working tree** while a dev server is running — it corrupts `.next` (module-not-found, route 404s). Use `tsc --noEmit` to verify instead.
- **Integrity flags are heuristics, never accusations** — a fast typist, an easy problem, or a student pasting their own earlier work all trip the same wires. Always presented as "worth a conversation."
- **Commits**: feature commits are scoped and include `tsc` status; trailer `Co-Authored-By: Claude`.
