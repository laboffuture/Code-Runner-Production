import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem190() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 190: Level 4, Session 2, Case 3 - Try-Except-Else – Success Check
    const problem190 = {
      problem_id: 190,
      session_id: 35, // Level 4, Session 2
      title: 'Try-Except-Else – Success Check',
      description: 'Learn to use the else clause with try-except to execute code only when no exceptions occur.',
      difficulty: 'Medium',
      question: `Create a signal verification system that accepts signal strength input. Use try-except to catch ValueError for invalid input. If input is valid, use else to print "Signal strength verified:" followed by the strength value.`,      sample_input: '75',
      sample_output: 'Processing signal...\nSignal strength verified: 75',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['try-except-else', 'ValueError', 'success validation', 'conditional execution'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 2: Exception Handling with Advanced Try-Except Blocks',

      // Case-specific content
      case_number: 3,
      case_title: 'Try-Except-Else – Success Check',
      case_overview: `Use the else clause to separate success messages from error handling. The else block runs only when no exceptions occur, keeping your code organized like mission control logs.`,
      case_explanation: `Use try to convert input to integer. If ValueError occurs, print error message. If no error, print "Processing signal..." and use else to verify the signal strength.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 190 if it exists
    await problemsCollection.deleteOne({ problem_id: 190 });
    await testCasesCollection.deleteMany({ problem_id: 190 });

    // Insert problem 190
    const problemResult = await problemsCollection.insertOne(problem190);
    console.log('Problem 190 inserted');

    // Test cases for Problem 190
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1901,
        problem_id: 190,
        input: '75',
        expected_output: 'Processing signal...\nSignal strength verified: 75',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1902,
        problem_id: 190,
        input: 'invalid',
        expected_output: 'Signal corrupted. Try again.',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1903,
        problem_id: 190,
        input: '100',
        expected_output: 'Processing signal...\nSignal strength verified: 100',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1904,
        problem_id: 190,
        input: 'error',
        expected_output: 'Signal corrupted. Try again.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1905,
        problem_id: 190,
        input: '50',
        expected_output: 'Processing signal...\nSignal strength verified: 50',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1906,
        problem_id: 190,
        input: '25',
        expected_output: 'Processing signal...\nSignal strength verified: 25',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1907,
        problem_id: 190,
        input: 'abc123',
        expected_output: 'Signal corrupted. Try again.',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 190`);

    console.log('\n✅ Problem 190 (Level 4, Session 2, Case 3: Try-Except-Else) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem190()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
