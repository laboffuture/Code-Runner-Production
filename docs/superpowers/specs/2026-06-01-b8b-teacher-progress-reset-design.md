# B8b — Teacher Progress Reset — Design Spec

> **Status:** Approved design (2026-06-01). Next: implementation plan (writing-plans).
> **Scope:** One feature — a teacher can reset a student's learning progress, either fully or from a
> chosen session onward, without deleting the account and without erasing the integrity log.
> **Sequel (separate spec, build AFTER this):** server-enforced sequential level/session unlocking —
> "start at Level 1, complete-to-unlock the next." That feature gives this reset its re-gating teeth;
> per the user's chosen order, reset ships first and re-gating arrives with the unlock feature.

---

## 1. Purpose

A teacher needs to give one of their students a clean restart on the *learning* — the whole course, or
from a specific chapter — while keeping the student enrolled, keeping their identity (character/login),
and **keeping the `StudentAttempt` integrity log** (so a reset cannot be used to wipe anti-cheat
evidence). Students themselves have no reset ability (removed in B8a).

---

## 2. Curriculum model & the "session boundary"

Problems are organized **level → session → problem** (`Problem` has `level_number`, `session_id`,
`session_title`, `difficulty`, `problem_id`, `age_group`). Sessions have a total curriculum order:
**order by `(level_number ASC, session_id ASC)`**.

A reset has a **boundary**:
- **Full reset** — boundary before the first session → drop *all* solves → progress returns to defaults.
- **From-session reset** — boundary at a chosen session S → keep solves for problems whose
  `(level_number, session_id)` is **strictly before** S's; drop everything **at or after** S.

Full reset is the degenerate case of from-session (boundary at position 0), so there is **one code path**.

---

## 3. Recompute model (Approach A — derive from surviving truth)

After the boundary is applied, every derived stat is rebuilt as a **pure function of what survives** — never
by subtracting deltas — so the numbers can never drift out of sync with reality.

**Two inputs define the new state:**
1. **Surviving solved set** = current `solvedProblemIds` ∩ {problems in sessions before the boundary}.
2. **Surviving attempts** = `StudentAttempt` records for problems in sessions before the boundary
   (the integrity log itself is **never modified** — this is a read for recompute only).

**Recomputed fields (pure function of the two inputs):**
| Field | Rule |
|-------|------|
| `solvedProblemIds` | the surviving solved set |
| `stats.totalSolved` | count of surviving solves |
| `stats.easy/medium/hardSolved` | counts by `difficulty` over surviving solves (`intro`→easy) |
| `experience` | Σ per-solve XP over surviving solves (hard 200 / medium 100 / else 50) |
| `level` | `floor(experience / 500) + 1` |
| `rank` | from `contestRating` thresholds (existing `updateRank` rule) |
| `topicProgress` | per `session_title`: `{ solved: surviving solves in topic, total: problems in session }` |
| `achievements` | recomputed from the surviving stats/streak (drop any no longer earned) |
| `stats.totalSubmissions` / `acceptedSubmissions` | count of surviving attempts / surviving accepted attempts |
| `stats.acceptanceRate` | accepted / total over surviving attempts (0 if none) |
| `submissionCalendar` | rebuilt from surviving attempts grouped by `createdAt` day |
| `solvedCalendar` | rebuilt from surviving attempts where `firstSolve && accepted`, by day |
| `recentActivity` | rebuilt from the 50 most-recent surviving attempts |

**Two judgment calls (approved):**
- **`streak.current` → 0** (and `lastSubmissionDate` → null). A live streak can't be honestly claimed after
  a teacher edits history. `streak.longest` is preserved (a historical high-water mark, not a current claim).
- **`contestRating` → recomputed** as `1000 + 15 × (surviving first-solves)`, clamped `[800, 3000]`.
  This intentionally drops historical fail penalties and contest deltas in favour of a clean, explainable rule.

**Kept, never touched:** the `User` account, `classroomId`, `selectedCharacter`, `onboardingComplete`,
`unlockedCharacters`, and the entire `StudentAttempt` log.

---

## 4. Components & isolation

- **`ResetLog` model** (`packages/shared/.../ResetLog.model.ts`) — durable audit row, written every reset.
  `{ teacherId, studentId, classroomId, scope: 'full'|'from-session', fromSessionId?: number,
  clearedSolvedCount, prevLevel, prevXp, createdAt }`. Append-only; no edit/delete route.
  (Editing `packages/shared` requires a **dist rebuild** — DO_NOT_DISTURB #5.)
- **`progressReset` service** (`apps/api/src/services/progressReset.ts`):
  - `computeResetProgress(current, survivingProblems, survivingAttempts) → Partial<UserProgress>` — **pure,
    no I/O, unit-testable**. This is where the panel + tests concentrate.
  - `performStudentReset({ studentId, teacherId, scope, fromSessionId }) → summary` — orchestrator: loads
    progress + problems + attempts, computes the boundary + surviving sets, calls `computeResetProgress`,
    persists `UserProgress`, writes `ResetLog`. Handles B2's optimistic-concurrency `VersionError` by
    retrying from a fresh read (bounded), so a reset racing a live grade fails safe, never clobbers.
- **Route** `POST /teacher/students/:id/reset` (`teacher.routes.ts`) — thin: validate body, **reuse the
  exact deep-dive ownership check** (student's `classroomId` ∈ a classroom I teach) under
  `teacherMiddleware`, call the service, return the refreshed summary.
- **Frontend** — on the existing `/teacher/students/[id]` deep-dive: a **"Reset Progress" danger control**
  → modal → choose **Full** or **From a session** (dropdown of the sessions the student has solves in,
  in curriculum order) → **type the student's username to confirm** → POST → reload the deep-dive.

---

## 5. Data flow

```
Teacher (deep-dive page) → clicks Reset → modal (scope + optional session + type-to-confirm)
  → POST /teacher/students/:id/reset { scope, fromSessionId? }
    → teacherMiddleware + ownership check (student is in my classroom)
    → performStudentReset:
        load UserProgress, the student's solved Problems, surviving StudentAttempts
        compute boundary → surviving solved set + surviving attempts
        computeResetProgress(...) → new fields
        save UserProgress (retry on VersionError)
        create ResetLog (audit)
    → 200 { newSummary, cleared: { count, scopeLabel } }
  → page reloads deep-dive (now showing the reset state)
```

---

## 6. Error handling & edge cases

- **Not my student** → 403 (ownership check), same as the deep-dive.
- **Invalid `scope`** or `from-session` without a valid `fromSessionId` → 400.
- **`fromSessionId` the student has no solves in / unknown** → 400 with a clear message (UI only offers valid
  sessions, but the API validates independently — never trust the client).
- **No `UserProgress` doc yet** → treat as already-empty; still write a `ResetLog` (records the intent), return
  a defaults summary. (Belt-and-suspenders; the deep-dive implies progress exists.)
- **Concurrent grade in flight** → optimistic-concurrency `VersionError` → bounded retry from fresh read.
- **`StudentAttempt` empty/sparse** → calendars/activity rebuild to what's present (possibly empty); counts
  still come from `solvedProblemIds`, so core stats stay correct even if behavioural history is thin.

---

## 7. Testing

- **Unit (pure fn):** `computeResetProgress` — (a) full reset → exact defaults; (b) from-session keeps
  before-boundary solves and drops at/after; (c) counts/XP/level/topicProgress match the surviving set;
  (d) streak→0, rating = 1000 + 15×survivingFirstSolves clamped; (e) **idempotent** (running twice = once).
  Exercised via a runnable `npx tsx` assertion script (the runner/api have no test framework wired — a
  framework-free script keeps the pure fn genuinely verified without new infra).
- **Type/contract:** `tsc --noEmit` on shared (after dist rebuild), api, web → 0/0/0.
- **Gate:** the 5-judge panel on the full diff before commit, same as every batch. Correctness/architecture
  judges focus on the boundary math + the recompute purity; security on the ownership check + that the
  integrity log is untouched.

---

## 8. Out of scope (YAGNI / deferred)

- **Sequential level/session unlocking** — the re-gating foundation. Its own spec, built next.
- **Undo / restore** — a reset is irreversible by design (the `ResetLog` records *that* it happened and the
  pre-reset level/XP, but is not a full snapshot to restore from).
- **Bulk reset** (whole classroom at once) — single-student only for v1.
- **Notifying the student** in-app that they were reset — not in v1.

---

## 9. Success criteria

1. A teacher can full-reset their own student → progress returns to exact defaults; account, character,
   class, and `StudentAttempt` log all intact.
2. A teacher can reset their student from a chosen session → earlier-session solves remain; that session and
   all later ones are cleared; every stat is recomputed to match the surviving solves (no drift).
3. A teacher **cannot** reset a student who isn't in their classroom (403).
4. Every reset writes a durable `ResetLog` row; the `StudentAttempt` integrity log is provably unchanged.
5. `computeResetProgress` is idempotent and verified by the runnable assertion script; panel returns PASS.
