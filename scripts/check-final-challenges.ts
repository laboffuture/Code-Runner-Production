import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://code-runner-admin:Lof%40123@code-runner-db.62kbtjj.mongodb.net/code-runner?retryWrites=true&w=majority&appName=code-runner-db';

async function checkFinalChallenges() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('code-runner');

    console.log('\n=== CHECKING FINAL CHALLENGES (Code Convergence) ===\n');

    for (let level = 1; level <= 4; level++) {
      // Check for session 11, 22, 33, 44 (final challenges)
      const finalSessionId = level === 1 ? 11 : level === 2 ? 22 : level === 3 ? 33 : 44;

      const problems = await db.collection('problems')
        .find({
          age_group: '11-14',
          level_number: level,
          session_id: finalSessionId
        })
        .project({
          problem_id: 1,
          title: 1,
          session_id: 1,
          level_number: 1,
        })
        .toArray();

      console.log(`Level ${level} - Session ${finalSessionId}:`);
      if (problems.length > 0) {
        console.log(`  ✅ Found ${problems.length} problem(s)`);
        problems.forEach(p => {
          console.log(`     - Problem ${p.problem_id}: ${p.title}`);
        });
      } else {
        console.log(`  ❌ NOT FOUND - Missing final challenge!`);
      }
      console.log();
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkFinalChallenges();
