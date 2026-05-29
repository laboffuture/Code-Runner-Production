require('dotenv').config({ path: './apps/api/.env.local' });
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const problems = await db.collection('problems').find({ 
    problem_id: { $in: [230,231,232,234,235,236,237,238,239,240,241,242] }
  }).sort({ problem_id: 1 }).toArray();
  for (const p of problems) {
    console.log('=== Problem', p.problem_id, '-', p.title, '===');
    console.log('QUESTION:', p.question);
    console.log('CASE_EXPLANATION:', p.case_explanation);
    console.log('SAMPLE_OUTPUT:', p.sample_output);
    console.log('EXAMPLE_CODE:', p.example_code || 'none');
    console.log('');
  }
  await client.close();
}
main().catch(console.error);
