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
