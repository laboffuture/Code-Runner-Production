import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem122() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 122: Level 3, Session 1, Case 2 - Different Ways to Import
    const problem122 = {
      problem_id: 122,
      session_id: 23, // Level 3, Session 1
      title: 'Different Ways to Import',
      description: 'Explore multiple methods of importing modules—like choosing the best antenna for a type of signal in space communications.',
      difficulty: 'Easy',
      question: `Mission Control has a list of possible destination planets and distance measurements in millions of kilometers. Can you randomly select one planet and calculate the average journey distance to plan the mission route?`,      sample_input: 'Mars,Venus,Jupiter,Saturn\n2,4,6,8',
      sample_output: 'Mars\n5',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['selective import', 'from import', 'module aliasing', 'random.choice', 'statistics.mean'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 1: Python Modules',

      // Case-specific content
      case_number: 2,
      case_title: 'Different Ways to Import',
      case_overview: `Explore multiple import methods—each with its own benefit. Different imports optimize code for different tasks.`,
      case_explanation: `Use 'from random import choice' for random selection and 'import statistics as stats' for calculations. Selective imports keep code clean.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 122 - 7 test cases (2 visible + 5 hidden)
    // Note: Python's statistics.mean() returns int for int inputs, float for float inputs
    // random.choice with seed(42) picks index based on list length
    const testCases122 = [
      {
        test_case_id: 1221,
        problem_id: 122,
        input: 'Mars,Venus,Jupiter,Saturn\n2,4,6,8',
        expected_output: 'Mars\n5',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1222,
        problem_id: 122,
        input: 'Mercury,Earth,Neptune\n10,20,30',
        expected_output: 'Mercury\n20',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1223,
        problem_id: 122,
        input: 'Alpha,Beta,Gamma,Delta,Epsilon\n15,25,35,45,55',
        expected_output: 'Alpha\n35',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1224,
        problem_id: 122,
        input: 'Pluto,Ceres\n100,200',
        expected_output: 'Pluto\n150',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1225,
        problem_id: 122,
        input: 'Titan,Europa,Ganymede,Callisto,Io,Enceladus\n5,10,15,20,25,30',
        expected_output: 'Titan\n17',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1226,
        problem_id: 122,
        input: 'Proxima,Sirius,Vega\n42,86,250',
        expected_output: 'Proxima\n126',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1227,
        problem_id: 122,
        input: 'Kepler-442b,Kepler-186f,Kepler-62e,Kepler-452b\n12,15,18,21',
        expected_output: 'Kepler-442b\n16',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 122 });
    await problemsCollection.insertOne(problem122);
    console.log('Problem 122 inserted');

    await testCasesCollection.deleteMany({ problem_id: 122 });
    await testCasesCollection.insertMany(testCases122);
    console.log(`${testCases122.length} test cases inserted for Problem 122`);

    console.log('\n✅ Problem 122 (Level 3, Session 1, Case 2: Different Ways to Import) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem122()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
