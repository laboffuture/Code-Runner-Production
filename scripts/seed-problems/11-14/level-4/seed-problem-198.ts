import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem198() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 198: Level 4, Session 3, Case 5 - Nested Try Blocks for Cascading Failures
    const problem198 = {
      problem_id: 198,
      session_id: 36, // Level 4, Session 3
      title: 'Nested Try Blocks for Cascading Failures',
      description: 'Learn to handle failures inside failures using nested try-except blocks for multi-stage anomaly simulation.',
      difficulty: 'Medium',
      question: `Create a nested exception system. Outer try prints "Main Engine Check". Inner try raises RuntimeError("Sensor glitch detected"). Inner except catches it and prints "Inner Recovery: Sensor glitch detected", then raises Exception("Mission abort initiated"). Outer except catches it and prints "Outer System Response: Mission abort initiated". Finally always prints "Mission Report Filed."`,      sample_input: '',
      sample_output: 'Main Engine Check\nInner Recovery: Sensor glitch detected\nOuter System Response: Mission abort initiated\nMission Report Filed.\n',

      compiler_comment: `# Write your code here\n`,

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['nested try-except', 'cascading failures', 'RuntimeError', 'multi-level recovery', 'finally'],
        estimated_time_minutes: 18
      },

      // Session-level content
      session_title: 'Session 3: Finally Block and User-Defined Exceptions',

      // Case-specific content
      case_number: 5,
      case_title: 'Nested Try Blocks for Cascading Failures',
      case_overview: `Handle failures inside failures—where a recovery step might also break. Simulate multi-stage anomalies using nested try-except blocks for cascading error scenarios.`,
      case_explanation: `Outer try contains inner try. Inner try raises RuntimeError, caught by inner except which then raises another Exception. Outer except catches the second exception. Finally ensures report is always filed.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 198 if it exists
    await problemsCollection.deleteOne({ problem_id: 198 });
    await testCasesCollection.deleteMany({ problem_id: 198 });

    // Insert problem 198
    const problemResult = await problemsCollection.insertOne(problem198);
    console.log('Problem 198 inserted');

    // Test cases for Problem 198
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1981,
        problem_id: 198,
        input: '',
        expected_output: 'Main Engine Check\nInner Recovery: Sensor glitch detected\nOuter System Response: Mission abort initiated\nMission Report Filed.\n',
        is_hidden: false,
        weight: 14
      },
      {
        test_case_id: 1982,
        problem_id: 198,
        input: '',
        expected_output: 'Main Engine Check\nInner Recovery: Sensor glitch detected\nOuter System Response: Mission abort initiated\nMission Report Filed.\n',
        is_hidden: false,
        weight: 14
      },
      // Hidden test cases
      {
        test_case_id: 1983,
        problem_id: 198,
        input: '',
        expected_output: 'Main Engine Check\nInner Recovery: Sensor glitch detected\nOuter System Response: Mission abort initiated\nMission Report Filed.\n',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1984,
        problem_id: 198,
        input: '',
        expected_output: 'Main Engine Check\nInner Recovery: Sensor glitch detected\nOuter System Response: Mission abort initiated\nMission Report Filed.\n',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1985,
        problem_id: 198,
        input: '',
        expected_output: 'Main Engine Check\nInner Recovery: Sensor glitch detected\nOuter System Response: Mission abort initiated\nMission Report Filed.\n',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1986,
        problem_id: 198,
        input: '',
        expected_output: 'Main Engine Check\nInner Recovery: Sensor glitch detected\nOuter System Response: Mission abort initiated\nMission Report Filed.\n',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1987,
        problem_id: 198,
        input: '',
        expected_output: 'Main Engine Check\nInner Recovery: Sensor glitch detected\nOuter System Response: Mission abort initiated\nMission Report Filed.\n',
        is_hidden: true,
        weight: 14
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 198`);

    console.log('\n✅ Problem 198 (Level 4, Session 3, Case 5: Nested Try Blocks) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem198()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
