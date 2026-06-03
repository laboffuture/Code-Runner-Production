# Teacher Teaching Guide (Explained Answer Key) — Design Spec

> Status: design approved in conversation (2026-06-03). Build the system once (all 4 levels),
> populate **Level 1 first**, then L2→L3→L4 in waves.

## 1. Purpose
Give teachers, inside the teacher portal (the same area where they track student data), a
**detailed, explained answer key for every problem, browsable by session**. A teacher opens a
session, sees its problems, and reads each problem's canonical solution **plus a clear,
step-by-step explanation** they can read and relay to a student. Today no answer key exists
anywhere — `case_code` is a student-facing teaching snippet (sometimes incomplete), and
`expected_output` is the output, not the solving code.

## 2. The one hard rule (security)
A student must **never** reach the answer key by any path. Precedent: the removed
`/test-cases/all` route once leaked hidden answers with no auth; solution code is even more
sensitive. Therefore the answer key lives in its **own collection**, behind a
**teacher+developer role gate**, and is **never** included in any student-facing query/response.

## 3. Data model — `Solution` (new collection `solutions`, `packages/shared`)
One record per problem, keyed by `problem_id` (unique). A structured object so it reads as a
guide, not a code dump:
```
interface ISolution {
  problem_id: number;          // unique, links to Problem
  level_number: number;        // 1-4  (for browsing)
  session_id: number;          // for browsing by session
  solution_code: string;       // canonical, verified Python (the real answer)
  approach: string;            // 1-2 sentences: the strategy in plain English
  walkthrough: Array<{         // the logic in ordered, labelled steps
    label: string;             //   "Read the input"
    code_snippet: string;      //   "n = int(input())"
    explanation: string;       //   "We read the first line and turn it into a number with int()."
  }>;
  key_concepts: string[];      // ["input()", "int() conversion", "for loop"]
  common_mistakes: string[];   // teacher gold: "Forgot int() -> joins text instead of adding"
  verified: boolean;           // set true by the verifier when solution_code passes all test cases
  created_at: Date; updated_at: Date;
}
```
Indexes: unique `problem_id`; `{ level_number, session_id }` for the browser.

## 4. Source of truth + the auto-verifier (the quality win)
- **Authored in version control** under `scripts/solutions/11-14/level-<n>/` (one source file per
  problem or per session). This is the canonical answer key.
- A **seeder** loads them into the `solutions` collection (idempotent upsert by `problem_id`),
  same pattern as the problem seeds.
- A **verifier** runs each `solution_code` against that problem's `test_cases` (the exact
  newline-normalised, Linux-runner-parity check used during the audit) and sets `verified`.
  A solution that fails its own test cases is flagged, not shipped. This is permanent curriculum
  insurance — it would have caught every bug fixed this week (degenerate tests, unicode traps,
  question-vs-graded mismatches).

## 5. API (teacher + developer gated — never student)
The guide endpoints require a logged-in user whose role is `teacher` OR `developer` (curriculum
staff). Because the 3-role model makes `developer` distinct from `teacher` (not a superset), the
existing `teacherMiddleware` (which 403s anyone who isn't exactly `teacher`) is too narrow. Add a
small `staffMiddleware` = "role is teacher or developer" and gate these routes with
`authMiddleware` + `staffMiddleware`. (A new endpoint group, e.g. mounted at `/curriculum`, keeps
this cleanly separate from the teacher-only classroom routes.) Routes:
- `GET /curriculum/tree` → the browse tree: levels → sessions → problems (id, title, difficulty,
  case_number, `hasGuide` boolean). Sourced from `problems` + a presence check on `solutions`.
  No solution content in this list.
- `GET /curriculum/problems/:problemId/guide` → the full `Solution` for one problem (the 5 parts).
  404 / `{ available: false }` when no guide exists yet (graceful during the wave rollout).
Both behind `authMiddleware` + `staffMiddleware`; neither is reachable by a student token. The
student problem route (`problems.routes.ts`) is unchanged and never touches `solutions`. The
frontend page that consumes these lives in the teacher portal (§6).

## 6. Frontend surface — teacher portal, by session
A new page in the existing teacher area (sibling to classrooms / students):
`/teacher/curriculum` (the "Answer Guide").
- **Browse:** Level (11-14: 1-4) → Session → the session's problems (6 per lesson session).
- **Guide panel** for a selected problem renders the 5 parts cleanly:
  - `solution_code` in a syntax-styled code block,
  - `approach` as a lead sentence,
  - `walkthrough` as numbered steps (label + its code snippet + plain explanation),
  - `key_concepts` as chips,
  - `common_mistakes` as a callout list.
- A problem without a guide shows "Detailed guide coming soon."
- Inherits the teacher gate from the teacher `layout`/`ProtectedRoute requireRole="teacher"`.
Uses static Tailwind classes / the existing teacher-portal styling. (Inline "View guide" links
from a student's failed problems in the deep-dive are a v2 enhancement, out of scope here.)

## 7. Rollout
1. Build the **system** end-to-end (model + seeder + verifier + 2 routes + page) with **Level 1
   fully populated** (~66 problems incl. the project). ~150 verified `solution_code` already
   exist from the audit (L1+L2+capstones), so L1's code half is largely in hand; we add the
   explanation layer.
2. Populate **L2**, then **L3**, then **L4** in subsequent waves (content authoring; each wave
   verifier-checked).

## 8. Testing
- The **verifier** is the built-in test: every `solution_code` must reproduce its test cases'
  expected output (CI-able; run after each authoring wave).
- `tsc --noEmit` clean: shared, api, web (+ shared dist rebuilt after the model edit).
- 5-judge panel before each commit: security (separate collection + role gate, no student leak),
  correctness, real-env, simplicity, architecture (no contract drift on the student path).

## 9. Decisions (confirmed in conversation)
1. Surface: in the teacher portal, **browse by session** (a sibling teacher page). ✓
2. Structure: the **5-part** guide (code / approach / walkthrough / key_concepts / common_mistakes). ✓
3. Storage: **separate `solutions` collection**, role-gated; **version-controlled source** that
   also drives the verifier. ✓
4. Rollout: system for all 4 levels, **L1 content first**. ✓

## 10. Out of scope (YAGNI / later)
- Inline guide links from the student deep-dive (v2).
- Student-facing hints/solutions of any kind (explicitly never for students).
- Auto-generating explanations; guides are authored + verifier-checked.
- Editing guides from the UI (authored in version control for now).

## 11. Success criteria
1. A teacher browses to a Level 1 session and reads a clear, detailed, step-by-step answer guide
   for each of its problems.
2. Every shipped guide's `solution_code` passes that problem's test cases (verifier green).
3. No student-reachable endpoint can return any `Solution` data.
4. tsc clean (shared/api/web); panel PASS.
