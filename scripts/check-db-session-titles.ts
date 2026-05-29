import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://code-runner-admin:Lof%40123@code-runner-db.62kbtjj.mongodb.net/code-runner?retryWrites=true&w=majority&appName=code-runner-db';

async function checkSessionTitles() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('code-runner');

    // Get all problems for Level 1
    const problems = await db.collection('problems')
      .find({
        age_group: '11-14',
        level_number: 1,
        session_id: { $lte: 10 }
      })
      .project({
        session_id: 1,
        problem_id: 1,
        title: 1,
        session_title: 1,
      })
      .sort({ session_id: 1, problem_id: 1 })
      .toArray();

    console.log('\n=== LEVEL 1 SESSION TITLES FROM DATABASE ===\n');

    const sessionMap = new Map();
    problems.forEach(problem => {
      if (!sessionMap.has(problem.session_id)) {
        sessionMap.set(problem.session_id, {
          session_id: problem.session_id,
          session_title: problem.session_title || 'NO TITLE IN DB',
          first_problem: problem.title,
        });
      }
    });

    sessionMap.forEach((info, sessionId) => {
      console.log(`Session ${sessionId}:`);
      console.log(`  DB Title: "${info.session_title}"`);
      console.log(`  First Problem: "${info.first_problem}"`);
      console.log();
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkSessionTitles();
