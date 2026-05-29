import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem134() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 134: Level 3, Session 3, Case 2 - Optimizing Calculations with Caching
    const problem134 = {
      problem_id: 134,
      session_id: 25, // Level 3, Session 3
      title: 'Optimizing Calculations with Caching',
      description: 'The functools module provides higher-order functions for functional programming, including caching decorators that store results of expensive computations.',
      difficulty: 'Medium',
      question: `Can you calculate orbital velocities using velocity = sqrt(distance * 1000 + distance ** 2) / 3.5 for comma-separated distances and output them rounded to 2 decimals, separated by spaces?`,      sample_input: '7000,8000,7000,9000,8000',
      sample_output: '2138.09 2424.37 2138.09 2710.52 2424.37',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['functools', 'lru_cache', 'decorators', 'optimization', 'caching'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 3: Functional Programming and Modular Data Handling',

      // Case-specific content
      case_number: 2,
      case_title: 'Optimizing Calculations with Caching',
      case_overview: `The functools.lru_cache decorator stores function results to avoid redundant calculations for repeated inputs.`,
      case_explanation: `Import functools and math. Define a function with @lru_cache decorator, then calculate sqrt(d * 1000 + d**2) / 3.5 for each input.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 134 - 7 test cases (2 visible + 5 hidden)
    // Formula: velocity = sqrt(distance * 1000 + distance ** 2) / 3.5
    const testCases134 = [
      {
        test_case_id: 1341,
        problem_id: 134,
        input: '7000,8000,7000,9000,8000',
        expected_output: '2138.09 2424.37 2138.09 2710.52 2424.37',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1342,
        problem_id: 134,
        input: '6000,6000,6000',
        expected_output: '1851.64 1851.64 1851.64',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1343,
        problem_id: 134,
        input: '5000,7000,5000,6000,7000',
        expected_output: '1564.92 2138.09 1564.92 1851.64 2138.09',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1344,
        problem_id: 134,
        input: '10000,12000,10000',
        expected_output: '2996.60 3568.57 2996.60',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1345,
        problem_id: 134,
        input: '8000,9000,8000,9000,8000',
        expected_output: '2424.37 2710.52 2424.37 2710.52 2424.37',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1346,
        problem_id: 134,
        input: '4000,5000,4000,6000,5000',
        expected_output: '1277.75 1564.92 1277.75 1851.64 1564.92',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1347,
        problem_id: 134,
        input: '15000,15000,20000',
        expected_output: '4426.27 4426.27 5855.40',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 134 });
    await problemsCollection.insertOne(problem134);
    console.log('Problem 134 inserted');

    await testCasesCollection.deleteMany({ problem_id: 134 });
    await testCasesCollection.insertMany(testCases134);
    console.log(`${testCases134.length} test cases inserted for Problem 134`);

    console.log('\n✅ Problem 134 (Level 3, Session 3, Case 2: Optimizing Calculations with Caching) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem134()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
