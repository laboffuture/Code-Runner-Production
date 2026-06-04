// Sequential-progression rule (single source of truth). Pure, no I/O.

export interface UnlockProblem {
  problem_id: number;
  level_number?: number;
  session_id: number;
  case_number?: number;
}

/**
 * Session-granular order key: by level, then session (case ignored). Used by the
 * progress-reset boundary, which re-locks whole sessions at a time.
 */
export function sessionOrderKey(p: { level_number?: number; session_id: number }): number {
  return (p.level_number ?? 0) * 1_000_000 + (p.session_id ?? 0);
}

/**
 * Problem-granular order key: by level, then session, then CASE. This is the total
 * curriculum order the sequential-unlock gate walks. session (≤ ~999) and case
 * (≤ ~999) each get their own decimal band so the key is strictly lexicographic.
 */
export function problemOrderKey(p: { level_number?: number; session_id: number; case_number?: number }): number {
  return (p.level_number ?? 0) * 1_000_000 + (p.session_id ?? 0) * 1_000 + (p.case_number ?? 0);
}

/**
 * A problem is unlocked iff every problem STRICTLY BEFORE its own (by
 * problemOrderKey — level, then session, then CASE) has been solved. So within a
 * session the cases must be completed in order: case 1, then case 2, … The very
 * first problem is always unlocked. The caller scopes `curriculum` to the
 * student's age band. A problem absent from `curriculum` is not gated.
 */
export function isProblemUnlocked(
  problemId: number,
  solvedProblemIds: number[] | Set<number>,
  curriculum: UnlockProblem[],
): boolean {
  const target = curriculum.find((p) => p.problem_id === problemId);
  if (!target) return true;
  const targetKey = problemOrderKey(target);
  const solved = solvedProblemIds instanceof Set ? solvedProblemIds : new Set(solvedProblemIds);
  for (const p of curriculum) {
    if (problemOrderKey(p) < targetKey && !solved.has(p.problem_id)) return false;
  }
  return true;
}
