# Coderunner — Architecture & Deployment Guide

> **Audience:** the engineers running the final test + deploying Coderunner.
> **Deployment split:** **frontend → Railway**, **backend (API + runner + Redis + Docker sandbox) → company server**, **database → MongoDB Atlas (managed)**.
> **Last updated:** 2026-06-06. Verified against the live code (ports, env vars, CORS, sandbox flags, PM2 layout).

---

## 1. What Coderunner is

A coding-education platform for children (two age bands: **11–14** and **15–18**). Students solve Python problems in an in-browser editor; their code runs in a **Docker-sandboxed** backend against hidden test cases; progress / XP / streaks / topic-mastery are tracked. Teachers run classrooms and watch *how* students learn. A developer (infra) role monitors the system; an admin role oversees students, teachers and developers.

---

## 2. The five components

| # | Component | Tech | Runs where | Port | Talks to |
|---|-----------|------|-----------|------|----------|
| 1 | **Web (frontend)** | Next.js 14 (App Router), React 18, Tailwind, Monaco editor | **Railway** | Railway-assigned (`$PORT`, e.g. 8080) | → API (HTTPS) only |
| 2 | **API** | Express + JWT, role middleware | **Company server** (PM2: `api-1`:4000, `api-2`:4001) | 4000 / 4001 | ← Web · → Redis (enqueue) · → Mongo · reads results |
| 3 | **Runner** | BullMQ workers + Docker container pool | **Company server** (PM2: `runner-1`, `runner-2`) | none (worker) | ← Redis (dequeue) · → Docker · → Mongo |
| 4 | **Redis** | Redis (BullMQ broker + rate-limit store) | **Company server** (local — see §6) | 6379 | ← API · ← Runner |
| 5 | **MongoDB** | MongoDB Atlas (managed) | Atlas cloud | 27017/SRV | ← API · ← Runner |

Plus the **`python-code-runner` Docker image** — the sandbox that student code actually executes inside (built on the company server; see §8).

> The frontend has **no database access** — it only calls the API. (`MONGODB_URI` in `web/.env.local.example` is legacy; do **not** set it on Railway.)

---

## 3. Topology diagram

```
                        ┌──────────────────────────────────────────────┐
   Student browser      │              COMPANY SERVER (VPS)            │
   ┌───────────┐        │                                              │
   │  Next.js  │        │   Nginx / Cloudflare Tunnel (TLS, public)    │
   │  on       │            │            │                            │
   │  RAILWAY  │  HTTPS  │   ┌────────┴────────┐                       │
   │           │ ───────────▶│  API (PM2)      │  api-1:4000           │
   └───────────┘  (REST   │   │  api-1 / api-2  │  api-2:4001           │
        ▲          + JWT) │   └───┬────────┬────┘                       │
        │                 │       │        │                            │
        │ NEXT_PUBLIC_    │   enqueue     read/write                    │
        │ API_URL         │       ▼        ▼                            │
        │                 │   ┌───────┐  ┌──────────────┐  (Atlas, SRV) │
        └─── result ──────│   │ REDIS │  │  Mongo driver │──────────────┼──▶ MongoDB Atlas
            (poll)        │   │ :6379 │  └──────────────┘               │
                          │   └───┬───┘        ▲                        │
                          │       │ dequeue    │ write progress/results │
                          │   ┌───▼─────────────┴───┐                   │
                          │   │  RUNNER (PM2)        │                  │
                          │   │  runner-1 / runner-2 │                  │
                          │   └──────────┬───────────┘                  │
                          │              │ docker run (per submission)  │
                          │   ┌──────────▼───────────────────────────┐  │
                          │   │  Docker container pool                │  │
                          │   │  image: python-code-runner            │  │
                          │   │  --network none --cap-drop ALL …      │  │
                          │   └───────────────────────────────────────┘  │
                          └──────────────────────────────────────────────┘
```

---

## 4. The core flow — how a code submission is graded

This is the money path. Everything else is reads.

1. **Edit** — student writes Python in the Monaco editor (web).
2. **Submit** — web calls `POST /execution/submit/grade { code, problemId, metrics }` on the API (JWT in `Authorization` header). The API derives `userId` **from the token** (never trusts a client-sent id).
3. **Enqueue** — the API pushes a job onto the **submission queue** (BullMQ → Redis) and returns a `jobId`.
4. **Poll** — web polls `GET /execution/result/:jobId` (`waitForResult`, up to ~90 s, tolerant of cold-start 404s).
5. **Execute** — a **runner** worker pulls the job from Redis, takes a warm container from its **pool** (or starts one), and runs the student code against the problem's hidden test cases **inside the `python-code-runner` sandbox** — isolated and capped (§9).
6. **Grade + persist** — the runner computes pass/fail + integrity signals (paste volume, timing, iteration), then **writes the graded result and updates `UserProgress`** (solved, XP, difficulty counts, acceptanceRate, contestRating, level, rank) in Mongo, and publishes the result to Redis.
7. **Return** — the API's poll resolves with the result; web shows Accepted/Rejected; profile / leaderboard / teacher / admin panels reflect the new **stored** stats.

**Read flows** (profile, leaderboard, teacher classroom, admin oversight) are plain `GET`s: web → API → Mongo → JSON. No queue, no Docker.

**Auth flow:** `POST /auth/login` → API verifies against Mongo (`passwordHash`, bcrypt) → returns a JWT → web stores it in `localStorage` and sends it as `Authorization: Bearer <token>` on every call. Role gates (`student`/`teacher`/`developer`/`admin`) are enforced in API middleware **and** re-checked against the DB for the privileged roles.

---

## 5. Scaling & process layout (company server)

Managed by **PM2** (`Coderunner-Backend/ecosystem.config.js`, `PROJECT_ROOT=/var/www/code-runner`):

| PM2 app | Count | Port | Notes |
|---------|-------|------|-------|
| `api-1`, `api-2` | 2 | 4000, 4001 | fork mode; **Nginx load-balances** across them. (Single-port tunnel? switch to cluster mode, 2 instances.) `max_memory_restart 300M`. |
| `runner-1`, `runner-2` | 2 | — | each owns a **namespaced Docker pool** (`RUNNER_INSTANCE_ID` → `pool-i1-*` / `pool-i2-*` so they never reap each other's containers). Pool min 2 / max 5, 30-min max age. Concurrency: execution 3, submission 2. `max_memory_restart 500M`. |

All four: `autorestart: true`, `max_restarts: 10`, `min_uptime: '10s'`.

> ⚠️ **Reliability note (ties to the open auto-stop issue):** with `max_restarts: 10` + `min_uptime: '10s'`, if a process **crash-loops** (e.g. it can't reach Redis or Mongo on boot, dying in under 10 s each time), PM2 gives up after 10 tries and **leaves it stopped** — which looks like "the server auto-stopped." First thing to check if a service is down: `pm2 logs <app>` for a repeated boot-time connection error.

---

## 6. Where Redis should live — **recommendation: the company server**

Redis is **only** the BullMQ broker between the **API** (producer) and the **runner** (consumer), plus the shared rate-limit store across the two API instances. **The frontend never touches Redis.**

- **Recommended — Redis on the company server, next to the API + runner.** Every enqueue/dequeue/result stays on `localhost`: fast, no extra TLS surface, one less network failure mode. **This is already the project's designed topology** — `Coderunner-Backend/deploy-backend-only.sh` and `vps-setup-prerequisites.sh` install Redis locally and set a `requirepass` password. API/runner default to `REDIS_HOST=localhost`.
- **Alternative — Redis on Railway (separate service).** Then **both** the API and the runner on the company server reach Redis **over the public internet on every job** — added latency on the hot path, requires `REDIS_URL=rediss://…` with TLS + auth, and a new partial-failure mode that overlaps with the auto-stop reliability work. Choose this only if the company server genuinely can't run Redis.

**Verdict:** keep Redis on the company server with the API + runner. Railway hosts the **frontend only**.

---

## 7. Environment variables (the deploy contract)

Secrets live in **`.env.local`** per service (git-ignored, never committed) — set them on each host. Templates are the committed `.env.example` files.

### API — `Coderunner-Backend/apps/api/.env.local`
| Var | Prod value | Secret? |
|-----|-----------|---------|
| `PORT` | `4000` (api-1) / `4001` (api-2) — PM2 sets these | no |
| `NODE_ENV` | `production` | no |
| `MONGODB_URI` | Atlas SRV string (`@` in pwd → `%40`) | **yes** |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | `localhost` / `6379` / *(requirepass)* — or `REDIS_URL` | **yes** (password) |
| `JWT_SECRET` | 64-byte base64; **must match the runner** | **yes** |
| `CORS_ORIGIN` | the **Railway frontend URL** (comma-sep for multiple) | no |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` | `60000` / `30` | no |
| `RAILWAY_API_TOKEN` / `RAILWAY_PROJECT_ID` | optional (dashboard frontend metrics) | yes if set |

### Runner — `Coderunner-Backend/apps/runner/.env.local`
| Var | Prod value | Secret? |
|-----|-----------|---------|
| `NODE_ENV` | `production` | no |
| `MONGODB_URI` | **same DB as the API** | **yes** |
| `REDIS_HOST`/`PORT`/`PASSWORD` (or `REDIS_URL`) | same Redis as the API | **yes** |
| `JWT_SECRET` | **must match the API** | **yes** |
| `ENABLE_CONTAINER_POOL` / `POOL_MIN_SIZE` / `POOL_MAX_SIZE` / `POOL_MAX_CONTAINER_AGE_MS` | `true` / `2` / `5` / `1800000` | no |
| `SANDBOX_IMAGE` | `python-code-runner` | no |
| `WORKER_CONCURRENCY_EXECUTION` / `_SUBMISSION` | ecosystem sets `3` / `2` | no |

### Frontend — Railway service variables
| Var | Prod value | Secret? |
|-----|-----------|---------|
| `NEXT_PUBLIC_API_URL` | the **public HTTPS URL of the company-server API** (e.g. `https://api.yourdomain.com`) | no (baked into the bundle at build) |

> Do **not** set `MONGODB_URI` on Railway — the frontend doesn't use it.

---

## 8. Prerequisites on the company server

1. **Node.js ≥ 18**, **npm ≥ 9**.
2. **Docker** installed and running; the backend user must have access to the Docker socket (the runner shells out to `docker run`).
3. **Build the sandbox image** — from `Coderunner-Backend/apps/runner/sandbox/`:
   `docker build -t python-code-runner .` (Python 3.11-slim, non-root user `1000:1000`, headless matplotlib/pygame). The runner will not execute code without it.
4. **Redis** installed locally with `requirepass` (see `vps-setup-prerequisites.sh`).
5. **PM2** (`npm i -g pm2`).
6. **Nginx** (load-balance api-1/api-2 + TLS) **or a Cloudflare Tunnel** to expose the API publicly over HTTPS.
7. **MongoDB Atlas** reachable (Atlas IP allowlist must include the company server's egress IP).

---

## 9. Security posture (don't weaken any of this)

- **Docker sandbox** — every student execution runs with: `--network none`, `--memory 128m`, `--memory-swap 128m`, `--pids-limit 64`, `--cap-drop ALL`, `--security-opt no-new-privileges`, `--read-only`, `--user 1000:1000`. No network, no privilege escalation, no fork bombs, hard memory/PID caps, non-root, read-only FS. *(`docker.executor.ts` + `container-pool.ts`.)*
- **Auth** — JWT; `passwordHash` is bcrypt and `select:false` (never returned). Privileged routes re-verify role against the DB.
- **CORS (prod)** — when `NODE_ENV=production`, the API allows **only** the origins in `CORS_ORIGIN` (plus no-origin server-to-server). The LAN/localhost auto-allow is dev-only. → **`CORS_ORIGIN` must contain the Railway frontend URL** or the browser calls fail.
- **Rate limiting** — per-user on the hot paths, per-IP on auth/register, backed by Redis (shared across API instances). (Note: a school behind one NAT IP shares the per-IP limiters — keep those generous.)
- **Secrets** — only ever in `.env.local` / host env, never in git. Rotation is the owner's responsibility.

---

## 10. Build & run order

**Backend (company server)** — shared package compiles to `dist/` and is consumed from there:
```
cd Coderunner-Backend
npm install
npm run build:all          # build:shared → build:api → build:runner  (order matters)
docker build -t python-code-runner apps/runner/sandbox
pm2 start ecosystem.config.js
pm2 logs                   # confirm all four boot clean
```
**Frontend (Railway)** — build `npm run build` (→ `cd web && next build`), start `npm run start`; set `NEXT_PUBLIC_API_URL`. Railway provides `$PORT`.

> Never run a production `next build` against a working tree that a dev server is using — it corrupts `.next`. `npx tsc --noEmit` is the correctness verifier.

---

## 11. Final-test plan

**A. Component liveness**
- `GET https://<api>/health` → `{status:"healthy"}` (open endpoint, also the LB health check).
- `GET https://<api>/health/redis` → `redis.connected:true`.
- `pm2 status` → all four `online`; `pm2 logs runner-1` shows the pool warming; `docker ps` shows `pool-i1-*` / `pool-i2-*` containers.
- Mongo: API/runner logs show a successful connection on boot.

**B. End-to-end smoke (the real test)**
1. Register a student → log in (JWT issued).
2. Open a problem → submit a **correct** solution → it grades **Accepted** within a few seconds.
3. Profile shows XP / solved incremented; leaderboard reflects it; the teacher's classroom view and the admin panel show the activity.
4. Submit a **wrong** solution → graded Rejected, no false progress.

**C. Sandbox hardening (must pass)**
- Submit an infinite loop → killed by the time/PID/memory caps, not a hung host.
- Submit code that opens a socket / hits the network → fails (`--network none`).
- Submit a fork bomb → contained by `--pids-limit 64`.

**D. Cross-origin**
- From the Railway frontend, a logged-in action succeeds (proves `CORS_ORIGIN` + `NEXT_PUBLIC_API_URL` are paired correctly). A request from an un-listed origin is rejected.

---

## 12. Pre-push checklist (company GitHub — "required stuff only")

**Push (required):** everything under `Coderunner-Backend/` (apps, packages, ecosystem.config.js, Dockerfiles, deploy scripts) and `Coderunner-Frontend/` (web/src, configs), the `.env.example` templates, `docs/`, root `package.json`, `.gitignore`.

**Never push:**
- `.env.local` / real env files — **git-ignored ✓**
- `node_modules/`, `dist/`, `.next/`, compiled `*.js` beside `src/` — **git-ignored ✓**
- `*.pem` / `*.key` — **git-ignored ✓**
- **`cmis-student-logins.csv` / `.html` (student credentials)** and `scripts/_curriculum-fix-backup/` — *were only untracked; now added to `.gitignore`.*

**Secret gate (before the first push to a company org):**
- ✅ Verified: only `.env.example` files are tracked, and the **root commit** added only those templates — no real secret was ever committed.
- Run a full secret scan as final insurance (e.g. `gitleaks detect` or `trufflehog git file://.`).
- **Decide history:** push the full (clean) history, **or** hand the company a fresh single-commit snapshot (cleanest for a code handoff — sidesteps any historical-secret risk entirely).

---

## 13. Open deployment decisions

1. **Redis placement** — recommend **company server** (§6). Confirm.
2. **How the API is exposed publicly** — Nginx + domain + TLS, or a Cloudflare Tunnel? The Railway frontend and every student browser must reach the API over HTTPS, and `NEXT_PUBLIC_API_URL` / `CORS_ORIGIN` are set from this.
3. **History vs snapshot** for the company repo (§12).
