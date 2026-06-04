# Coderunner — Pre-Launch Backlog

Tracked work, grouped by phase. UI polish is intentionally **last** — internal mechanics get fixed first.

## Phase 1 — Progress mechanics (the internal engine)
- [x] **1.1 Enforce sequential unlock server-side, case-by-case** — server gate (`isProblemUnlocked` → `problemOrderKey`) now requires every earlier case in the session, then earlier sessions, then earlier levels. Frontend `ProblemList` locks tasks to match. Panel PASS. (Root cause of the "impossible" half/half state was out-of-order TEST data seeded directly into the DB, not a gate hole — real students were already gated at session level; this tightens to case level.)
- [ ] **1.1b Reconcile client solved-set on reset/sync** — `progress.ts syncFromServer` merges (append-only) and is never cleared on a teacher reset, so a just-reset student's browser can show tasks unlocked that the server 403s. Fail-safe (server authoritative) but confusing. Make the client set authoritative-by-replacement. (Flagged by Correctness + Architecture judges.)
- [x] **1.2–1.4 One source of truth for completion** — teacher roster + student profile now DERIVE completion (totalSolved, difficulty split, sessionsCompleted, curriculum level) from `solvedProblemIds` via one shared `deriveCompletion` helper, so roster and profile can't disagree and stored-stat drift (e.g. Shifana's legacy 31/L8) never shows. `level` kept = stored XP level (ProfileStats XP bar); new `curriculumLevel` = derived 1–4. Gamification + submission-quality stats stay stored. Panel PASS (fixed a HIGH: had overloaded `level`).
- [ ] **1.4b Extract `difficultyBucket` + xp-for-difficulty to packages/shared** — the intro→easy rule is duplicated in deriveCompletion / computeResetProgress / grading worker; a future difficulty tier would desync them. Non-blocking (they agree today). Rebuild shared dist after.
- [ ] **1.5 Clean up test accounts** — reset out-of-order solves (e.g. `Teja`) so the portal reflects real sequential usage; real students start clean.

## Phase 2 — Classroom lifecycle
- [x] **2.1 Delete a class** (teacher) — `DELETE /teacher/classrooms/:id` (owner-only via myClassroom). Deletes the class first (join code invalid immediately), then detaches members (classroomId→null); student accounts/progress/attempts preserved, re-join by code. Strict "type the class name to confirm" modal. Panel PASS.
- [ ] ~~**2.2 Multi-class membership**~~ — **DEFERRED**: only one teacher at launch, so a student never needs to be in >1 class. Membership stays single-class (`User.classroomId`). Revisit if multiple teachers are added.

## Phase 3 — Admin role
- [ ] **3.1 Admin / CEO-CMO oversight** — teacher activity (logging in, managing students) + student engagement (actually solving). Distinct from the `developer` role (system/tech health).

## Phase 4 — UI polish (last)
- [ ] **4.1 Guide reading view** — playful/cartoonish, kid-friendly, LeetCode-grade structure.
- [ ] **4.2 Broader UI pass.**

## Done — pending verify + commit
- [x] Case 1 hidden by the sticky session header (teacher curriculum page) — fixed, typechecks clean.
- [x] Student click → full profile instead of the slide-over panel — fixed, typechecks clean.

## Parked — separate workstream
- 12 Pygame guides (P230–241) + P193 — need a headless-display + image-asset grading harness.

## Launch ops (user-owned)
- Rotate `.env.local` secrets · set real account passwords · prod config · deploy (rebuild `packages/shared` → `dist/`).
