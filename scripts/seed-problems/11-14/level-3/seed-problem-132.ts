import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem132() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 132: Level 3, Session 2, Case 6 - Celestial Calculations (FINAL TASK)
    const problem132 = {
      problem_id: 132,
      session_id: 24, // Level 3, Session 2
      title: 'Celestial Calculations – Enhancing Space Systems',
      description: 'Your space station analyzes star systems using advanced computational modules. Generate random star coordinates, calculate high-precision fuel requirements, and process radiation sensor data to ensure mission success and crew safety.',
      difficulty: 'Hard',
      question: `The space station needs analysis operations based on input type. Can you implement: star_distance (random coords 1-100, seed 42, Euclidean distance from origin, 2 decimals), fuel_calc (distance * 0.437, Decimal precision 10, output 3 decimals), and radiation_mean (mean of sensor values, 2 decimals)?`,      sample_input: 'star_distance',
      sample_output: '83.36',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['random module', 'math module', 'decimal module', 'statistics module', 'multiple imports', 'precision control'],
        estimated_time_minutes: 25
      },

      // Session-level content
      session_title: 'Session 2: Built-in Modules',

      // Case-specific content
      case_number: 6,
      case_title: 'Celestial Calculations – Enhancing Space Systems',
      case_explanation: `Use random.seed(42) and randint(1,100) for coordinates. Calculate distance with math.sqrt(x**2 + y**2). Set Decimal precision with getcontext().prec = 10. Use statistics.mean() for radiation averages.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 132 - 7 test cases (2 visible + 5 hidden)
    const testCases132 = [
      {
        test_case_id: 1321,
        problem_id: 132,
        input: 'star_distance',
        expected_output: '83.36',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1322,
        problem_id: 132,
        input: 'fuel_calc\n100',
        expected_output: '43.700',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1323,
        problem_id: 132,
        input: 'radiation_mean\n23,25,19,28,30',
        expected_output: '25.00',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1324,
        problem_id: 132,
        input: 'star_distance',
        expected_output: '83.36',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1325,
        problem_id: 132,
        input: 'fuel_calc\n250.5',
        expected_output: '109.469',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1326,
        problem_id: 132,
        input: 'radiation_mean\n15,20,18,22,25',
        expected_output: '20.00',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1327,
        problem_id: 132,
        input: 'fuel_calc\n75.8',
        expected_output: '33.125',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 132 });
    await problemsCollection.insertOne(problem132);
    console.log('Problem 132 inserted');

    await testCasesCollection.deleteMany({ problem_id: 132 });
    await testCasesCollection.insertMany(testCases132);
    console.log(`${testCases132.length} test cases inserted for Problem 132`);

    console.log('\n✅ Problem 132 (Level 3, Session 2, Case 6: Celestial Calculations) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem132()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
