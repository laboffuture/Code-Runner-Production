import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem130() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 130: Level 3, Session 2, Case 4 - os module
    const problem130 = {
      problem_id: 130,
      session_id: 24, // Level 3, Session 2
      title: 'os module',
      description: 'The os module connects programs to the computer\'s file system, enabling directory navigation and file organization tasks.',
      difficulty: 'Easy',
      question: `The spacecraft data analysis system receives file paths from various sensor logs stored across different directories. The system needs to extract just the directory path from complete file paths to organize data by location. Given a complete file path, can you extract the directory portion using path manipulation functions?`,      sample_input: '/home/station/logs/sensor_data.txt',
      sample_output: '/home/station/logs',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['os module', 'path manipulation', 'dirname', 'file paths'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 2: Built-in Modules',

      // Case-specific content
      case_number: 4,
      case_title: 'os module',
      case_overview: `The os module provides tools to interact with the operating system's file structure and navigate directories programmatically.`,
      case_explanation: `Import os, then use os.path.dirname() on the input path to extract and print the directory portion without the filename.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 130 - 7 test cases (2 visible + 5 hidden)
    const testCases130 = [
      {
        test_case_id: 1301,
        problem_id: 130,
        input: '/home/station/logs/sensor_data.txt',
        expected_output: '/home/station/logs',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1302,
        problem_id: 130,
        input: '/data/mission/reports/analysis.csv',
        expected_output: '/data/mission/reports',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1303,
        problem_id: 130,
        input: '/usr/local/bin/program.py',
        expected_output: '/usr/local/bin',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1304,
        problem_id: 130,
        input: '/var/telemetry/orbit/position.log',
        expected_output: '/var/telemetry/orbit',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1305,
        problem_id: 130,
        input: '/spacecraft/navigation/coordinates.dat',
        expected_output: '/spacecraft/navigation',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1306,
        problem_id: 130,
        input: '/tmp/cache/temp_file.tmp',
        expected_output: '/tmp/cache',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1307,
        problem_id: 130,
        input: '/opt/systems/backup/archive.zip',
        expected_output: '/opt/systems/backup',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 130 });
    await problemsCollection.insertOne(problem130);
    console.log('Problem 130 inserted');

    await testCasesCollection.deleteMany({ problem_id: 130 });
    await testCasesCollection.insertMany(testCases130);
    console.log(`${testCases130.length} test cases inserted for Problem 130`);

    console.log('\n✅ Problem 130 (Level 3, Session 2, Case 4: os module) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem130()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
