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
