import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem182() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 182: Level 4, Session 1, Case 1 - Understanding Runtime Errors
    const problem182 = {
      problem_id: 182,
      session_id: 34, // Level 4, Session 1
      title: 'Understanding Runtime Errors',
      description: 'Learn to identify and handle runtime errors that occur during program execution.',
      difficulty: 'Easy',
      question: `Can you create a velocity calculator that handles runtime errors? Take inputs for speed and time, then calculate velocity using division. Use try-except to catch ZeroDivisionError and print the appropriate error message.`,      sample_input: '100\n0',
      sample_output: 'Error: Time cannot be zero',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['exception handling', 'try-except', 'ZeroDivisionError', 'runtime errors'],
        estimated_time_minutes: 10
      },

      // Session-level content
      session_title: 'Session 1: Error Detection and Exception Resolution',

      // Case-specific content
      case_number: 1,
      case_title: 'Understanding Runtime Errors',
      case_overview: `Runtime errors occur during program execution, unlike compile-time errors. Understanding this distinction helps developers write more predictable code and handle errors effectively.`,
      case_explanation: `Create a function that calculates velocity from speed and time. Handle ZeroDivisionError when time is zero by printing an error message instead of crashing the program.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 182 if it exists
    await problemsCollection.deleteOne({ problem_id: 182 });
    await testCasesCollection.deleteMany({ problem_id: 182 });

    // Insert problem 182
    const problemResult = await problemsCollection.insertOne(problem182);
    console.log('Problem 182 inserted');

    // Test cases for Problem 182
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1821,
        problem_id: 182,
        input: '100\n0',
        expected_output: 'Error: Time cannot be zero',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1822,
        problem_id: 182,
        input: '100\n5',
        expected_output: 'Velocity: 20.0',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1823,
        problem_id: 182,
        input: '200\n0',
        expected_output: 'Error: Time cannot be zero',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1824,
        problem_id: 182,
        input: '150\n10',
        expected_output: 'Velocity: 15.0',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1825,
        problem_id: 182,
        input: '80\n4',
        expected_output: 'Velocity: 20.0',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1826,
        problem_id: 182,
        input: '300\n0',
        expected_output: 'Error: Time cannot be zero',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1827,
        problem_id: 182,
        input: '120\n6',
        expected_output: 'Velocity: 20.0',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 182`);

    console.log('\n✅ Problem 182 (Level 4, Session 1, Case 1: Runtime Errors) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem182()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
