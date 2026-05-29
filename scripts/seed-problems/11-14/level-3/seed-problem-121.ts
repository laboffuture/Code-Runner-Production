import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem121() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 121: Level 3, Session 1, Case 1 - Understanding and Using Python Modules
    const problem121 = {
      problem_id: 121,
      session_id: 23, // Level 3, Session 1
      title: 'Understanding and Using Python Modules',
      description: 'Learn to use Python\'s built-in math module to perform trigonometric calculations.',
      difficulty: 'Easy',
      question: `A spacecraft has traveled a certain distance at a specific angle from its starting point. Can you calculate how far horizontally the spacecraft has moved using Python's math module?`,      sample_input: '1000\n45',
      sample_output: '707.11',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['modules', 'import', 'math module', 'trigonometry', 'math.radians()', 'math.cos()'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 1: Python Modules',

      // Case-specific content
      case_number: 1,
      case_title: 'Understanding and Using Python Modules',
      case_overview: `Python modules help divide programs into smaller, manageable pieces. Explore built-in modules for navigation and control tasks.`,
      case_explanation: `Import the math module. Use math.cos(math.radians(angle)) to calculate horizontal displacement from distance and angle. Round the result to 2 decimal places.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 121 - 7 test cases (2 visible + 5 hidden)
    // All outputs rounded to 2 decimal places for consistency
    const testCases121 = [
      {
        test_case_id: 1211,
        problem_id: 121,
        input: '1000\n45',
        expected_output: '707.11',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1212,
        problem_id: 121,
        input: '500\n30',
        expected_output: '433.01',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1213,
        problem_id: 121,
        input: '2000\n60',
        expected_output: '1000.0',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1214,
        problem_id: 121,
        input: '1500\n0',
        expected_output: '1500.0',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1215,
        problem_id: 121,
        input: '800\n90',
        expected_output: '0.0',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1216,
        problem_id: 121,
        input: '1200\n15',
        expected_output: '1159.11',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1217,
        problem_id: 121,
        input: '3000\n75',
        expected_output: '776.46',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 121 });
    await problemsCollection.insertOne(problem121);
    console.log('Problem 121 inserted');

    await testCasesCollection.deleteMany({ problem_id: 121 });
    await testCasesCollection.insertMany(testCases121);
    console.log(`${testCases121.length} test cases inserted for Problem 121`);

    console.log('\n✅ Problem 121 (Level 3, Session 1, Case 1: Understanding and Using Python Modules) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem121()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
