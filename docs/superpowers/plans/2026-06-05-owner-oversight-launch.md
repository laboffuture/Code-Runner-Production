# Owner Oversight (Launch Cut) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the launch cut of the owner oversight tier — a new `owner` role at `/oversight` with a Groups Overview and a read-only Accountability Radar, fed by a new Ticket model and student "Report a bug / Ask a doubt" buttons.

**Architecture:** New top role `owner` (seeded, never self-registered), gated by `ownerMiddleware`, served by `/oversight/*` routes that aggregate existing `Classroom`/`User`/`UserProgress`/`StudentAttempt` data plus a new `Ticket` collection. Delay/breach is computed at query time, anchored to ticket creation. A nullable `Classroom.schoolId` seam makes a future School layer additive. Spec: `docs/superpowers/specs/2026-06-05-admin-oversight-design.md`.

**Tech Stack:** TypeScript, Express, Mongoose (MongoDB Atlas), Next.js 14 App Router, `@code-runner/shared` (compiled to `dist/`). **No unit-test runner exists** — the authoritative verifier is `npx tsc --noEmit` (DO_NOT_DISTURB #6), plus endpoint smoke checks and the judge panel before each substantive commit.

**Conventions (read once):**
- After editing anything in `packages/shared`, rebuild it: `cd Coderunner-Backend/packages/shared && npm run build` (DO_NOT_DISTURB #5). The api imports from `dist/`, so stale dist = stale runtime.
- Verify backend with `cd Coderunner-Backend/apps/api && npx tsc --noEmit`; frontend with `cd Coderunner-Frontend/web && npx tsc --noEmit`.
- Never run a prod `next build` on the working tree (DO_NOT_DISTURB #6).
- Run the domain-seated judge panel (security + real-environment always-on) before each phase commit that touches `apps/`, `packages/`, or `web/src`.
- No leftover `console.log`; no interpolated Tailwind color classes (DO_NOT_DISTURB #8).

---

## Phase 1 — Centralize the role type + add `owner` (backend)

### Task 1: Single source of truth for roles

**Files:**
- Create: `Coderunner-Backend/packages/shared/src/types/roles.ts`
- Modify: `Coderunner-Backend/packages/shared/src/index.ts` (add export)

- [ ] **Step 1: Create the roles module**

```ts
// Coderunner-Backend/packages/shared/src/types/roles.ts
/** Single source of truth for user roles. Every role union/enum derives from this. */
export const ROLES = ['student', 'teacher', 'developer', 'owner'] as const;
export type Role = (typeof ROLES)[number];
```

- [ ] **Step 2: Export it from the shared package barrel**

Open `Coderunner-Backend/packages/shared/src/index.ts`. Find the block of `export * from './types/...'` lines and add (next to the other type exports):

```ts
export * from './types/roles';
```

- [ ] **Step 3: Verify shared compiles**

Run: `cd Coderunner-Backend/packages/shared && npx tsc --noEmit`
Expected: no output (success).

### Task 2: Derive every role union from `Role`

**Files:**
- Modify: `Coderunner-Backend/packages/shared/src/types/user.types.ts:71,80,103`
- Modify: `Coderunner-Backend/packages/shared/src/database/models/User.model.ts` (enum + `IUser.role`)

- [ ] **Step 1: Update the three unions in user.types.ts**

At the top of `user.types.ts` add the import (keep existing imports):

```ts
import type { Role } from './roles';
```

Replace each of the three literal unions `'student' | 'teacher' | 'developer'` (lines ~71, ~80, ~103 — in `User`, `AuthToken`, and `AuthResponse.user`) with `Role`. After: `role: Role;`.

- [ ] **Step 2: Update the User model enum + interface**

In `User.model.ts`: add `import { ROLES, Role } from '../../types/roles';` (match the existing relative import depth used by other imports in that file). Change the `IUser.role` field type to `Role`. Change the schema enum from `enum: ['student', 'teacher', 'developer']` to `enum: [...ROLES]`.

- [ ] **Step 3: Rebuild shared + verify**

Run: `cd Coderunner-Backend/packages/shared && npm run build && npx tsc --noEmit`
Expected: builds, no type errors. Confirm `dist/types/roles.js` exists:
Run: `ls Coderunner-Backend/packages/shared/dist/types/roles.js`
Expected: the file path prints.

- [ ] **Step 4: Verify the api still typechecks against the new shared**

Run: `cd Coderunner-Backend/apps/api && npx tsc --noEmit`
Expected: no output. (If errors mention `role`, a consumer needs the `Role` widening — fix before continuing.)

### Task 3: `ownerMiddleware`

**Files:**
- Modify: `Coderunner-Backend/apps/api/src/middleware/auth.middleware.ts` (append after `staffMiddleware`)

- [ ] **Step 1: Add the middleware**

Append to `auth.middleware.ts`:

```ts
// Owner-only middleware (must be used after authMiddleware).
// Gates the oversight tier — the platform owner only. Re-verifies the role
// against the DB because this is the highest-privilege credential and the JWT
// role is otherwise trusted for the full token lifetime.
export async function ownerMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Forbidden', message: 'Owner access required' });
  }
  try {
    const { Models } = await import('@code-runner/shared');
    const fresh = await Models.User.findById(req.user.userId).select('role').lean();
    if (!fresh || fresh.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden', message: 'Owner access required' });
    }
    next();
  } catch {
    return res.status(500).json({ error: 'Internal error', message: 'Role verification failed' });
  }
}
```

> Note: if `@code-runner/shared` is already statically imported at the top of this file in your tree, use that import instead of the dynamic `await import` to match the file's convention.

- [ ] **Step 2: Verify**

Run: `cd Coderunner-Backend/apps/api && npx tsc --noEmit`
Expected: no output.

### Task 4: Seed script for the owner account

**Files:**
- Create: `Coderunner-Backend/apps/api/src/scripts/create-owner.ts`

- [ ] **Step 1: Create the script (mirrors create-admin.ts)**

```ts
/**
 * Script to create the platform OWNER (oversight tier) account.
 * Run with: npx tsx src/scripts/create-owner.ts
 * Requires in .env.local (git-ignored): OWNER_USERNAME, OWNER_EMAIL, OWNER_PASSWORD
 */
import { Models, hashPassword } from '@code-runner/shared';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function createOwnerUser() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    const ownerUsername = process.env.OWNER_USERNAME || 'owner';
    const ownerEmail = process.env.OWNER_EMAIL || 'owner@coderunner.com';
    const ownerPassword = process.env.OWNER_PASSWORD;

    if (!ownerPassword || ownerPassword.length < 12) {
      console.error('❌ OWNER_PASSWORD env var is required and must be at least 12 characters.');
      console.error('   Set it in .env.local, e.g. OWNER_PASSWORD=<strong-unique> npx tsx src/scripts/create-owner.ts');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const existing = await Models.User.findOne({ username: ownerUsername });
    if (existing) {
      console.log('⚠️  Owner user already exists — leaving the existing password untouched.');
      console.log('📝 Owner:', { username: existing.username, email: existing.email, role: existing.role });
      if (process.env.OWNER_RESET_PASSWORD === 'true') {
        existing.passwordHash = await hashPassword(ownerPassword);
        await existing.save();
        console.log('✅ Owner password reset (OWNER_RESET_PASSWORD=true).');
      } else {
        console.log('ℹ️  To reset it, re-run with OWNER_RESET_PASSWORD=true.');
      }
    } else {
      const passwordHash = await hashPassword(ownerPassword);
      const owner = new Models.User({
        username: ownerUsername,
        email: ownerEmail,
        passwordHash,
        age_group: '15-18',
        role: 'owner',
        selectedCharacter: 'astra',
        onboardingComplete: true,
      });
      await owner.save();
      console.log('✅ Owner user created:', { username: ownerUsername, email: ownerEmail, role: 'owner' });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating owner user:', error);
    process.exit(1);
  }
}

createOwnerUser();
```

- [ ] **Step 2: Verify it typechecks (do NOT run it yet — needs env creds)**

Run: `cd Coderunner-Backend/apps/api && npx tsc --noEmit`
Expected: no output.

### Task 5: Frontend role plumbing

**Files:**
- Modify: `Coderunner-Frontend/web/src/contexts/AuthContext.tsx` (role union + `isOwner`)
- Modify: `Coderunner-Frontend/web/src/components/auth/ProtectedRoute.tsx:11` (`requireRole` union)
- Modify: `Coderunner-Frontend/web/src/app/page.tsx:16-24` (owner dispatch)

- [ ] **Step 1: AuthContext — add owner to the role union + an isOwner flag**

In `AuthContext.tsx`: add `'owner'` to the `User.role` union (the local type near line 8). Add `isOwner: boolean` to `AuthContextType`. In the provider value, set `isOwner: user?.role === 'owner'` (alongside the existing `isDeveloper`/`isTeacher`).

- [ ] **Step 2: ProtectedRoute — widen requireRole**

In `ProtectedRoute.tsx:11`, change the `requireRole` union to include `'owner'`: `requireRole?: 'student' | 'teacher' | 'developer' | 'owner';`

- [ ] **Step 3: page.tsx — dispatch owner before the student fallthrough**

In `app/page.tsx`, inside the `if (isAuthenticated)` block, add (above the `developer` check):

```tsx
      if (user?.role === 'owner') {
        router.push('/oversight/dashboard');
        return;
      }
```

- [ ] **Step 4: Verify frontend typechecks**

Run: `cd Coderunner-Frontend/web && npx tsc --noEmit`
Expected: no output.

### Task 6: Phase 1 panel + commit

- [ ] **Step 1: Run the judge panel** (security + real-environment always-on) on the Phase 1 diff. Fix any surviving HIGH, re-run.
- [ ] **Step 2: Commit**

```bash
git add Coderunner-Backend/packages/shared Coderunner-Backend/apps/api/src/middleware/auth.middleware.ts Coderunner-Backend/apps/api/src/scripts/create-owner.ts Coderunner-Frontend/web/src/contexts/AuthContext.tsx Coderunner-Frontend/web/src/components/auth/ProtectedRoute.tsx Coderunner-Frontend/web/src/app/page.tsx
git commit -m "feat(oversight): add owner role (centralized Role type), ownerMiddleware, seed script"
```

---

## Phase 2 — Data model: `Classroom.schoolId` seam + `Ticket`

### Task 7: Classroom schoolId seam

**Files:**
- Modify: `Coderunner-Backend/packages/shared/src/database/models/Classroom.model.ts`

- [ ] **Step 1: Add the nullable indexed field + interface member**

In `IClassroom` add: `schoolId?: mongoose.Types.ObjectId | null;`
In `ClassroomSchema` (after `teacherIds`) add:

```ts
    // Forward-compat seam for the future School layer (Phase 2). Nullable now.
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null, index: true },
```

- [ ] **Step 2: Verify shared compiles**

Run: `cd Coderunner-Backend/packages/shared && npx tsc --noEmit`
Expected: no output.

### Task 8: Ticket model

**Files:**
- Create: `Coderunner-Backend/packages/shared/src/database/models/Ticket.model.ts`
- Modify: `Coderunner-Backend/packages/shared/src/database/models/index.ts` (export Ticket)

- [ ] **Step 1: Create the model**

```ts
// Coderunner-Backend/packages/shared/src/database/models/Ticket.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export type TicketType = 'bug_report' | 'doubt';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export type TicketTargetRole = 'developer' | 'teacher';

export interface ITicket extends Document {
  type: TicketType;
  status: TicketStatus;
  targetRole: TicketTargetRole;        // derived from type at create
  createdBy: mongoose.Types.ObjectId;  // the student
  classroomId: mongoose.Types.ObjectId | null;
  assignedTo?: mongoose.Types.ObjectId; // claimer (fast-follow)
  title: string;
  description: string;
  firstResponseAt?: Date;              // set on first respond (fast-follow)
  resolvedAt?: Date;                   // set on resolve (fast-follow)
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    type: { type: String, enum: ['bug_report', 'doubt'], required: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
    targetRole: { type: String, enum: ['developer', 'teacher'], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', default: null, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    firstResponseAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'tickets' }
);

TicketSchema.index({ targetRole: 1, status: 1, createdAt: -1 });
TicketSchema.index({ classroomId: 1, status: 1, createdAt: -1 });
TicketSchema.index({ status: 1, createdAt: -1 });

export const Ticket =
  mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);
```

- [ ] **Step 2: Export from the models barrel**

In `models/index.ts`, add (next to the other model exports): `export * from './Ticket.model';` and, if the file also builds a `Models` aggregate object, add `Ticket` to it following the existing pattern.

- [ ] **Step 3: Rebuild shared + verify exports**

Run: `cd Coderunner-Backend/packages/shared && npm run build && npx tsc --noEmit`
Then: `node -e "const {Models}=require('./Coderunner-Backend/packages/shared/dist'); console.log(!!Models.Ticket && !!Models.Classroom)"`
Expected: `true`.

- [ ] **Step 4: Verify api typechecks**

Run: `cd Coderunner-Backend/apps/api && npx tsc --noEmit`
Expected: no output.

- [ ] **Step 5: Panel + commit**

Run the judge panel on the Phase 2 diff; fix HIGHs. Then:

```bash
git add Coderunner-Backend/packages/shared
git commit -m "feat(oversight): Ticket model + Classroom.schoolId forward-compat seam"
```

---

## Phase 3 — SLA config + breach helper

### Task 9: Oversight config (constants, not env)

**Files:**
- Create: `Coderunner-Backend/apps/api/src/config/oversight.config.ts`

- [ ] **Step 1: Create the config + breach helper**

```ts
// Coderunner-Backend/apps/api/src/config/oversight.config.ts
import type { ITicket } from '@code-runner/shared';

/** SLA thresholds (hours). Named constants for launch — promote to env only if retuning-without-deploy is ever needed. */
export const SLA_HOURS = { bug_report: 48, doubt: 24 } as const;

/**
 * Delay/breach is anchored to ticket CREATION (never resets on first response),
 * so a ticket left unresolved always keeps climbing on the radar.
 */
export function computeTicketDelay(ticket: Pick<ITicket, 'type' | 'status' | 'resolvedAt' | 'createdAt'>) {
  const end = ticket.status === 'resolved' && ticket.resolvedAt ? new Date(ticket.resolvedAt) : new Date();
  const delayHours = (end.getTime() - new Date(ticket.createdAt).getTime()) / 3_600_000;
  const threshold = SLA_HOURS[ticket.type];
  const isBreached = ticket.status !== 'resolved' && delayHours > threshold;
  return { delayHours: Math.round(delayHours * 10) / 10, isBreached, thresholdHours: threshold };
}
```

- [ ] **Step 2: Verify**

Run: `cd Coderunner-Backend/apps/api && npx tsc --noEmit`
Expected: no output.

---

## Phase 4 — Student ticket creation (`POST /tickets`)

### Task 10: tickets.routes.ts

**Files:**
- Create: `Coderunner-Backend/apps/api/src/routes/tickets.routes.ts`
- Modify: `Coderunner-Backend/apps/api/src/index.ts` (import + mount)

- [ ] **Step 1: Create the route**

```ts
// Coderunner-Backend/apps/api/src/routes/tickets.routes.ts
import { Router, Request, Response } from 'express';
import { Models } from '@code-runner/shared';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

// POST /tickets — a student raises a bug report (→ developer) or a doubt (→ teacher).
// Scope (createdBy, classroomId) and targetRole are stamped SERVER-SIDE; the client
// cannot forge them, nor set status/assignedTo.
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Forbidden', message: 'Students only' });
    }
    const { type, title, description } = req.body ?? {};
    if (type !== 'bug_report' && type !== 'doubt') {
      return res.status(400).json({ error: 'Bad request', message: 'type must be bug_report or doubt' });
    }
    if (!title || !description || typeof title !== 'string' || typeof description !== 'string') {
      return res.status(400).json({ error: 'Bad request', message: 'title and description are required' });
    }

    const student = await Models.User.findById(req.user.userId).select('classroomId').lean();
    const targetRole = type === 'bug_report' ? 'developer' : 'teacher';

    const ticket = await Models.Ticket.create({
      type,
      targetRole,
      status: 'open',
      createdBy: req.user.userId,
      classroomId: student?.classroomId ?? null,
      title: title.slice(0, 140),
      description: description.slice(0, 4000),
    });

    return res.status(201).json({ id: ticket._id, status: ticket.status });
  } catch (error) {
    console.error('[Tickets] create failed:', error);
    return res.status(500).json({ error: 'Internal error', message: 'Could not create ticket' });
  }
});

export default router;
```

- [ ] **Step 2: Mount it**

In `apps/api/src/index.ts`: add `import ticketsRoutes from './routes/tickets.routes';` with the other route imports, and `app.use('/tickets', ticketsRoutes);` in the routes block (near line 270).

- [ ] **Step 3: Verify**

Run: `cd Coderunner-Backend/apps/api && npx tsc --noEmit`
Expected: no output.

---

## Phase 5 — Oversight aggregations (`GET /oversight/groups`, `GET /oversight/tickets`)

### Task 11: oversight.routes.ts

**Files:**
- Create: `Coderunner-Backend/apps/api/src/routes/oversight.routes.ts`
- Modify: `Coderunner-Backend/apps/api/src/index.ts` (import + mount)

- [ ] **Step 1: Create the route**

```ts
// Coderunner-Backend/apps/api/src/routes/oversight.routes.ts
import { Router, Request, Response } from 'express';
import { Models } from '@code-runner/shared';
import { authMiddleware, ownerMiddleware } from '../middleware/auth.middleware';
import { computeTicketDelay } from '../config/oversight.config';

const router = Router();
router.use(authMiddleware);
router.use(ownerMiddleware);

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// GET /oversight/groups — one row per classroom: counts, active-today, level distribution.
// `schoolId` scope is the Phase-2 seam: defaults to "all classrooms".
router.get('/groups', async (_req: Request, res: Response) => {
  try {
    const classrooms = await Models.Classroom.find({}).select('name age_group teacherIds').lean();
    const since = new Date(Date.now() - ONE_DAY_MS);

    const rows = await Promise.all(
      classrooms.map(async (c: any) => {
        // Current members (NOT the snapshot stamped on attempts).
        const studentIds = await Models.User.find({ role: 'student', classroomId: c._id }).distinct('_id');
        const studentCount = studentIds.length;

        const activeUserIds = studentCount
          ? await Models.StudentAttempt.distinct('userId', { userId: { $in: studentIds }, createdAt: { $gte: since } })
          : [];

        // Level distribution L1..L4 from UserProgress of the current members.
        const levelDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
        if (studentCount) {
          const progresses = await Models.UserProgress.find({ userId: { $in: studentIds } }).select('level').lean();
          for (const p of progresses) {
            const lvl = Math.max(1, Math.min(4, Number(p.level) || 1));
            levelDist[lvl] = (levelDist[lvl] || 0) + 1;
          }
        }

        return {
          classroomId: String(c._id),
          name: c.name,
          ageGroup: c.age_group,
          teacherCount: Array.isArray(c.teacherIds) ? c.teacherIds.length : 0,
          studentCount,
          activeToday: activeUserIds.length, // = submitted a graded attempt in 24h
          levelDistribution: levelDist,
        };
      })
    );

    return res.json({ groups: rows });
  } catch (error) {
    console.error('[Oversight] groups failed:', error);
    return res.status(500).json({ error: 'Internal error', message: 'Could not load groups' });
  }
});

// GET /oversight/tickets?status=&type= — read-only radar with computed delay/breach.
router.get('/tickets', async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const tickets = await Models.Ticket.find(filter).sort({ createdAt: -1 }).limit(500)
      .populate('createdBy', 'username')
      .populate('classroomId', 'name')
      .lean();

    const rows = tickets.map((t: any) => ({
      id: String(t._id),
      type: t.type,
      status: t.status,
      targetRole: t.targetRole,
      title: t.title,
      student: t.createdBy?.username ?? 'Unknown',
      classroom: t.classroomId?.name ?? null,
      createdAt: t.createdAt,
      ...computeTicketDelay(t),
    }));

    return res.json({ tickets: rows });
  } catch (error) {
    console.error('[Oversight] tickets failed:', error);
    return res.status(500).json({ error: 'Internal error', message: 'Could not load tickets' });
  }
});

export default router;
```

- [ ] **Step 2: Mount it**

In `apps/api/src/index.ts`: add `import oversightRoutes from './routes/oversight.routes';` and `app.use('/oversight', oversightRoutes);` in the routes block.

- [ ] **Step 3: Verify**

Run: `cd Coderunner-Backend/apps/api && npx tsc --noEmit`
Expected: no output.

- [ ] **Step 4: Endpoint smoke test (manual, with the api running locally)**

Start the api locally. With a seeded owner token:
- `GET /oversight/groups` → `{ groups: [...] }`, one entry per classroom, sane counts.
- `GET /oversight/tickets` → `{ tickets: [] }` initially.
- As a STUDENT token, `POST /tickets {type:'doubt',title:'t',description:'d'}` → `201`. Then owner `GET /oversight/tickets` shows it with `targetRole:'teacher'`, `isBreached:false`.
- As an owner token, `POST /tickets` → `403`. As a student, `GET /oversight/groups` → `403`.

- [ ] **Step 5: Panel + commit**

Run the judge panel on the Phase 3-5 diff (security: confirm student can't forge scope, owner gate holds; real-env: the membership-join active count, no N+1 surprise). Fix HIGHs. Then:

```bash
git add Coderunner-Backend/apps/api/src/config/oversight.config.ts Coderunner-Backend/apps/api/src/routes/tickets.routes.ts Coderunner-Backend/apps/api/src/routes/oversight.routes.ts Coderunner-Backend/apps/api/src/index.ts
git commit -m "feat(oversight): POST /tickets + GET /oversight/groups,/tickets (read-only radar)"
```

---

## Phase 6 — Frontend API client

### Task 12: api-client namespaces

**Files:**
- Modify: `Coderunner-Frontend/web/src/lib/api-client.ts`

- [ ] **Step 1: Add the oversight + tickets namespaces**

Following the existing `api.leaderboard` / `api.teacher` module pattern in `api-client.ts`, add two namespaces to the `api` object:

```ts
  oversight: {
    getGroups: () => apiClient.get('/oversight/groups'),
    getTickets: (params?: { status?: string; type?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.type) q.append('type', params.type);
      return apiClient.get(`/oversight/tickets?${q.toString()}`);
    },
  },
  tickets: {
    create: (data: { type: 'bug_report' | 'doubt'; title: string; description: string }) =>
      apiClient.post('/tickets', data),
  },
```

(Use the same `apiClient.get/post` helpers the other namespaces use. If `apiClient.post` isn't present, mirror how an existing POST namespace like `api.store` calls it.)

- [ ] **Step 2: Verify**

Run: `cd Coderunner-Frontend/web && npx tsc --noEmit`
Expected: no output.

---

## Phase 7 — Oversight UI (shell + Groups + read-only Radar)

### Task 13: DelayBadge (smallest unit first)

**Files:**
- Create: `Coderunner-Frontend/web/src/app/oversight/components/DelayBadge.tsx`

- [ ] **Step 1: Create the badge**

```tsx
'use client';

export function DelayBadge({ delayHours, isBreached }: { delayHours: number; isBreached: boolean }) {
  const label = delayHours >= 24 ? `${Math.floor(delayHours / 24)}d` : `${Math.round(delayHours)}h`;
  const color = isBreached ? '#dc2626' : delayHours >= 12 ? '#d97706' : '#16a34a';
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-orbitron font-bold"
      style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}55` }}
    >
      {isBreached ? `BREACHED · ${label}` : label}
    </span>
  );
}
```

- [ ] **Step 2: Verify** — `cd Coderunner-Frontend/web && npx tsc --noEmit` → no output.

### Task 14: OverviewShell (route gate + sidebar)

**Files:**
- Create: `Coderunner-Frontend/web/src/app/oversight/layout.tsx`
- Create: `Coderunner-Frontend/web/src/app/oversight/components/OverviewShell.tsx`

- [ ] **Step 1: Layout** — mirror `Coderunner-Frontend/web/src/app/teacher/layout.tsx` exactly, swapping the role and shell:

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { OverviewShell } from './components/OverviewShell';

export default function OversightLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireRole="owner">
      <OverviewShell>{children}</OverviewShell>
    </ProtectedRoute>
  );
}
```

(Match the exact import style of the existing teacher layout — default vs named `ProtectedRoute`.)

- [ ] **Step 2: Shell** — create `OverviewShell.tsx` modeled on `teacher/components/TeacherShell.tsx` (read it first). Sidebar nav with two links: `{ href: '/oversight/dashboard', label: 'Groups' }`, `{ href: '/oversight/tickets', label: 'Accountability' }`. Reuse the same dark sidebar styling, `font-orbitron` labels, and logout action as TeacherShell. No new color classes; follow its convention.

- [ ] **Step 3: Verify** — `cd Coderunner-Frontend/web && npx tsc --noEmit` → no output.

### Task 15: Groups Overview page

**Files:**
- Create: `Coderunner-Frontend/web/src/app/oversight/dashboard/page.tsx`
- Create: `Coderunner-Frontend/web/src/app/oversight/components/GroupsOverviewPanel.tsx`

- [ ] **Step 1: Panel** — `GroupsOverviewPanel.tsx`: `'use client'`, fetch via `api.oversight.getGroups()` in a `useEffect` with loading/error/empty states (mirror the pattern in `app/rank/page.tsx`). Render a table, one row per group: name, age group, `teacherCount`, `studentCount`, `activeToday`, and a small level-distribution bar built from `levelDistribution` (L1–L4 segment widths). Show an amber "No activity today" badge when `activeToday === 0`. Reuse `Card`/`Badge` from `@/components/ui`; style headings `font-orbitron` like the developer dashboard's `ArchLayer` cards (read `app/admin/dashboard/page.tsx` for the visual convention). Type the row with a local interface matching the `/oversight/groups` response.

- [ ] **Step 2: Page** — `dashboard/page.tsx`: `'use client'`, render `<GroupsOverviewPanel />` inside the standard page padding wrapper.

- [ ] **Step 3: Verify** — `cd Coderunner-Frontend/web && npx tsc --noEmit` → no output.

### Task 16: Accountability Radar page (read-only)

**Files:**
- Create: `Coderunner-Frontend/web/src/app/oversight/tickets/page.tsx`
- Create: `Coderunner-Frontend/web/src/app/oversight/components/AccountabilityPanel.tsx`

- [ ] **Step 1: Panel** — `AccountabilityPanel.tsx`: `'use client'`, fetch via `api.oversight.getTickets()`. Two columns: **Bug Reports** (`targetRole==='developer'`) and **Doubts** (`targetRole==='teacher'`). Each column header shows open count + breached count. Each row (inline `TicketRow` helper, no separate file) shows student, classroom, title, created-time, status, and `<DelayBadge delayHours isBreached />`. A filter bar at top: All / Open / Breached (client-side filter; "Breached" = `isBreached === true`). Loading/error/empty states like the groups panel. Local interface matches the `/oversight/tickets` response.

- [ ] **Step 2: Page** — `tickets/page.tsx`: `'use client'`, render `<AccountabilityPanel />`.

- [ ] **Step 3: Verify** — `cd Coderunner-Frontend/web && npx tsc --noEmit` → no output.

- [ ] **Step 4: Panel + commit**

Run the frontend-seated judge panel on the Phase 6-7 diff. Fix HIGHs. Then:

```bash
git add Coderunner-Frontend/web/src/lib/api-client.ts Coderunner-Frontend/web/src/app/oversight
git commit -m "feat(oversight): owner UI — shell, Groups overview, read-only Accountability radar"
```

---

## Phase 8 — Student "Report a bug / Ask a doubt" buttons

### Task 17: Report modal + entry buttons

**Files:**
- Create: `Coderunner-Frontend/web/src/components/support/ReportModal.tsx`
- Modify: a student-visible mount point (see Step 2)

- [ ] **Step 1: Modal** — `ReportModal.tsx`: `'use client'`. Props `{ type: 'bug_report' | 'doubt'; open: boolean; onClose: () => void }`. A free-text form (title + description). On submit, call `api.tickets.create({ type, title, description })`, show a success toast/inline confirmation, and close. Header copy reflects the type ("Report a bug" → developer / "Ask a doubt" → your teacher). Disable submit while pending. Reuse the existing modal/dialog primitive in `@/components/ui` (check for `dialog`/`popover`); otherwise a simple fixed overlay matching the app's modal style. No interpolated Tailwind color classes.

- [ ] **Step 2: Mount the two entry buttons** — add a small, always-available control in the student app. Recommended placement: a compact pair of buttons in the student `Header` (`components/layout/Header.tsx`) user area, visible only when `user?.role === 'student'`, opening `ReportModal` with the matching `type`. (If the owner prefers a global floating button instead, place a fixed bottom-right launcher in the authenticated student layout — confirm placement before building, per spec §6.)

- [ ] **Step 3: Verify** — `cd Coderunner-Frontend/web && npx tsc --noEmit` → no output.

- [ ] **Step 4: Panel + commit**

Run the frontend-seated judge panel. Fix HIGHs. Then:

```bash
git add Coderunner-Frontend/web/src/components/support Coderunner-Frontend/web/src/components/layout/Header.tsx
git commit -m "feat(support): student Report-a-bug / Ask-a-doubt buttons create tickets"
```

---

## Phase 9 — Seed the owner + end-to-end smoke

### Task 18: Seed + verify the full loop

- [ ] **Step 1: Seed the owner account** — the user sets `OWNER_USERNAME/OWNER_EMAIL/OWNER_PASSWORD` in `Coderunner-Backend/apps/api/.env.local` (git-ignored), then runs:
`cd Coderunner-Backend/apps/api && npx tsx src/scripts/create-owner.ts`
Expected: "Owner user created" (or "already exists").

- [ ] **Step 2: End-to-end** — log in as the owner in the web app → lands on `/oversight/dashboard` → Groups shows real classrooms → as a student, submit a doubt and a bug via the buttons → owner's Accountability radar shows both in the right columns with delay badges.

- [ ] **Step 3: Final commit (if any cleanup)** — none expected; the feature is shipped across the phase commits above.

---

## Deploy note (when promoting to the server)

Rebuild order on every PM2 host: **`packages/shared` build → restart api → restart runner** (DO_NOT_DISTURB #5). The new `Ticket` model and `Classroom.schoolId` only exist in `dist/` after the shared build.

---

## Fast-follow (NOT in this plan — tracked for next)

`PATCH /tickets/:id/respond` + `/resolve` with a shared `ownsTicket()` IDOR guard; `TeacherActivity` model + upsert in `GET /teacher/students/:id`; `GET /oversight/health/{students,teachers,developers}` + the three health panels. Phase 2 (separate spec): the `School` layer above classrooms.
