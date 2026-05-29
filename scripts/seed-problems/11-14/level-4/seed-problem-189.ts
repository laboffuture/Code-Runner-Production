import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem189() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 189: Level 4, Session 2, Case 2 - Multiple Exceptions – Handle More Than One Error
    const problem189 = {
      problem_id: 189,
      session_id: 35, // Level 4, Session 2
      title: 'Multiple Exceptions – Handle More Than One Error',
      description: 'Learn to handle different types of errors using multiple except blocks for more precise error handling.',
      difficulty: 'Easy',
      question: `Create a command decoder that accepts a command code, divides 50 by it, and handles both ValueError (invalid input like letters) and ZeroDivisionError (zero input) with specific error messages. For invalid input, display an error message about entering a number. For zero input, display that the command code cannot be zero. For successful division, display the result.`,      sample_input: '5',
      sample_output: 'Result: 10.0',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['multiple except blocks', 'ValueError', 'ZeroDivisionError', 'type conversion', 'input validation'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 2: Exception Handling with Advanced Try-Except Blocks',

      // Case-specific content
      case_number: 2,
      case_title: 'Multiple Exceptions – Handle More Than One Error',
      case_overview: `Different kinds of problems need different responses. Use multiple except blocks to give your code a guidebook: handle ValueError for invalid input and ZeroDivisionError for zero input separately.`,
      case_explanation: `Use try to convert input and divide 50 by it. Catch ValueError for non-numeric input and ZeroDivisionError for zero. Print appropriate messages for each error type.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 189 if it exists
    await problemsCollection.deleteOne({ problem_id: 189 });
    await testCasesCollection.deleteMany({ problem_id: 189 });

    // Insert problem 189
    const problemResult = await problemsCollection.insertOne(problem189);
    console.log('Problem 189 inserted');

    // Test cases for Problem 189
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1891,
        problem_id: 189,
        input: 'abc',
        expected_output: 'Invalid input! Please enter a number.',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1892,
        problem_id: 189,
        input: '5',
        expected_output: 'Result: 10.0',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1893,
        problem_id: 189,
        input: '10',
        expected_output: 'Result: 5.0',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1894,
        problem_id: 189,
        input: '0',
        expected_output: 'Command code cannot be zero.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1895,
        problem_id: 189,
        input: 'xyz',
        expected_output: 'Invalid input! Please enter a number.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1896,
        problem_id: 189,
        input: '25',
        expected_output: 'Result: 2.0',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1897,
        problem_id: 189,
        input: '2',
        expected_output: 'Result: 25.0',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 189`);

    console.log('\n✅ Problem 189 (Level 4, Session 2, Case 2: Multiple Exceptions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem189()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
