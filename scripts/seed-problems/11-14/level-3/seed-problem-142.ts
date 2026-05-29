import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem142() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 142: Level 3, Session 4, Case 4 - Updating Object Information
    const problem142 = {
      problem_id: 142,
      session_id: 26, // Level 3, Session 4
      title: 'Updating Object Information',
      description: 'Objects can manage and change their own state through custom methods, allowing information to be updated while the program runs.',
      difficulty: 'Easy',
      question: `Can you create a Computer class with brand and status attributes, and an update_status method to change and display the status?`,      sample_input: 'Lenovo\nOffline\nOnline',
      sample_output: 'Lenovo computer is now: Online',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'state management', 'updating attributes', 'object methods', 'dynamic changes'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 4: Using Classes and Objects in Python',

      // Case-specific content
      case_number: 4,
      case_title: 'Updating Object Information',
      case_overview: `Objects manage and change their own state through methods, enabling dynamic updates during program execution.`,
      case_explanation: `Create Computer class with __init__(brand, status). Add update_status(new_status) to change and print updated status.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 142 - 7 test cases (2 visible + 5 hidden)
    const testCases142 = [
      {
        test_case_id: 1421,
        problem_id: 142,
        input: 'Lenovo\nOffline\nOnline',
        expected_output: 'Lenovo computer is now: Online',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1422,
        problem_id: 142,
        input: 'Dell\nOnline\nOffline',
        expected_output: 'Dell computer is now: Offline',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1423,
        problem_id: 142,
        input: 'HP\nStandby\nActive',
        expected_output: 'HP computer is now: Active',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1424,
        problem_id: 142,
        input: 'Apple\nIdle\nRunning',
        expected_output: 'Apple computer is now: Running',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1425,
        problem_id: 142,
        input: 'Asus\nShutdown\nBooting',
        expected_output: 'Asus computer is now: Booting',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1426,
        problem_id: 142,
        input: 'Acer\nSleeping\nAwake',
        expected_output: 'Acer computer is now: Awake',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1427,
        problem_id: 142,
        input: 'Samsung\nMaintenance\nOperational',
        expected_output: 'Samsung computer is now: Operational',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 142 });
    await problemsCollection.insertOne(problem142);
    console.log('Problem 142 inserted');

    await testCasesCollection.deleteMany({ problem_id: 142 });
    await testCasesCollection.insertMany(testCases142);
    console.log(`${testCases142.length} test cases inserted for Problem 142`);

    console.log('\n✅ Problem 142 (Level 3, Session 4, Case 4: Updating Object Information) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem142()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
