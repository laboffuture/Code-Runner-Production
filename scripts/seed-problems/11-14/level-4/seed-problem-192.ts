import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem192() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 192: Level 4, Session 2, Case 5 - Nested Try-Except – Complex Systems
    const problem192 = {
      problem_id: 192,
      session_id: 35, // Level 4, Session 2
      title: 'Nested Try-Except – Complex Systems',
      description: 'Learn to use nested try-except blocks to handle errors at multiple levels, such as decoding and logging operations.',
      difficulty: 'Medium',
      question: `Create a signal logging system with nested exception handling. The outer try should decode a signal code (convert to integer), and the inner try should write it to "log.txt". Handle ValueError for decoding failure and general exceptions for logging failure independently.`,      sample_input: '12345',
      sample_output: 'Signal logged successfully!',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['nested try-except', 'file operations', 'ValueError', 'multi-layer error handling', 'logging'],
        estimated_time_minutes: 18
      },

      // Session-level content
      session_title: 'Session 2: Exception Handling with Advanced Try-Except Blocks',

      // Case-specific content
      case_number: 5,
      case_title: 'Nested Try-Except – Complex Systems',
      case_overview: `In complex AI systems, failures can happen at multiple layers. Use nested try-except to guard each layer independently—handle decoding errors separately from logging errors.`,
      case_explanation: `Outer try converts signal to int and catches ValueError. Inner try opens and writes to log file, catching any file operation errors. Each layer has independent error handling.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 192 if it exists
    await problemsCollection.deleteOne({ problem_id: 192 });
    await testCasesCollection.deleteMany({ problem_id: 192 });

    // Insert problem 192
    const problemResult = await problemsCollection.insertOne(problem192);
    console.log('Problem 192 inserted');

    // Test cases for Problem 192
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1921,
        problem_id: 192,
        input: '12345',
        expected_output: 'Signal logged successfully!',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1922,
        problem_id: 192,
        input: 'invalid',
        expected_output: 'Signal decoding failed!',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1923,
        problem_id: 192,
        input: '99999',
        expected_output: 'Signal logged successfully!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1924,
        problem_id: 192,
        input: 'abc123',
        expected_output: 'Signal decoding failed!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1925,
        problem_id: 192,
        input: '54321',
        expected_output: 'Signal logged successfully!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1926,
        problem_id: 192,
        input: '777',
        expected_output: 'Signal logged successfully!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1927,
        problem_id: 192,
        input: 'error',
        expected_output: 'Signal decoding failed!',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 192`);

    console.log('\n✅ Problem 192 (Level 4, Session 2, Case 5: Nested Try-Except) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem192()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
