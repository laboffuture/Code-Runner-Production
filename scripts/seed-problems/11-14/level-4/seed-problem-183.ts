import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem183() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 183: Level 4, Session 1, Case 2 - Basic Try-Except Block
    const problem183 = {
      problem_id: 183,
      session_id: 34, // Level 4, Session 1
      title: 'Basic Try-Except Block',
      description: 'Use try-except blocks to handle common runtime errors and prevent program crashes.',
      difficulty: 'Easy',
      question: `Can you calculate velocity using try-except to handle errors? Take inputs for speed and time. Handle ZeroDivisionError by printing "Division by zero: Adjusting time." and ValueError by printing "Invalid input: Time must be a number." For successful calculations, print the velocity.`,      sample_input: '100\n0',
      sample_output: 'Division by zero: Adjusting time.',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['exception handling', 'try-except', 'ZeroDivisionError', 'ValueError', 'error recovery'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 1: Error Detection and Exception Resolution',

      // Case-specific content
      case_number: 2,
      case_title: 'Basic Try-Except Block',
      case_overview: `The try-except block allows programs to handle runtime errors gracefully by catching exceptions and providing meaningful responses or fallback actions instead of crashing.`,
      case_explanation: `Wrap risky operations in try block. Use separate except blocks for ZeroDivisionError and ValueError. Print specific error messages for each exception type, allowing the program to recover from errors.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 183 if it exists
    await problemsCollection.deleteOne({ problem_id: 183 });
    await testCasesCollection.deleteMany({ problem_id: 183 });

    // Insert problem 183
    const problemResult = await problemsCollection.insertOne(problem183);
    console.log('Problem 183 inserted');

    // Test cases for Problem 183
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1831,
        problem_id: 183,
        input: '100\n0',
        expected_output: 'Division by zero: Adjusting time.',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1832,
        problem_id: 183,
        input: '100\nabc',
        expected_output: 'Invalid input: Time must be a number.',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1833,
        problem_id: 183,
        input: '100\n5',
        expected_output: 'Velocity: 20.0',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1834,
        problem_id: 183,
        input: '200\n0',
        expected_output: 'Division by zero: Adjusting time.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1835,
        problem_id: 183,
        input: '150\nxyz',
        expected_output: 'Invalid input: Time must be a number.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1836,
        problem_id: 183,
        input: '80\n4',
        expected_output: 'Velocity: 20.0',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1837,
        problem_id: 183,
        input: '120\n6',
        expected_output: 'Velocity: 20.0',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 183`);

    console.log('\n✅ Problem 183 (Level 4, Session 1, Case 2: Basic Try-Except) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem183()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
