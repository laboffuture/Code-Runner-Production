# Sequential Unlock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make curriculum progression sequential and un-bypassable — a student can only grade a problem once every problem in all earlier sessions (ordered by level, then session) is solved — enforced on the server and reflected by server-derived locks on the frontend.

**Architecture:** One pure rule `isProblemUnlocked(problemId, solvedIds, curriculum)` in `@code-runner/shared`, derived from the solved set (no stored state). The grade route enforces it (contest-exempt); the frontend mirrors the rule to derive level locks from the levels data it already fetches, replacing the client-only `UNLOCK_ALL_LEVELS` flag.

**Tech Stack:** TypeScript, Express, Mongoose (`@code-runner/shared` → dist), Next.js 14.

---

## ⚠️ Close discipline (overrides the skill's per-task commit pattern)

Per the user's standing rule: **do NOT commit per task.** Build all tasks, verify (`tsc` + the assertion script), then run the **judge-panel**; fix every in-scope finding (HIGH **and** LOW) and re-run until clean; **only then** a single commit. Nothing closes until the panel is clean.

---

## File Structure

```
packages/shared/src/utils/unlock.utils.ts          # NEW pure isProblemUnlocked + sessionOrderKey
packages/shared/src/utils/unlock.assert.ts         # NEW framework-free assertion script
packages/shared/src/utils/index.ts                 # + export unlock.utils
apps/api/src/routes/execution.routes.ts            # grade gate in POST /submit/grade
Coderunner-Frontend/web/src/lib/utilities/unlock.ts        # NEW frontend mirror: isLevelUnlocked derive
Coderunner-Frontend/web/src/lib/utilities/progress.ts      # UNLOCK_ALL_LEVELS -> false
Coderunner-Frontend/web/src/components/lists/LevelList.tsx  # use the derive helper
```

---

### Task 1: Shared pure `isProblemUnlocked` + assertion (TDD)

**Files:**
- Create: `Coderunner-Backend/packages/shared/src/utils/unlock.utils.ts`
- Create: `Coderunner-Backend/packages/shared/src/utils/unlock.assert.ts`
- Modify: `Coderunner-Backend/packages/shared/src/utils/index.ts`

- [ ] **Step 1: Write the assertion script first (the failing test)**

`unlock.assert.ts`:
```ts
import { isProblemUnlocked } from './unlock.utils';

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) { console.error('  ✗', msg); failures++; } else { console.log('  ✓', msg); }
}

// Curriculum: L1{ S1:[1,2], S2:[3] }, L2{ S1:[4] }
const curriculum = [
  { problem_id: 1, level_number: 1, session_id: 1 },
  { problem_id: 2, level_number: 1, session_id: 1 },
  { problem_id: 3, level_number: 1, session_id: 2 },
  { problem_id: 4, level_number: 2, session_id: 1 },
];

// First session is always unlocked (nothing before it).
assert(isProblemUnlocked(1, [], curriculum) === true, 'first session: problem 1 unlocked with no solves');
assert(isProblemUnlocked(2, [], curriculum) === true, 'first session: problem 2 (same session) unlocked, free order');

// Session 2 locked until BOTH problems of session 1 are solved.
assert(isProblemUnlocked(3, [1], curriculum) === false, 'session 2 locked when only 1 of session 1 solved');
assert(isProblemUnlocked(3, [1, 2], curriculum) === true, 'session 2 unlocks when session 1 fully solved');

// Level 2 locked until ALL of level 1 (sessions 1 and 2) is solved.
assert(isProblemUnlocked(4, [1, 2], curriculum) === false, 'level 2 locked until level 1 session 2 solved');
assert(isProblemUnlocked(4, [1, 2, 3], curriculum) === true, 'level 2 unlocks when all of level 1 solved');

// A problem not in this curriculum is not gated (grade route already validated existence).
assert(isProblemUnlocked(99, [], curriculum) === true, 'unknown problem: not gated');

// Set input also accepted.
assert(isProblemUnlocked(3, new Set([1, 2]), curriculum) === true, 'accepts a Set of solved ids');

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
```

- [ ] **Step 2: Run it — expect failure** (module/function not defined)

Run: `cd Coderunner-Backend/packages/shared && npx tsx src/utils/unlock.assert.ts`
Expected: error — `unlock.utils` has no export `isProblemUnlocked`.

- [ ] **Step 3: Implement the pure function**

`unlock.utils.ts`:
```ts
// Sequential-progression rule (single source of truth). Pure, no I/O.

export interface UnlockProblem {
  problem_id: number;
  level_number?: number;
  session_id: number;
}

/** Total curriculum order: by level, then session. */
export function sessionOrderKey(p: { level_number?: number; session_id: number }): number {
  return (p.level_number ?? 0) * 1_000_000 + (p.session_id ?? 0);
}

/**
 * A problem is unlocked iff every problem in a session STRICTLY BEFORE its own
 * (by sessionOrderKey) has been solved. The lowest session is always unlocked;
 * within a session, problems are freely ordered. The caller scopes `curriculum`
 * to the student's age band. A problem absent from `curriculum` is not gated.
 */
export function isProblemUnlocked(
  problemId: number,
  solvedProblemIds: number[] | Set<number>,
  curriculum: UnlockProblem[],
): boolean {
  const target = curriculum.find((p) => p.problem_id === problemId);
  if (!target) return true;
  const targetKey = sessionOrderKey(target);
  const solved = solvedProblemIds instanceof Set ? solvedProblemIds : new Set(solvedProblemIds);
  for (const p of curriculum) {
    if (sessionOrderKey(p) < targetKey && !solved.has(p.problem_id)) return false;
  }
  return true;
}
```

- [ ] **Step 4: Export it** — append to `packages/shared/src/utils/index.ts`:
```ts
export * from './unlock.utils';
```

- [ ] **Step 5: Run the assertion — expect PASS**

Run: `cd Coderunner-Backend/packages/shared && npx tsx src/utils/unlock.assert.ts`
Expected: all `✓`, final `ALL PASS`, exit 0.

- [ ] **Step 6: Rebuild shared dist** (DO_NOT_DISTURB #5):

Run: `cd Coderunner-Backend/packages/shared && npx tsc`
Expected: exit 0; `grep -c "isProblemUnlocked" dist/utils/unlock.utils.js` ≥ 1.

---

### Task 2: Server grade gate

**Files:**
- Modify: `Coderunner-Backend/apps/api/src/routes/execution.routes.ts`

- [ ] **Step 1: Add the import** — extend the shared import (line 3):
```ts
import { Models, CodeExecutionJobData, SubmissionJobData, isProblemUnlocked } from '@code-runner/shared';
```

- [ ] **Step 2: Insert the gate in `POST /submit/grade`**, immediately AFTER the existing "Verify problem exists" block (the `if (!problem) { return res.status(404)... }` that ends ~line 187):
```ts
    // Sequential progression: a curriculum problem can only be GRADED once every
    // problem in all prior sessions is solved. Contests are exempt (not curriculum
    // progression). Skip if the problem has no age band (can't scope the curriculum).
    if (!contestId && problem.age_group) {
      const userId = req.user!.userId;
      const up = await Models.UserProgress.findOne({ userId }).select('solvedProblemIds').lean();
      const solved: number[] = (up as any)?.solvedProblemIds || [];
      const curriculum = await Models.Problem.find(
        { age_group: problem.age_group }, 'problem_id level_number session_id',
      ).lean();
      if (!isProblemUnlocked(problemId, solved, curriculum as any)) {
        return res.status(403).json({
          error: 'Locked',
          message: 'Complete the previous session to unlock this one.',
        });
      }
    }
```

- [ ] **Step 3: Typecheck** — Run: `cd Coderunner-Backend/apps/api && npx tsc --noEmit` · Expected: exit 0.

---

### Task 3: Frontend mirror helper

**Files:**
- Create: `Coderunner-Frontend/web/src/lib/utilities/unlock.ts`

- [ ] **Step 1: Create the helper** (mirrors the shared rule for the data the levels page already has):
```ts
// Mirrors the server rule (packages/shared/.../unlock.utils.ts): a level is
// unlocked iff every problem in all EARLIER levels has been solved. The grade
// API is authoritative; this is for the matching UI lock state.

interface UnlockLevel {
  level_number: number;
  sessions?: Array<{ problems?: Array<{ problem_id: number }> }>;
}

export function isLevelUnlocked(
  levels: UnlockLevel[],
  levelNumber: number,
  isSolved: (problemId: number) => boolean,
): boolean {
  if (levelNumber <= 1) return true; // first level always open
  for (const lvl of levels) {
    if (lvl.level_number < levelNumber) {
      for (const s of lvl.sessions || []) {
        for (const p of s.problems || []) {
          if (!isSolved(p.problem_id)) return false;
        }
      }
    }
  }
  return true;
}
```

- [ ] **Step 2: Typecheck** — Run: `cd Coderunner-Frontend/web && npx tsc --noEmit` · Expected: exit 0.

---

### Task 4: Wire the frontend (LevelList derive + flip the flag)

**Files:**
- Modify: `Coderunner-Frontend/web/src/components/lists/LevelList.tsx`
- Modify: `Coderunner-Frontend/web/src/lib/utilities/progress.ts`

- [ ] **Step 1: Import the helper** in `LevelList.tsx` (after line 6):
```ts
import { isLevelUnlocked } from '@/lib/utilities/unlock';
```

- [ ] **Step 2: Derive `isUnlocked` from the solved set** — replace line 45
  (`const isUnlocked = progress.isLevelUnlocked(level.age_group, level.level_number);`) with:
```ts
    const isUnlocked = isLevelUnlocked(
      levels as any,
      level.level_number,
      (pid: number) => progress.isProblemCompleted(String(pid)),
    );
```
(`levels` is the component prop — the full curriculum from `GET /levels/:age_group`. The `as any`
keeps the helper decoupled from the exact `Level` type; the fields it reads — `level_number`,
`sessions[].problems[].problem_id` — are present in that response.)

- [ ] **Step 3: Flip the launch flag** in `progress.ts` — change line 25:
```ts
const UNLOCK_ALL_LEVELS = false;
```
(LevelList no longer calls `progress.isLevelUnlocked`, but flip the flag so any residual caller also
gates correctly; `progress.isLevelUnlocked` then falls back to its sequential `isLevelCompleted(N-1)`
path rather than always-true.)

- [ ] **Step 4: Typecheck** — Run: `cd Coderunner-Frontend/web && npx tsc --noEmit` · Expected: exit 0.

---

### Task 5: Verify + judge-panel gate + close (single commit)

**Files:** none (verification + gate)

- [ ] **Step 1: Full verification**
```bash
cd Coderunner-Backend/packages/shared && npx tsx src/utils/unlock.assert.ts && npx tsc && \
cd ../../apps/api && npx tsc --noEmit && \
cd ../../../Coderunner-Frontend/web && npx tsc --noEmit
```
Expected: assertion `ALL PASS`; shared build 0; api tsc 0; web tsc 0.

- [ ] **Step 2: Run the `judge-panel` skill** on the full working-tree diff. Intent: "Sequential unlock —
  server grade-gate (contest-exempt) + frontend derives level locks from the solved set." Focus the
  judges: **Security/Architecture** on the gate being un-bypassable and the contest carve-out + the
  age-band scoping; **Correctness** on the ordering/boundary math + the assert; **Real-environment** on
  the dist rebuild and that the frontend rule matches the server rule (no UI/enforcement mismatch).

- [ ] **Step 3: Resolve every in-scope finding (HIGH and LOW), re-run the panel, loop until clean.**
  Only genuinely pre-existing / out-of-scope items may be logged and surfaced to the user.

- [ ] **Step 4: Commit once, on a clean panel:**
```bash
git add Coderunner-Backend/packages/shared/src/utils/unlock.utils.ts \
        Coderunner-Backend/packages/shared/src/utils/unlock.assert.ts \
        Coderunner-Backend/packages/shared/src/utils/index.ts \
        Coderunner-Backend/apps/api/src/routes/execution.routes.ts \
        Coderunner-Frontend/web/src/lib/utilities/unlock.ts \
        Coderunner-Frontend/web/src/lib/utilities/progress.ts \
        Coderunner-Frontend/web/src/components/lists/LevelList.tsx
git commit -m "feat(progression): server-enforced sequential unlock"
```
(Include the panel verdict + `tsc`/assertion status + `Co-Authored-By` trailer.)

---

## Notes for the executor

- **Inline execution recommended** — Task 5 dispatches the 5-judge panel, which the main agent runs.
- **The server gate is authoritative**; the frontend mirror is UX only. The panel must confirm the two
  rules agree (a frontend that shows "unlocked" for something the server 403s would be a bad mismatch).
- **Contest carve-out is load-bearing** — verify a contest submission (`contestId` present) is never gated.
- **Curriculum read on grade** is fine (grade already enqueues a Docker job); revisit only if the
  catalog grows large.
- **The `*.assert.ts` is the unit test** (no framework wired). Keep it green; extend it if the rule changes.
```
