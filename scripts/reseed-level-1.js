const { execSync } = require('child_process');

const problems = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,51,52];

console.log('========================================');
console.log('RESEEDING PROBLEMS 1-15, 51-52');
console.log('========================================\n');

for (const num of problems) {
  console.log(`Seeding problem ${num}...`);
  try {
    execSync(`npx tsx scripts/seed-problems/11-14/level-1/seed-problem-${num}.ts`, {
      cwd: 'D:\LOF\PROJECTS\LOF\Code_Runner-main',
      stdio: 'inherit'
    });
  } catch (e) {
    console.error(`Failed to seed problem ${num}`);
  }
}

console.log('\n========================================');
console.log('✅ ALL PROBLEMS RESEEDED');
console.log('========================================\n');
console.log('Now:');
console.log('1. Stop dev server: Ctrl+C');
console.log('2. Delete .next folder');
console.log('3. Restart: npm run dev');
console.log('4. Hard refresh browser: Ctrl+Shift+R');
