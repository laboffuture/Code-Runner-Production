const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://code-runner-admin:Lof%40123@code-runner-db.62kbtjj.mongodb.net/code-runner?retryWrites=true&w=majority&appName=code-runner-db';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('code-runner');

  // Check ALL test cases for problem 1000
  const tcs = await db.collection('test_cases').find({ problem_id: 1000 }).toArray();
  console.log('Total test cases for problem 1000:', tcs.length);

  tcs.forEach((tc, i) => {
    const lines = (tc.input || '').split('\n');
    const hasLiteralN = (tc.input || '').includes('\\n');
    console.log(`\nTC ${i+1} (id=${tc.test_case_id}):`);
    console.log(`  Lines: ${lines.length}, hasLiteral\\n: ${hasLiteralN}`);
    console.log(`  Line 1: "${lines[0]}"`);
    console.log(`  Line 2: "${lines[1]}"`);
  });

  // Also check if any test cases have 'Mission' in input line 2
  const missionInLine2 = tcs.filter(tc => {
    const lines = (tc.input || '').split('\n');
    return lines[1] && lines[1].includes('Mission');
  });
  console.log('\nTest cases with Mission in line 2:', missionInLine2.length);

  await client.close();
}
main().catch(console.error);
