import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem128() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 128: Level 3, Session 2, Case 2 - Using the random module
    const problem128 = {
      problem_id: 128,
      session_id: 24, // Level 3, Session 2
      title: 'Using the random module',
      description: 'The random module brings unpredictability to programs through random numbers, shuffling, and simulations—perfect for games and testing.',
      difficulty: 'Easy',
      question: `The training simulation needs to generate random challenge scenarios for astronaut preparation. Given a seed value to initialize the random generator, can you simulate a dice roll that produces a number between 1 and 6 to determine the difficulty level of the next training module?`,      sample_input: '42',
      sample_output: '6',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['random module', 'randint', 'seeding', 'random numbers'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 2: Built-in Modules',

      // Case-specific content
      case_number: 2,
      case_title: 'Using the random module',
      case_overview: `The random module generates random numbers and helps simulate unpredictable events like dice rolls or random selections.`,
      case_explanation: `Import random, use random.seed() with the input value, then use random.randint(1, 6) to generate a dice roll.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 128 - 7 test cases (2 visible + 5 hidden)
    // Note: These outputs are based on Python's random.seed() behavior
    const testCases128 = [
      {
        test_case_id: 1281,
        problem_id: 128,
        input: '42',
        expected_output: '6',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1282,
        problem_id: 128,
        input: '10',
        expected_output: '5',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1283,
        problem_id: 128,
        input: '100',
        expected_output: '2',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1284,
        problem_id: 128,
        input: '7',
        expected_output: '3',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1285,
        problem_id: 128,
        input: '1',
        expected_output: '2',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1286,
        problem_id: 128,
        input: '55',
        expected_output: '1',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1287,
        problem_id: 128,
        input: '99',
        expected_output: '4',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 128 });
    await problemsCollection.insertOne(problem128);
    console.log('Problem 128 inserted');

    await testCasesCollection.deleteMany({ problem_id: 128 });
    await testCasesCollection.insertMany(testCases128);
    console.log(`${testCases128.length} test cases inserted for Problem 128`);

    console.log('\n✅ Problem 128 (Level 3, Session 2, Case 2: Using the random module) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem128()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
