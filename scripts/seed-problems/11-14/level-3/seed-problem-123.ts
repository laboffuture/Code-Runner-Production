import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem123() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 123: Level 3, Session 1, Case 3 - Creating and Using Your Own Modules
    const problem123 = {
      problem_id: 123,
      session_id: 23, // Level 3, Session 1
      title: 'Creating and Using Your Own Modules',
      description: 'Just like NASA engineers create specialized tools, create your own module with a function to calculate spacecraft acceleration.',
      difficulty: 'Medium',
      question: `A spacecraft engine produces thrust force in Newtons, and the spacecraft has a certain mass in kilograms. Can you create a function to calculate the engine's acceleration using Newton's Second Law?`,      sample_input: '5000\n2500',
      sample_output: '2.00',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['custom functions', 'modules', 'function definition', 'Newton\'s Second Law', 'acceleration'],
        estimated_time_minutes: 20
      },

      // Session-level content
      session_title: 'Session 1: Python Modules',

      // Case-specific content
      case_number: 3,
      case_title: 'Creating and Using Your Own Modules',
      case_overview: `Create custom functions and modules for reusable code. Build organized, efficient systems like NASA engineers.`,
      case_explanation: `Define a function thrust(force, mass) that implements Newton's Second Law (a = F / m) to calculate acceleration.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 123 - 7 test cases (2 visible + 5 hidden)
    const testCases123 = [
      {
        test_case_id: 1231,
        problem_id: 123,
        input: '5000\n2500',
        expected_output: '2.00',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1232,
        problem_id: 123,
        input: '10000\n5000',
        expected_output: '2.00',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1233,
        problem_id: 123,
        input: '15000\n3000',
        expected_output: '5.00',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1234,
        problem_id: 123,
        input: '8500\n1700',
        expected_output: '5.00',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1235,
        problem_id: 123,
        input: '12000\n4000',
        expected_output: '3.00',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1236,
        problem_id: 123,
        input: '7200\n1800',
        expected_output: '4.00',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1237,
        problem_id: 123,
        input: '25000\n10000',
        expected_output: '2.50',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 123 });
    await problemsCollection.insertOne(problem123);
    console.log('Problem 123 inserted');

    await testCasesCollection.deleteMany({ problem_id: 123 });
    await testCasesCollection.insertMany(testCases123);
    console.log(`${testCases123.length} test cases inserted for Problem 123`);

    console.log('\n✅ Problem 123 (Level 3, Session 1, Case 3: Creating and Using Your Own Modules) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem123()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
