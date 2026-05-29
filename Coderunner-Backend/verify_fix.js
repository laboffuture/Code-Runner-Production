const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://code-runner-admin:Lof%40123@code-runner-db.62kbtjj.mongodb.net/code-runner?retryWrites=true&w=majority&appName=code-runner-db';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('code-runner');
  const col = db.collection('test_cases');

  const tcs = await col.find({ problem_id: 1000 }).toArray();

  for (const tc of tcs) {
    const lines = (tc.input || '').split('\n');
    const hasLiteralNewline = (tc.input || '').includes('\\n');
    console.log(`TC ${tc.test_case_id}: lines=${lines.length}, hasLiteral\\n=${hasLiteralNewline}`);
    lines.forEach((l, i) => console.log(`  [${i}]: "${l}"`));

    // Force fix again if still broken
    if (hasLiteralNewline || lines.length < 4) {
      const fixed = tc.input.replace(/\\n/g, '\n');
      await col.updateOne({ _id: tc._id }, { $set: { input: fixed } });
      console.log(`  --> Re-fixed!`);
    }
  }

  await client.close();
}
main().catch(console.error);
