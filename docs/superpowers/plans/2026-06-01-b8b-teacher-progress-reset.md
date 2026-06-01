# B8b — Teacher Progress Reset — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Let a teacher reset one of their own students' learning progress — fully, or from a chosen session onward — recomputing every stat from the surviving solves, writing a durable audit row, and never touching the `StudentAttempt` integrity log.

**Architecture:** A pure, unit-tested `computeResetProgress` (no I/O) derives the new `UserProgress` from the surviving solves + attempts; a thin orchestrator `performStudentReset` loads data, applies the session boundary, calls the pure function, persists (retrying on optimistic-concurrency conflict), and writes a `ResetLog`. Two ownership-checked teacher routes expose it; a self-contained dialog drives it from the existing student deep-dive page.

**Tech Stack:** TypeScript, Express, Mongoose (`@code-runner/shared` → dist), Next.js 14 (App Router), Tailwind.

---

## ⚠️ Close discipline (overrides the skill's per-task commit pattern)

Per the user's explicit rule: **do NOT commit per task.** Build all tasks, verify (`tsc` + the assertion script), then run the **judge-panel**; fix every in-scope finding (HIGH **and** LOW) and re-run until the debate is clean; **only then** make a single commit. Nothing closes until the panel is clean.

---

## File Structure

```
packages/shared/src/database/models/ResetLog.model.ts     # NEW durable audit model
packages/shared/src/database/models/index.ts              # + export ResetLog (registers Models.ResetLog)
apps/api/src/services/progressReset.ts                    # NEW pure computeResetProgress + orchestrator performStudentReset
apps/api/src/services/progressReset.assert.ts             # NEW framework-free assertion script for the pure fn
apps/api/src/routes/teacher.routes.ts                     # + myStudent() helper, GET reset-options, POST reset
Coderunner-Frontend/web/src/lib/api-client.ts             # + api.teacher.getResetOptions / resetStudent
Coderunner-Frontend/web/src/components/teacher/ResetProgressDialog.tsx  # NEW self-contained modal
Coderunner-Frontend/web/src/app/teacher/students/[id]/page.tsx          # + Reset button + dialog mount
```

---

### Task 1: `ResetLog` audit model + registration

**Files:**
- Create: `Coderunner-Backend/packages/shared/src/database/models/ResetLog.model.ts`
- Modify: `Coderunner-Backend/packages/shared/src/database/models/index.ts`

- [ ] **Step 1: Create the model**

`ResetLog.model.ts`:
```ts
import mongoose, { Schema, Document } from 'mongoose';

/** Durable audit row: one per teacher-initiated student progress reset. Append-only. */
export interface IResetLog extends Document {
  teacherId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  classroomId?: mongoose.Types.ObjectId | null;
  scope: 'full' | 'from-session';
  fromSessionId?: number | null;
  clearedSolvedCount: number;
  prevLevel: number;
  prevXp: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResetLogSchema = new Schema<IResetLog>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', default: null },
    scope: { type: String, enum: ['full', 'from-session'], required: true },
    fromSessionId: { type: Number, default: null },
    clearedSolvedCount: { type: Number, default: 0 },
    prevLevel: { type: Number, default: 1 },
    prevXp: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'reset_logs' }
);

export const ResetLog =
  mongoose.models.ResetLog || mongoose.model<IResetLog>('ResetLog', ResetLogSchema);
```

- [ ] **Step 2: Register it** — append to `index.ts`:
```ts
export { ResetLog } from './ResetLog.model';
```
(`Models` is `export * as Models from './database/models'`, so this one line makes `Models.ResetLog` available.)

- [ ] **Step 3: Rebuild shared dist** (DO_NOT_DISTURB #5):

Run: `cd Coderunner-Backend/packages/shared && npx tsc`
Expected: exit 0; `dist/database/models/ResetLog.model.js` exists.

---

### Task 2: Pure `computeResetProgress` + assertion script (TDD)

**Files:**
- Create: `Coderunner-Backend/apps/api/src/services/progressReset.ts`
- Create: `Coderunner-Backend/apps/api/src/services/progressReset.assert.ts`

- [ ] **Step 1: Write the assertion script first (the failing test)**

`progressReset.assert.ts`:
```ts
import { computeResetProgress } from './progressReset';

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) { console.error('  ✗', msg); failures++; } else { console.log('  ✓', msg); }
}

// 1) Full reset (no survivors) -> exact defaults, longest streak preserved.
{
  const r = computeResetProgress({ survivingSolvedIds: [], solvedMeta: {}, sessionTotals: {}, survivingAttempts: [], survivingRecentActivity: [], prevLongestStreak: 7 });
  assert(r.solvedProblemIds.length === 0, 'full: no solved');
  assert(r.stats.totalSolved === 0, 'full: totalSolved 0');
  assert(r.experience === 0 && r.level === 1, 'full: xp 0 / level 1');
  assert(r.contestRating === 1000 && r.rank === 'NOVICE', 'full: rating 1000 NOVICE');
  assert(r.streak.current === 0 && r.streak.longest === 7 && r.streak.lastSubmissionDate === null, 'full: streak reset, longest kept');
  assert(r.achievements.length === 0, 'full: no achievements');
  assert(r.submissionCalendar.length === 0 && r.solvedCalendar.length === 0 && r.recentActivity.length === 0, 'full: empty history');
}

// 2) From-session: keep before, recompute everything.
{
  const r = computeResetProgress({
    survivingSolvedIds: [1, 2, 3],
    solvedMeta: { 1: { difficulty: 'Easy', session_title: 'S1' }, 2: { difficulty: 'Medium', session_title: 'S1' }, 3: { difficulty: 'Hard', session_title: 'S2' } },
    sessionTotals: { S1: 4, S2: 3 },
    survivingAttempts: [
      { accepted: true, firstSolve: true, createdAt: '2026-05-01' },
      { accepted: false, firstSolve: false, createdAt: '2026-05-01' },
      { accepted: true, firstSolve: true, createdAt: '2026-05-02' },
      { accepted: true, firstSolve: true, createdAt: '2026-05-02' },
    ],
    survivingRecentActivity: [{ problemId: 3, problemTitle: 'P3', difficulty: 'Hard', status: 'ACCEPTED', timestamp: '2026-05-02' }],
    prevLongestStreak: 5,
  });
  assert(r.stats.totalSolved === 3, 'partial: 3 solved');
  assert(r.stats.easySolved === 1 && r.stats.mediumSolved === 1 && r.stats.hardSolved === 1, 'partial: difficulty counts');
  assert(r.experience === 350, 'partial: xp 50+100+200');
  assert(r.level === 1, 'partial: level floor(350/500)+1');
  assert(r.contestRating === 1045, 'partial: rating 1000+15*3');
  assert(r.stats.totalSubmissions === 4 && r.stats.acceptedSubmissions === 3, 'partial: submission counts');
  assert(r.stats.acceptanceRate === 75, 'partial: acceptance 75%');
  assert(r.submissionCalendar.length === 2, 'partial: 2 submission days');
  const day2 = r.solvedCalendar.find((d) => d.date.toISOString().startsWith('2026-05-02'));
  assert(!!day2 && day2.count === 2, 'partial: 2 first-solves on day 2');
  const s1 = r.topicProgress.find((t) => t.topic === 'S1');
  assert(!!s1 && s1.solved === 2 && s1.total === 4, 'partial: topic S1 = 2/4');
  assert(r.achievements.includes('first_solve'), 'partial: first_solve earned');
  assert(r.recentActivity.length === 1 && r.recentActivity[0].problemTitle === 'P3', 'partial: recentActivity filtered + typed');
}

// 3) Idempotent + de-dup.
{
  const input = { survivingSolvedIds: [1, 1, 2], solvedMeta: { 1: { difficulty: 'Easy', session_title: 'S1' }, 2: { difficulty: 'Easy', session_title: 'S1' } }, sessionTotals: { S1: 2 }, survivingAttempts: [], survivingRecentActivity: [], prevLongestStreak: 0 };
  const a = computeResetProgress(input);
  const b = computeResetProgress(input);
  assert(JSON.stringify(a) === JSON.stringify(b), 'idempotent: stable output');
  assert(a.stats.totalSolved === 2, 'de-dup: duplicate solved id counted once');
}

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
```

- [ ] **Step 2: Run it — expect failure** (module/function not defined yet)

Run: `cd Coderunner-Backend/apps/api && npx tsx src/services/progressReset.assert.ts`
Expected: error — `progressReset` has no export `computeResetProgress` (or file not found).

- [ ] **Step 3: Implement the pure function**

`progressReset.ts` (pure-function half — the orchestrator is added in Task 3):
```ts
// ── Pure recompute: derive UserProgress fields from the SURVIVING solves/attempts.
// No I/O — fully unit-testable (see progressReset.assert.ts).

export interface ResetSolvedMeta { difficulty: string; session_title: string; }
export interface ResetAttemptLite { accepted: boolean; firstSolve: boolean; createdAt: string | Date; }
export interface ResetActivityEntry { problemId: number; problemTitle: string; difficulty: string; status: string; timestamp: string | Date; }

export interface ComputeResetInput {
  survivingSolvedIds: number[];
  solvedMeta: Record<number, ResetSolvedMeta>;   // meta for each surviving solved id
  sessionTotals: Record<string, number>;          // session_title -> total problems in that session
  survivingAttempts: ResetAttemptLite[];
  survivingRecentActivity: ResetActivityEntry[];
  prevLongestStreak: number;
}

export interface ResetProgressFields {
  solvedProblemIds: number[];
  stats: { totalSolved: number; easySolved: number; mediumSolved: number; hardSolved: number; totalSubmissions: number; acceptedSubmissions: number; acceptanceRate: number; };
  experience: number;
  level: number;
  contestRating: number;
  rank: 'NOVICE' | 'ADVANCED' | 'EXPERT' | 'MASTER';
  streak: { current: number; longest: number; lastSubmissionDate: Date | null };
  topicProgress: Array<{ topic: string; solved: number; total: number }>;
  achievements: string[];
  submissionCalendar: Array<{ date: Date; count: number }>;
  solvedCalendar: Array<{ date: Date; count: number }>;
  recentActivity: Array<{ problemId: number; problemTitle: string; difficulty: string; status: string; timestamp: Date }>;
}

function xpFor(difficulty: string): number {
  const d = difficulty.toLowerCase();
  return d === 'hard' ? 200 : d === 'medium' ? 100 : 50; // intro + easy -> 50
}

function dayKey(ts: string | Date): string {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export function computeResetProgress(input: ComputeResetInput): ResetProgressFields {
  const { solvedMeta, sessionTotals, survivingAttempts, survivingRecentActivity, prevLongestStreak } = input;
  const solved = Array.from(new Set(input.survivingSolvedIds));

  let easy = 0, medium = 0, hard = 0, xp = 0;
  const topicSolved: Record<string, number> = {};
  for (const pid of solved) {
    const meta = solvedMeta[pid];
    if (!meta) continue;
    const d = meta.difficulty.toLowerCase();
    if (d === 'hard') hard++; else if (d === 'medium') medium++; else easy++;
    xp += xpFor(meta.difficulty);
    const t = meta.session_title || 'General';
    topicSolved[t] = (topicSolved[t] || 0) + 1;
  }

  const totalSolved = solved.length;
  const experience = xp;
  const level = Math.floor(experience / 500) + 1;
  const contestRating = Math.max(800, Math.min(3000, 1000 + 15 * totalSolved));
  const rank: ResetProgressFields['rank'] =
    contestRating >= 2000 ? 'MASTER' : contestRating >= 1600 ? 'EXPERT' : contestRating >= 1200 ? 'ADVANCED' : 'NOVICE';

  const totalSubmissions = survivingAttempts.length;
  const acceptedSubmissions = survivingAttempts.filter((a) => a.accepted).length;
  const acceptanceRate = totalSubmissions > 0 ? parseFloat(((acceptedSubmissions / totalSubmissions) * 100).toFixed(2)) : 0;

  const subByDay: Record<string, number> = {};
  const solvedByDay: Record<string, number> = {};
  for (const a of survivingAttempts) {
    const k = dayKey(a.createdAt);
    subByDay[k] = (subByDay[k] || 0) + 1;
    if (a.accepted && a.firstSolve) solvedByDay[k] = (solvedByDay[k] || 0) + 1;
  }
  const toCalendar = (m: Record<string, number>) =>
    Object.entries(m).map(([k, count]) => ({ date: new Date(k), count })).sort((a, b) => a.date.getTime() - b.date.getTime());

  const topicProgress = Object.entries(topicSolved).map(([topic, s]) => {
    const total = sessionTotals[topic] ?? s;
    return { topic, solved: Math.min(s, total), total };
  });

  const achievements: string[] = [];
  if (totalSolved >= 1) achievements.push('first_solve');
  for (const n of [5, 10, 25, 50, 100]) if (totalSolved >= n) achievements.push(`solver_${n}`);
  if (easy >= 10) achievements.push('easy_master');
  if (medium >= 5) achievements.push('medium_master');
  if (hard >= 3) achievements.push('hard_master');

  const recentActivity = survivingRecentActivity.slice(0, 50).map((a) => ({
    problemId: a.problemId, problemTitle: a.problemTitle, difficulty: a.difficulty, status: a.status, timestamp: new Date(a.timestamp),
  }));

  return {
    solvedProblemIds: solved,
    stats: { totalSolved, easySolved: easy, mediumSolved: medium, hardSolved: hard, totalSubmissions, acceptedSubmissions, acceptanceRate },
    experience, level, contestRating, rank,
    streak: { current: 0, longest: prevLongestStreak, lastSubmissionDate: null },
    topicProgress, achievements,
    submissionCalendar: toCalendar(subByDay),
    solvedCalendar: toCalendar(solvedByDay),
    recentActivity,
  };
}
```

- [ ] **Step 4: Run the assertion script — expect PASS**

Run: `cd Coderunner-Backend/apps/api && npx tsx src/services/progressReset.assert.ts`
Expected: all `✓` lines, final `ALL PASS`, exit 0.

---

### Task 3: Orchestrator `performStudentReset`

**Files:**
- Modify: `Coderunner-Backend/apps/api/src/services/progressReset.ts` (append)

- [ ] **Step 1a: Add the imports at the TOP of `progressReset.ts`** (above the pure function — ES module imports must be top-level, never mid-file):
```ts
import mongoose from 'mongoose';
import { Models, getLogger } from '@code-runner/shared';
```

- [ ] **Step 1b: Append the orchestrator** (below the pure function, same file — no import lines here, they're already at the top from Step 1a):
```ts
// ── Orchestrator: load data, apply the session boundary, recompute, persist, audit.
const logger = getLogger('progress-reset');
const MAX_RESET_ATTEMPTS = 5;

export interface ResetRequest {
  studentId: string;
  teacherId: string;
  classroomId?: string | null;
  scope: 'full' | 'from-session';
  fromSessionId?: number;
}

export async function performStudentReset(
  req: ResetRequest,
  attempt = 1,
): Promise<{ scope: string; clearedSolvedCount: number; newLevel: number; newXp: number }> {
  const userId = new mongoose.Types.ObjectId(req.studentId);
  const progress: any = await Models.UserProgress.findOne({ userId });

  // Load the (small) curriculum once: order sessions + map problems.
  const problems: any[] = await Models.Problem.find(
    {}, 'problem_id session_id level_number session_title difficulty',
  ).lean();
  const orderKey = (p: any) => (p.level_number ?? 0) * 1_000_000 + (p.session_id ?? 0);

  // Keep-set = problems strictly BEFORE the boundary. Full reset = empty keep-set.
  let keep: Set<number>;
  if (req.scope === 'full') {
    keep = new Set();
  } else {
    const boundary = problems.find((p) => p.session_id === req.fromSessionId);
    if (!boundary) throw Object.assign(new Error('Unknown session for this reset'), { statusCode: 400 });
    const bKey = orderKey(boundary);
    keep = new Set(problems.filter((p) => orderKey(p) < bKey).map((p) => p.problem_id));
  }

  const prevSolved: number[] = progress?.solvedProblemIds || [];
  const survivingSet = new Set(prevSolved.filter((id) => keep.has(id)));
  const survivingSolvedIds = Array.from(survivingSet);

  const solvedMeta: Record<number, { difficulty: string; session_title: string }> = {};
  const sessionTotals: Record<string, number> = {};
  for (const p of problems) {
    const t = p.session_title || 'General';
    sessionTotals[t] = (sessionTotals[t] || 0) + 1;
    if (survivingSet.has(p.problem_id)) solvedMeta[p.problem_id] = { difficulty: p.difficulty, session_title: t };
  }

  // Integrity log is read-only here — never modified.
  const attempts: any[] = await Models.StudentAttempt.find({ userId }, 'problemId accepted firstSolve createdAt').lean();
  const survivingAttempts = attempts
    .filter((a) => keep.has(a.problemId))
    .map((a) => ({ accepted: a.accepted, firstSolve: a.firstSolve, createdAt: a.createdAt }));

  const survivingRecentActivity = (progress?.recentActivity || []).filter((a: any) => keep.has(a.problemId));

  const fields = computeResetProgress({
    survivingSolvedIds, solvedMeta, sessionTotals, survivingAttempts,
    survivingRecentActivity, prevLongestStreak: progress?.streak?.longest ?? 0,
  });

  const clearedSolvedCount = prevSolved.length - survivingSolvedIds.length;
  const prevLevel = progress?.level ?? 1;
  const prevXp = progress?.experience ?? 0;

  if (progress) {
    Object.assign(progress, fields);
    try {
      await progress.save();
    } catch (err: any) {
      // UserProgress has optimisticConcurrency (B2): a racing grade bumps __v.
      if (err instanceof mongoose.Error.VersionError && attempt < MAX_RESET_ATTEMPTS) {
        logger.warn('Reset hit a version conflict, retrying', { studentId: req.studentId, attempt });
        await new Promise((r) => setTimeout(r, 20 * attempt));
        return performStudentReset(req, attempt + 1);
      }
      throw err;
    }
  }

  await Models.ResetLog.create({
    teacherId: new mongoose.Types.ObjectId(req.teacherId),
    studentId: userId,
    classroomId: req.classroomId ? new mongoose.Types.ObjectId(req.classroomId) : null,
    scope: req.scope,
    fromSessionId: req.scope === 'from-session' ? req.fromSessionId : null,
    clearedSolvedCount, prevLevel, prevXp,
  });

  logger.info('Student progress reset', { studentId: req.studentId, teacherId: req.teacherId, scope: req.scope, fromSessionId: req.fromSessionId, clearedSolvedCount });
  return { scope: req.scope, clearedSolvedCount, newLevel: fields.level, newXp: fields.experience };
}
```

- [ ] **Step 2: Typecheck** — Run: `cd Coderunner-Backend/apps/api && npx tsc --noEmit` · Expected: exit 0.

---

### Task 4: Teacher routes (ownership-checked)

**Files:**
- Modify: `Coderunner-Backend/apps/api/src/routes/teacher.routes.ts`

- [ ] **Step 1: Import the service** — add near the top imports:
```ts
import { performStudentReset } from '../services/progressReset';
```

- [ ] **Step 2: Add the `myStudent` ownership helper** (below `myClassroom`):
```ts
/** Fetch a student the current teacher owns (in one of my classrooms), or null. */
async function myStudent(req: Request, id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const user: any = await Models.User.findById(id).select('-passwordHash').lean();
  if (!user || user.role !== 'student' || !user.classroomId) return null;
  const me = new mongoose.Types.ObjectId(req.user!.userId);
  const owns = await Models.Classroom.exists({ _id: user.classroomId, teacherIds: me });
  return owns ? user : null;
}
```

- [ ] **Step 3: Add the two routes** (after the existing `GET /students/:id` handler):
```ts
/**
 * GET /teacher/students/:id/reset-options — sessions this student has solves in,
 * in curriculum order, for the reset dialog's "from a session" picker.
 */
router.get('/students/:id/reset-options', async (req: Request, res: Response) => {
  try {
    const student = await myStudent(req, req.params.id);
    if (!student) return res.status(403).json({ error: 'Forbidden', message: 'Student is not in your classroom' });
    const progress: any = await Models.UserProgress.findOne({ userId: student._id }).select('solvedProblemIds').lean();
    const solved: number[] = progress?.solvedProblemIds || [];
    const problems: any[] = await Models.Problem.find(
      { problem_id: { $in: solved } }, 'session_id level_number session_title',
    ).lean();
    const seen = new Map<number, any>();
    for (const p of problems) {
      if (!seen.has(p.session_id)) {
        seen.set(p.session_id, { session_id: p.session_id, level_number: p.level_number ?? 0, session_title: p.session_title || `Session ${p.session_id}` });
      }
    }
    const sessions = Array.from(seen.values()).sort((a, b) => (a.level_number - b.level_number) || (a.session_id - b.session_id));
    res.json({ sessions });
  } catch (error) {
    logger.error('Error building reset options', { error });
    res.status(500).json({ error: 'Failed to load reset options' });
  }
});

/**
 * POST /teacher/students/:id/reset — reset a student's progress (full or from a session).
 * Ownership-checked. The StudentAttempt integrity log is never modified.
 */
router.post('/students/:id/reset', async (req: Request, res: Response) => {
  try {
    const student = await myStudent(req, req.params.id);
    if (!student) return res.status(403).json({ error: 'Forbidden', message: 'Student is not in your classroom' });

    const scope = req.body?.scope;
    if (scope !== 'full' && scope !== 'from-session') {
      return res.status(400).json({ error: 'Validation Error', message: "scope must be 'full' or 'from-session'" });
    }
    let fromSessionId: number | undefined;
    if (scope === 'from-session') {
      fromSessionId = Number(req.body?.fromSessionId);
      if (!Number.isFinite(fromSessionId)) {
        return res.status(400).json({ error: 'Validation Error', message: 'fromSessionId is required for a from-session reset' });
      }
    }

    const result = await performStudentReset({
      studentId: String(student._id),
      teacherId: req.user!.userId,
      classroomId: student.classroomId ? String(student.classroomId) : null,
      scope, fromSessionId,
    });
    res.json({ message: 'Progress reset', ...result });
  } catch (error: any) {
    if (error?.statusCode === 400) return res.status(400).json({ error: 'Validation Error', message: error.message });
    logger.error('Error resetting student progress', { error });
    res.status(500).json({ error: 'Failed to reset progress' });
  }
});
```

- [ ] **Step 4: Typecheck** — Run: `cd Coderunner-Backend/apps/api && npx tsc --noEmit` · Expected: exit 0.

---

### Task 5: api-client methods

**Files:**
- Modify: `Coderunner-Frontend/web/src/lib/api-client.ts`

- [ ] **Step 1:** In the `teacher: { ... }` block, after `getStudent`, add:
```ts
    getResetOptions: (id: string) => apiClient.get(`/teacher/students/${id}/reset-options`),
    resetStudent: (id: string, body: { scope: 'full' | 'from-session'; fromSessionId?: number }) =>
      apiClient.post(`/teacher/students/${id}/reset`, body),
```

- [ ] **Step 2: Typecheck** — Run: `cd Coderunner-Frontend/web && npx tsc --noEmit` · Expected: exit 0.

---

### Task 6: `ResetProgressDialog` component

**Files:**
- Create: `Coderunner-Frontend/web/src/components/teacher/ResetProgressDialog.tsx`

- [ ] **Step 1: Create the self-contained modal** (static Tailwind classes only — no interpolation):
```tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface SessionOpt { session_id: number; level_number: number; session_title: string; }

export function ResetProgressDialog({
  studentId, studentUsername, onClose, onComplete,
}: {
  studentId: string;
  studentUsername: string;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [scope, setScope] = useState<'full' | 'from-session'>('full');
  const [sessions, setSessions] = useState<SessionOpt[]>([]);
  const [fromSessionId, setFromSessionId] = useState<number | ''>('');
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.teacher.getResetOptions(studentId)
      .then((d: any) => {
        const s: SessionOpt[] = d.sessions || [];
        setSessions(s);
        if (s.length > 0) setFromSessionId(s[0].session_id);
      })
      .catch(() => {});
  }, [studentId]);

  const canSubmit =
    confirmText === studentUsername &&
    !busy &&
    (scope === 'full' || (scope === 'from-session' && fromSessionId !== ''));

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.teacher.resetStudent(studentId, {
        scope,
        fromSessionId: scope === 'from-session' ? Number(fromSessionId) : undefined,
      });
      onComplete();
    } catch (e: any) {
      setError(e?.message || 'Reset failed. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <h3 className="font-orbitron text-lg font-bold text-gray-900">Reset Progress</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          This permanently resets <span className="font-semibold">{studentUsername}</span>'s learning progress.
          Their account, character, class, and integrity record are kept. This cannot be undone.
        </p>

        <div className="mb-4 space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="radio" name="scope" checked={scope === 'full'} onChange={() => setScope('full')} />
            Full reset (back to the start)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="radio" name="scope" checked={scope === 'from-session'} onChange={() => setScope('from-session')} disabled={sessions.length === 0} />
            From a session onward
          </label>
          {scope === 'from-session' && (
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={fromSessionId}
              onChange={(e) => setFromSessionId(Number(e.target.value))}
            >
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  L{s.level_number} · {s.session_title}
                </option>
              ))}
            </select>
          )}
        </div>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Type <span className="font-mono text-gray-800">{studentUsername}</span> to confirm
        </label>
        <input
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={studentUsername}
        />

        {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck** — Run: `cd Coderunner-Frontend/web && npx tsc --noEmit` · Expected: exit 0.

---

### Task 7: Wire the dialog into the deep-dive page

**Files:**
- Modify: `Coderunner-Frontend/web/src/app/teacher/students/[id]/page.tsx`

- [ ] **Step 1: Read the page** to find its data-loading function (it calls `api.teacher.getStudent(id)` inside an effect) and the header JSX where a button fits. Confirm the student's username field on `data` (e.g. `data.username`).

- [ ] **Step 2: Add the import** near the other imports:
```tsx
import { ResetProgressDialog } from '@/components/teacher/ResetProgressDialog';
```

- [ ] **Step 3: Add open-state** inside the component (near the other `useState`s):
```tsx
const [resetOpen, setResetOpen] = useState(false);
```

- [ ] **Step 4: Add a Reset button** in the page header (next to the back button / title). Use static classes:
```tsx
<button
  onClick={() => setResetOpen(true)}
  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
>
  Reset Progress
</button>
```

- [ ] **Step 5: Mount the dialog** near the end of the returned JSX (only when open and data is loaded):
```tsx
{resetOpen && data && (
  <ResetProgressDialog
    studentId={id}
    studentUsername={data.username}
    onClose={() => setResetOpen(false)}
    onComplete={() => { setResetOpen(false); window.location.reload(); }}
  />
)}
```
(Reload guarantees the deep-dive re-fetches the reset state with zero coupling to the page's internal loader.)

- [ ] **Step 6: Typecheck** — Run: `cd Coderunner-Frontend/web && npx tsc --noEmit` · Expected: exit 0.

---

### Task 8: Verify + judge-panel gate + close (single commit)

**Files:** none (verification + gate)

- [ ] **Step 1: Full verification**
```bash
cd Coderunner-Backend/packages/shared && npx tsc && \
cd ../../apps/api && npx tsc --noEmit && npx tsx src/services/progressReset.assert.ts && \
cd ../../../Coderunner-Frontend/web && npx tsc --noEmit
```
Expected: shared build 0; api tsc 0; assertion script `ALL PASS` exit 0; web tsc 0.

- [ ] **Step 2: Run the `judge-panel` skill** on the full working-tree diff. Intent: "B8b — teacher progress reset (full + from-session), recompute-from-truth, ResetLog audit, integrity log preserved." Tell the judges to focus: **Correctness/Architecture** on the boundary math + recompute purity + idempotency; **Security** on the ownership check (a teacher can only reset their own student) and that `StudentAttempt` is provably untouched; **Real-environment** on the shared dist rebuild + B2 optimistic-concurrency interaction.

- [ ] **Step 3: Resolve every in-scope finding (HIGH and LOW), re-run the panel, loop until clean.** Per the close discipline, do not proceed to commit while any in-scope finding stands. Only genuinely pre-existing / out-of-scope items may be logged as backlog and surfaced to the user.

- [ ] **Step 4: Commit once, on a clean panel:**
```bash
git add Coderunner-Backend/packages/shared/src/database/models/ResetLog.model.ts \
        Coderunner-Backend/packages/shared/src/database/models/index.ts \
        Coderunner-Backend/apps/api/src/services/progressReset.ts \
        Coderunner-Backend/apps/api/src/services/progressReset.assert.ts \
        Coderunner-Backend/apps/api/src/routes/teacher.routes.ts \
        Coderunner-Frontend/web/src/lib/api-client.ts \
        Coderunner-Frontend/web/src/components/teacher/ResetProgressDialog.tsx \
        "Coderunner-Frontend/web/src/app/teacher/students/[id]/page.tsx"
git commit -m "feat(teacher): student progress reset — full or from-session (B8b)"
```
(Include the panel verdict + `tsc`/assertion status + `Co-Authored-By` trailer in the message, per convention.)

---

## Notes for the executor

- **Inline execution recommended** — Task 8 dispatches the 5-judge panel, which the main agent runs (a worker subagent can't fan out its own panel).
- **The integrity log is sacrosanct:** `performStudentReset` only ever *reads* `StudentAttempt`. The panel's security judge must confirm no write/delete touches it.
- **Curriculum is small** (a few intro levels), so loading all problems once per reset is fine; revisit only if the catalog grows large.
- **The `assert` script is the unit test** (no framework is wired in api/runner). Keep it green; extend it if the recompute rules change.
