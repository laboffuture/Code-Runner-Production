import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem124() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 124: Level 3, Session 1, Case 4 - Exploring Built-in Utility Modules
    const problem124 = {
      problem_id: 124,
      session_id: 23, // Level 3, Session 1
      title: 'Exploring Built-in Utility Modules',
      description: 'Use Python\'s datetime and random modules to track mission time and simulate unpredictable space events.',
      difficulty: 'Medium',
      question: `A deep-space probe sends a mission date and power system parameters. Can you parse the date to extract the year, month, and day, then simulate a power reading to predict system performance?`,      sample_input: '2024-03-15\n50\n100',
      sample_output: '2024\n3\n15\n80',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['datetime module', 'random module', 'date parsing', 'random.randint', 'string splitting'],
        estimated_time_minutes: 20
      },

      // Session-level content
      session_title: 'Session 1: Python Modules',

      // Case-specific content
      case_number: 4,
      case_title: 'Exploring Built-in Utility Modules',
      case_overview: `Use Python's utility modules like datetime and random for timing and simulation tasks in space missions.`,
      case_explanation: `Parse date strings to extract year, month, day. Use random.randint() to simulate power readings within bounds.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 124 - 7 test cases (2 visible + 5 hidden)
    // Outputs based on random.seed(year) behavior
    const testCases124 = [
      {
        test_case_id: 1241,
        problem_id: 124,
        input: '2024-03-15\n50\n100',
        expected_output: '2024\n3\n15\n80',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1242,
        problem_id: 124,
        input: '2025-12-25\n60\n90',
        expected_output: '2025\n12\n25\n77',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1243,
        problem_id: 124,
        input: '2023-01-01\n70\n100',
        expected_output: '2023\n1\n1\n82',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1244,
        problem_id: 124,
        input: '2026-07-20\n40\n80',
        expected_output: '2026\n7\n20\n47',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1245,
        problem_id: 124,
        input: '2022-11-11\n85\n95',
        expected_output: '2022\n11\n11\n93',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1246,
        problem_id: 124,
        input: '2027-05-30\n10\n50',
        expected_output: '2027\n5\n30\n16',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1247,
        problem_id: 124,
        input: '2021-09-09\n55\n75',
        expected_output: '2021\n9\n9\n67',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 124 });
    await problemsCollection.insertOne(problem124);
    console.log('Problem 124 inserted');

    await testCasesCollection.deleteMany({ problem_id: 124 });
    await testCasesCollection.insertMany(testCases124);
    console.log(`${testCases124.length} test cases inserted for Problem 124`);

    console.log('\n✅ Problem 124 (Level 3, Session 1, Case 4: Exploring Built-in Utility Modules) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem124()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
