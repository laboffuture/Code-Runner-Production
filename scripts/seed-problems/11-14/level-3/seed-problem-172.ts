import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem172() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 172: Level 3, Session 9, Case 4 - Using super()
    const problem172 = {
      problem_id: 172,
      session_id: 31, // Level 3, Session 9
      title: 'Using super() to Access Parent Methods',
      description: 'Learn how to extend parent class behavior while keeping the original functionality intact.',
      difficulty: 'Medium',
      question: `Can you create an AdvancedCheck that extends SystemCheck's behavior using super() to call the parent method?`,      sample_input: 'Validator',
      sample_output: 'ExtendCheck: Running system diagnostics.\nExtendCheck: All systems functional.',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['super()', 'inheritance', 'method extension', 'parent method access', 'OOP', 'conditional logic', 'nested conditionals', 'modulo operator'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 9: Mastering Inheritance - Advanced',

      // Case-specific content
      case_number: 4,
      case_title: 'Using super() to Access Parent Methods',
      case_overview: `The super() function lets child classes extend parent behavior rather than replace it.`,
      case_explanation: `Build AdvancedCheck that extends SystemCheck using super() to call parent methods with conditional prefixes.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 172 if it exists
    await problemsCollection.deleteOne({ problem_id: 172 });
    await testCasesCollection.deleteMany({ problem_id: 172 });

    // Insert problem 172
    const problemResult = await problemsCollection.insertOne(problem172);
    console.log('Problem 172 inserted');

    // Test cases for Problem 172
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1721,
        problem_id: 172,
        input: 'Validator',
        expected_output: 'ExtendCheck: Running system diagnostics.\nExtendCheck: All systems functional.', // len=9, odd, >=7
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1722,
        problem_id: 172,
        input: 'Verifier',
        expected_output: 'SuperCheck: Running system diagnostics.\nSuperCheck: All systems functional.', // len=8, even, >=7
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1723,
        problem_id: 172,
        input: 'Check',
        expected_output: 'Scan: Running system diagnostics.\nScan: All systems functional.', // len=5, odd, <7
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1724,
        problem_id: 172,
        input: 'System',
        expected_output: 'Check: Running system diagnostics.\nCheck: All systems functional.', // len=6, even, <7
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1725,
        problem_id: 172,
        input: 'Test',
        expected_output: 'Check: Running system diagnostics.\nCheck: All systems functional.', // len=4, even, <7
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1726,
        problem_id: 172,
        input: 'Diagnostic',
        expected_output: 'SuperCheck: Running system diagnostics.\nSuperCheck: All systems functional.', // len=10, even, >=7
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1727,
        problem_id: 172,
        input: 'Scan',
        expected_output: 'Check: Running system diagnostics.\nCheck: All systems functional.', // len=4, even, <7
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 172`);

    console.log('\n✅ Problem 172 (Level 3, Session 9, Case 4: Using super()) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem172()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
