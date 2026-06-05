# Owner Oversight — Complete Features (increment 2) Implementation Plan

> **For agentic workers:** execute task-by-task; `tsc --noEmit` + judge panel gate each phase before commit. Branch: `feat/owner-features` (off master @ the launch-cut merge).

**Goal:** Finish the owner oversight vision — the three per-role **health panels**, ticket **respond/resolve** (so work actually moves), and **teacher-activity tracking** — handled in each role's own area (teacher→/teacher, developer→/admin), watched by owner→/oversight.

**Builds on:** spec `docs/superpowers/specs/2026-06-05-admin-oversight-design.md` (fast-follow section) + the shipped launch cut (Ticket model, ownerMiddleware, /oversight).

**Verifier:** `npx tsc --noEmit` (no unit runner). Rebuild `packages/shared` after model edits. Panel before each phase commit. No leftover console.log; no interpolated Tailwind color classes.

**Existing patterns to follow (verified):**
- Ownership helpers `myClassroom(req,id)` / `myStudent(req,id)` — `teacher.routes.ts:22-36`. Model `ownsTicket` on these.
- `GET /teacher/students/:id` handler — `teacher.routes.ts:286` (hook the TeacherActivity upsert here).
- `buildClassData` aggregation — `teacher.routes.ts:72`.
- Teacher UI: `TeacherShell.tsx` (nav) + pages under `app/teacher/`. Add an Inbox page + nav item.
- Developer UI: `app/admin/layout.tsx` (ProtectedRoute requireRole="developer") + `AdminHeader.tsx` nav (`{href,label,icon}` list) + pages under `app/admin/`. Add a Tickets page + nav item.
- Owner UI: `OverviewShell.tsx` nav + panels under `app/oversight/components/`. Add a Health page + nav item.
- `staffMiddleware` (teacher OR developer) — `auth.middleware.ts:68`.

---

## Phase 1 — Backend: respond/resolve + teacher/dev ticket lists + TeacherActivity

### Task 1: TeacherActivity model
**Files:** Create `packages/shared/src/database/models/TeacherActivity.model.ts`; modify `models/index.ts`.

```ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacherActivity extends Document {
  teacherId: mongoose.Types.ObjectId;
  classroomId: mongoose.Types.ObjectId | null;
  studentId: mongoose.Types.ObjectId;   // last student profile viewed
  lastReviewedAt: Date;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherActivitySchema = new Schema<ITeacherActivity>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', default: null },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastReviewedAt: { type: Date, default: Date.now },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'teacher_activity' }
);
// One row per teacher↔student pair; upsert bumps it.
TeacherActivitySchema.index({ teacherId: 1, studentId: 1 }, { unique: true });

export const TeacherActivity =
  mongoose.models.TeacherActivity || mongoose.model<ITeacherActivity>('TeacherActivity', TeacherActivitySchema);
```
Export `{ TeacherActivity }` from `models/index.ts`. Rebuild shared. Verify `Models.TeacherActivity` resolves + api tsc clean.

### Task 2: Hook the activity upsert into the existing student-profile view
**File:** modify `apps/api/src/routes/teacher.routes.ts:286` (`GET /students/:id`), AFTER the `myStudent` ownership check passes (so only legit views count). Add (non-blocking, fire-and-forget so it never breaks the response):
```ts
    // Record that this teacher reviewed this student (powers the owner Teacher-health panel).
    Models.TeacherActivity.findOneAndUpdate(
      { teacherId: req.user!.userId, studentId: user._id },
      { $set: { lastReviewedAt: new Date(), classroomId: user.classroomId ?? null }, $inc: { reviewCount: 1 } },
      { upsert: true }
    ).catch(() => { /* activity logging is best-effort */ });
```
Verify api tsc clean. (No response-shape change — contract safe.)

### Task 3: `ownsTicket` guard + respond/resolve + teacher/dev ticket lists
**File:** modify `apps/api/src/routes/tickets.routes.ts`. Add `staffMiddleware` import. Add a helper and four routes (all after the existing `POST /`).

```ts
import { authMiddleware, staffMiddleware } from '../middleware/auth.middleware';
import { computeTicketDelay } from '../config/oversight.config';
import mongoose from 'mongoose';

// A staff member may act on a ticket only if it's theirs to handle:
// developer → any bug_report; teacher → a doubt in a classroom they teach.
async function ownsTicket(req: Request, ticket: any): Promise<boolean> {
  const role = req.user!.role;
  if (ticket.targetRole === 'developer') return role === 'developer';
  if (ticket.targetRole === 'teacher') {
    if (role !== 'teacher') return false;
    if (!ticket.classroomId) return false;
    const me = new mongoose.Types.ObjectId(req.user!.userId);
    return !!(await Models.Classroom.exists({ _id: ticket.classroomId, teacherIds: me }));
  }
  return false;
}
```

`PATCH /:id/respond` (staffMiddleware): load ticket → 404 if none → `ownsTicket` else 403 → guard transition (only from `open`; reject if `firstResponseAt` already set) → set `firstResponseAt=now`, `status='in_progress'`, `assignedTo=req.user.userId` → save → return `{id,status}`.

`PATCH /:id/resolve` (staffMiddleware): load → 404 → `ownsTicket` else 403 → guard (only from `in_progress`) → set `resolvedAt=now`, `status='resolved'` → save → `{id,status}`.

`GET /mine` (staffMiddleware): the staff member's work queue.
- developer → `Ticket.find({ targetRole:'developer' })` (all bugs).
- teacher → doubts in my classrooms: `const myClassIds = await Classroom.find({ teacherIds: me }).distinct('_id'); Ticket.find({ targetRole:'teacher', classroomId: { $in: myClassIds } })`.
- sort `createdAt:-1`, limit 200, populate `createdBy username` + `classroomId name`, map with `computeTicketDelay`, return `{ tickets: [...] }` (same row shape as `/oversight/tickets`).

Validate: a teacher only ever sees/acts on doubts in their classrooms; a developer only bugs. Body never sets status/assignedTo/targetRole directly (only the transition routes mutate them). Verify api tsc clean.

### Task 4: Owner health endpoints
**File:** modify `apps/api/src/routes/oversight.routes.ts` (already owner-gated). Add three GETs.

`GET /health/students` — across all current students: bucket by last-active (from `UserProgress.recentActivity[0].timestamp || updatedAt`): **active** ≤7d, **quiet** 7–14d, **silent** >14d. Per student row: username, classroom name, lastActive, totalSolved, acceptanceRate (from UserProgress.stats). Return `{ buckets: {active,quiet,silent}, students: [...] }` (cap 500).

`GET /health/teachers` — per teacher (`User.find({role:'teacher'})`): username, classroom count (`Classroom.countDocuments({teacherIds:t._id})`), lastReviewedAt + total reviewCount (sum from TeacherActivity), open-doubt backlog (`Ticket.countDocuments({targetRole:'teacher', status:{$ne:'resolved'}, classroomId:{$in: their class ids}})`). Return `{ teachers: [...] }`.

`GET /health/developers` — aggregate over bug tickets: totalOpen (`status≠resolved`), breached count (compute via `computeTicketDelay`), avgResolutionHours (mean of `resolvedAt-createdAt` over resolved bugs), oldest 5 open bugs (id, title, delayHours). Return `{ summary:{...}, oldestOpen:[...] }`.

Verify api tsc clean.

### Task 5: api-client + Phase-1 panel + commit
**File:** modify `web/src/lib/api-client.ts`. Extend `api.tickets` with `respond(id)`, `resolve(id)`, `mine()`; add `api.oversight.getStudentHealth/getTeacherHealth/getDeveloperHealth`.
```ts
  // in api.tickets:
  respond: (id: string) => apiClient.patch(`/tickets/${id}/respond`, {}),
  resolve: (id: string) => apiClient.patch(`/tickets/${id}/resolve`, {}),
  mine: () => apiClient.get('/tickets/mine'),
  // in api.oversight:
  getStudentHealth: () => apiClient.get('/oversight/health/students'),
  getTeacherHealth: () => apiClient.get('/oversight/health/teachers'),
  getDeveloperHealth: () => apiClient.get('/oversight/health/developers'),
```
(Confirm `apiClient.patch` exists; if not, mirror an existing PATCH/PUT call.) Verify web tsc clean.
Run the judge panel (security: ownsTicket IDOR, transition guards, owner gate; correctness: health math; real-env: tsc, indexes). Rebuild shared. Commit:
```
feat(oversight): respond/resolve + ownsTicket guard, teacher/dev ticket lists, TeacherActivity, health endpoints
```

---

## Phase 2 — Teacher Inbox UI (handle doubts in /teacher)

### Task 6: Teacher Inbox page + nav + respond/resolve
**Files:** Create `web/src/app/teacher/inbox/page.tsx`; modify `components/teacher/TeacherShell.tsx` (add nav item `{ href:'/teacher/inbox', label:'Inbox' }` with a fitting lucide icon).
- Page (`'use client'`): fetch `api.tickets.mine()`, loading/error/empty states (mirror existing teacher pages). List doubt tickets — student, classroom, title, description (expandable), created time, status, `DelayBadge` (import the shared one from oversight components, or a local copy). Per open ticket: **Respond** button → `api.tickets.respond(id)` → optimistic refetch; per in_progress: **Resolve** → `api.tickets.resolve(id)`. Disable buttons while pending; refetch after.
- Match the existing teacher page styling. No interpolated color classes.
Verify web tsc clean. Frontend panel. Commit `feat(teacher): inbox to respond/resolve student doubts`.

---

## Phase 3 — Developer Bug Reports UI (handle bugs in /admin)

### Task 7: Developer Tickets page + nav + resolve
**Files:** Create `web/src/app/admin/tickets/page.tsx`; modify `app/admin/components/AdminHeader.tsx` (add `{ href:'/admin/tickets', label:'TICKETS', icon: <a lucide icon e.g. Bug/Inbox> }` to the nav list).
- Page (`'use client'`, the page is already gated by the admin layout's ProtectedRoute requireRole="developer"): fetch `api.tickets.mine()` (developer → all bugs). Same list + Respond/Resolve actions + DelayBadge. Match the admin dashboard card style (white cards, border-gray-200, font-orbitron) — read `app/admin/dashboard/page.tsx`.
Verify web tsc clean. Frontend panel. Commit `feat(developer): bug-reports page to respond/resolve student bug tickets`.

---

## Phase 4 — Owner Health panels (watch all three roles)

### Task 8: Health page + nav + three panels
**Files:** Create `web/src/app/oversight/health/page.tsx`; create `components/StudentHealthPanel.tsx`, `TeacherHealthPanel.tsx`, `DeveloperHealthPanel.tsx`; modify `OverviewShell.tsx` (add nav item `{ href:'/oversight/health', label:'Health' }`).
- **StudentHealthPanel:** fetch `api.oversight.getStudentHealth()`. Top: three count chips (Active / Quiet / Silent). Table: student, classroom, last-active bucket (color chip), solved, acceptance%. 
- **TeacherHealthPanel:** fetch `getTeacherHealth()`. Table: teacher, #classes, last reviewed (or "No reviews yet"), total reviews, open-doubt backlog (amber if >0).
- **DeveloperHealthPanel:** fetch `getDeveloperHealth()`. Summary chips: open bugs, breached (red), avg resolution time. List: oldest 5 open bugs with DelayBadge.
- `health/page.tsx`: render the three panels stacked, each in a `<div className="p-6">` section. Mirror GroupsOverviewPanel's fetch/loading/empty conventions.
Verify web tsc clean. Frontend panel. Commit `feat(oversight): owner per-role health panels (student/teacher/developer)`.

---

## Phase 5 — End-to-end + merge readiness

### Task 9: Full-loop smoke
- Student submits a doubt + a bug (Header buttons).
- Teacher logs in → Inbox → sees the doubt → Respond → Resolve.
- Developer logs in → /admin/tickets → sees the bug → Respond → Resolve.
- Owner → /oversight/health → Student/Teacher/Developer panels show real numbers; the teacher who opened a student profile shows a recent "last reviewed"; resolved tickets drop off the breach radar.
- Final whole-increment review. Deploy note: rebuild shared → restart api → restart runner before merge.

## Out of scope (next): the School layer (Phase 2 of the product) — its own spec/plan.
