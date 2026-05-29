import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem193() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 193: Level 4, Session 2, Case 6 - Cosmic Fault Resilience – Mastering Spacecraft System Stability
    const problem193 = {
      problem_id: 193,
      session_id: 35, // Level 4, Session 2
      title: 'Cosmic Fault Resilience – Mastering Spacecraft System Stability',
      description: 'Build a complete fault-resilient spacecraft system using all advanced exception handling techniques learned in this session.',
      difficulty: 'Hard',
      question: `Build a fault-resilient spacecraft system that handles multiple subsystem checks with comprehensive exception handling. Your program must validate atmospheric pressure readings, execute command calculations with error handling, log operations to a file, process mission status with guaranteed cleanup, and distribute space rations with safety checks. Handle ValueError for invalid inputs, ZeroDivisionError for division by zero, IndexError for invalid list access, and other errors appropriately. Ensure all systems shut down safely and distribution completes regardless of errors encountered.`,      sample_input: '75\n2\n5\n10\nOK\n100\n5',
      sample_output: 'Atmospheric pressure: 75\nCommand result: 0.4\nOperation result logged!\nStatus: OK\nSystems shutdown safely.\nRation per crew: 20.0 kg\nDistribution complete.',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['comprehensive exception handling', 'try-except', 'try-except-else-finally', 'nested exceptions', 'ValueError', 'ZeroDivisionError', 'IndexError', 'TypeError', 'file operations', 'multi-step validation'],
        estimated_time_minutes: 35
      },

      // Session-level content
      session_title: 'Session 2: Exception Handling with Advanced Try-Except Blocks',

      // Case-specific content
      case_number: 6,
      case_title: 'Cosmic Fault Resilience – Mastering Spacecraft System Stability',
      case_overview: `A comprehensive fault-resilient system that combines all exception handling techniques: multi-branch except clauses, try-except-else-finally, nested error handlers, and grouped exception handling. Build a resilience wrapper for spacecraft subsystem checks.`,
      case_explanation: `Implement 5 interconnected fault-handling systems: sensor input validation, multi-error command execution, nested file logging, status response with cleanup, and resource distribution with warnings. Each subsystem demonstrates different exception handling patterns working together.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 193 if it exists
    await problemsCollection.deleteOne({ problem_id: 193 });
    await testCasesCollection.deleteMany({ problem_id: 193 });

    // Insert problem 193
    const problemResult = await problemsCollection.insertOne(problem193);
    console.log('Problem 193 inserted');

    // Test cases for Problem 193 (7 test cases)
    const testCases = [
      // Visible test case
      {
        test_case_id: 1931,
        problem_id: 193,
        input: '75\n2\n5\n10\nOK\n100\n5',
        expected_output: 'Atmospheric pressure: 75\nCommand result: 0.4\nOperation result logged!\nStatus: OK\nSystems shutdown safely.\nRation per crew: 20.0 kg\nDistribution complete.',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1932,
        problem_id: 193,
        input: 'invalid\n1\n3\n9\nERROR\n50\n10',
        expected_output: 'Invalid sensor reading!\nCommand result: 0.333\nOperation result logged!\nStatus: ERROR\nSystems shutdown safely.\nRation per crew: 5.0 kg\nWarning: Low rations!\nDistribution complete.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1933,
        problem_id: 193,
        input: '100\n0\n2\n4\nOK\n80\n4',
        expected_output: 'Atmospheric pressure: 100\nCommand error occurred!\nOperation result logged!\nStatus: OK\nSystems shutdown safely.\nRation per crew: 20.0 kg\nDistribution complete.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1934,
        problem_id: 193,
        input: '50\n3\n0\n12\nINVALID\n100\n0',
        expected_output: 'Atmospheric pressure: 50\nCommand error occurred!\nOperation result logged!\nInvalid status input!\nSystems shutdown safely.\nCannot distribute to zero crew!\nDistribution complete.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1935,
        problem_id: 193,
        input: '90\n1\n4\n16\nOK\n30\n10',
        expected_output: 'Atmospheric pressure: 90\nCommand result: 0.25\nOperation result logged!\nStatus: OK\nSystems shutdown safely.\nRation per crew: 3.0 kg\nWarning: Low rations!\nDistribution complete.',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 1936,
        problem_id: 193,
        input: '120\n5\n10\n50\nERROR\n200\n8',
        expected_output: 'Atmospheric pressure: 120\nCommand error occurred!\nOperation result logged!\nStatus: ERROR\nSystems shutdown safely.\nRation per crew: 25.0 kg\nDistribution complete.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1937,
        problem_id: 193,
        input: 'abc\n2\n8\n16\nOK\n150\n6',
        expected_output: 'Invalid sensor reading!\nCommand result: 0.25\nOperation result logged!\nStatus: OK\nSystems shutdown safely.\nRation per crew: 25.0 kg\nDistribution complete.',
        is_hidden: true,
        weight: 15
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 193`);

    console.log('\n✅ Problem 193 (Level 4, Session 2, Case 6: Cosmic Fault Resilience) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem193()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
