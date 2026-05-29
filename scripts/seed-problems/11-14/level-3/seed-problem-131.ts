import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem131() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 131: Level 3, Session 2, Case 5 - Statistics module
    const problem131 = {
      problem_id: 131,
      session_id: 24, // Level 3, Session 2
      title: 'Statistics module',
      description: 'The statistics module analyzes numerical data to find patterns like mean, median, and mode—essential for making data-driven decisions.',
      difficulty: 'Easy',
      question: `The environmental control system monitors temperature readings from multiple sensors across the spacecraft. Given comma-separated temperature values, can you calculate the median to determine the stable operating temperature?`,      sample_input: '5,3,8,9,2',
      sample_output: '5',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['statistics module', 'median', 'data analysis', 'list processing'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 2: Built-in Modules',

      // Case-specific content
      case_number: 5,
      case_title: 'Statistics module',
      case_overview: `The statistics module performs statistical calculations like mean, median, and mode to analyze numerical data patterns.`,
      case_explanation: `Import statistics, split the input by comma, convert to integers, then use statistics.median() to find and print the middle value.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 131 - 7 test cases (2 visible + 5 hidden)
    const testCases131 = [
      {
        test_case_id: 1311,
        problem_id: 131,
        input: '5,3,8,9,2',
        expected_output: '5',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1312,
        problem_id: 131,
        input: '10,20,30,40',
        expected_output: '25.0',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1313,
        problem_id: 131,
        input: '7,14,21,28,35',
        expected_output: '21',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1314,
        problem_id: 131,
        input: '100,200,150',
        expected_output: '150',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1315,
        problem_id: 131,
        input: '1,2,3,4,5,6,7',
        expected_output: '4',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1316,
        problem_id: 131,
        input: '50,60',
        expected_output: '55.0',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1317,
        problem_id: 131,
        input: '12,18,15,9,21,6',
        expected_output: '13.5',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 131 });
    await problemsCollection.insertOne(problem131);
    console.log('Problem 131 inserted');

    await testCasesCollection.deleteMany({ problem_id: 131 });
    await testCasesCollection.insertMany(testCases131);
    console.log(`${testCases131.length} test cases inserted for Problem 131`);

    console.log('\n✅ Problem 131 (Level 3, Session 2, Case 5: Statistics module) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem131()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
