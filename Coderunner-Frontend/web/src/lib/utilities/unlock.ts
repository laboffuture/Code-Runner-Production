// Mirrors the server rule (packages/shared/.../unlock.utils.ts): a level is
// unlocked iff every problem in all EARLIER levels has been solved. The grade
// API is authoritative; this is for the matching UI lock state.

interface UnlockLevel {
  level_number: number;
  sessions?: Array<{ problems?: Array<{ problem_id: number }> }>;
}

export function isLevelUnlocked(
  levels: UnlockLevel[],
  levelNumber: number,
  isSolved: (problemId: number) => boolean,
): boolean {
  if (levelNumber <= 1) return true; // first level always open
  for (const lvl of levels) {
    if (lvl.level_number < levelNumber) {
      for (const s of lvl.sessions || []) {
        for (const p of s.problems || []) {
          if (!isSolved(p.problem_id)) return false;
        }
      }
    }
  }
  return true;
}
