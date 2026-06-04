import { isProblemUnlocked } from './unlock.utils';

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) { console.error('  ✗', msg); failures++; } else { console.log('  ✓', msg); }
}

// Curriculum: L1{ S1:[case1=1, case2=2], S2:[case1=3] }, L2{ S1:[case1=4] }
const curriculum = [
  { problem_id: 1, level_number: 1, session_id: 1, case_number: 1 },
  { problem_id: 2, level_number: 1, session_id: 1, case_number: 2 },
  { problem_id: 3, level_number: 1, session_id: 2, case_number: 1 },
  { problem_id: 4, level_number: 2, session_id: 1, case_number: 1 },
];

// The very first problem is always unlocked (nothing before it).
assert(isProblemUnlocked(1, [], curriculum) === true, 'first problem (S1 C1) unlocked with no solves');

// CASE-BY-CASE: within a session, case 2 is locked until case 1 is solved.
assert(isProblemUnlocked(2, [], curriculum) === false, 'S1 C2 locked until S1 C1 solved');
assert(isProblemUnlocked(2, [1], curriculum) === true, 'S1 C2 unlocks once S1 C1 solved');

// Session 2 locked until BOTH cases of session 1 are solved.
assert(isProblemUnlocked(3, [1], curriculum) === false, 'S2 locked when only S1 C1 solved');
assert(isProblemUnlocked(3, [1, 2], curriculum) === true, 'S2 unlocks when all of S1 solved');

// Level 2 locked until ALL of level 1 (sessions 1 and 2) is solved.
assert(isProblemUnlocked(4, [1, 2], curriculum) === false, 'L2 locked until L1 S2 solved');
assert(isProblemUnlocked(4, [1, 2, 3], curriculum) === true, 'L2 unlocks when all of L1 solved');

// A problem not in this curriculum is not gated (grade route already validated existence).
assert(isProblemUnlocked(99, [], curriculum) === true, 'unknown problem: not gated');

// Set input also accepted.
assert(isProblemUnlocked(2, new Set([1]), curriculum) === true, 'accepts a Set of solved ids');

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
