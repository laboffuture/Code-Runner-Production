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
      question: `Build a nested exception system that reacts to a sensor reading.

Read one integer: the sensor reading.

- Outer try: print "Main Engine Check".
  - Inner try: if the reading is greater than 50, raise RuntimeError("Sensor glitch detected"); otherwise print "Sensors nominal".
  - Inner except (RuntimeError): print "Inner Recovery: Sensor glitch detected", then raise Exception("Mission abort initiated").
- Outer except: print "Outer System Response: Mission abort initiated".
- Finally: always print "Mission Report Filed."

A high reading (greater than 50) triggers the full cascade; a safe reading (50 or less) does not.`,
      sample_input: '80',
      sample_output: 'Main Engine Check\nInner Recovery: Sensor glitch detected\nOuter System Response: Mission abort initiated\nMission Report Filed.',

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

    // Test cases use the sensor reading to drive two distinct paths (cascade vs nominal),
    // including the boundary at exactly 50, so the printed lines can only be produced by
    // actually reading the input and running the nested try/except (no hard-coding).
    const GLITCH = 'Main Engine Check\nInner Recovery: Sensor glitch detected\nOuter System Response: Mission abort initiated\nMission Report Filed.';
    const NOMINAL = 'Main Engine Check\nSensors nominal\nMission Report Filed.';
    const testCases = [
      // Visible test cases
      { test_case_id: 1981, problem_id: 198, input: '80', expected_output: GLITCH, is_hidden: false, weight: 14 },
      { test_case_id: 1982, problem_id: 198, input: '30', expected_output: NOMINAL, is_hidden: false, weight: 14 },
      // Hidden test cases
      { test_case_id: 1983, problem_id: 198, input: '51', expected_output: GLITCH, is_hidden: true, weight: 14 },  // just above boundary
      { test_case_id: 1984, problem_id: 198, input: '50', expected_output: NOMINAL, is_hidden: true, weight: 15 }, // exactly 50 -> nominal
      { test_case_id: 1985, problem_id: 198, input: '95', expected_output: GLITCH, is_hidden: true, weight: 14 },
      { test_case_id: 1986, problem_id: 198, input: '10', expected_output: NOMINAL, is_hidden: true, weight: 15 },
      { test_case_id: 1987, problem_id: 198, input: '70', expected_output: GLITCH, is_hidden: true, weight: 14 }
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
