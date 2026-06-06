/**
 * Curriculum completion — the single source of truth for every CURRICULUM-scoped
 * number shown about a student (how far through the syllabus they are).
 *
 * Derives completion fresh from the student's solvedProblemIds (the same write-once
 * source the unlock gate uses), scoped to the problems in the student's age band.
 * Used by BOTH the teacher classroom views and the owner oversight /groups panel so
 * "curriculum level" means exactly the same thing on every surface (fixes the owner
 * panel previously showing XP level under a curriculum-level label).
 *
 * NOTE: `level` here is the CURRICULUM level reached (1–4), NOT the gamification XP
 * level (floor(experience/500)+1). Lifetime solve COUNTS (totalSolved / difficulty)
 * are intentionally NOT sourced here — those come from the stored stats so they match
 * the student's own profile, the leaderboard, and the owner health panel. This helper
 * is only for curriculum progress (level, sessions completed, in-band solved).
 */
export interface BandProblem {
  problem_id: number;
  level_number: number;
  session_id: number;
  difficulty: string;
}

export interface CurriculumCompletion {
  // ⚠️ These in-band solve counts are a free byproduct of the session aggregation and
  // are intentionally NOT consumed anywhere. Headline solve counts come from stored
  // UserProgress.stats.* (H1, 2026-06-06). Do NOT wire these into any surface, or you
  // reintroduce the teacher-vs-profile divergence this split exists to fix. Only
  // `level` + `sessionsCompleted`/`sessionsTotal` are read by callers.
  totalSolved: number;       // in-band solved (curriculum-scoped) — see warning above
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  sessionsCompleted: number; // CONSUMED — curriculum sessions fully solved
  sessionsTotal: number;     // CONSUMED — total sessions in the band
  level: number;             // CONSUMED — highest curriculum level reached (1–4)
}

export function deriveCompletion(solvedIds: number[], bandProblems: BandProblem[]): CurriculumCompletion {
  const solvedSet = new Set(solvedIds);
  let easySolved = 0, mediumSolved = 0, hardSolved = 0, totalSolved = 0, level = 1;
  const agg = new Map<number, { total: number; solved: number }>();
  for (const p of bandProblems) {
    const e = agg.get(p.session_id) || { total: 0, solved: 0 };
    e.total += 1;
    if (solvedSet.has(p.problem_id)) {
      e.solved += 1;
      totalSolved += 1;
      if (p.level_number > level) level = p.level_number;
      const d = (p.difficulty || '').toLowerCase();
      if (d === 'hard') hardSolved += 1; else if (d === 'medium') mediumSolved += 1; else easySolved += 1; // intro counts as easy
    }
    agg.set(p.session_id, e);
  }
  let sessionsCompleted = 0;
  for (const e of agg.values()) if (e.total > 0 && e.solved >= e.total) sessionsCompleted += 1;
  level = Math.max(1, Math.min(4, level)); // curriculum is 4 levels; guard against stray level_number
  return { totalSolved, easySolved, mediumSolved, hardSolved, sessionsCompleted, sessionsTotal: agg.size, level };
}
