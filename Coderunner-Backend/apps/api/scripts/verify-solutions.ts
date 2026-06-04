/**
 * Curriculum auto-verifier: for each seeded Solution, run its solution_code against that
 * problem's test_cases and set `verified`. The output comparison MIRRORS the real Docker
 * grader (apps/runner/src/executors/docker.executor.ts: normalizeOutput + outputsMatch),
 * so a "VERIFIED" badge means "passes the way students are actually graded".
 * Run: npx tsx apps/api/scripts/verify-solutions.ts  (from Coderunner-Backend).
 */
import './_load-env';
import { connectToDatabase, Models } from '@code-runner/shared';
import { execFileSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const PY = process.platform === 'win32' ? 'python' : 'python3';

// ── Grader parity (keep in sync with docker.executor.ts) ────────────────────
const normalizeOutput = (s: string): string =>
  String(s)
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, '')) // per-line trimEnd
    .join('\n');

const numRe = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;
const tokensMatch = (actual: string, expected: string): boolean => {
  if (actual === expected) return true;
  const a = actual.trim();
  const e = expected.trim();
  if (numRe.test(a) && numRe.test(e)) {
    const fa = parseFloat(a);
    const fe = parseFloat(e);
    if (isFinite(fa) && isFinite(fe)) {
      const tol = Math.max(1e-4, Math.abs(fe) * 1e-4);
      return Math.abs(fa - fe) <= tol;
    }
  }
  return false;
};

const outputsMatch = (actual: string, expected: string): boolean => {
  const na = normalizeOutput(actual);
  const ne = normalizeOutput(expected);
  if (na === ne) return true;
  const aLines = na.split('\n');
  const eLines = ne.split('\n');
  if (aLines.length !== eLines.length) return false;
  return aLines.every((al, i) => tokensMatch(al, eLines[i]));
};
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  await connectToDatabase();
  const solutions = await Models.Solution.find({}).lean<any[]>();
  let okAll = true;
  for (const sol of solutions) {
    const tcs = await Models.TestCase.find({ problem_id: sol.problem_id }).sort({ test_case_id: 1 }).lean<any[]>();
    let pass = 0;
    let firstFail: any = null;
    for (const tc of tcs) {
      let got = '';
      // Run each test case in its own fresh temp dir so file-creating solutions are
      // isolated per test (matching the runner's per-execution sandbox) and never
      // litter the repo. Non-file solutions are unaffected by the cwd.
      const workDir = mkdtempSync(join(tmpdir(), 'verify-'));
      try {
        got = execFileSync(PY, ['-c', sol.solution_code], {
          input: String(tc.input ?? ''), encoding: 'utf8', timeout: 10000, cwd: workDir,
          env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
        });
      } catch (e: any) {
        firstFail = { input: tc.input, err: (e.stderr || e.message || '').toString().trim().split('\n').pop() };
        break;
      } finally {
        try { rmSync(workDir, { recursive: true, force: true }); } catch { /* best-effort cleanup */ }
      }
      if (outputsMatch(got, tc.expected_output)) pass++;
      else if (!firstFail) firstFail = { input: tc.input, exp: normalizeOutput(tc.expected_output), got: normalizeOutput(got) };
    }
    const verified = !firstFail && tcs.length > 0 && pass === tcs.length;
    await Models.Solution.updateOne({ problem_id: sol.problem_id }, { $set: { verified } });
    console.log(`P${sol.problem_id}: ${pass}/${tcs.length} ${verified ? 'VERIFIED' : 'FAIL'}`);
    if (!verified) {
      okAll = false;
      if (firstFail) console.log('    ', JSON.stringify(firstFail).slice(0, 300));
    }
  }
  console.log(okAll ? '\nALL SOLUTIONS VERIFIED' : '\nSOME SOLUTIONS FAILED');
  process.exit(okAll ? 0 : 1);
}

main().catch((e) => { console.error('Verify failed:', e); process.exit(1); });
