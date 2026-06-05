# Admin / Owner Oversight — Design Spec

> **Created:** 2026-06-05 · **Status:** approved design, pre-implementation
> **Author:** brainstormed with the owner; architecture by code-architect agent; validated by the 5-judge panel (8 findings folded in).
> **Launch target:** ~June 15, 2026. This spec defines the **launch cut** and the **fast-follow** explicitly.

## 1. Purpose

A new top-tier **oversight** surface for the platform owner. It does not do work — it is a **"where is it stuck / who's lagging" radar** across the three working roles:

- **Groups** — per-classroom overview: how many teachers, how many students, how many active, overall level progress. Glanceable "what's going on."
- **Accountability** — two student-initiated streams, each with a responder the owner holds accountable:
  - 🐞 **Bug report → developer** — is the developer acting, or is it sitting (delayed)?
  - ❓ **Doubt → teacher** — is the teacher responding, or ignoring it (delayed)?
- **Per-role health** (fast-follow) — student engagement (active vs gone quiet, progressing vs stuck), teacher responsiveness, developer responsiveness.

The engine underneath is **one Ticket model with timestamps**; "delay" is *time since creation with no resolution*, computed at query time.

## 2. Key decisions (owner-approved)

- **Role name = `owner`** (not `admin`). The existing `/admin/*` area is the **developer** infra console, and a prior `admin` role was already migrated to `developer` (`migrate-admin-to-developer.ts`). The oversight UI lives at a **new `/oversight/*`** route. No collision.
- **Launch cut = tight.** Ship: owner login + Groups Overview + read-only Accountability Radar + the student "Report a bug / Ask a doubt" buttons that create tickets. **Fast-follow:** per-role health panels, teacher/developer respond+resolve actions, teacher review-activity tracking.
- **Forward-compatible to a future School layer** (Phase 2) via a single seam: `Classroom.schoolId` (nullable, indexed). No rewrite later.

## 3. Architecture

### 3.1 Role as a centralized type (panel fix #2)

`role` is currently a hardcoded string union duplicated across many files. Adding `owner` ad-hoc would leave unhandled-role gaps (e.g. the root dispatch in `page.tsx` would drop the owner into the student flow; `AuthToken`/`AuthResponse` unions would reject owner tokens).

**Fix:** introduce a single source of truth in `packages/shared`:

```ts
// packages/shared/src/types/roles.ts  (new)
export const ROLES = ['student', 'teacher', 'developer', 'owner'] as const;
export type Role = typeof ROLES[number];
```

Then **derive** every consumer from it. All consumers to update (complete list — contract-drift safe):

| File | Change |
|---|---|
| `packages/shared/src/types/roles.ts` | **NEW** — `ROLES` + `Role` |
| `packages/shared/src/database/models/User.model.ts` | `role` enum ← `[...ROLES]`; `IUser.role: Role` |
| `packages/shared/src/types/user.types.ts` | `User.role`, `AuthToken.role`, `AuthResponse…role` ← `Role` (3 unions) |
| `Coderunner-Frontend/web/src/contexts/AuthContext.tsx` | `User.role` union ← include `owner`; add `isOwner` flag |
| `Coderunner-Frontend/web/src/components/auth/ProtectedRoute.tsx` | `requireRole` union ← include `owner` |
| `Coderunner-Frontend/web/src/app/page.tsx` | add `owner → /oversight/dashboard` dispatch arm **before** the student fallthrough |
| `Coderunner-Frontend/web/src/app/(auth)/login/page.tsx`, `app/home/page.tsx` | confirm non-student redirect routes the owner correctly (don't loop back to student flow) |
| `Coderunner-Backend/apps/api/src/middleware/auth.middleware.ts` | **add `ownerMiddleware`** (exact `role==='owner'`); do **not** overload `staffMiddleware` |

Every `switch (role)` gets an explicit `owner` arm or a default guard.

### 3.2 Forward-compat seam (panel fix #5)

One nullable indexed field on the entity that owns the school relationship:

```ts
// Classroom.model.ts
schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null, index: true }
```

`schoolId` is **NOT** denormalized onto Ticket/TeacherActivity — school is derived via the classroom join when Phase 2 needs it. Every Phase-1 oversight aggregation takes an optional `schoolId` scope variable (null in Phase 1 = all classrooms); Phase 2 passes a real id. Additive, no rewrite.

## 4. Data model

### 4.1 Ticket (new) — the engine

`packages/shared/src/database/models/Ticket.model.ts`:

```ts
type TicketType = 'bug_report' | 'doubt';
type TicketStatus = 'open' | 'in_progress' | 'resolved';   // 'closed' removed (was unreachable — panel #6)
type TicketTargetRole = 'developer' | 'teacher';

interface ITicket {
  type: TicketType;
  status: TicketStatus;
  targetRole: TicketTargetRole;        // derived from type at create: bug_report→developer, doubt→teacher
  createdBy: ObjectId;                 // the student (server-stamped, never from body)
  classroomId: ObjectId | null;        // student's current classroom (server-stamped)
  assignedTo?: ObjectId;               // teacher/developer who claimed it (fast-follow)
  title: string;
  description: string;
  createdAt: Date;                     // timestamps:true
  firstResponseAt?: Date;              // set on first respond (fast-follow)
  resolvedAt?: Date;                   // set on resolve (fast-follow)
}
```

Indexes: `{classroomId,status,createdAt}`, `{targetRole,status,createdAt}`, `{createdBy,createdAt}`, `{status,createdAt}`.

**Lifecycle guards (panel #6):** `respond` allowed only from `open` (reject if `firstResponseAt` already set, sets `in_progress`); `resolve` allowed only from `in_progress` (sets `resolvedAt`). No reopen, no double-fire. (respond/resolve are fast-follow; the model+guards are defined now so the launch read-only radar is forward-correct.)

**Breach / delay math (panel #6 — measured from creation, never resets):**

```
resolutionDelayHours = ((resolvedAt ?? now) - createdAt) / 3_600_000
isBreached = status !== 'resolved' && resolutionDelayHours > threshold(type)
```

Anchoring on `createdAt → resolved` means a ticket answered quickly but left unresolved **still trips the radar**. Computed at query time; nothing stored. Thresholds are **named constants** for launch (`BUG_SLA_HOURS = 48`, `DOUBT_SLA_HOURS = 24`) in one small module — not env vars (panel: YAGNI). Promote to env later only if retuning-without-deploy is actually needed.

### 4.2 Reused data — NO new fields (panel fixes #3, #4)

- **Student last-active / "gone quiet":** derived at query time from `UserProgress.recentActivity[0].timestamp || updatedAt` — the exact derivation `buildClassData` already uses (`teacher.routes.ts:114`). **No new `lastActiveAt` field** (it would re-introduce the roster/profile drift killed in commit `30c0334`).
- **"Active today" (correct version):** join **current membership** to attempts — get the class's current student ids (`User.find({role:'student', classroomId})`), then `StudentAttempt.distinct('userId', {userId:{$in:ids}, createdAt:{$gte:since}})`. Immune to membership churn / class deletion; uses the existing `{userId,createdAt}` index. **Do NOT** key off the attempt's stamped `classroomId` (it's a point-in-time snapshot → undercounts/mis-attributes).
- **Level progress / counts:** reuse the `buildClassData` aggregation pattern (`teacher.routes.ts:72`). **`teacherCount` from `Classroom.teacherIds.length`** (single source of truth), not `User.classroomId`.

### 4.3 TeacherActivity (fast-follow only)

Deferred entirely to fast-follow. When built: a small collection upserted in `GET /teacher/students/:id`, `{teacherId, classroomId, lastReviewedAt, reviewCount}`. Not in the launch cut.

## 5. API surface — launch cut

New router `apps/api/src/routes/oversight.routes.ts` (`authMiddleware` + `ownerMiddleware`), and ticket creation in `apps/api/src/routes/tickets.routes.ts`.

| Method | Path | Gate | Launch? | Description |
|---|---|---|---|---|
| `GET` | `/oversight/groups` | owner | ✅ | Per-classroom: name, age_group, teacherCount, studentCount, activeToday, level distribution |
| `GET` | `/oversight/tickets` | owner | ✅ | All tickets + computed `resolutionDelayHours`, `isBreached`; filter `?status=&type=` |
| `POST` | `/tickets` | student (authMiddleware + in-handler `role==='student'`) | ✅ | Create bug_report/doubt; server-stamps `createdBy`, `classroomId`, derives `targetRole`; ignores client-supplied status/assignedTo/targetRole |
| `PATCH` | `/tickets/:id/respond` | staff + `ownsTicket()` | fast-follow | Claim, set firstResponseAt, →in_progress |
| `PATCH` | `/tickets/:id/resolve` | staff + `ownsTicket()` | fast-follow | Set resolvedAt, →resolved |
| `GET` | `/oversight/health/*` | owner | fast-follow | Student/teacher/developer health |

**Consumers to update:** `apps/api/src/index.ts` (mount `/oversight` + `/tickets`). Fast-follow only: `teacher.routes.ts` (TeacherActivity upsert).

**Security (panel #7):**
- `ownsTicket(req, ticket)` shared helper (fast-follow respond/resolve): teacher must own the ticket's classroom (`Classroom.find({teacherIds:me})`) AND `role==='teacher'` for `targetRole==='teacher'`; developer for `targetRole==='developer'`. 403 otherwise. Mirrors existing `myClassroom`/`myStudent`.
- `ownerMiddleware` re-verifies role against the DB (one cheap indexed `findById().select('role')`) — the owner is the highest-privilege credential and JWT role is trusted for 7 days otherwise.
- Owner is **seeded only** via `create-owner.ts` (env creds, mirrors `create-admin.ts`); `POST /auth/register` hardcodes `student` — owner can never self-register.

## 6. Frontend — launch cut

```
web/src/app/oversight/
  layout.tsx              — <ProtectedRoute requireRole="owner"><OverviewShell>
  dashboard/page.tsx      — GroupsOverviewPanel
  tickets/page.tsx        — AccountabilityPanel (read-only radar)
  components/
    OverviewShell.tsx      — sidebar nav (mirrors TeacherShell), nav: Groups · Accountability
    GroupsOverviewPanel.tsx
    AccountabilityPanel.tsx  (TicketRow + DelayBadge as inline helpers — panel #8 keeps it lean)
```

- **GroupsOverviewPanel:** table, one row per classroom — name, age group, teachers, students, active-today, level-distribution mini-bar, "no activity" warning badge. Reuses `Card`/`Badge`/`Progress`; styled like the dashboard `ArchLayer`.
- **AccountabilityPanel (read-only):** two columns Bug Reports | Doubts; per column: open count + breached count; each `TicketRow` shows student, classroom, title, created-time, status, `DelayBadge` (amber "2h" / red "BREACHED"). Filter: All / Open / Breached.
- `AuthContext` gains `isOwner`; `api-client.ts` gains `api.oversight.*` (getGroups, getTickets) and `api.tickets.create`.

**Student ticket buttons (launch):** the existing student app gets two entry points — **"Report a bug"** (→ developer) and **"Ask a doubt"** (→ teacher) — opening a free-text modal that calls `api.tickets.create`. (Placement to confirm during implementation; the back-to-arena header and editor are natural homes.)

## 7. Forward-compat — School (Phase 2, not now)

Additive only: new `School.model.ts` `{name, orgId, adminIds[]}`; `POST/GET /oversight/schools`; assign classrooms via `Classroom.schoolId`; oversight routes gain an optional `?schoolId=` that flows into the already-present scope variable; a "Schools" nav rolls classrooms up under schools. **Nothing in the ticket model, health queries, or existing routes changes.**

## 8. Launch cut vs fast-follow — summary

**Launch:** `Role` centralization + `owner` role + `ownerMiddleware` + `create-owner.ts`; `Ticket` model (+ lifecycle guards/breach math) exported & shared rebuilt; `POST /tickets`; `GET /oversight/groups` (reusing `buildClassData`); `GET /oversight/tickets` (read-only); `Classroom.schoolId` seam; the `/oversight` shell + Groups + read-only Radar; student bug/doubt buttons.

**Fast-follow:** `PATCH respond/resolve` + `ownsTicket()`; `TeacherActivity` + upsert; `GET /oversight/health/{students,teachers,developers}` + the three health panels.

## 9. Deploy ordering (panel #7, DO_NOT_DISTURB #5)

New shared models/fields require: **rebuild `packages/shared` → restart api → restart runner**, in that order, on every PM2 host. Add fields to interfaces (`IUser`, `IClassroom`) too, or `tsc --noEmit` fails. Verify `dist/database/models/index.js` exports `Ticket` post-build.

## 10. Resolved risks / open items

- Multi-teacher classroom: a doubt is unassigned until a teacher claims it (`assignedTo` nullable) — first-to-respond wins. (Fast-follow.)
- `age_group` is required on `User`; `create-owner.ts` stamps `'15-18'` like `create-admin.ts`.
- Null-classroom tickets (student not yet joined): `$match` them out of group aggregations or surface an "Unassigned" bucket.
- "Active today" label: surface precisely (it means "submitted a graded attempt today").

## 11. Review process

Each implementation phase is gated by the domain-seated judge panel (security + real-environment always-on) and `tsc --noEmit` before commit, per the established process.
