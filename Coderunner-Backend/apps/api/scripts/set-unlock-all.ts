/**
 * TEST/DEV ONLY — toggle the per-account sequential-gate bypass (`unlockAllLevels`)
 * for one student account. Used for the Teja test account so all levels/sessions/
 * cases are open for testing. Real students are never given this flag.
 *
 * Usage (from Coderunner-Backend):
 *   npx tsx apps/api/scripts/set-unlock-all.ts <username> <true|false>
 *
 * REMOVAL: when the Teja test account is removed at production, run this with
 * `false` (or delete the account) AND remove the bypass code — see the memory note
 * project-teja-unlock-bypass. Leave no test bypass in production.
 */
import './_load-env';
import { connectToDatabase, Models } from '@code-runner/shared';

async function main() {
  const [username, valueArg] = process.argv.slice(2);
  if (!username || (valueArg !== 'true' && valueArg !== 'false')) {
    console.error('Usage: npx tsx apps/api/scripts/set-unlock-all.ts <username> <true|false>');
    process.exit(1);
  }
  const value = valueArg === 'true';
  await connectToDatabase();

  const user = await Models.User.findOne({ username }).select('_id username role').lean<any>();
  if (!user) { console.error(`No user with username "${username}".`); process.exit(1); }
  if (user.role !== 'student') {
    console.error(`Refusing: "${username}" is a ${user.role}, not a student. This flag is a student test bypass.`);
    process.exit(1);
  }

  // No upsert: the student must already have a progress doc (created at registration),
  // so a typo'd username can't create a sparse UserProgress.
  const r = await Models.UserProgress.updateOne(
    { userId: user._id },
    { $set: { unlockAllLevels: value } },
  );
  if (r.matchedCount === 0) {
    console.error(`No UserProgress for "${username}" — have them log in once first, then re-run.`);
    process.exit(1);
  }
  console.log(`Set unlockAllLevels=${value} for student "${username}". (matched=${r.matchedCount})`);
  process.exit(0);
}
main().catch((e) => { console.error(e?.message || e); process.exit(1); });
