import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem186() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 186: Level 4, Session 1, Case 5 - Custom Exceptions
    const problem186 = {
      problem_id: 186,
      session_id: 34, // Level 4, Session 1
      title: 'Simulating Custom Exceptions',
      description: 'Define custom exceptions to simulate specific errors tailored to your application.',
      difficulty: 'Medium',
      question: `Can you create and handle a custom SensorFailure exception? Define a custom exception class called SensorFailure that inherits from Exception. Take input for sensor status (0 for fail, 1 for success). If status is 0, raise SensorFailure with message "Sensor malfunction detected!". Catch and print "Custom Error:" followed by the error message. If status is 1, print "Sensor operational.".`,      sample_input: '0',
      sample_output: 'Custom Error: Sensor malfunction detected!',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['exception handling', 'custom exceptions', 'class inheritance', 'raise statement', '__init__ method'],
        estimated_time_minutes: 18
      },

      // Session-level content
      session_title: 'Session 1: Error Detection and Exception Resolution',

      // Case-specific content
      case_number: 5,
      case_title: 'Simulating Custom Exceptions',
      case_overview: `Custom exceptions allow defining application-specific errors with meaningful messages. They provide better error communication for scenarios that built-in exceptions can't adequately cover.`,
      case_explanation: `Create SensorFailure class inheriting from Exception with __init__ method. Use raise to trigger custom exception. Handle it with try-except to provide clear, context-specific error messages.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 186 if it exists
    await problemsCollection.deleteOne({ problem_id: 186 });
    await testCasesCollection.deleteMany({ problem_id: 186 });

    // Insert problem 186
    const problemResult = await problemsCollection.insertOne(problem186);
    console.log('Problem 186 inserted');

    // Test cases for Problem 186
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1861,
        problem_id: 186,
        input: '0',
        expected_output: 'Custom Error: Sensor malfunction detected!',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1862,
        problem_id: 186,
        input: '1',
        expected_output: 'Sensor operational.',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1863,
        problem_id: 186,
        input: '0',
        expected_output: 'Custom Error: Sensor malfunction detected!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1864,
        problem_id: 186,
        input: '1',
        expected_output: 'Sensor operational.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1865,
        problem_id: 186,
        input: '0',
        expected_output: 'Custom Error: Sensor malfunction detected!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1866,
        problem_id: 186,
        input: '1',
        expected_output: 'Sensor operational.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1867,
        problem_id: 186,
        input: '0',
        expected_output: 'Custom Error: Sensor malfunction detected!',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 186`);

    console.log('\n✅ Problem 186 (Level 4, Session 1, Case 5: Custom Exceptions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem186()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
