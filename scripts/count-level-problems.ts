import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://code-runner-admin:Lof%40123@code-runner-db.62kbtjj.mongodb.net/code-runner?retryWrites=true&w=majority&appName=code-runner-db';

async function countLevelProblems() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('code-runner');

    console.log('\n=== COUNTING PROBLEMS PER LEVEL (age 11-14) ===\n');

    for (let level = 1; level <= 4; level++) {
      const count = await db.collection('problems')
        .countDocuments({
          age_group: '11-14',
          level_number: level
        });

      console.log(`Level ${level}: ${count} problems total`);

      // Count by session
      const sessionCounts = await db.collection('problems').aggregate([
        {
          $match: {
            age_group: '11-14',
            level_number: level
          }
        },
        {
          $group: {
            _id: '$session_id',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();

      console.log(`  Sessions: ${sessionCounts.length}`);
      sessionCounts.forEach((s: any) => {
        console.log(`    Session ${s._id}: ${s.count} problems`);
      });
      console.log();
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

countLevelProblems();
