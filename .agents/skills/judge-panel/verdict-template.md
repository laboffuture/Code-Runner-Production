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
