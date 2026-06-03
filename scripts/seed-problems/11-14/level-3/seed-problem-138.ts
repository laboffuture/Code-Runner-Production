import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem138() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 138: Level 3, Session 3, Case 6 - Quantum Signal Decoder (FINAL TASK)
    const problem138 = {
      problem_id: 138,
      session_id: 25, // Level 3, Session 3
      title: 'Quantum Signal Decoder – Advanced Module Integration',
      description: 'Your quantum communication system processes encrypted signals using multiple advanced modules for pattern generation, calculation optimization, and data transformation.',
      difficulty: 'Hard',
      question: `Can you process signal types: 'pattern' (cycle [1,2,3,4,5], output first 15 values), 'velocity' (sqrt(d*1000 + d²)/3.5 for comma-separated distances, 2 decimals), or 'transform' (sum * 2 for comma-separated integers)?`,      sample_input: 'pattern',
      sample_output: '1 2 3 4 5 1 2 3 4 5 1 2 3 4 5',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['itertools', 'functools', 'operator', 'lru_cache', 'reduce', 'partial', 'cycle', 'islice'],
        estimated_time_minutes: 25
      },

      // Session-level content
      session_title: 'Session 3: Functional Programming and Modular Data Handling',

      // Case-specific content
      case_number: 6,
      case_title: 'Quantum Signal Decoder – Advanced Module Integration',
      case_explanation: `Combine itertools.cycle/islice, functools.lru_cache/reduce/partial, operator.add/mul, and math.sqrt based on signal type.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 138 - 7 test cases (2 visible + 5 hidden)
    const testCases138 = [
      {
        test_case_id: 1381,
        problem_id: 138,
        input: 'pattern',
        expected_output: '1 2 3 4 5 1 2 3 4 5 1 2 3 4 5',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1382,
        problem_id: 138,
        input: 'velocity\n7000,8000,9000',
        expected_output: '2138.09 2424.37 2710.52',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1383,
        problem_id: 138,
        input: 'transform\n10,20,30,40,50',
        expected_output: '300',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1384,
        problem_id: 138,
        input: 'pattern',
        expected_output: '1 2 3 4 5 1 2 3 4 5 1 2 3 4 5',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1385,
        problem_id: 138,
        input: 'velocity\n6000,6000,7000',
        expected_output: '1851.64 1851.64 2138.09',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1386,
        problem_id: 138,
        input: 'transform\n5,5,5,5',
        expected_output: '40',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1387,
        problem_id: 138,
        input: 'velocity\n10000,12000,15000',
        expected_output: '2996.60 3568.57 4426.27',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 138 });
    await problemsCollection.insertOne(problem138);
    console.log('Problem 138 inserted');

    await testCasesCollection.deleteMany({ problem_id: 138 });
    await testCasesCollection.insertMany(testCases138);
    console.log(`${testCases138.length} test cases inserted for Problem 138`);

    console.log('\n✅ Problem 138 (Level 3, Session 3, Case 6: Quantum Signal Decoder) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem138()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
