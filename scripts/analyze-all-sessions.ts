import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://code-runner-admin:Lof%40123@code-runner-db.62kbtjj.mongodb.net/code-runner?retryWrites=true&w=majority&appName=code-runner-db';

async function analyzeAllSessions() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('code-runner');

    // Get all sessions for age group 11-14
    const pipeline = [
      {
        $match: { age_group: '11-14' }
      },
      {
        $group: {
          _id: {
            level_number: '$level_number',
            session_id: '$session_id'
          },
          first_problem: { $first: '$title' },
          problem_count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.level_number': 1, '_id.session_id': 1 }
      }
    ];

    const sessions = await db.collection('problems').aggregate(pipeline).toArray();

    console.log('\n=== ALL SESSIONS BY LEVEL (Age 11-14) ===\n');

    let currentLevel = 0;
    sessions.forEach((session: any) => {
      if (session._id.level_number !== currentLevel) {
        currentLevel = session._id.level_number;
        console.log(`\n📚 LEVEL ${currentLevel}:`);
      }
      console.log(`   Session ${session._id.session_id}: "${session.first_problem}" (${session.problem_count} problems)`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

analyzeAllSessions();
