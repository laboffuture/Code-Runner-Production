# Pygame (and side-effecting) Grading Harness — Design Spec

> Status: design approved + core mechanism PROVEN with real pygame 2.6.1 headless (2026-06-03).
> Fixes the 12 pygame problems (P230–241) + 6 file side-effect problems whose autograder
> currently checks a fake confirmation string (a kid hard-codes one print() and scores 100%).

## Problem
The autograder compares stdout. A pygame program's real product is a rendered window /
interactive response — invisible to stdout. So those problems were given fake confirmation
strings as expected output, which test none of the actual skill and are trivially hard-coded.

## Principle
Grade the program's REAL state, made observable as deterministic text after a headless run —
not a typed confirmation. Then the existing exact-match grader works, tests the real skill,
and cannot be hard-coded.

## Architecture: a RUN / GRADE mode split in the runner

Today both paths funnel through `DockerExecutor.executeCode(code, input)` → `preprocessCode`
→ `preprocessPygame` (which appends the image-capture block). There is no mode distinction.

The fix threads a `mode: 'run' | 'grade'` parameter (default `'run'`):
- `executeCode(code, input, mode='run')` → `preprocessCode(code, mode)` → `preprocessPygame(code, mode)`
- Run worker calls `executeCode(code, input)` → defaults `'run'` → **byte-for-byte unchanged**.
- `executeWithTestCases(...)` calls `executeCode(code, tc.input, 'grade')`.
- `mode='run'`: today's behavior exactly (image capture → PygameCanvas; visual render intact).
- `mode='grade'`: pygame gets the probe harness below instead of image capture.

GATING: everything is fenced by the existing `usesPygame(code)` check, so NON-pygame problems
and the RUN path are completely untouched. This is additive.

## Mechanism A — State inspection (create window / caption / fill / draw)
Appended after student code in GRADE mode (PROVEN):
```python
# grade-mode probe
try:
    import pygame as _pg
    _s = _pg.display.get_surface()
    if _s is None:
        print("PROBE: NO_WINDOW")
    else:
        _w,_h = _s.get_size()
        _cap = _pg.display.get_caption()[0]
        _r,_g,_b = _s.get_at((1,1))[:3]
        print(f"PROBE WINDOW_SIZE={_w}x{_h}")
        print(f"PROBE CAPTION={_cap}")
        print(f"PROBE BG_COLOR={_r},{_g},{_b}")
    _pg.quit()
except Exception:
    print("PROBE: NO_WINDOW")
```
Expected output (P230) becomes the PROBE lines. A no-window cheat prints `PROBE: NO_WINDOW`
and fails. Which probes to emit comes from a per-problem `grader.probes` list.

## Mechanism B — Scripted event injection (respond to keys / typing)
Prepended before student code in GRADE mode (PROVEN): build a deterministic event queue from
the test input (e.g. `LEFT\nLEFT\nUP`), monkeypatch `pygame.event.get` to drain it then QUIT.
The student's loop processes them and prints state after each → observable → graded. Varied
event scripts per test → not hard-codeable.

## Banner suppression (REQUIRED)
pygame prints a welcome banner on import that pollutes stdout. GRADE mode sets
`PYGAME_HIDE_SUPPORT_PROMPT=hide` (verified: yields a clean exact-match).

## Probe library (build once)
WINDOW_SIZE (get_size), CAPTION (get_caption), BG_COLOR / PIXEL@x,y (get_at), scripted events.
Covers all 12 pygame lessons.

## File problems (same principle, simpler)
For the 6 side-effect-only file problems, GRADE mode reads the written file back and prints its
contents to grade — instead of a fake confirmation. (Many file problems already print contents
and are fine; only the side-effect-only ones change.)

## Per-problem change
Add a small spec on the problem doc, e.g.
`grader: { type: 'pygame_state', probes: ['WINDOW_SIZE','CAPTION','BG_COLOR'] }`
or `grader: { type: 'pygame_events', keymap: [...] }`, and rewrite that problem's test cases
to the PROBE / event format. Verify per problem: a real solution passes, a hard-coded cheat fails.

## Phasing
1. Runner GRADE-mode harness: thread `mode`, add the pygame grade branch (probes + scripted
   events + banner suppression). tsc clean; local harness test (pygame 2.6.1 present); judge panel.
2. Convert the 12 pygame problems (grader spec + test cases); verify real-pass / cheat-fail each.
3. Convert the 6 file side-effect problems (read-back grading).

## Safety / blast radius
- Non-pygame problems, all verified L1–L3 work, normal stdin/stdout problems: ZERO impact (gated).
- Pygame RUN mode (the visual window kids see): ZERO impact (mode defaults to run).
- Changes: the runner gains a gated grade-mode branch; the 18 broken problems' test cases are
  rewritten (that is the fix). No other problem/session changes.
- Runner is critical shared infra (2× runner under PM2) → judge-panel-gated before commit.

## Success criteria
1. A correct pygame solution is graded by its REAL window state / event responses (not a print).
2. A hard-coded confirmation cheat FAILS every converted problem.
3. RUN mode still renders the window in PygameCanvas, unchanged.
4. Non-pygame problems grade identically to today. tsc clean; panel PASS.
