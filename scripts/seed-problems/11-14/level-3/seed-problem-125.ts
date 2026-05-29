import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem125() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 125: Level 3, Session 1, Case 5 - Module Aliasing and Selective Imports in Missions
    const problem125 = {
      problem_id: 125,
      session_id: 23, // Level 3, Session 1
      title: 'Module Aliasing and Selective Imports in Missions',
      description: 'Optimize mission scripts using module aliasing and selective imports to shorten code and improve readability.',
      difficulty: 'Medium',
      question: `The engineering team has a base value, an exponent, and sensor measurements. Can you calculate the exponential power value and find the median of the measurements to optimize the energy distribution system?`,      sample_input: '5\n3\n120,135,150,160',
      sample_output: '125.00\n142.5',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['module aliasing', 'selective import', 'as keyword', 'math.pow', 'statistics.median'],
        estimated_time_minutes: 20
      },

      // Session-level content
      session_title: 'Session 1: Python Modules',

      // Case-specific content
      case_number: 5,
      case_title: 'Module Aliasing and Selective Imports in Missions',
      case_overview: `Use aliasing and selective imports to shorten code and reduce redundancy in mission scripts.`,
      case_explanation: `Import functions with aliases: 'from math import pow as p' and 'from statistics import median as md' for cleaner code.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 125 - 7 test cases (2 visible + 5 hidden)
    // Python's median() returns float type
    const testCases125 = [
      {
        test_case_id: 1251,
        problem_id: 125,
        input: '5\n3\n120,135,150,160',
        expected_output: '125.00\n142.5',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1252,
        problem_id: 125,
        input: '2\n8\n10,20,30,40,50',
        expected_output: '256.00\n30.0',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1253,
        problem_id: 125,
        input: '3\n4\n100,200,300',
        expected_output: '81.00\n200.0',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1254,
        problem_id: 125,
        input: '10\n2\n5,15,25,35,45',
        expected_output: '100.00\n25.0',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1255,
        problem_id: 125,
        input: '4\n5\n12,18,24,30,36,42',
        expected_output: '1024.00\n27.0',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1256,
        problem_id: 125,
        input: '7\n2\n50,100,150,200',
        expected_output: '49.00\n125.0',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1257,
        problem_id: 125,
        input: '6\n3\n88,92,96,100,104',
        expected_output: '216.00\n96.0',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 125 });
    await problemsCollection.insertOne(problem125);
    console.log('Problem 125 inserted');

    await testCasesCollection.deleteMany({ problem_id: 125 });
    await testCasesCollection.insertMany(testCases125);
    console.log(`${testCases125.length} test cases inserted for Problem 125`);

    console.log('\n✅ Problem 125 (Level 3, Session 1, Case 5: Module Aliasing and Selective Imports in Missions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem125()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
