# Curriculum Bug Domains — 11–14 (L3 + L4 review)

> Created 2026-06-03. Read-only automated scan of all 122 L3+L4 problems (problem_id 121–242)
> for the bug classes the judge panel surfaced, plus classification of each. "Graded" = the
> exact stdout the autograder compares (it strips trailing whitespace per line, exact-match otherwise).

## Already fixed this audit (context)
- L1: P4 (NameError teaching example), P50 (→ arrow), P60 (en-dash), P999 (\n corruption).
- L2: all 10 lessons verified; **P1000** capstone rewritten (question-vs-graded mismatch).
- L3: **P181** capstone fully repaired (en-dash trap + under-spec question + contradictory hint + degenerate tests).
- DB-wide: the literal-`\n` test-input corruption (161 problems) re-seeded clean; verified 0 remaining in L3+L4.

---

## Domain 1 — DEGENERATE TEST CASES (21 problems) — the dominant issue
All of a problem's test cases produce the **identical** expected output, so a hard-coded
program that ignores input scores 100%. Splits into three sub-types:

### 1a. Logic / project degenerate — REAL BUGS, FIXABLE (3)
The problem *should* vary with input but doesn't. Fix = redesign test cases with varied
inputs/outputs (as done for P181).
- **P242** (L4 **PROJECT** "GALACTIC COMMAND", Hard) — takes no input, prints a fixed 5-line banner; 7 identical tests. The Level-4 capstone tests nothing. **Highest priority** (level-unlock capstone, same class as P181/P1000).
- **P173** (L3 c5 "Method Resolution Order", Medium) — inputs (Alpha/Bravo/Charlie) are ignored; output is a fixed MRO dump. 7 identical tests.
- **P198** (L4 c5 "Nested Try Blocks", Medium) — 7 identical tests.

### 1b. Pygame — STRUCTURALLY UN-STDOUT-TESTABLE (12)
Pygame draws to a graphical window; there is no meaningful stdout to compare. The "test"
is a fake confirmation string (e.g. "Window created successfully") the grader cannot verify
— a student can print that string without doing anything. Sessions 42–43:
- P230, P231, P232, P233, P234, **P235 (FINAL)**, P236, P237, P238, P239, P240, **P241 (FINAL)**.
- **Root cause:** graphical exercises don't fit an stdout autograder. Options: (a) accept as
  un-graded "completion" exercises; (b) grade by static code-inspection / expected API calls;
  (c) replace with stdout-testable logic problems. Needs a product decision, not a test tweak.

### 1c. File-operation degenerate — MOSTLY STRUCTURAL / side-effecting (6)
File create/delete/metadata/folder ops whose real effect is on the filesystem, not stdout,
so the test collapses to a fixed confirmation. Sessions 37–41:
- **P205 (FINAL)**, P215, **P217 (FINAL)**, P222, P225, P228.
- Note: many file problems are FINE (e.g. P206 "read the file back and print contents" varies
  with input). Only the side-effect-only ones are degenerate.
- Fix: where the task reads data back (printable), add varied test cases; where it's a pure
  side effect (made a folder), same structural question as pygame.

## Domain 2 — WEAK / FEW-DISTINCT TESTS (7) — near-degenerate
≥5 test cases but only 2 distinct outputs — weak discrimination (a near-miss solution can pass).
Mostly L4 custom-exception lessons where outcomes are binary (raised / not):
- P160 (L3 c4), P185, P186, P192, P195, P196, P197 (L4 exception handling).
- Severity LOW–MEDIUM: somewhat inherent to exception exercises, but strengthenable with more
  varied trigger/no-trigger inputs.

## Domain 3 — QUESTION-vs-GRADED MISMATCH (capstones + Hard finals) — needs panel review
The question demands structure the stdout grader can't see (functions, classes, "return",
"display readings") or under-specifies the exact output. Confirmed on P1000 + P181 (fixed).
- **P242** almost certainly shares this (its question describes a multi-class file-logging
  system; the graded output is a fixed banner). Pending panel review.
- The L3/L4 **Hard finals** (case-6: P126, P132, P138, P144, P150, P156, P162, P168, P174, P180,
  P205, P211, P217, P223, P229, P235, P241) are the next most likely carriers — not yet
  individually panel-reviewed.

## Domain 4 — UNICODE IN PROSE (4) — mild, readability only (NOT grading traps)
Un-typeable chars in the QUESTION text only (the kid reads, doesn't type them; expected
output is clean):
- P132, P138 (`×` multiplication sign), P164 (`→` arrow), P241 (`—` em-dash).
- Optional polish: replace with `*`, `->`, `-`. Low priority.
- ✅ Confirmed: **0** un-typeable chars in any graded OUTPUT across L3+L4 (the P50/P60/P181
  trap class is absent in the lessons).

## Domain 5 — UNVERIFIED GRADING CORRECTNESS (gap, not a confirmed bug)
The ~90 non-degenerate L3/L4 **lesson** problems have NOT had reference-solution execution to
confirm a *correct* answer reproduces the expected output (the way L1 + L2 were verified). The
systemic issues (corruption, unicode) are clean, but individual expected-output logic errors
could still exist. Closing this needs reference solutions per problem (heavier; OOP solutions).

---

## Tally (L3+L4, 122 problems)
| Domain | Count | Severity | Action |
|--------|-------|----------|--------|
| 1a Logic/project degenerate | 3 | HIGH | Redesign test cases (like P181) |
| 1b Pygame un-testable | 12 | HIGH (structural) | Product decision on how to grade graphics |
| 1c File side-effect degenerate | 6 | MED–HIGH | Mixed: add tests where printable; else structural |
| 2 Weak/few-distinct | 7 | LOW–MED | Strengthen test variety |
| 3 Question-vs-graded mismatch | P242 + ~17 finals | HIGH (capstones) | Panel-review + reword/redesign |
| 4 Unicode in prose | 4 | LOW | Optional char swap |
| 5 Unverified lesson grading | ~90 | UNKNOWN | Reference-solution execution pass |
| ✅ Unicode output trap | 0 | — | clean |
| ✅ \n corruption | 0 | — | fixed |

## Suggested priority order (when we act)
1. **P242** (L4 capstone) — panel + redesign (highest stakes, confirmed degenerate).
2. **P173, P198** — quick test-case redesigns.
3. **Pygame (12) + file side-effect (6)** — needs your product call on graphics/side-effect grading before any code.
4. **Hard finals (~17)** — panel-review for the question-vs-graded pattern.
5. **Weak tests (7)** — strengthen.
6. **Unicode prose (4)** — optional polish.
7. **Lesson grading-correctness pass (~90)** — reference-solution execution if desired.
