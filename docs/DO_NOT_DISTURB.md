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
