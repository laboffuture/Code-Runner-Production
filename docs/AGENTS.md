# Coderunner

Monorepo: `Coderunner-Backend` (apps/api · apps/runner · packages/shared) and
`Coderunner-Frontend/web`. See `PROJECT_STATUS.md` for status, architecture, and roadmap.

## Guardrails & Review
- **`DO_NOT_DISTURB.md`** (repo root) — hard rules that must never be violated.
- **Judge Panel** (`.Codex/skills/judge-panel/`) — run before committing substantive code
  (anything under `apps/`, `packages/`, `web/src`). It blocks on any surviving HIGH finding.
