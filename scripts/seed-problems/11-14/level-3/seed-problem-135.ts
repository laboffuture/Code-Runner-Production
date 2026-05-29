import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem135() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 135: Level 3, Session 3, Case 3 - Signal Math with operator Module
    const problem135 = {
      problem_id: 135,
      session_id: 25, // Level 3, Session 3
      title: 'Signal Math with operator Module',
      description: 'The operator module provides functions for standard Python operators, enabling functional programming approaches to arithmetic and comparisons.',
      difficulty: 'Easy',
      question: `Can you read two integers and output their sum, product, and equality check (True/False) on separate lines?`,      sample_input: '12\n8',
      sample_output: '20\n96\nFalse',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['operator module', 'functional programming', 'operator.add', 'operator.mul', 'operator.eq'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 3: Functional Programming and Modular Data Handling',

      // Case-specific content
      case_number: 3,
      case_title: 'Signal Math with operator Module',
      case_overview: `The operator module provides function equivalents for arithmetic and comparison operations.`,
      case_explanation: `Import operator. Use operator.add(), operator.mul(), and operator.eq() instead of +, *, and == operators.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 135 - 7 test cases (2 visible + 5 hidden)
    const testCases135 = [
      {
        test_case_id: 1351,
        problem_id: 135,
        input: '12\n8',
        expected_output: '20\n96\nFalse',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1352,
        problem_id: 135,
        input: '5\n5',
        expected_output: '10\n25\nTrue',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1353,
        problem_id: 135,
        input: '15\n3',
        expected_output: '18\n45\nFalse',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1354,
        problem_id: 135,
        input: '7\n9',
        expected_output: '16\n63\nFalse',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1355,
        problem_id: 135,
        input: '100\n100',
        expected_output: '200\n10000\nTrue',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1356,
        problem_id: 135,
        input: '0\n25',
        expected_output: '25\n0\nFalse',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1357,
        problem_id: 135,
        input: '11\n4',
        expected_output: '15\n44\nFalse',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 135 });
    await problemsCollection.insertOne(problem135);
    console.log('Problem 135 inserted');

    await testCasesCollection.deleteMany({ problem_id: 135 });
    await testCasesCollection.insertMany(testCases135);
    console.log(`${testCases135.length} test cases inserted for Problem 135`);

    console.log('\n✅ Problem 135 (Level 3, Session 3, Case 3: Signal Math with operator Module) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem135()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
