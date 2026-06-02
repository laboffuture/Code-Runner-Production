import { computeResetProgress } from './progressReset';

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) { console.error('  ✗', msg); failures++; } else { console.log('  ✓', msg); }
}

// 1) Full reset (no survivors) -> exact defaults, longest streak preserved.
{
  const r = computeResetProgress({ survivingSolvedIds: [], solvedMeta: {}, sessionTotals: {}, survivingAttempts: [], survivingRecentActivity: [], prevLongestStreak: 7 });
  assert(r.solvedProblemIds.length === 0, 'full: no solved');
  assert(r.stats.totalSolved === 0, 'full: totalSolved 0');
  assert(r.stats.failedRuns === 0, 'full: failedRuns reset to 0');
  assert(r.experience === 0 && r.level === 1, 'full: xp 0 / level 1');
  assert(r.contestRating === 1000 && r.rank === 'NOVICE', 'full: rating 1000 NOVICE');
  assert(r.streak.current === 0 && r.streak.longest === 7 && r.streak.lastSubmissionDate === null, 'full: streak reset, longest kept');
  assert(r.achievements.length === 0, 'full: no achievements');
  assert(r.skills.length === 0, 'full: no skills');
  assert(r.submissionCalendar.length === 0 && r.solvedCalendar.length === 0 && r.recentActivity.length === 0, 'full: empty history');
}

// 2) From-session: keep before, recompute everything.
{
  const r = computeResetProgress({
    survivingSolvedIds: [1, 2, 3],
    solvedMeta: { 1: { difficulty: 'Easy', session_title: 'S1' }, 2: { difficulty: 'Medium', session_title: 'S1' }, 3: { difficulty: 'Hard', session_title: 'S2' } },
    sessionTotals: { S1: 4, S2: 3 },
    survivingAttempts: [
      { problemId: 1, accepted: true, firstSolve: true, createdAt: '2026-05-01' },
      { problemId: 1, accepted: false, firstSolve: false, createdAt: '2026-05-01' },
      { problemId: 2, accepted: true, firstSolve: true, createdAt: '2026-05-02' },
      { problemId: 3, accepted: true, firstSolve: true, createdAt: '2026-05-02' },
    ],
    survivingRecentActivity: [{ problemId: 3, problemTitle: 'P3', difficulty: 'Hard', status: 'ACCEPTED', timestamp: '2026-05-02' }],
    prevLongestStreak: 5,
  });
  assert(r.stats.totalSolved === 3, 'partial: 3 solved');
  assert(r.stats.easySolved === 1 && r.stats.mediumSolved === 1 && r.stats.hardSolved === 1, 'partial: difficulty counts');
  assert(r.experience === 350, 'partial: xp 50+100+200');
  assert(r.level === 1, 'partial: level floor(350/500)+1');
  assert(r.contestRating === 1045, 'partial: rating 1000+15*3');
  assert(r.stats.totalSubmissions === 4 && r.stats.acceptedSubmissions === 3, 'partial: submission counts');
  assert(r.stats.acceptanceRate === 75, 'partial: acceptance 75%');
  assert(r.stats.failedRuns === 0, 'partial: failedRuns always resets to 0 (run-level, not solve-tied)');
  assert(r.submissionCalendar.length === 2, 'partial: 2 submission days');
  const day2 = r.solvedCalendar.find((d) => d.date.toISOString().startsWith('2026-05-02'));
  assert(!!day2 && day2.count === 2, 'partial: 2 first-solves on day 2');
  const s1 = r.topicProgress.find((t) => t.topic === 'S1');
  assert(!!s1 && s1.solved === 2 && s1.total === 4, 'partial: topic S1 = 2/4');
  assert(r.achievements.includes('first_solve'), 'partial: first_solve earned');
  assert(r.skills.length === 1 && r.skills[0] === 'Python', 'partial: Python skill tracked');
  assert(r.recentActivity.length === 1 && r.recentActivity[0].problemTitle === 'P3', 'partial: recentActivity filtered + typed');
}

// 4) solvedCalendar de-dups first-solves by problemId (reset-then-re-solve safety).
{
  const r = computeResetProgress({
    survivingSolvedIds: [1],
    solvedMeta: { 1: { difficulty: 'Easy', session_title: 'S1' } },
    sessionTotals: { S1: 1 },
    survivingAttempts: [
      { problemId: 1, accepted: true, firstSolve: true, createdAt: '2026-05-01' },
      { problemId: 1, accepted: true, firstSolve: true, createdAt: '2026-05-03' }, // re-solve after a prior reset
    ],
    survivingRecentActivity: [],
    prevLongestStreak: 0,
  });
  assert(r.solvedCalendar.reduce((s, d) => s + d.count, 0) === 1, 'dedupe: same problem first-solved twice -> counted once in solvedCalendar');
  assert(r.submissionCalendar.reduce((s, d) => s + d.count, 0) === 2, 'dedupe: both submissions still counted');
}

// 3) Idempotent + de-dup.
{
  const input = { survivingSolvedIds: [1, 1, 2], solvedMeta: { 1: { difficulty: 'Easy', session_title: 'S1' }, 2: { difficulty: 'Easy', session_title: 'S1' } }, sessionTotals: { S1: 2 }, survivingAttempts: [], survivingRecentActivity: [], prevLongestStreak: 0 };
  const a = computeResetProgress(input);
  const b = computeResetProgress(input);
  assert(JSON.stringify(a) === JSON.stringify(b), 'idempotent: stable output');
  assert(a.stats.totalSolved === 2, 'de-dup: duplicate solved id counted once');
}

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
