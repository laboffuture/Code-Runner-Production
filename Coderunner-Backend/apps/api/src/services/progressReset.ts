import mongoose from 'mongoose';
import { Models, getLogger, sessionOrderKey } from '@code-runner/shared';

// ── Pure recompute: derive UserProgress fields from the SURVIVING solves/attempts.
// No I/O — fully unit-testable (see progressReset.assert.ts).

export interface ResetSolvedMeta { difficulty: string; session_title: string; }
export interface ResetAttemptLite { problemId: number; accepted: boolean; firstSolve: boolean; createdAt: string | Date; }
export interface ResetActivityEntry { problemId: number; problemTitle: string; difficulty: string; status: string; timestamp: string | Date; }

export interface ComputeResetInput {
  survivingSolvedIds: number[];
  solvedMeta: Record<number, ResetSolvedMeta>;   // meta for each surviving solved id
  sessionTotals: Record<string, number>;          // session_title -> total problems in that session
  survivingAttempts: ResetAttemptLite[];
  survivingRecentActivity: ResetActivityEntry[];
  prevLongestStreak: number;
}

export interface ResetProgressFields {
  solvedProblemIds: number[];
  stats: { totalSolved: number; easySolved: number; mediumSolved: number; hardSolved: number; totalSubmissions: number; acceptedSubmissions: number; acceptanceRate: number; failedRuns: number; };
  experience: number;
  level: number;
  contestRating: number;
  rank: 'NOVICE' | 'ADVANCED' | 'EXPERT' | 'MASTER';
  streak: { current: number; longest: number; lastSubmissionDate: Date | null };
  topicProgress: Array<{ topic: string; solved: number; total: number }>;
  achievements: string[];
  skills: string[];
  submissionCalendar: Array<{ date: Date; count: number }>;
  solvedCalendar: Array<{ date: Date; count: number }>;
  recentActivity: Array<{ problemId: number; problemTitle: string; difficulty: string; status: string; timestamp: Date }>;
}

function xpFor(difficulty: string): number {
  const d = difficulty.toLowerCase();
  return d === 'hard' ? 200 : d === 'medium' ? 100 : 50; // intro + easy -> 50
}

function dayKey(ts: string | Date): string {
  // UTC calendar day — timezone-stable so the recompute buckets identically
  // regardless of the server's local timezone (mixing local setHours with
  // toISOString() would shift dates across the day boundary).
  return new Date(ts).toISOString().slice(0, 10);
}

export function computeResetProgress(input: ComputeResetInput): ResetProgressFields {
  const { solvedMeta, sessionTotals, survivingAttempts, survivingRecentActivity, prevLongestStreak } = input;
  const solved = Array.from(new Set(input.survivingSolvedIds));

  let easy = 0, medium = 0, hard = 0, xp = 0;
  const topicSolved: Record<string, number> = {};
  for (const pid of solved) {
    const meta = solvedMeta[pid];
    if (!meta) continue;
    const d = meta.difficulty.toLowerCase();
    if (d === 'hard') hard++; else if (d === 'medium') medium++; else easy++;
    xp += xpFor(meta.difficulty);
    const t = meta.session_title || 'General';
    topicSolved[t] = (topicSolved[t] || 0) + 1;
  }

  const totalSolved = solved.length;
  const experience = xp;
  const level = Math.floor(experience / 500) + 1;
  const contestRating = Math.max(800, Math.min(3000, 1000 + 15 * totalSolved));
  const rank: ResetProgressFields['rank'] =
    contestRating >= 2000 ? 'MASTER' : contestRating >= 1600 ? 'EXPERT' : contestRating >= 1200 ? 'ADVANCED' : 'NOVICE';

  const totalSubmissions = survivingAttempts.length;
  const acceptedSubmissions = survivingAttempts.filter((a) => a.accepted).length;
  const acceptanceRate = totalSubmissions > 0 ? parseFloat(((acceptedSubmissions / totalSubmissions) * 100).toFixed(2)) : 0;

  const subByDay: Record<string, number> = {};
  const solvedByDay: Record<string, number> = {};
  const countedFirstSolve = new Set<number>();
  const attemptsAsc = [...survivingAttempts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  for (const a of attemptsAsc) {
    const k = dayKey(a.createdAt);
    subByDay[k] = (subByDay[k] || 0) + 1; // every surviving submission
    // solvedCalendar = DISTINCT first-solves per day: dedupe by problemId on the
    // earliest surviving accepted attempt, so a reset-then-re-solve of the same
    // problem can't double-count a calendar day.
    if (a.accepted && a.firstSolve && !countedFirstSolve.has(a.problemId)) {
      countedFirstSolve.add(a.problemId);
      solvedByDay[k] = (solvedByDay[k] || 0) + 1;
    }
  }
  const toCalendar = (m: Record<string, number>) =>
    Object.entries(m).map(([k, count]) => ({ date: new Date(k), count })).sort((a, b) => a.date.getTime() - b.date.getTime());

  const topicProgress = Object.entries(topicSolved).map(([topic, s]) => {
    const total = sessionTotals[topic] ?? s;
    return { topic, solved: Math.min(s, total), total };
  });

  const achievements: string[] = [];
  if (totalSolved >= 1) achievements.push('first_solve');
  for (const n of [5, 10, 25, 50, 100]) if (totalSolved >= n) achievements.push(`solver_${n}`);
  if (easy >= 10) achievements.push('easy_master');
  if (medium >= 5) achievements.push('medium_master');
  if (hard >= 3) achievements.push('hard_master');

  // skills: the worker tracks 'Python' once the student has any solve.
  const skills = totalSolved > 0 ? ['Python'] : [];

  const recentActivity = survivingRecentActivity.slice(0, 50).map((a) => ({
    problemId: a.problemId, problemTitle: a.problemTitle, difficulty: a.difficulty, status: a.status, timestamp: new Date(a.timestamp),
  }));

  return {
    solvedProblemIds: solved,
    stats: { totalSolved, easySolved: easy, mediumSolved: medium, hardSolved: hard, totalSubmissions, acceptedSubmissions, acceptanceRate, failedRuns: 0 },
    experience, level, contestRating, rank,
    streak: { current: 0, longest: prevLongestStreak, lastSubmissionDate: null },
    topicProgress, achievements, skills,
    submissionCalendar: toCalendar(subByDay),
    solvedCalendar: toCalendar(solvedByDay),
    recentActivity,
  };
}

// ── Orchestrator: load data, apply the session boundary, recompute, persist, audit.
const logger = getLogger('progress-reset');
const MAX_RESET_ATTEMPTS = 5;

export interface ResetRequest {
  studentId: string;
  teacherId: string;
  classroomId?: string | null;
  ageGroup: string;            // scope the curriculum load to the student's band
  scope: 'full' | 'from-session';
  fromSessionId?: number;
}

export async function performStudentReset(
  req: ResetRequest,
  attempt = 1,
): Promise<{ scope: string; clearedSolvedCount: number; newLevel: number; newXp: number }> {
  const userId = new mongoose.Types.ObjectId(req.studentId);
  const progress: any = await Models.UserProgress.findOne({ userId });

  // Load the (small) curriculum for the student's age band once: order sessions
  // + map problems. Scoping by age_group keeps the boundary lookup and session
  // totals within the student's own curriculum (no cross-band title collisions).
  const problems: any[] = await Models.Problem.find(
    { age_group: req.ageGroup }, 'problem_id session_id level_number session_title difficulty',
  ).lean();
  // Keep-set = problems strictly BEFORE the boundary. Full reset = empty keep-set.
  // Uses the SAME shared sessionOrderKey as the sequential-unlock gate, so a
  // from-session reset re-locks exactly the sessions the gate then gates.
  let keep: Set<number>;
  if (req.scope === 'full') {
    keep = new Set();
  } else {
    const boundary = problems.find((p) => p.session_id === req.fromSessionId);
    if (!boundary) throw Object.assign(new Error('Unknown session for this reset'), { statusCode: 400 });
    const bKey = sessionOrderKey(boundary);
    keep = new Set(problems.filter((p) => sessionOrderKey(p) < bKey).map((p) => p.problem_id));
  }

  const prevSolved: number[] = progress?.solvedProblemIds || [];
  const survivingSet = new Set(prevSolved.filter((id) => keep.has(id)));
  const survivingSolvedIds = Array.from(survivingSet);

  const solvedMeta: Record<number, { difficulty: string; session_title: string }> = {};
  const sessionTotals: Record<string, number> = {};
  for (const p of problems) {
    const t = p.session_title || 'General';
    sessionTotals[t] = (sessionTotals[t] || 0) + 1;
    if (survivingSet.has(p.problem_id)) solvedMeta[p.problem_id] = { difficulty: p.difficulty, session_title: t };
  }

  // Integrity log is read-only here — never modified.
  const attempts: any[] = await Models.StudentAttempt.find({ userId }, 'problemId accepted firstSolve createdAt').lean();
  const survivingAttempts = attempts
    .filter((a) => keep.has(a.problemId))
    .map((a) => ({ problemId: a.problemId, accepted: a.accepted, firstSolve: a.firstSolve, createdAt: a.createdAt }));

  const survivingRecentActivity = (progress?.recentActivity || []).filter((a: any) => keep.has(a.problemId));

  const fields = computeResetProgress({
    survivingSolvedIds, solvedMeta, sessionTotals, survivingAttempts,
    survivingRecentActivity, prevLongestStreak: progress?.streak?.longest ?? 0,
  });

  const clearedSolvedCount = prevSolved.length - survivingSolvedIds.length;
  const prevLevel = progress?.level ?? 1;
  const prevXp = progress?.experience ?? 0;

  if (progress) {
    Object.assign(progress, fields);
    try {
      await progress.save();
    } catch (err: any) {
      // UserProgress has optimisticConcurrency (B2): a racing grade bumps __v.
      if (err instanceof mongoose.Error.VersionError && attempt < MAX_RESET_ATTEMPTS) {
        logger.warn('Reset hit a version conflict, retrying', { studentId: req.studentId, attempt });
        await new Promise((r) => setTimeout(r, 20 * attempt));
        return performStudentReset(req, attempt + 1);
      }
      throw err;
    }
  }

  await Models.ResetLog.create({
    teacherId: new mongoose.Types.ObjectId(req.teacherId),
    studentId: userId,
    classroomId: req.classroomId ? new mongoose.Types.ObjectId(req.classroomId) : null,
    scope: req.scope,
    fromSessionId: req.scope === 'from-session' ? req.fromSessionId : null,
    clearedSolvedCount, prevLevel, prevXp,
  });

  logger.info('Student progress reset', { studentId: req.studentId, teacherId: req.teacherId, scope: req.scope, fromSessionId: req.fromSessionId, clearedSolvedCount });
  return { scope: req.scope, clearedSolvedCount, newLevel: fields.level, newXp: fields.experience };
}
