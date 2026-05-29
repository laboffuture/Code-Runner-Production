const fs = require('fs');
const path = require('path');

// Update test cases for problems 206-214
for (let problemId = 206; problemId <= 214; problemId++) {
  const filePath = path.join(__dirname, `seed-problems/11-14/level-4/seed-problem-${problemId}.ts`);

  let content = fs.readFileSync(filePath, 'utf-8');

  // Find the test cases section and extract the first two test cases
  const testCasesMatch = content.match(/\/\/ Test cases for Problem \d+.*?\n(.*?const testCases = \[)([\s\S]*?)(\];)/);

  if (testCasesMatch) {
    const fullTestCasesSection = testCasesMatch[2];

    // Extract individual test cases
    const testCaseMatches = [...fullTestCasesSection.matchAll(/\{[^{}]*test_case_id:[^{}]*\}/gs)];

    if (testCaseMatches.length >= 2) {
      // Get first two test cases
      let testCase1 = testCaseMatches[0][0];
      let testCase2 = testCaseMatches[1][0];

      // Update weights to 50
      testCase1 = testCase1.replace(/weight:\s*\d+/, 'weight: 50');
      testCase2 = testCase2.replace(/weight:\s*\d+/, 'weight: 50');

      // Create new test cases section
      const newTestCases = `\n      ${testCase1},\n      ${testCase2}\n    `;

      // Replace the old test cases with new ones
      content = content.replace(
        testCasesMatch[0],
        `// Test cases for Problem ${problemId}\n    const testCases = [${newTestCases}];`
      );

      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated seed-problem-${problemId}.ts`);
    }
  }
}

console.log('All files updated!');
