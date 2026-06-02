# G3 — Failed-Runs Tracking — Design Spec

> **Status:** Approved (2026-06-02). Small feature — build + panel-gate, no separate plan doc.
> **Scope:** Give a teacher a durable "how much did this student struggle while practising" signal —
> the all-time count of Runs (the Run button) that errored or timed out on a curriculum problem.

---

## 1. Purpose

Today only graded **submissions** write progress. When a student hits **Run** and the code
errors/crashes, the only record is the 7-day `ExecutionResult` cache — invisible to the teacher.
G3 surfaces that struggle as a durable counter.

## 2. Data model

Add **`stats.failedRuns: number`** (default 0) to `UserProgress` (`packages/shared`). One field.
Editing `packages/shared` requires a **dist rebuild** (DO_NOT_DISTURB #5).

## 3. The write (the only hot-path touch)

In `CodeExecutionWorker.processJob`, AFTER the run result is saved to `ExecutionResult`, when ALL hold:
- `result.status === 'Error' || result.status === 'Timeout'`, and
- `job.data.userId && job.data.userId !== 'anonymous'` (a logged-in student), and
- `job.data.problemId` is present (a curriculum problem),

fire **one atomic** `UserProgress.updateOne({ userId }, { $inc: { 'stats.failedRuns': 1 } })`.

- **Atomic `$inc`, not a hydrated save** — bypasses the B2 optimistic-concurrency versioning, so a
  failed run racing a grade can't conflict.
- **Fire-and-forget in try/catch** — a stats write must never fail or slow the run (the `ExecutionResult`
  is already saved first); on error, log and continue.
- Fires only on the failed-run subset of logged-in students → negligible load.

## 4. Surfacing

- The deep-dive response (`GET /teacher/students/:id`) already sends `stats`, so `failedRuns` flows
  automatically once it's on the model; UI reads `stats.failedRuns ?? 0`.
- `GET /me/stats` sends `stats` too — same automatic flow (shape stays consistent).
- The teacher monitoring strip (shipped in 4ef34d5) gains a 5th tile: **FAILED RUNS**, beside FAILED SUBMITS.
- Roster: out of scope for v1.

## 5. Reset interaction (B8b)

A teacher reset zeroes `failedRuns` too: add it to `computeResetProgress`'s `stats` output (it currently
omits it → would survive a reset). Full + from-session reset both return `failedRuns: 0` (it's a
run-level signal not tied to surviving solves, so it always resets to 0).

## 6. Edge cases

- Anonymous / no-problemId runs → not counted (can't attribute / not curriculum).
- Old docs with no field → `?? 0` everywhere; the `$inc` upserts the path. No migration.
- The run worker has only `job.data` for context — `userId`/`problemId` are already in the job, so no
  threading needed.

## 7. Testing

- Extend `progressReset.assert.ts`: assert `failedRuns` is in the reset output and resets to 0.
- `tsc --noEmit` shared (after rebuild) + api + runner + web → 0.
- 5-judge panel: correctness on the guard conditions; real-env on the atomic-$inc / B2 interaction +
  dist rebuild; security that anonymous/cross-user can't inflate the count. Rebuild-until-clean.

## 8. Out of scope (YAGNI)

- Per-problem failed-run breakdown (total only for v1).
- Roster column.
- Counting wrong-output runs (a Run doesn't grade — only errors/timeouts are detectable).

## 9. Success criteria

1. A logged-in student's errored/timed-out run on a problem increments `stats.failedRuns`.
2. Anonymous runs, clean runs, and no-problemId runs do NOT increment it.
3. The teacher's student-detail strip shows the count.
4. A teacher reset zeroes it.
5. The run path is never slowed/failed by the stats write; panel returns PASS.
