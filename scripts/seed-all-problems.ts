import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

async function seedAllProblems() {
  console.log('🌱 Starting database seeding...\n');

  const seedDir = join(__dirname, 'seed-problems', '11-14');
  const levels = ['level-1', 'level-2', 'level-3', 'level-4'];

  let totalSeeded = 0;

  for (const level of levels) {
    console.log(`📂 Seeding ${level}...`);
    const levelDir = join(seedDir, level);

    try {
      const files = await readdir(levelDir);
      const seedFiles = files.filter(f => f.endsWith('.ts') && f.startsWith('seed-problem'));

      console.log(`   Found ${seedFiles.length} problems in ${level}`);

      for (const file of seedFiles) {
        const filePath = join(levelDir, file);
        try {
          await execAsync(`tsx "${filePath}"`);
          totalSeeded++;
          process.stdout.write('.');
        } catch (error) {
          console.error(`\n   ❌ Failed to seed ${file}:`, error);
        }
      }

      console.log(`\n   ✅ Completed ${level}\n`);
    } catch (error) {
      console.error(`   ❌ Error reading ${level}:`, error);
    }
  }

  console.log(`\n🎉 Seeding complete! Seeded ${totalSeeded} problems across 4 levels.`);
}

seedAllProblems().catch(console.error);
