import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem114() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 114: Level 2, Session 9, Case 6 - Mastering Inner Functions for Space Control
    const problem114 = {
      problem_id: 114,
      session_id: 20, // Level 2, Session 9
      title: 'Mastering Inner Functions for Space Control',
      description: `A severe power surge threatens NOVA-12's orbital stability! Only tightly coordinated subsystem routines executing in precise sequence can maintain control during the crisis.

Create the Mission Core orchestrator with nested helper functions (adjust thrusters, cool radiators) that work together through shared scope, returning a single callable controller to stabilize the ship.`,
      difficulty: 'Hard',
      question: `The orbital stabilization system needs coordinated inner routines sharing mission state. Write a program with nested functions that encapsulate helper operations, use scope management to share status between layers, and orchestrate multiple subsystem controls through a unified interface.`,      sample_input: 'Apollo',
      sample_output: 'Mission Ready for: Apollo\nStatus: Launched',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 3,
      max_score: 150,

      metadata: {
        space_theme: true,
        story_linked: true,
        is_final_task: true,
        is_capstone: true,
        concepts: [
          'nested functions',
          'local scope',
          'nonlocal keyword',
          'function encapsulation',
          'scope management',
          'integration'
        ],
        estimated_time_minutes: 25
      },
      // Session-level content
      session_title: 'Session 9: Nested User-Defined Functions & Function Scope',

      // Case-specific content
      case_number: 6,
      case_title: 'Mastering Inner Functions for Space Control',
      case_explanation: `Define outer function with nested inner functions. Use local scope for state variables. Use nonlocal to modify outer scope from inner functions.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 114 if it exists
    await problemsCollection.deleteOne({ problem_id: 114 });
    await testCasesCollection.deleteMany({ problem_id: 114 });

    // Insert problem 114
    const problemResult = await problemsCollection.insertOne(problem114);
    console.log('Problem 114 inserted');

    // Test cases for Problem 114 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1141,
        problem_id: 114,
        input: 'Apollo',
        expected_output: 'Mission Ready for: Apollo\nStatus: Launched',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1142,
        problem_id: 114,
        input: 'Artemis',
        expected_output: 'Mission Ready for: Artemis\nStatus: Launched',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1143,
        problem_id: 114,
        input: 'Voyager',
        expected_output: 'Mission Ready for: Voyager\nStatus: Launched',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1144,
        problem_id: 114,
        input: 'Mars2020',
        expected_output: 'Mission Ready for: Mars2020\nStatus: Launched',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1145,
        problem_id: 114,
        input: 'ISS',
        expected_output: 'Mission Ready for: ISS\nStatus: Launched',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1146,
        problem_id: 114,
        input: 'Hubble',
        expected_output: 'Mission Ready for: Hubble\nStatus: Launched',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1147,
        problem_id: 114,
        input: 'SpaceX',
        expected_output: 'Mission Ready for: SpaceX\nStatus: Launched',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 114`);

    console.log('\n✅ Problem 114 (Level 2, Session 9, Case 6: Mission Control Function Builder - Final Challenge) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem114()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
