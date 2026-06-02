// Sequential-progression rule (single source of truth). Pure, no I/O.

export interface UnlockProblem {
  problem_id: number;
  level_number?: number;
  session_id: number;
}

/** Total curriculum order: by level, then session. */
export function sessionOrderKey(p: { level_number?: number; session_id: number }): number {
  return (p.level_number ?? 0) * 1_000_000 + (p.session_id ?? 0);
}

/**
 * A problem is unlocked iff every problem in a session STRICTLY BEFORE its own
 * (by sessionOrderKey) has been solved. The lowest session is always unlocked;
 * within a session, problems are freely ordered. The caller scopes `curriculum`
 * to the student's age band. A problem absent from `curriculum` is not gated.
 */
export function isProblemUnlocked(
  problemId: number,
  solvedProblemIds: number[] | Set<number>,
  curriculum: UnlockProblem[],
): boolean {
  const target = curriculum.find((p) => p.problem_id === problemId);
  if (!target) return true;
  const targetKey = sessionOrderKey(target);
  const solved = solvedProblemIds instanceof Set ? solvedProblemIds : new Set(solvedProblemIds);
  for (const p of curriculum) {
    if (sessionOrderKey(p) < targetKey && !solved.has(p.problem_id)) return false;
  }
  return true;
}
