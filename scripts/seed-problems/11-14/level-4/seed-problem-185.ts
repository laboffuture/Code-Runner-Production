import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem185() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 185: Level 4, Session 1, Case 4 - Understanding Exception Class Hierarchy
    const problem185 = {
      problem_id: 185,
      session_id: 34, // Level 4, Session 1
      title: 'Understanding Exception Class Hierarchy',
      description: 'Explore the exception class hierarchy and use base Exception class for generalized error handling.',
      difficulty: 'Medium',
      question: `Can you catch any exception and print its type? Take two inputs (dividend and divisor), perform division, and catch any exception using the base Exception class. Print the result if successful. If an error occurs, print "Error:" followed by the error message on one line, then "Error Type:" followed by the exception class type on the next line.`,      sample_input: '10\n0',
      sample_output: 'Error: float division by zero\nError Type: <class \'ZeroDivisionError\'>',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['exception handling', 'exception hierarchy', 'base Exception class', 'type()', 'error debugging'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 1: Error Detection and Exception Resolution',

      // Case-specific content
      case_number: 4,
      case_title: 'Understanding Exception Class Hierarchy',
      case_overview: `All exceptions in Python inherit from the Exception class. Understanding this hierarchy allows for generalized error handling or specific responses to particular error categories.`,
      case_explanation: `Use Exception in except block to catch any exception type. Use type() function to identify exception class for debugging. This provides flexibility in handling unexpected errors.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 185 if it exists
    await problemsCollection.deleteOne({ problem_id: 185 });
    await testCasesCollection.deleteMany({ problem_id: 185 });

    // Insert problem 185
    const problemResult = await problemsCollection.insertOne(problem185);
    console.log('Problem 185 inserted');

    // Test cases for Problem 185
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1851,
        problem_id: 185,
        input: '10\n0',
        expected_output: 'Error: float division by zero\nError Type: <class \'ZeroDivisionError\'>',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1852,
        problem_id: 185,
        input: '100\n5',
        expected_output: 'Result: 20.0',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1853,
        problem_id: 185,
        input: '50\n0',
        expected_output: 'Error: float division by zero\nError Type: <class \'ZeroDivisionError\'>',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1854,
        problem_id: 185,
        input: '200\n10',
        expected_output: 'Result: 20.0',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1855,
        problem_id: 185,
        input: '80\n4',
        expected_output: 'Result: 20.0',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1856,
        problem_id: 185,
        input: '150\n0',
        expected_output: 'Error: float division by zero\nError Type: <class \'ZeroDivisionError\'>',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1857,
        problem_id: 185,
        input: '120\n6',
        expected_output: 'Result: 20.0',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 185`);

    console.log('\n✅ Problem 185 (Level 4, Session 1, Case 4: Exception Hierarchy) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem185()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
