# Teacher Teaching Guide (Explained Answer Key) — Design Spec

> Status: design approved in conversation (2026-06-03). Build the system once (all 4 levels),
> populate **Level 1 first**, then L2→L3→L4 in waves.

## 1. Purpose
Give teachers, inside the teacher portal (the same area where they track student data), a
**detailed, explained answer key browsable by session and case**. A session has 5 cases (plus a
final challenge). When a teacher opens a case, they see — in one place, ready to teach from:
1. **The question** — what the case asks (shown for context).
2. **The answer** — the canonical solution code.
3. **The logic breakdown** — the solution explained step by step.
4. **An easy, kid-friendly explanation** — plain words the teacher can relay to the student.
5. **A worked example** — a concrete "if the input is X, the program does Y → prints Z" to show.
The goal: opening a case makes explaining it to a student effortless.

Today no answer key exists anywhere — `case_code` is a student-facing teaching snippet (sometimes
incomplete), and `expected_output` is the output, not the solving code.

## 2. The one hard rule (security)
A student must **never** reach the answer key by any path. Precedent: the removed
`/test-cases/all` route once leaked hidden answers with no auth; solution code is even more
sensitive. Therefore the answer key lives in its **own collection**, behind a
**teacher+developer role gate**, and is **never** included in any student-facing query/response.

## 3. Data model — `Solution` (new collection `solutions`, `packages/shared`)
One record per problem (= per case), keyed by `problem_id` (unique). Structured so it reads as a
teaching guide, not a code dump. The five teacher-facing parts map to fields as below — note **the
question is NOT stored here**: it already lives on the `Problem` doc and is joined into the guide
response (single source of truth), so the teacher sees it without duplication/drift.
```
interface ISolution {
  problem_id: number;          // unique, links to Problem (the case)
  level_number: number;        // 1-4  (browse)
  session_id: number;          // browse by session
  case_number: number;         // browse by case within a session (1-5, + final)

  // (1) question  -> joined from Problem.question at read time, not stored here.

  // (2) THE ANSWER
  solution_code: string;       // canonical, verified Python

  // (3) LOGIC BREAKDOWN — the solution explained step by step
  walkthrough: Array<{
    label: string;             //   "Read the input"
    code_snippet: string;      //   "n = int(input())"
    explanation: string;       //   "We read the first line and turn it into a number with int()."
  }>;

  // (4) EASY EXPLANATION — plain, kid-friendly words a teacher relays to the student
  student_explanation: string;

  // (5) WORKED EXAMPLE — a concrete walked example to show the student
  worked_example: string;      //   "If the student types 5, the loop counts 1, 2, 3, 4, 5 and prints each."

  // supporting (optional, teacher-helpful)
  key_concepts: string[];      // ["input()", "int() conversion", "for loop"]
  common_mistakes: string[];   // "Forgot int() -> joins text instead of adding"

  verified: boolean;           // set true by the verifier when solution_code passes all test cases
  created_at: Date; updated_at: Date;
}
```
Indexes: unique `problem_id`; `{ level_number, session_id, case_number }` for the browser.

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
- `GET /curriculum/problems/:problemId/guide` → the full guide for one case: the `Solution`
  (answer / walkthrough / student_explanation / worked_example / concepts / mistakes) **plus the
  `question`** joined from the `Problem` doc, so the teacher gets all 5 parts in one payload.
  404 / `{ available: false }` when no guide exists yet (graceful during the wave rollout).
Both behind `authMiddleware` + `staffMiddleware`; neither is reachable by a student token. The
student problem route (`problems.routes.ts`) is unchanged and never touches `solutions`. The
frontend page that consumes these lives in the teacher portal (§6).

## 6. Frontend surface — teacher portal, by session
A new page in the existing teacher area (sibling to classrooms / students):
`/teacher/curriculum` (the "Answer Guide").
- **Browse:** Level (11-14: 1-4) → Session → the session's **cases** (the 5 cases + the final
  challenge), each a clickable row.
- **Guide panel** for a selected case renders the 5 teaching parts top-to-bottom, in the order a
  teacher would use them:
  1. **The Question** — the case's `question` (so the teacher has the task in front of them),
  2. **The Answer** — `solution_code` in a syntax-styled code block,
  3. **How it works (Logic Breakdown)** — `walkthrough` as numbered steps (label + code snippet +
     plain explanation),
  4. **Explain it simply** — `student_explanation`, the kid-friendly script to relay,
  5. **Example** — `worked_example`, a concrete walked example to show the student.
  Plus, below, supporting chips for `key_concepts` and a `common_mistakes` callout.
- A case without a guide yet shows "Detailed guide coming soon."
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
1. Surface: in the teacher portal, **browse by session → case** (a sibling teacher page); a
   session has 5 cases + a final challenge. ✓
2. Structure per case (the 5 teaching parts, in order): **question** (joined from the Problem) →
   **answer** (solution_code) → **logic breakdown** (walkthrough) → **easy student explanation** →
   **worked example**; with supporting key_concepts + common_mistakes. ✓
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
