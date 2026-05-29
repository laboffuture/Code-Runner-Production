import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem197() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 197: Level 4, Session 3, Case 4 - Multi-Layer Exception Handling
    const problem197 = {
      problem_id: 197,
      session_id: 36, // Level 4, Session 3
      title: 'Multi-Layer Exception Handling',
      description: 'Learn to handle different types of failures with layered exception blocks for proper error diagnosis.',
      difficulty: 'Medium',
      question: `Create a two-layer failure system. If system_status is "power_loss", raise ValueError("Power system failure!"). Handle ValueError with message "Mission Alert: Power system failure!" and general Exception with "Generic Failure occurred". Always print "Log transmission complete" in finally block.`,      sample_input: 'power_loss',
      sample_output: 'Mission Alert: Power system failure!\nLog transmission complete',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['multiple except blocks', 'error hierarchy', 'ValueError', 'finally', 'logging'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 3: Finally Block and User-Defined Exceptions',

      // Case-specific content
      case_number: 4,
      case_title: 'Multi-Layer Exception Handling',
      case_overview: `Handle different types of failures with layered exception blocks—ensuring each type of error triggers the correct response action in a space system.`,
      case_explanation: `Use try-except-finally with multiple except blocks. Raise ValueError for power_loss. First except handles ValueError, second handles general Exception. Finally ensures logging always occurs.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 197 if it exists
    await problemsCollection.deleteOne({ problem_id: 197 });
    await testCasesCollection.deleteMany({ problem_id: 197 });

    // Insert problem 197
    const problemResult = await problemsCollection.insertOne(problem197);
    console.log('Problem 197 inserted');

    // Test cases for Problem 197
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1971,
        problem_id: 197,
        input: 'power_loss',
        expected_output: 'Mission Alert: Power system failure!\nLog transmission complete',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1972,
        problem_id: 197,
        input: 'normal',
        expected_output: 'Systems operational\nLog transmission complete',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1973,
        problem_id: 197,
        input: 'power_loss',
        expected_output: 'Mission Alert: Power system failure!\nLog transmission complete',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1974,
        problem_id: 197,
        input: 'normal',
        expected_output: 'Systems operational\nLog transmission complete',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1975,
        problem_id: 197,
        input: 'power_loss',
        expected_output: 'Mission Alert: Power system failure!\nLog transmission complete',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1976,
        problem_id: 197,
        input: 'normal',
        expected_output: 'Systems operational\nLog transmission complete',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1977,
        problem_id: 197,
        input: 'power_loss',
        expected_output: 'Mission Alert: Power system failure!\nLog transmission complete',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 197`);

    console.log('\n✅ Problem 197 (Level 4, Session 3, Case 4: Multi-Layer Exceptions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem197()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
