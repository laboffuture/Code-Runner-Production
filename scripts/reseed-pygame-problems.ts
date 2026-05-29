import { execSync } from 'child_process';

/**
 * Reseed all Pygame problems (Problems 230-241: Session 9 & 10)
 * This script runs all seed scripts for Pygame problems to update the database
 */

const pygameProblems = [
  230, 231, 232, 233, 234, 235, // Session 9: Pygame Basics
  236, 237, 238, 239, 240, 241  // Session 10: Pygame Events
];

console.log('🎮 Reseeding all Pygame problems (230-241)...\n');

for (const problemId of pygameProblems) {
  try {
    console.log(`Seeding Problem ${problemId}...`);
    execSync(`npx tsx scripts/seed-problems/11-14/level-4/seed-problem-${problemId}.ts`, {
      stdio: 'inherit'
    });
    console.log(`✅ Problem ${problemId} seeded successfully\n`);
  } catch (error) {
    console.error(`❌ Failed to seed Problem ${problemId}:`, error);
    process.exit(1);
  }
}

console.log('\n🚀 All Pygame problems reseeded successfully!');
console.log('\n📝 Summary:');
console.log('- Session 9 (Problems 230-235): Pygame Basics and Visual Representation');
console.log('- Session 10 (Problems 236-241): Pygame Events and Interactions');
console.log('- Each problem now has 2 test cases (1 visible, 1 hidden)');
console.log('- Test validation uses CONSOLE OUTPUT (print capture), not SYSTEM OUTPUT');
