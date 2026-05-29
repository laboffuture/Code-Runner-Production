import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://code-runner-admin:Lof%40123@code-runner-db.62kbtjj.mongodb.net/code-runner?retryWrites=true&w=majority&appName=code-runner-db';

async function checkProblem999() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('code-runner');

    const problem = await db.collection('problems')
      .findOne({ problem_id: 999 });

    console.log('\n=== PROBLEM 999 (Final Challenge Level 1) ===\n');
    console.log('Problem ID:', problem?.problem_id);
    console.log('Title:', problem?.title);
    console.log('Session ID:', problem?.session_id);
    console.log('Level Number:', problem?.level_number);
    console.log('Age Group:', problem?.age_group);
    console.log('\nShould match:');
    console.log('- session_id: 11');
    console.log('- level_number: 1');
    console.log('- age_group: "11-14"');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkProblem999();
