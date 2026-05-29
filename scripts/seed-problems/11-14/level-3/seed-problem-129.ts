import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem129() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 129: Level 3, Session 2, Case 3 - Datetime module
    const problem129 = {
      problem_id: 129,
      session_id: 24, // Level 3, Session 2
      title: 'Datetime module',
      description: 'The datetime module handles dates and times, helping track schedules, deadlines, and time-based mission data with precision.',
      difficulty: 'Easy',
      question: `Mission Control receives timestamps from various space stations in different formats. The system needs to standardize all dates for the central database. Given a date in DD-MM-YYYY format, can you convert it to the standard YYYY-MM-DD format required by the interstellar tracking system?`,      sample_input: '15-03-2024',
      sample_output: '2024-03-15',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['datetime module', 'date parsing', 'strptime', 'strftime', 'date formatting'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 2: Built-in Modules',

      // Case-specific content
      case_number: 3,
      case_title: 'Datetime module',
      case_overview: `The datetime module manages dates and times, enabling programs to parse, format, and calculate with temporal data.`,
      case_explanation: `Import datetime, use datetime.strptime() to parse the input with format '%d-%m-%Y', then use strftime('%Y-%m-%d') to output in the required format.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 129 - 7 test cases (2 visible + 5 hidden)
    const testCases129 = [
      {
        test_case_id: 1291,
        problem_id: 129,
        input: '15-03-2024',
        expected_output: '2024-03-15',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1292,
        problem_id: 129,
        input: '01-01-2025',
        expected_output: '2025-01-01',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1293,
        problem_id: 129,
        input: '25-12-2023',
        expected_output: '2023-12-25',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1294,
        problem_id: 129,
        input: '10-07-2026',
        expected_output: '2026-07-10',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1295,
        problem_id: 129,
        input: '31-08-2022',
        expected_output: '2022-08-31',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1296,
        problem_id: 129,
        input: '05-11-2027',
        expected_output: '2027-11-05',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1297,
        problem_id: 129,
        input: '20-02-2021',
        expected_output: '2021-02-20',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 129 });
    await problemsCollection.insertOne(problem129);
    console.log('Problem 129 inserted');

    await testCasesCollection.deleteMany({ problem_id: 129 });
    await testCasesCollection.insertMany(testCases129);
    console.log(`${testCases129.length} test cases inserted for Problem 129`);

    console.log('\n✅ Problem 129 (Level 3, Session 2, Case 3: Datetime module) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem129()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
