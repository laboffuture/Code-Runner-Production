import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://code-runner-admin:Lof%40123@code-runner-db.62kbtjj.mongodb.net/code-runner?retryWrites=true&w=majority&appName=code-runner-db';

async function checkExactField() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('code-runner');

    // Get first problem from Session 1 Level 1
    const problem = await db.collection('problems')
      .findOne({
        age_group: '11-14',
        level_number: 1,
        session_id: 1,
        problem_id: 1
      });

    console.log('\n=== FIRST PROBLEM FROM SESSION 1 ===\n');
    console.log('Problem ID:', problem?.problem_id);
    console.log('Title:', problem?.title);
    console.log('Has session_title field:', 'session_title' in (problem || {}));
    console.log('session_title value:', problem?.session_title);
    console.log('\nAll fields:', Object.keys(problem || {}));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkExactField();
