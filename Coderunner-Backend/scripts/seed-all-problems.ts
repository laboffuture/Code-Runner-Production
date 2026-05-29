import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir } from 'fs/promises';
import { join, resolve } from 'path';
import dotenv from 'dotenv';

// Load MongoDB URI from apps/api/.env.local (same pattern as make-admin.ts)
dotenv.config({ path: resolve(__dirname, '../apps/api/.env.local') });
dotenv.config(); // fallback

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set. Check apps/api/.env.local');
  process.exit(1);
}

const execAsync = promisify(exec);

// Pass MONGODB_URI explicitly to each child tsx process
const childEnv = { ...process.env, MONGODB_URI };

async function runFile(filePath: string): Promise<boolean> {
  try {
    await execAsync(`tsx "${filePath}"`, { env: childEnv });
    process.stdout.write('.');
    return true;
  } catch (error: any) {
    console.error(`\n   ❌ Failed ${filePath.split(/[\\/]/).pop()}:`, error.stderr || error.message);
    return false;
  }
}

async function seedAllProblems() {
  console.log('🌱 Starting database seeding...\n');
  console.log(`   DB: ${MONGODB_URI!.replace(/:([^:@]+)@/, ':***@')}\n`);

  let totalSeeded = 0;

  // ── seed-problems (11-14, levels 1-4) ─────────────────────────────────────
  console.log('━━━ Seeding Problems ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  const seedDir = join(__dirname, 'seed-problems', '11-14');
  const levels = ['level-1', 'level-2', 'level-3', 'level-4'];

  for (const level of levels) {
    console.log(`📂 Seeding ${level}...`);
    const levelDir = join(seedDir, level);

    try {
      const files = await readdir(levelDir);
      const seedFiles = files
        .filter(f => f.endsWith('.ts') && f.startsWith('seed-problem'))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.match(/\d+/)?.[0] || '0');
          return numA - numB;
        });

      console.log(`   Found ${seedFiles.length} problems in ${level}`);

      for (const file of seedFiles) {
        if (await runFile(join(levelDir, file))) totalSeeded++;
      }

      console.log(`\n   ✅ Completed ${level}\n`);
    } catch (error) {
      console.error(`   ❌ Error reading ${level}:`, error);
    }
  }

  console.log(`\n🎉 Seeding complete! Total seeded: ${totalSeeded} problem files.`);
}

seedAllProblems().catch(console.error);
