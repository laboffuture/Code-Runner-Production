import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem127() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 127: Level 3, Session 2, Case 1 - Using the math module
    const problem127 = {
      problem_id: 127,
      session_id: 24, // Level 3, Session 2
      title: 'Using the math module',
      description: 'The math module provides powerful mathematical functions for quick and accurate calculations, from simple square roots to complex factorials.',
      difficulty: 'Easy',
      question: `The spacecraft mission computer needs to calculate possible mission configurations based on crew arrangements. Given a number of available crew members, can you calculate how many different ways they can be arranged in specific positions using factorial calculations?`,      sample_input: '5',
      sample_output: '120',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['math module', 'factorial', 'import', 'mathematical functions'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 2: Built-in Modules',

      // Case-specific content
      case_number: 1,
      case_title: 'Using the math module',
      case_overview: `The math module performs basic and advanced math operations like square roots, powers, and factorials with built-in optimized functions.`,
      case_explanation: `Import the math module and use math.factorial() to calculate the factorial of the input number.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 127 - 7 test cases (2 visible + 5 hidden)
    const testCases127 = [
      {
        test_case_id: 1271,
        problem_id: 127,
        input: '5',
        expected_output: '120',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1272,
        problem_id: 127,
        input: '3',
        expected_output: '6',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1273,
        problem_id: 127,
        input: '7',
        expected_output: '5040',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1274,
        problem_id: 127,
        input: '10',
        expected_output: '3628800',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1275,
        problem_id: 127,
        input: '1',
        expected_output: '1',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1276,
        problem_id: 127,
        input: '6',
        expected_output: '720',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1277,
        problem_id: 127,
        input: '8',
        expected_output: '40320',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 127 });
    await problemsCollection.insertOne(problem127);
    console.log('Problem 127 inserted');

    await testCasesCollection.deleteMany({ problem_id: 127 });
    await testCasesCollection.insertMany(testCases127);
    console.log(`${testCases127.length} test cases inserted for Problem 127`);

    console.log('\n✅ Problem 127 (Level 3, Session 2, Case 1: Using the math module) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem127()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
