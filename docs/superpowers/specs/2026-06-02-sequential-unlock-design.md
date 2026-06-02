# Sequential Unlock — Design Spec

> **Status:** Approved design (2026-06-02). Next: implementation plan (writing-plans).
> **Scope:** One feature — server-enforced sequential progression. A student starts at Level 1 /
> Session 1; the next session/level unlocks only when all prior content is solved. Replaces today's
> client-only, bypassable gating (`UNLOCK_ALL_LEVELS = true`).
> **Pairs with:** B8b reset (shipped) — a from-session reset now actually re-locks those chapters,
> because lock state is derived from the solved set.

---

## 1. Purpose

Today every level is open (`UNLOCK_ALL_LEVELS = true` in `web/src/lib/utilities/progress.ts`) and
session locking is visual-only — a student can call the grade API directly for any problem and skip
ahead. This feature makes progression **sequential and un-bypassable**: you must complete content in
order, enforced on the server.

---

## 2. The unlock rule (one rule for both sessions and levels)

Order every session by **`(level_number, session_id)`**. **A session is unlocked iff every problem in
every session strictly before it (in that order) is solved.** A problem is unlocked iff its session is
unlocked. The lowest session (Level 1 / Session 1) is always unlocked.

Level gating falls out of this automatically: Level 2's first session has all of Level 1's sessions
before it, so it unlocks exactly when Level 1 is fully solved. Within an unlocked session, problems
are freely ordered (matches today's behavior). Scope is the student's **age band** (`age_group`).

---

## 3. Approach — derive-from-truth, no stored state

Unlock is a **pure function** of `solvedProblemIds` + the curriculum, computed on demand. Never stored.
- No drift (the exact B2 lesson: stored derived state rots). The solved set is the single source of truth.
- Grade is not a hot path (it already enqueues a Docker job), so the small curriculum read is negligible.
- The same data already drives B8b's reset and the frontend's session list, so everything stays consistent.

*(Rejected: an `unlockedSessions`/`unlockedLevel` field on UserProgress — added state that can drift and
must be maintained on every solve/reset.)*

---

## 4. Components & isolation

**a) Pure rule (`packages/shared/src/utils/unlock.ts`) — the single source of truth.**
```
sessionOrderKey(p) = (p.level_number ?? 0) * 1_000_000 + (p.session_id ?? 0)

isProblemUnlocked(problemId, solvedIds, curriculum): boolean
  target = curriculum.find(p => p.problem_id === problemId)
  if !target -> true                       // not in curriculum: don't gate (grade route already 404s)
  targetKey = sessionOrderKey(target)
  for p in curriculum:
    if sessionOrderKey(p) < targetKey && !solved.has(p.problem_id) -> false
  return true
```
Pure, no I/O. Unit-tested via a framework-free `unlock.assert.ts` (api or shared). Editing
`packages/shared` requires a **dist rebuild** (DO_NOT_DISTURB #5).

**b) Server gate — `POST /submit/grade` (`apps/api/src/routes/execution.routes.ts`).**
After the problem is loaded (it already is, ~line 181), and **only when `contestId` is absent**:
- load the student's solved set (`UserProgress.solvedProblemIds` for `req.user.userId`) and the
  age-band curriculum (`Problem.find({ age_group: problem.age_group }, 'problem_id level_number session_id')`),
- if `!isProblemUnlocked(problemId, solved, curriculum)` → **403** `{ error: 'Locked', message:
  'Complete the previous session to unlock this one.' }`.
- **Contest carve-out:** when `contestId` is present, skip the gate entirely (contests aren't
  curriculum progression and may include any problem).

**c) Frontend — derive level-unlock from the solved set.**
- Flip `UNLOCK_ALL_LEVELS → false` in `web/src/lib/utilities/progress.ts`.
- Add `web/src/lib/utilities/unlock.ts` mirroring the shared rule for the data the frontend already
  has (the `GET /levels/:age_group` response carries level → session → problem with `problem_id`):
  `isLevelUnlocked(levelNumber, levels, isSolved)` = level 1 true, else every problem in levels
  `< levelNumber` is solved. The levels page uses it to gate level entry; `SessionList` already gates
  sessions within a level (`SessionList.tsx:92`), so its logic is kept (optionally routed through the
  same helper for consistency).
- Retire the localStorage `completedLevels` machinery as the unlock source (the `completedProblems`
  set — synced from the server — remains the source of truth). `markLevelComplete`/`completedLevels`
  may stay as dead state or be removed; unlock decisions no longer read them.

---

## 5. Data flow

```
Student grades a problem -> POST /submit/grade { code, problemId, contestId? }
  authMiddleware -> load Problem(problemId)  (already happens)
  if contestId absent:
     solved = UserProgress(req.user.userId).solvedProblemIds
     curriculum = Problem.find({ age_group: problem.age_group }, projection)
     if !isProblemUnlocked(problemId, solved, curriculum) -> 403 'Locked'
  ...enqueue grading as today...

Frontend levels page -> GET /levels/:age_group (level->session->problem)
  + syncProgressFromServer() (solved set)
  isLevelUnlocked(N, levels, isSolved) gates each level; SessionList gates sessions within.
```

---

## 6. Error handling & edge cases

- **Contest submissions** (`contestId` present) → gate skipped. Essential carve-out.
- **First session** (lowest order key) → always unlocked (nothing before it).
- **Problem not in the loaded curriculum** (e.g. mismatched age band) → `isProblemUnlocked` returns
  true (don't gate; the grade route has already validated the problem exists). Avoids false 403s.
- **No UserProgress doc** → solved set is empty → only the first session is unlocked (correct for a
  brand-new student).
- **A locked grade is rejected before enqueue** → no Docker job, no progress write, fast 403.
- **Frontend stale state** → if the UI ever lets a click through to a locked problem, the server 403
  is the backstop; surface the message.

---

## 7. Testing

- **Unit (pure fn):** `isProblemUnlocked` — (a) first session always unlocked; (b) a problem stays
  locked until *every* problem in all prior sessions is solved; (c) partial prior-session completion
  still locks; (d) level boundary (Level 2 locked until Level 1 fully solved); (e) problem-not-in-
  curriculum → unlocked. Framework-free `*.assert.ts`, run via `npx tsx`.
- **Contract/type:** `tsc --noEmit` shared (after dist rebuild) + api + web → 0/0/0.
- **Gate:** the 5-judge panel on the full diff; rebuild-until-clean before commit. Security/architecture
  judges focus on the grade gate being un-bypassable and the contest carve-out; correctness on the
  ordering/boundary math; real-environment that the frontend derivation matches the server rule.

---

## 8. Out of scope (YAGNI / deferred)

- **Access/run gating** of locked problems (chosen Grade-gate-only): viewing/running a locked problem
  is unaffected; only earning a graded solve is gated. (Stronger access-gating can be a later add.)
- **A dedicated unlock-state endpoint** — not needed; the frontend derives from data it already fetches.
- **Per-problem (intra-session) ordering** — within an unlocked session, problems stay freely ordered.
- **Removing `markLevelComplete`/`completedLevels` code** — optional cleanup; not required for correctness.

---

## 9. Success criteria

1. A brand-new student can grade only Level 1 / Session 1 problems; grading any later problem → 403.
2. After solving all of Session 1, Session 2's problems grade successfully; Session 2's stay 403 until
   Session 1 is fully solved.
3. Level 2 problems return 403 until **all** of Level 1 is solved; then they grade.
4. A contest submission for any problem is **never** gated (carve-out holds).
5. The frontend shows the same locks (levels + sessions) derived from the solved set; `UNLOCK_ALL_LEVELS`
   is false and no unlock decision reads `completedLevels`.
6. `isProblemUnlocked` is covered by the assertion script (ALL PASS) and the panel returns PASS.
