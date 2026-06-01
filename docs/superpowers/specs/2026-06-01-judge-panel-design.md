# Judge Panel — Design Spec

> **Status:** Approved design (2026-06-01). Next step: implementation plan (writing-plans).
> **Scope:** A repeatable, multi-agent blocking review gate for the Coderunner monorepo.

---

## 1. Purpose

Before any substantive change is considered "done," a panel of **5 judge-agents** — each with a
distinct lens — independently reviews the change, then **debates** each other's findings. The change
only passes if **no HIGH-severity flaw survives the debate**. The goal is to catch the class of bugs
that a single reviewer misses: contract drift (e.g. the `roster`/`students` key mismatch), environment
mismatches (e.g. rate-limiter keying on a NAT'd IP), sandbox/auth weakening, and resilience gaps.

This is a **process + reusable asset**, not a feature of the product. It changes how *we* work, not
what Coderunner does.

---

## 2. The Panel

Five judges, each a separate subagent with a role-specific prompt:

| # | Judge | Lens | Tooling |
|---|-------|------|---------|
| 1 | ⚙️ **Correctness** | logic, edge cases, race conditions, error handling, off-by-one, operator precedence | read + trace (Read/Grep/Glob) |
| 2 | 🌐 **Real-environment fit** | PM2 2× api/runner, NAT'd classrooms, Docker sandbox, Redis/BullMQ, Mongo contention, stale `@code-runner/shared` dist. **Actually runs `tsc --noEmit` and tests.** | read + trace + **Bash** |
| 3 | 🔒 **Security & integrity** | sandbox escape, auth/IDOR, role gates, secret exposure, anti-cheat soundness | read + trace |
| 4 | ✂️ **Simplicity & conventions** | YAGNI, follows existing patterns, no dead code, matches codebase style, no over-engineering | read |
| 5 | 🏛️ **Architecture-fit & resilience** | fits the whole architecture, no contract/interface drift, withstands load spikes, a dying runner, a rogue container, Mongo contention, malformed input | read + trace |

Five lenses guarantee the debate is real (divergent priorities) rather than five agents agreeing.

---

## 3. Review Protocol

### Round 1 — Independent (parallel)
All 5 judges receive the same inputs and review **in parallel**, each producing a structured findings
list. No judge sees another's output yet.

**Inputs given to every judge:**
- The diff under review (`git diff` of the change, or the staged/working set).
- The change's stated intent (what it's supposed to do).
- Repo context: this spec, the do-not-disturb contract (§5), and `PROJECT_STATUS.md`.

**Each finding has:**
- `severity`: `HIGH` | `LOW`
- `lens`: which judge raised it
- `location`: `file:line`
- `claim`: what's wrong
- `reasoning`: why it's wrong / how it manifests
- `suggested_fix`: concrete remedy

> **Severity rule:** `HIGH` = breaks correctness, security, a shipped feature, the architecture, or
> violates the do-not-disturb contract. `LOW` = nit, style, non-blocking improvement.

### Round 2 — Cross-examination
Each judge is re-invoked with **all Round-1 findings from all judges**. For every finding (including
its own), the judge must mark one of:
- **refute** — with a concrete reason it's wrong/non-issue (e.g. "the consumer is dead code", "guarded upstream").
- **concede** — agree it stands.
- **escalate** — agree and argue it's worse than stated (e.g. LOW → HIGH).

A finding is **surviving-HIGH** only if, after Round 2, it is HIGH and **not refuted by a majority of
the other judges** (3+ of the remaining 4). This stops one judge's false positive from blocking, and
stops one judge's miss from passing.

### Verdict — Severity veto
- **Any surviving-HIGH ⇒ BLOCKED.** I fix all surviving-HIGHs, then **re-run the full panel** on the
  new diff. Repeat until zero surviving-HIGHs.
- **Zero surviving-HIGHs ⇒ PASS.** I commit the change (scoped message + `tsc` status + Co-Authored-By
  trailer). Surviving LOWs are recorded in the verdict for optional follow-up, never block.

A **verdict report** is produced each run: per-judge findings, the cross-examination outcomes, the list
of surviving-HIGHs (if any), and the final PASS/BLOCKED decision. Surfaced to the user.

---

## 4. Trigger & Mechanism

**Trigger (confirmed default A):** the panel runs **before each commit of substantive code**. Pure-docs
/ copy / comment-only changes take a **fast-path** (skip the panel) — but anything touching `apps/`,
`packages/`, or `web/src` runs the full gate. When in doubt, run it.

**Mechanism (confirmed default B):** the 5 judges are dispatched as **parallel subagents** via the Agent
tool — Round 1 as one parallel batch, Round 2 as a second batch carrying the cross-examination context.
Cost/effort is explicitly **not** a constraint (per the user); the panel is never trimmed for budget.

**Reusable asset:** the protocol is codified so "run the panel" is one move every time:
- A **skill** (`judge-panel`) that orchestrates the two rounds, applies the veto rule, and emits the
  verdict report.
- **5 judge prompt definitions** (one per lens) — either as subagent definitions or as prompt templates
  the skill injects. Exact packaging decided in the implementation plan.

---

## 5. The Do-Not-Disturb Contract

Guardrails the panel **hard-enforces**: the relevant judge treats any violation as an automatic HIGH.
This lives in the repo as its own doc with a pointer from `CLAUDE.md`.

- 🔐 **Live secrets** (`.env.local`: Atlas / JWT / Railway / Cloudinary / Redis) — never commit, never
  print. Rotation is the user's alone.
- 🚫 **Never weaken** the Docker sandbox flags (`--network none`, `--cap-drop ALL`,
  `--security-opt no-new-privileges`, `--pids-limit`, memory/cpu caps, `--read-only`, non-root user) or
  any auth / role gate.
- 🧩 **No contract drift** — never change an API response shape, field name, or type without updating
  every consumer in the same change (the `roster`/`students` class of bug).
- 🏗️ **Rebuild `@code-runner/shared` `dist`** after editing anything in `packages/shared`, or the
  api/runner run stale code.
- ⛔ **Never run a production `next build`** against the working tree (corrupts `.next`). `tsc --noEmit`
  is the verifier.
- 🧪 **`tsc` is authoritative** for correctness — ignore the LSP's false JSX-parse errors on `.tsx`.
- 🧹 No debug `console.log` / `print` left behind. Tailwind: no interpolated color class names — full
  static strings or lookup maps only.
- ✋ **Don't break shipped features** — if a change alters working behavior, that's a HIGH unless
  explicitly signed off by the user.

---

## 6. Out of Scope (YAGNI)

- No web dashboard / UI for the panel — verdicts are reported in-conversation.
- No persistence of verdicts to a database — they live in the conversation / optional markdown log.
- No automatic fixing by the judges — judges *find*; the main agent *fixes* and re-runs.
- No unbounded debate — strictly 2 rounds (independent → cross-examine).
- Not wired into git hooks / CI in v1 — it's a workflow the main agent runs. (CI integration is a later
  roadmap candidate, separate from this spec.)

---

## 7. Success Criteria

1. Running the panel on a known-bad diff (e.g. re-introduce the `roster`/`students` mismatch) yields a
   **surviving-HIGH from the Architecture-fit (and/or Correctness) judge** and a **BLOCKED** verdict.
2. Running it on a clean, correct diff yields **PASS** with at most LOW findings.
3. A single judge's false positive is **refuted** in Round 2 and does **not** block.
4. The panel is invokable as a single repeatable move and emits a structured verdict report.
5. The do-not-disturb contract exists in the repo and is referenced by `CLAUDE.md`.

---

## 8. Build Order (this initiative)

1. Build the Judge Panel: this spec → implementation plan → the `judge-panel` skill + 5 judge prompts.
2. Write the do-not-disturb contract to the repo + pointer in `CLAUDE.md`.
3. First real run: point the panel at roadmap **Phase 3c (code similarity)** — design doc first, then
   build, gated by the panel.
4. Backlog (panel-gated, in order): server-side enforcement (level/session unlock) → CI/CD +
   docker-compose → asset purge (~150 MB).
