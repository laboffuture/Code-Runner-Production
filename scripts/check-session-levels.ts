import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://code-runner-admin:Lof%40123@code-runner-db.62kbtjj.mongodb.net/code-runner?retryWrites=true&w=majority&appName=code-runner-db';

async function checkSessionLevels() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('code-runner');

    // Get session_id 12-21 and see what levels they're assigned to
    const sessions = await db.collection('problems')
      .find({
        session_id: { $in: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21] },
        age_group: '11-14'
      })
      .project({
        session_id: 1,
        level_number: 1,
        title: 1,
        problem_id: 1
      })
      .sort({ session_id: 1, problem_id: 1 })
      .limit(60)
      .toArray();

    console.log('\n=== SESSION TO LEVEL MAPPING ===\n');

    const sessionMap = new Map();
    sessions.forEach(problem => {
      if (!sessionMap.has(problem.session_id)) {
        sessionMap.set(problem.session_id, {
          session_id: problem.session_id,
          level_number: problem.level_number,
          first_problem: problem.title,
          problem_count: 0
        });
      }
      const session = sessionMap.get(problem.session_id);
      session.problem_count++;
    });

    sessionMap.forEach((session, sessionId) => {
      console.log(`Session ${sessionId}: Level ${session.level_number} - "${session.first_problem}" (${session.problem_count} problems)`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkSessionLevels();
