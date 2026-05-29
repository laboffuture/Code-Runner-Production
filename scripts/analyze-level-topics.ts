import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://code-runner-admin:Lof%40123@code-runner-db.62kbtjj.mongodb.net/code-runner?retryWrites=true&w=majority&appName=code-runner-db';

async function analyzeLevels() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('code-runner');

    // Get all levels for age group 11-14
    const pipeline = [
      {
        $match: {
          age_group: '11-14'
        }
      },
      {
        $group: {
          _id: {
            age_group: '$age_group',
            level_number: '$level_number'
          },
          problems: { $push: '$$ROOT' },
          concepts: { $push: '$metadata.concepts' }
        }
      },
      {
        $sort: { '_id.level_number': 1 }
      }
    ];

    const levels = await db.collection('problems').aggregate(pipeline).toArray();

    console.log('\n=== LEVEL ANALYSIS FOR AGE GROUP 11-14 ===\n');

    for (const level of levels) {
      const levelNum = level._id.level_number;
      const problemCount = level.problems.length;

      // Extract all concepts
      const allConcepts = level.concepts.flat().filter(Boolean);
      const uniqueConcepts = [...new Set(allConcepts)];

      // Get problem titles to understand topics
      const problemTitles = level.problems.map((p: any) => p.title).slice(0, 10);

      console.log(`\n📚 LEVEL ${levelNum}`);
      console.log(`   Problems: ${problemCount}`);
      console.log(`   Key Concepts:`);
      uniqueConcepts.slice(0, 8).forEach(concept => {
        console.log(`      - ${concept}`);
      });
      console.log(`   Sample Problems:`);
      problemTitles.forEach((title: string) => {
        console.log(`      - ${title}`);
      });
      console.log('   ---');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

analyzeLevels();
