import { isProblemUnlocked } from './unlock.utils';

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) { console.error('  ✗', msg); failures++; } else { console.log('  ✓', msg); }
}

// Curriculum: L1{ S1:[1,2], S2:[3] }, L2{ S1:[4] }
const curriculum = [
  { problem_id: 1, level_number: 1, session_id: 1 },
  { problem_id: 2, level_number: 1, session_id: 1 },
  { problem_id: 3, level_number: 1, session_id: 2 },
  { problem_id: 4, level_number: 2, session_id: 1 },
];

// First session is always unlocked (nothing before it).
assert(isProblemUnlocked(1, [], curriculum) === true, 'first session: problem 1 unlocked with no solves');
assert(isProblemUnlocked(2, [], curriculum) === true, 'first session: problem 2 (same session) unlocked, free order');

// Session 2 locked until BOTH problems of session 1 are solved.
assert(isProblemUnlocked(3, [1], curriculum) === false, 'session 2 locked when only 1 of session 1 solved');
assert(isProblemUnlocked(3, [1, 2], curriculum) === true, 'session 2 unlocks when session 1 fully solved');

// Level 2 locked until ALL of level 1 (sessions 1 and 2) is solved.
assert(isProblemUnlocked(4, [1, 2], curriculum) === false, 'level 2 locked until level 1 session 2 solved');
assert(isProblemUnlocked(4, [1, 2, 3], curriculum) === true, 'level 2 unlocks when all of level 1 solved');

// A problem not in this curriculum is not gated (grade route already validated existence).
assert(isProblemUnlocked(99, [], curriculum) === true, 'unknown problem: not gated');

// Set input also accepted.
assert(isProblemUnlocked(3, new Set([1, 2]), curriculum) === true, 'accepts a Set of solved ids');

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
