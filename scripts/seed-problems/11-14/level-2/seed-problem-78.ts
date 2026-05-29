import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem78() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 78: Level 2, Session 3, Case 6 - Galactic Archives
    const problem78 = {
      problem_id: 78,
      session_id: 14, // Level 2, Session 3
      title: 'Galactic Archives',
      description: `Interference floods NOVA-12's consoles! Critical telemetry data is scattered and the crew must quickly organize subsystem information into structured dictionary records.

Create the Galactic Archives system that structures mission telemetry with functions and default parameters.`,
      difficulty: 'Medium',
      question: `Create a mission planner. Take two inputs: distance and crew_count. Calculate fuel needed as distance × 5. Check if crew_count is at least 3. If crew is sufficient, print "Mission approved! Fuel needed: X units". If crew is insufficient, print "Mission denied! Insufficient crew".`,      sample_input: '100\n4',
      sample_output: 'Mission approved! Fuel needed: 500 units',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 3,
      max_score: 150,

      metadata: {
        space_theme: true,
        story_linked: true,
        is_final_task: true,
        is_capstone: true,
        concepts: ['dictionaries', 'functions', 'parameters', 'return values', 'default parameters', 'CRUD operations'],
        estimated_time_minutes: 25
      },
      // Session-level content
      session_title: 'Session 3: Dictionary (Syntax & Basic Operations)',

      // Case-specific content
      case_number: 6,
      case_title: 'Galactic Archives',
      case_explanation: `Read distance and crew_count as integers. Calculate fuel = distance * 5. Use if-else: if crew_count >= 3 print approval message with fuel, else print denial message.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 78 if it exists
    await problemsCollection.deleteOne({ problem_id: 78 });
    await testCasesCollection.deleteMany({ problem_id: 78 });

    // Insert problem 78
    const problemResult = await problemsCollection.insertOne(problem78);
    console.log('Problem 78 inserted');

    // Test cases for Problem 78 (7 test cases: 2 visible + 5 hidden)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 781,
        problem_id: 78,
        input: '100\n4',
        expected_output: 'Mission approved! Fuel needed: 500 units',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 782,
        problem_id: 78,
        input: '200\n2',
        expected_output: 'Mission denied! Insufficient crew',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 783,
        problem_id: 78,
        input: '150\n3',
        expected_output: 'Mission approved! Fuel needed: 750 units',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 784,
        problem_id: 78,
        input: '300\n1',
        expected_output: 'Mission denied! Insufficient crew',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 785,
        problem_id: 78,
        input: '500\n5',
        expected_output: 'Mission approved! Fuel needed: 2500 units',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 786,
        problem_id: 78,
        input: '250\n10',
        expected_output: 'Mission approved! Fuel needed: 1250 units',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 787,
        problem_id: 78,
        input: '1000\n0',
        expected_output: 'Mission denied! Insufficient crew',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 78`);

    console.log('\n✅ Problem 78 (Level 2, Session 3, Case 6: Space Mission Planner) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem78()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
