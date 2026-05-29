import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem191() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 191: Level 4, Session 2, Case 4 - Try-Except-Finally – Always Execute Cleanup
    const problem191 = {
      problem_id: 191,
      session_id: 35, // Level 4, Session 2
      title: 'Try-Except-Finally – Always Execute Cleanup',
      description: 'Learn to use the finally clause to ensure cleanup code always runs, regardless of whether an error occurred.',
      difficulty: 'Medium',
      question: `Create a sample storage system that accepts chamber temperature. Use try-except to handle ValueError, and use finally to always print "Closing storage chamber." whether an error occurs or not.`,      sample_input: '25',
      sample_output: 'Storing sample at 25 °C\nClosing storage chamber.',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['try-except-finally', 'ValueError', 'cleanup operations', 'resource management'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 2: Exception Handling with Advanced Try-Except Blocks',

      // Case-specific content
      case_number: 4,
      case_title: 'Try-Except-Finally – Always Execute Cleanup',
      case_overview: `The finally clause ensures critical cleanup tasks always execute, like closing files or shutting down systems. It runs whether errors occur or not—your code's way of always finishing what it starts.`,
      case_explanation: `Use try to convert input and print storage message. Catch ValueError for invalid input. Use finally to always print chamber closing message, demonstrating guaranteed cleanup.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 191 if it exists
    await problemsCollection.deleteOne({ problem_id: 191 });
    await testCasesCollection.deleteMany({ problem_id: 191 });

    // Insert problem 191
    const problemResult = await problemsCollection.insertOne(problem191);
    console.log('Problem 191 inserted');

    // Test cases for Problem 191
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1911,
        problem_id: 191,
        input: '25',
        expected_output: 'Storing sample at 25 °C\nClosing storage chamber.',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1912,
        problem_id: 191,
        input: 'invalid',
        expected_output: 'Temperature data invalid!\nClosing storage chamber.',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1913,
        problem_id: 191,
        input: '-20',
        expected_output: 'Storing sample at -20 °C\nClosing storage chamber.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1914,
        problem_id: 191,
        input: 'error',
        expected_output: 'Temperature data invalid!\nClosing storage chamber.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1915,
        problem_id: 191,
        input: '100',
        expected_output: 'Storing sample at 100 °C\nClosing storage chamber.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1916,
        problem_id: 191,
        input: '0',
        expected_output: 'Storing sample at 0 °C\nClosing storage chamber.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1917,
        problem_id: 191,
        input: 'abc',
        expected_output: 'Temperature data invalid!\nClosing storage chamber.',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 191`);

    console.log('\n✅ Problem 191 (Level 4, Session 2, Case 4: Try-Except-Finally) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem191()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
