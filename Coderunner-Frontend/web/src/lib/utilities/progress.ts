export interface UserProgress {
  completedProblems: Set<string>;
  completedLevels: { [ageGroup: string]: Set<number> };
  currentLevel: { [ageGroup: string]: number };
}

export interface LevelProgress {
  ageGroup: string;
  levelNumber: number;
  completed: boolean;
  unlocked: boolean;
}

// Bump this version whenever level-completion logic changes.
// Any stored data without this version will have completedLevels reset
// (completedProblems are preserved).
const PROGRESS_VERSION = 'v2';

// Sequential progression is now ENFORCED server-side (the grade route 403s a
// problem in a locked session), and LevelList derives level locks from the
// synced solved set via lib/utilities/unlock.ts. This flag stays false only so
// the legacy progress.isLevelUnlocked helper (no longer rendered anywhere)
// returns its sequential value rather than always-true, should anything read it.
const UNLOCK_ALL_LEVELS = false;

// Number of levels per age group, used only for progress-percentage helpers
// (getChapterProgress/getOverallProgress — not currently rendered anywhere).
// TODO: derive this from the backend levels API instead of hardcoding; update
// as more levels are released.
const LEVELS_PER_AGE_GROUP: Record<string, number> = {
  '11-14': 4,
  '15-18': 4,
};

class ProgressManager {
  private static instance: ProgressManager;
  private progress: UserProgress;
  // TEST/DEV ONLY: per-account gate bypass, synced from the server each session
  // (never persisted — server is authoritative). True only for the Teja test
  // account; makes the level/session/case gates report everything unlocked.
  // Remove with the Teja test account at production.
  private unlockAllLevels = false;

  private constructor() {
    this.progress = this.loadProgress();
  }

  /** TEST/DEV: is this account's sequential gate bypassed? (Teja only.) */
  isUnlockAll(): boolean {
    return this.unlockAllLevels;
  }

  static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager();
    }
    return ProgressManager.instance;
  }

  private loadProgress(): UserProgress {
    if (typeof window === 'undefined') {
      return this.getDefaultProgress();
    }

    try {
      const saved = localStorage.getItem('coderunner_progress');
      if (saved) {
        const parsed = JSON.parse(saved);

        // Version migration: if stored version doesn't match, reset completedLevels
        // (completedProblems are preserved so individual problem progress is kept)
        const storedVersion = parsed._version;
        const levelsData = storedVersion === PROGRESS_VERSION
          ? parsed.completedLevels
          : null; // clear incorrectly set level completions

        const progress: UserProgress = {
          completedProblems: new Set(parsed.completedProblems || []),
          completedLevels: {
            '11-14': new Set(levelsData?.['11-14'] || []),
            '15-18': new Set(levelsData?.['15-18'] || [])
          },
          currentLevel: {
            '11-14': parsed.currentLevel?.['11-14'] || 1,
            '15-18': parsed.currentLevel?.['15-18'] || 1
          }
        };

        // If we migrated (version mismatch), save immediately with the new version
        if (storedVersion !== PROGRESS_VERSION) {
          const toSave = {
            _version: PROGRESS_VERSION,
            completedProblems: Array.from(progress.completedProblems),
            completedLevels: { '11-14': [], '15-18': [] },
            currentLevel: progress.currentLevel
          };
          localStorage.setItem('coderunner_progress', JSON.stringify(toSave));
        }

        return progress;
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }

    return this.getDefaultProgress();
  }

  private getDefaultProgress(): UserProgress {
    return {
      completedProblems: new Set(),
      completedLevels: {
        '11-14': new Set(),
        '15-18': new Set()
      },
      currentLevel: {
        '11-14': 1,
        '15-18': 1
      }
    };
  }

  private saveProgress(): void {
    if (typeof window === 'undefined') return;

    try {
      const toSave = {
        _version: PROGRESS_VERSION,
        completedProblems: Array.from(this.progress.completedProblems),
        completedLevels: {
          '11-14': Array.from(this.progress.completedLevels['11-14']),
          '15-18': Array.from(this.progress.completedLevels['15-18'])
        },
        currentLevel: this.progress.currentLevel
      };
      localStorage.setItem('coderunner_progress', JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  markProblemComplete(problemId: string): void {
    this.progress.completedProblems.add(problemId);
    this.saveProgress();
  }

  markLevelComplete(ageGroup: string, levelNumber: number): void {
    this.progress.completedLevels[ageGroup].add(levelNumber);
    
    // Unlock next level
    const nextLevel = levelNumber + 1;
    if (nextLevel > this.progress.currentLevel[ageGroup]) {
      this.progress.currentLevel[ageGroup] = nextLevel;
    }
    
    this.saveProgress();
  }

  isProblemCompleted(problemId: string): boolean {
    return this.progress.completedProblems.has(problemId);
  }

  isLevelCompleted(ageGroup: string, levelNumber: number): boolean {
    return this.progress.completedLevels[ageGroup].has(levelNumber);
  }

  isLevelUnlocked(ageGroup: string, levelNumber: number): boolean {
    // Level 1 is always unlocked
    if (levelNumber === 1) return true;

    // Launch posture: everything unlocked (see UNLOCK_ALL_LEVELS note above).
    if (UNLOCK_ALL_LEVELS) return true;

    // TEST/DEV per-account bypass (Teja only).
    if (this.unlockAllLevels) return true;

    // Otherwise a level is unlocked once the previous one is completed.
    return this.isLevelCompleted(ageGroup, levelNumber - 1);
  }

  getCurrentLevel(ageGroup: string): number {
    return this.progress.currentLevel[ageGroup];
  }

  getLevelProgress(ageGroup: string, levelNumber: number): LevelProgress {
    return {
      ageGroup,
      levelNumber,
      completed: this.isLevelCompleted(ageGroup, levelNumber),
      unlocked: this.isLevelUnlocked(ageGroup, levelNumber)
    };
  }

  getChapterProgress(ageGroup: string): { completed: number; total: number; percentage: number } {
    const totalLevels = this.getTotalLevelsForAgeGroup(ageGroup);
    const completedLevels = this.progress.completedLevels[ageGroup].size;
    
    return {
      completed: completedLevels,
      total: totalLevels,
      percentage: totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0
    };
  }

  private getTotalLevelsForAgeGroup(ageGroup: string): number {
    return LEVELS_PER_AGE_GROUP[ageGroup] ?? 4;
  }

  getOverallProgress(): { completed: number; total: number; percentage: number } {
    const ageGroups = ['11-14', '15-18'];
    let totalCompleted = 0;
    let totalLevels = 0;

    ageGroups.forEach(ageGroup => {
      const progress = this.getChapterProgress(ageGroup);
      totalCompleted += progress.completed;
      totalLevels += progress.total;
    });

    return {
      completed: totalCompleted,
      total: totalLevels,
      percentage: totalLevels > 0 ? Math.round((totalCompleted / totalLevels) * 100) : 0
    };
  }

  syncFromServer(solvedProblemIds: number[], unlockAllLevels = false): void {
    // Server is authoritative for the gate-bypass flag; refresh it each sync.
    this.unlockAllLevels = unlockAllLevels;
    let changed = false;
    for (const id of solvedProblemIds) {
      const key = String(id);
      if (!this.progress.completedProblems.has(key)) {
        this.progress.completedProblems.add(key);
        changed = true;
      }
    }
    if (changed) this.saveProgress();
  }

  // Get all levels for an age group with their status
  getAllLevelsForAgeGroup(ageGroup: string): LevelProgress[] {
    const totalLevels = this.getTotalLevelsForAgeGroup(ageGroup);
    const levels: LevelProgress[] = [];

    for (let i = 1; i <= totalLevels; i++) {
      levels.push(this.getLevelProgress(ageGroup, i));
    }

    return levels;
  }
}

// Export singleton instance
export const progressManager = ProgressManager.getInstance();

/**
 * Fetches solvedProblemIds from the server and merges them into the local
 * ProgressManager store.  Fire-and-forget — errors are swallowed so callers
 * don't need to handle failures.
 *
 * Import `api` lazily to avoid circular-dependency issues (progress.ts ←→ api-client.ts).
 */
export async function syncProgressFromServer(): Promise<void> {
  try {
    // Dynamic import breaks the potential circular dep and keeps this module SSR-safe
    const { api } = await import('@/lib/api-client');
    const stats = await api.users.getStats() as any;
    if (Array.isArray(stats?.solvedProblemIds)) {
      progressManager.syncFromServer(stats.solvedProblemIds as number[], stats.unlockAllLevels === true);
    }
  } catch {
    // Non-critical — localStorage data is the fallback
  }
}

// Helper hooks for React components
export function useProgress() {
  return {
    markProblemComplete: (problemId: string) => progressManager.markProblemComplete(problemId),
    markLevelComplete: (ageGroup: string, levelNumber: number) => progressManager.markLevelComplete(ageGroup, levelNumber),
    isProblemCompleted: (problemId: string) => progressManager.isProblemCompleted(problemId),
    unlockAll: progressManager.isUnlockAll(),
    isLevelCompleted: (ageGroup: string, levelNumber: number) => progressManager.isLevelCompleted(ageGroup, levelNumber),
    isLevelUnlocked: (ageGroup: string, levelNumber: number) => progressManager.isLevelUnlocked(ageGroup, levelNumber),
    getLevelProgress: (ageGroup: string, levelNumber: number) => progressManager.getLevelProgress(ageGroup, levelNumber),
    getChapterProgress: (ageGroup: string) => progressManager.getChapterProgress(ageGroup),
    getOverallProgress: () => progressManager.getOverallProgress(),
    getAllLevelsForAgeGroup: (ageGroup: string) => progressManager.getAllLevelsForAgeGroup(ageGroup),
    syncFromServer: (ids: number[]) => progressManager.syncFromServer(ids),
  };
}