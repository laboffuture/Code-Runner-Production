/**
 * Load apps/api/.env.local for standalone scripts (seed/verify) BEFORE anything reads
 * process.env, so MONGODB_URI points at the real database. Fail CLOSED if nothing is
 * configured, rather than letting connectToDatabase silently fall back to
 * mongodb://localhost (which would seed/verify answer keys into the wrong DB).
 * Import this first: `import './_load-env';`
 */
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';

const candidates = [
  path.resolve(__dirname, '../.env.local'),            // apps/api/.env.local (run via tsx)
  path.resolve(process.cwd(), 'apps/api/.env.local'),  // run from Coderunner-Backend
  path.resolve(process.cwd(), '.env.local'),
];

for (const p of candidates) {
  if (existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

if (!process.env.MONGODB_URI) {
  console.error(
    'FATAL: MONGODB_URI is not set. Looked for .env.local at:\n  ' +
      candidates.join('\n  ') +
      '\nRefusing to run against the localhost fallback. Set MONGODB_URI or add apps/api/.env.local.'
  );
  process.exit(1);
}
