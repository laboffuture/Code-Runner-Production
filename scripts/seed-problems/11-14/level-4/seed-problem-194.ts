import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem194() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 194: Level 4, Session 3, Case 1 - Ensuring Critical Operations with Finally
    const problem194 = {
      problem_id: 194,
      session_id: 36, // Level 4, Session 3
      title: 'Ensuring Critical Operations with Finally',
      description: 'Learn to guarantee that critical cleanup operations always execute using the finally block, even when errors occur.',
      difficulty: 'Easy',
      question: `Create a launch system simulation that accepts a fuel divisor value and calculates 100 divided by it. Use try-except-finally to handle ZeroDivisionError. If successful, print the calculation result. If division by zero occurs, print an error message. Always print "Fuel valves closed" in the finally block regardless of success or failure.`,      sample_input: '0',
      sample_output: 'Initiating launch sequence...\nError: Division by zero during calculations.\nFuel valves closed',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['finally block', 'guaranteed execution', 'cleanup operations', 'try-except-finally', 'safe shutdown'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 3: Finally Block and User-Defined Exceptions',

      // Case-specific content
      case_number: 1,
      case_title: 'Ensuring Critical Operations with Finally',
      case_overview: `The finally block ensures critical operations like closing connections or saving data always run, even if errors occur. Essential for spacecraft systems to finish important tasks before shutting down.`,
      case_explanation: `Use try-except-finally structure. Trigger a ZeroDivisionError in try block, catch it in except, and use finally to always print "Fuel valves closed" regardless of the error.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 194 if it exists
    await problemsCollection.deleteOne({ problem_id: 194 });
    await testCasesCollection.deleteMany({ problem_id: 194 });

    // Insert problem 194
    const problemResult = await problemsCollection.insertOne(problem194);
    console.log('Problem 194 inserted');

    // Test cases for Problem 194
    const testCases = [
      // Visible test case
      {
        test_case_id: 1941,
        problem_id: 194,
        input: '0',
        expected_output: 'Initiating launch sequence...\nError: Division by zero during calculations.\nFuel valves closed',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1942,
        problem_id: 194,
        input: '10',
        expected_output: 'Initiating launch sequence...\nCalculation result: 10.0\nFuel valves closed',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1943,
        problem_id: 194,
        input: '5',
        expected_output: 'Initiating launch sequence...\nCalculation result: 20.0\nFuel valves closed',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1944,
        problem_id: 194,
        input: '0',
        expected_output: 'Initiating launch sequence...\nError: Division by zero during calculations.\nFuel valves closed',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1945,
        problem_id: 194,
        input: '20',
        expected_output: 'Initiating launch sequence...\nCalculation result: 5.0\nFuel valves closed',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1946,
        problem_id: 194,
        input: '4',
        expected_output: 'Initiating launch sequence...\nCalculation result: 25.0\nFuel valves closed',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1947,
        problem_id: 194,
        input: '0',
        expected_output: 'Initiating launch sequence...\nError: Division by zero during calculations.\nFuel valves closed',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 194`);

    console.log('\n✅ Problem 194 (Level 4, Session 3, Case 1: Finally Block) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem194()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
