import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://code-runner-admin:Lof%40123@code-runner-db.62kbtjj.mongodb.net/code-runner?retryWrites=true&w=majority&appName=code-runner-db';

async function testAggregation() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('code-runner');

    // Run the same aggregation as the API
    const levels = await db.collection('problems').aggregate([
      { $match: { age_group: '11-14' } },
      {
        $group: {
          _id: '$level_number',
          level_number: { $first: '$level_number' },
          age_group: { $first: '$age_group' },
          problems: { $push: '$$ROOT' },
        },
      },
      { $sort: { level_number: 1 } },
    ]).toArray();

    console.log('\n=== AGGREGATION RESULTS ===\n');

    const level1 = levels.find((l: any) => l.level_number === 1);

    if (level1) {
      console.log(`Level 1 has ${level1.problems.length} problems`);

      // Group by session to count
      const sessionMap = new Map();
      level1.problems.forEach((p: any) => {
        if (!sessionMap.has(p.session_id)) {
          sessionMap.set(p.session_id, []);
        }
        sessionMap.get(p.session_id).push(p.problem_id);
      });

      console.log(`\nGrouped into ${sessionMap.size} sessions:`);
      Array.from(sessionMap.keys()).sort((a, b) => a - b).forEach(sessionId => {
        const problems = sessionMap.get(sessionId);
        console.log(`  Session ${sessionId}: ${problems.length} problems (${problems.join(', ')})`);
      });

      // Check specifically for problem 999
      const has999 = level1.problems.some((p: any) => p.problem_id === 999);
      console.log(`\n✓ Problem 999 included: ${has999}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testAggregation();
