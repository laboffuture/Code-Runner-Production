# Judge Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repeatable 5-judge blocking review gate that debates a code change across two rounds and blocks on any surviving HIGH finding.

**Architecture:** The panel is a Claude Code project skill (`.claude/skills/judge-panel/`). The main agent runs the skill: it composes a dispatch prompt per judge (`shared-preamble + judge charge + diff/context`), dispatches 5 `general-purpose` subagents in parallel (Round 1), re-dispatches them with all findings for cross-examination (Round 2), applies the severity veto, and emits a verdict. Judges are markdown charges; the orchestration lives in `SKILL.md`. No DB, no UI, no git hooks — it's a workflow the main agent invokes before committing substantive code.

**Tech Stack:** Markdown skill + judge charges; Claude Code `Agent` tool for dispatch (general-purpose agents, which have Bash for the real-environment judge); `git diff` as the change bundle; `npx tsc --noEmit` as the real-environment verifier.

---

## File Structure

```
DO_NOT_DISTURB.md                              # repo-root guardrail contract
CLAUDE.md                                       # + pointer to the contract & panel
.claude/skills/judge-panel/
  SKILL.md                                      # orchestrator (the gate)
  shared-preamble.md                            # finding schema + severity rubric (Round 1)
  cross-exam-preamble.md                        # Round 2 refute/concede/escalate rules
  verdict-template.md                           # final report shape
  judges/
    correctness.md                              # lens charge
    real-environment.md                         # lens charge (has Bash)
    security.md                                 # lens charge
    simplicity.md                               # lens charge
    architecture.md                             # lens charge
  tests/
    bad-diff.patch                              # known-bad change (acceptance A)
    clean-diff.patch                            # clean change (acceptance B)
```

Each file has one responsibility. The shared preamble + cross-exam preamble keep the finding schema and round-2 rules defined **once** (DRY); judge charges hold only their lens. The orchestrator composes them at dispatch time.

---

### Task 1: Do-Not-Disturb contract

**Files:**
- Create: `DO_NOT_DISTURB.md`
- Modify: `CLAUDE.md` (append a pointer)

- [ ] **Step 1: Write the contract file**

Create `DO_NOT_DISTURB.md`:

```markdown
# DO NOT DISTURB — Coderunner Guardrails

Hard rules. The Judge Panel (`.claude/skills/judge-panel/`) treats any violation as an
automatic HIGH finding that blocks the change.

1. **Live secrets** — `.env.local` (Atlas, JWT_SECRET, Railway, Cloudinary, Redis). Never commit,
   never print, never echo into logs. `.env.local` stays git-ignored. Rotation is the user's alone.
2. **Docker sandbox** — never weaken the runner sandbox flags: `--network none`, `--cap-drop ALL`,
   `--security-opt no-new-privileges`, `--pids-limit`, `--memory`/`--memory-swap`/`--cpus` caps,
   `--read-only`, tmpfs, non-root `--user`.
3. **Auth & role gates** — never remove or loosen an auth check, ownership/IDOR check, or
   `developer`/`teacher` role gate.
4. **No contract drift** — never change an API response shape, field name, or type without updating
   every consumer in the same change. (This is the `roster`/`students` class of bug.)
5. **Shared package** — after editing anything in `packages/shared`, rebuild it to `dist/` or the
   api/runner run stale code.
6. **Builds** — never run a production `next build` against the working tree (it corrupts `.next`).
   `npx tsc --noEmit` is the correctness verifier.
7. **LSP lies** — the editor shows false JSX-parse errors on `.tsx`. `tsc` is authoritative.
8. **Hygiene** — no debug `console.log`/`print` left behind; Tailwind = no interpolated color class
   names (full static strings or lookup maps only).
9. **Shipped features** — if a change alters working behavior, that's a HIGH unless the user has
   explicitly signed off.
```

- [ ] **Step 2: Add a pointer to CLAUDE.md**

Append to `CLAUDE.md`:

```markdown

## Guardrails & Review
- **`DO_NOT_DISTURB.md`** (repo root) — hard rules that must never be violated.
- **Judge Panel** (`.claude/skills/judge-panel/`) — run before committing substantive code
  (anything under `apps/`, `packages/`, `web/src`). It blocks on any surviving HIGH finding.
```

- [ ] **Step 3: Verify both files**

Run: `test -f DO_NOT_DISTURB.md && grep -q "Judge Panel" CLAUDE.md && echo OK`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add DO_NOT_DISTURB.md CLAUDE.md
git commit -m "docs(judge-panel): add do-not-disturb contract + CLAUDE.md pointer"
```

---

### Task 2: Shared preamble (finding schema + severity)

**Files:**
- Create: `.claude/skills/judge-panel/shared-preamble.md`

- [ ] **Step 1: Write the shared preamble**

Create `.claude/skills/judge-panel/shared-preamble.md`:

```markdown
You are ONE of five independent judges reviewing a single code change for **Coderunner** — a
sandboxed coding-education platform for children (Next.js web → Express API → BullMQ/Redis →
Docker-sandboxed Python runner → MongoDB). Production runs PM2 (2× api + 2× runner) behind Nginx;
classrooms of students sit behind a single shared NAT IP.

You review ONLY through your assigned lens (stated below this preamble). Do not rubber-stamp. If you
find nothing HIGH through your lens, say so explicitly.

You are given, below your charge:
- **INTENT** — what the change is supposed to do.
- **DIFF** — the change under review.
- **CONTRACT** — the contents of `DO_NOT_DISTURB.md`. Any violation of it is an automatic HIGH.
You may use Read/Grep/Glob to trace call paths and confirm consumers. Cite real `file:line`.

## Severity
- **HIGH** — breaks correctness, security, a shipped feature, or the architecture; or violates the
  DO_NOT_DISTURB contract. A HIGH means "do not ship this as-is."
- **LOW** — nit, style, or non-blocking improvement.

## Output format (return EXACTLY this, nothing else)
For each finding:

FINDING
  severity: HIGH | LOW
  lens: <your lens name>
  location: <file:line, or "cross-cutting">
  claim: <one sentence: what is wrong>
  reasoning: <why it is wrong / how it manifests at runtime>
  suggested_fix: <concrete remedy>

If you have zero findings:

NO FINDINGS (lens: <your lens name>)
```

- [ ] **Step 2: Verify**

Run: `grep -q "FINDING" .claude/skills/judge-panel/shared-preamble.md && echo OK`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/judge-panel/shared-preamble.md
git commit -m "feat(judge-panel): shared round-1 preamble (finding schema + severity)"
```

---

### Task 3: Cross-examination preamble (Round 2)

**Files:**
- Create: `.claude/skills/judge-panel/cross-exam-preamble.md`

- [ ] **Step 1: Write the cross-exam preamble**

Create `.claude/skills/judge-panel/cross-exam-preamble.md`:

```markdown
ROUND 2 — CROSS-EXAMINATION. You are the same judge as in Round 1, with the same lens (below).

Below your charge you are given ALL findings from ALL five judges in Round 1 (the FINDINGS BUNDLE),
plus the original INTENT, DIFF, and CONTRACT.

For EVERY finding in the bundle — including your own — output a verdict line:

VERDICT
  finding_ref: <judge-lens + short claim, enough to identify it>
  ruling: REFUTE | CONCEDE | ESCALATE
  reason: <REFUTE: concrete reason it is a non-issue, e.g. "consumer is dead code / guarded upstream
           at file:line". CONCEDE: agree it stands. ESCALATE: agree AND argue it is worse / should be
           HIGH, with reasoning.>

Be intellectually honest: refute only with evidence, concede real problems even if another judge
raised them, escalate when a LOW is actually load-bearing. Cite `file:line` when refuting.
```

- [ ] **Step 2: Verify**

Run: `grep -q "REFUTE | CONCEDE | ESCALATE" .claude/skills/judge-panel/cross-exam-preamble.md && echo OK`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/judge-panel/cross-exam-preamble.md
git commit -m "feat(judge-panel): round-2 cross-examination preamble"
```

---

### Task 4: The five judge charges

**Files:**
- Create: `.claude/skills/judge-panel/judges/correctness.md`
- Create: `.claude/skills/judge-panel/judges/real-environment.md`
- Create: `.claude/skills/judge-panel/judges/security.md`
- Create: `.claude/skills/judge-panel/judges/simplicity.md`
- Create: `.claude/skills/judge-panel/judges/architecture.md`

- [ ] **Step 1: Correctness charge**

Create `.claude/skills/judge-panel/judges/correctness.md`:

```markdown
LENS: Correctness.

Hunt for: logic errors, wrong or missing edge cases, race conditions, operator-precedence bugs
(`&&` binding before `||`), off-by-one, unhandled promise rejections / swallowed errors, incorrect
async ordering, and read-modify-write that loses updates under concurrency. Trace each changed
function's call path with Read/Grep before ruling. Known Coderunner hazards to probe: Mongo
findOne→mutate→save without atomic `$inc`/`$addToSet`; boolean test chains mixing `&&` and `||`;
double-processing of code on the grade path. A real logic bug on a user path is HIGH.
```

- [ ] **Step 2: Real-environment charge**

Create `.claude/skills/judge-panel/judges/real-environment.md`:

```markdown
LENS: Real-environment fit.

You have Bash. For every package the diff touches, RUN `npx tsc --noEmit` (cwd = that package:
`Coderunner-Backend/apps/api`, `Coderunner-Backend/apps/runner`, `Coderunner-Frontend/web`) and any
existing tests; a failure is HIGH. Then reason about the ACTUAL deployment, not an idealized one:
- PM2 runs **2× api + 2× runner** — does the change assume a single process? (in-memory locks/flags,
  container-pool ownership, "apply once" guards that aren't atomic across instances) → HIGH.
- Classrooms share **one NAT public IP** with `trust proxy` on — does anything key per-IP and so
  punish a whole class? → HIGH.
- Docker sandbox is driven via the shell `docker` CLI; Redis/BullMQ is the queue; Mongo is shared.
- `@code-runner/shared` is consumed from `dist/` — an edit there without a rebuild ships stale code.
If the change cannot survive the real environment, that is HIGH.
```

- [ ] **Step 3: Security charge**

Create `.claude/skills/judge-panel/judges/security.md`:

```markdown
LENS: Security & integrity.

Probe: sandbox escape or any weakening of the Docker flags (automatic HIGH); auth bypass; missing
ownership / IDOR checks; removed or loosened `developer`/`teacher` role gates; secret exposure or
logging; injection (command/path/NoSQL); and anti-cheat soundness (can a student forge metrics,
read test answers, or grade arbitrary userIds?). Kids run untrusted code here — err toward HIGH on
anything that widens the trust boundary.
```

- [ ] **Step 4: Simplicity charge**

Create `.claude/skills/judge-panel/judges/simplicity.md`:

```markdown
LENS: Simplicity & conventions.

Flag: YAGNI violations and over-engineering, dead/unreachable code, duplication, not following the
codebase's existing patterns and naming, interpolated Tailwind class names, and leftover debug
`console.log`/`print`. These are usually LOW — raise to HIGH only when the complexity hides a
correctness or maintenance trap. Your job in the debate is to push back on solutions the other
judges might over-build: the smallest change that satisfies the intent and the contract wins.
```

- [ ] **Step 5: Architecture charge**

Create `.claude/skills/judge-panel/judges/architecture.md`:

```markdown
LENS: Architecture-fit & resilience.

Two questions. (1) FIT: does the change sit coherently in the whole architecture with no contract
drift? An API response shape/field/type changed without updating every consumer is HIGH (e.g.
backend returns `roster`, frontend reads `students`). Watch for hidden coupling and leaky
boundaries. (2) RESILIENCE: can the system withstand any situation — load spikes, a runner dying or
restarting mid-job, a rogue or timed-out container, Mongo contention, malformed or hostile input,
partial failures? Missing resilience on a critical path (execution, grading, auth) is HIGH.
```

- [ ] **Step 6: Verify all five exist**

Run: `ls .claude/skills/judge-panel/judges/ | sort | tr '\n' ' '`
Expected: `architecture.md correctness.md real-environment.md security.md simplicity.md`

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/judge-panel/judges/
git commit -m "feat(judge-panel): the five judge lens charges"
```

---

### Task 5: Verdict report template

**Files:**
- Create: `.claude/skills/judge-panel/verdict-template.md`

- [ ] **Step 1: Write the template**

Create `.claude/skills/judge-panel/verdict-template.md`:

```markdown
# Judge Panel Verdict — <change name> — <YYYY-MM-DD>

**Change intent:** <one line>
**Diff scope:** <files touched>

## Round 1 — findings by judge
- ⚙️ Correctness: <n HIGH, n LOW | NO FINDINGS>
- 🌐 Real-environment: <... + tsc result per package>
- 🔒 Security: <...>
- ✂️ Simplicity: <...>
- 🏛️ Architecture: <...>

## Round 2 — cross-examination outcomes
For each Round-1 finding: REFUTE / CONCEDE / ESCALATE tally across the other four judges.

| finding | raised by | refuted by (n/4) | result |
|---------|-----------|------------------|--------|
| ...     | ...       | ...              | survives-HIGH / cleared / LOW |

## Surviving HIGHs (block the change)
1. <file:line — claim — fix>   (or: "none")

## Recorded LOWs (non-blocking)
- <...>

## VERDICT: PASS | BLOCKED
<If BLOCKED: the surviving HIGHs must be fixed, then the panel re-runs on the new diff.>
```

- [ ] **Step 2: Verify**

Run: `grep -q "VERDICT: PASS | BLOCKED" .claude/skills/judge-panel/verdict-template.md && echo OK`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/judge-panel/verdict-template.md
git commit -m "feat(judge-panel): verdict report template"
```

---

### Task 6: The orchestrator (SKILL.md)

**Files:**
- Create: `.claude/skills/judge-panel/SKILL.md`

- [ ] **Step 1: Write the skill**

Create `.claude/skills/judge-panel/SKILL.md`:

```markdown
---
name: judge-panel
description: Run before committing substantive code (anything under apps/, packages/, or web/src). Dispatches a 5-judge blocking review that debates the change across two rounds and blocks on any surviving HIGH finding. Use when verifying a change is truly done.
---

# Judge Panel — 5-Judge Blocking Review Gate

A blocking gate. The change is NOT done until the panel returns PASS. See the design spec at
`docs/superpowers/specs/2026-06-01-judge-panel-design.md`.

## When it runs
Before committing any change under `apps/`, `packages/`, or `web/src`. Pure-docs / copy / comment-only
changes skip it (fast-path). When in doubt, run it.

## Inputs you assemble first
1. **DIFF** — `git --no-pager diff` (working set) or `git --no-pager diff --staged`.
2. **INTENT** — one line: what the change is supposed to do.
3. **CONTRACT** — the contents of `DO_NOT_DISTURB.md`.

## Round 1 — independent (parallel)
For EACH of the 5 judges, dispatch a `general-purpose` subagent (single message, 5 parallel Agent
calls). Each agent's prompt is the concatenation, in order, of:
1. `shared-preamble.md`
2. `judges/<lens>.md`
3. `--- INTENT ---` + the intent
4. `--- DIFF ---` + the diff
5. `--- CONTRACT ---` + the DO_NOT_DISTURB contents

The real-environment judge MUST run `npx tsc --noEmit` per touched package; tell it the repo paths.
Collect all five FINDINGS outputs verbatim into a FINDINGS BUNDLE.

## Round 2 — cross-examination (parallel)
For EACH of the 5 judges, dispatch a `general-purpose` subagent again. Each prompt is, in order:
1. `cross-exam-preamble.md`
2. `judges/<lens>.md`   (same lens as that judge)
3. `--- FINDINGS BUNDLE ---` + all Round-1 findings
4. `--- INTENT / DIFF / CONTRACT ---` (same as Round 1)

Collect each judge's VERDICT lines.

## Verdict — severity veto
For each Round-1 finding, tally the other four judges' Round-2 rulings:
- A finding is **surviving-HIGH** if it is HIGH and **fewer than 3 of the other 4 judges REFUTED it**
  (i.e. it was NOT refuted by a majority). ESCALATE counts as support, not refute.
- **Any surviving-HIGH ⇒ BLOCKED.** Report them, fix them, then RE-RUN the whole panel on the new
  diff. Repeat until zero surviving-HIGHs.
- **Zero surviving-HIGHs ⇒ PASS.** Commit the change (scoped message + tsc status + Co-Authored-By).

Emit the verdict using `verdict-template.md`. Record surviving LOWs; they never block.

## Non-negotiables
- Never trim the panel below 5 judges for cost/time.
- Judges FIND; the main agent FIXES and re-runs. Judges never edit code.
- Strictly two rounds — no unbounded debate.
```

- [ ] **Step 2: Verify frontmatter + key sections**

Run: `grep -q "name: judge-panel" .claude/skills/judge-panel/SKILL.md && grep -q "surviving-HIGH" .claude/skills/judge-panel/SKILL.md && echo OK`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/judge-panel/SKILL.md
git commit -m "feat(judge-panel): orchestrator skill (two-round debate + severity veto)"
```

---

### Task 7: Acceptance test A — known-bad diff must BLOCK

This is the spec's success criterion #1. We feed the panel a diff that re-introduces the
`roster`/`students` contract-drift bug and confirm it is BLOCKED.

**Files:**
- Create: `.claude/skills/judge-panel/tests/bad-diff.patch`

- [ ] **Step 1: Write the known-bad diff fixture**

Create `.claude/skills/judge-panel/tests/bad-diff.patch` (a realistic unified diff that breaks the
API contract — frontend reads a key the backend never sends):

```diff
--- a/Coderunner-Frontend/web/src/app/teacher/classrooms/[id]/page.tsx
+++ b/Coderunner-Frontend/web/src/app/teacher/classrooms/[id]/page.tsx
@@ interface ClassroomData {
   classroom: { id: string; name: string; age_group: string; joinCode: string };
-  roster: StudentRow[];
+  students: StudentRow[];
   overview: Overview;
 }
@@ render
-  const students = data?.roster || [];
+  const students = data?.students || [];
```

(Intent to give the panel: "Rename the roster field to students on the teacher dashboard." The
backend at `teacher.routes.ts` still returns `roster`, so this silently empties the dashboard.)

- [ ] **Step 2: Run the panel on the fixture**

Invoke the `judge-panel` skill with:
- INTENT = "Rename the roster field to students on the teacher dashboard."
- DIFF = contents of `.claude/skills/judge-panel/tests/bad-diff.patch`
- CONTRACT = contents of `DO_NOT_DISTURB.md`

Expected: the **Architecture-fit judge (and likely Correctness)** raises a HIGH for contract drift
(backend returns `roster`; consumer now reads `students` → always empty); it survives cross-exam
(no judge can refute it — the backend genuinely sends `roster`). **VERDICT: BLOCKED.**

- [ ] **Step 3: Record the run**

If BLOCKED as expected, the gate works on the negative case. If it PASSED, the judges are too weak —
strengthen the relevant charge (architecture/correctness) to explicitly hunt contract drift, then
re-run. Do not proceed until this case BLOCKS.

- [ ] **Step 4: Commit the fixture**

```bash
git add .claude/skills/judge-panel/tests/bad-diff.patch
git commit -m "test(judge-panel): known-bad contract-drift fixture (expects BLOCKED)"
```

---

### Task 8: Acceptance test B — clean diff must PASS

Spec success criterion #2 (and #3: a lone false positive is refuted, not blocking).

**Files:**
- Create: `.claude/skills/judge-panel/tests/clean-diff.patch`

- [ ] **Step 1: Write a clean, correct diff fixture**

Create `.claude/skills/judge-panel/tests/clean-diff.patch` — the real fix we already shipped
(reorder middleware so the limiter keys per-user), which is correct and contract-safe:

```diff
--- a/Coderunner-Backend/apps/api/src/routes/execution.routes.ts
+++ b/Coderunner-Backend/apps/api/src/routes/execution.routes.ts
@@ POST /execution/submit
-router.post('/submit', executionLimiter, dailyExecutionLimiter, optionalAuthMiddleware, async (req, res) => {
+router.post('/submit', optionalAuthMiddleware, executionLimiter, dailyExecutionLimiter, async (req, res) => {
```

(Intent: "Run optionalAuthMiddleware before the rate limiters so they key on req.user.userId
instead of the shared NAT IP.")

- [ ] **Step 2: Run the panel on the fixture**

Invoke `judge-panel` with INTENT/DIFF/CONTRACT as above.

Expected: at most LOW findings (e.g. someone may note anonymous runs still fall back to IP — a LOW,
correctly refuted/conceded as acceptable since grading requires auth). No surviving-HIGH.
**VERDICT: PASS.**

- [ ] **Step 3: Record the run**

If a HIGH survives here, a judge is over-firing. Confirm via the Round-2 rulings whether it was a
genuine miss in our shipped fix or an over-eager judge; if over-eager, tune that charge and re-run.
Do not proceed until this case PASSES.

- [ ] **Step 4: Commit the fixture**

```bash
git add .claude/skills/judge-panel/tests/clean-diff.patch
git commit -m "test(judge-panel): clean-diff fixture (expects PASS)"
```

---

### Task 9: Wire it up + register

**Files:**
- Modify: `PROJECT_STATUS.md` (note the panel as a delivered process asset)

- [ ] **Step 1: Make the skill discoverable**

The skill lives at `.claude/skills/judge-panel/SKILL.md`. If it does not appear as an invocable skill
yet, run `/reload-plugins` (user action) or restart the session so Claude Code registers it. Until
then it is still runnable: the main agent reads `SKILL.md` and follows it directly.

- [ ] **Step 2: Add a short note to PROJECT_STATUS.md**

Under §3 (Completed Work), add a row noting: "Judge Panel — 5-judge blocking review gate
(`.claude/skills/judge-panel/`) + `DO_NOT_DISTURB.md` contract. Run before committing substantive
code." Mark status Done.

- [ ] **Step 3: Verify the full asset set is present**

Run:
```bash
ls .claude/skills/judge-panel .claude/skills/judge-panel/judges .claude/skills/judge-panel/tests DO_NOT_DISTURB.md
```
Expected: all files from the File Structure section exist.

- [ ] **Step 4: Commit**

```bash
git add PROJECT_STATUS.md
git commit -m "docs(judge-panel): record the review gate in project status"
```

---

## Notes for the executor

- **The acceptance tests (Tasks 7–8) are integration runs, not unit tests** — they exercise the real
  panel by dispatching real subagents. They are the only meaningful verification for a
  prompt-engineering deliverable, and they encode the spec's success criteria.
- **Inline execution is recommended over subagent-driven here**, because Tasks 7–8 require the main
  agent to dispatch the 5 judge subagents — a worker subagent generally cannot fan out its own panel.
- Keep judge charges short and lens-pure; if a charge starts overlapping another lens, trim it — the
  debate's value comes from divergent lenses.
```
