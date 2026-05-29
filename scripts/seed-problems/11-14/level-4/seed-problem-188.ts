import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem188() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 188: Level 4, Session 2, Case 1 - Basic Try-Except – Shield Against Crashes
    const problem188 = {
      problem_id: 188,
      session_id: 35, // Level 4, Session 2
      title: 'Basic Try-Except – Shield Against Crashes',
      description: 'Learn to protect your program from crashes using basic try-except blocks to handle division by zero errors.',
      difficulty: 'Easy',
      question: `Your space control panel needs to divide data into packets. Can you create a system that asks for the number of packets, divides 100 units of data by that number, and handles division by zero errors gracefully using try-except?`,      sample_input: '0',
      sample_output: 'Error: Cannot divide by zero!',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['try-except', 'ZeroDivisionError', 'basic exception handling', 'input validation'],
        estimated_time_minutes: 10
      },

      // Session-level content
      session_title: 'Session 2: Exception Handling with Advanced Try-Except Blocks',

      // Case-specific content
      case_number: 1,
      case_title: 'Basic Try-Except – Shield Against Crashes',
      case_overview: `Imagine your code is like a space control panel. Use try-except blocks as shields to catch problems like division by zero and show friendly error messages instead of crashing the system.`,
      case_explanation: `Use a try block to attempt dividing 100 by user input. Catch ZeroDivisionError in an except block and print an error message. If successful, print the result.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 188 if it exists
    await problemsCollection.deleteOne({ problem_id: 188 });
    await testCasesCollection.deleteMany({ problem_id: 188 });

    // Insert problem 188
    const problemResult = await problemsCollection.insertOne(problem188);
    console.log('Problem 188 inserted');

    // Test cases for Problem 188
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1881,
        problem_id: 188,
        input: '0',
        expected_output: 'Error: Cannot divide by zero!',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1882,
        problem_id: 188,
        input: '5',
        expected_output: 'Each packet contains 20.0 units of data.',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1883,
        problem_id: 188,
        input: '10',
        expected_output: 'Each packet contains 10.0 units of data.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1884,
        problem_id: 188,
        input: '0',
        expected_output: 'Error: Cannot divide by zero!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1885,
        problem_id: 188,
        input: '4',
        expected_output: 'Each packet contains 25.0 units of data.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1886,
        problem_id: 188,
        input: '20',
        expected_output: 'Each packet contains 5.0 units of data.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1887,
        problem_id: 188,
        input: '0',
        expected_output: 'Error: Cannot divide by zero!',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 188`);

    console.log('\n✅ Problem 188 (Level 4, Session 2, Case 1: Basic Try-Except) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem188()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
