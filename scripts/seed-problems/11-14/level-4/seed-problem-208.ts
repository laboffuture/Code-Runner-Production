import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem208() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 208: Level 4, Session 5, Case 3 - Reading Recovery Data from Mission Logs
    const problem208 = {
      problem_id: 208,
      session_id: 38, // Level 4, Session 5
      title: 'Reading Recovery Data from Mission Logs',
      description: 'Learn to retrieve and display mission data by reading files line-by-line for analysis and review.',
      difficulty: 'Easy',
      question: `Read 3 log entries from input (one per line). Create "mission_log.txt" and write these entries with newlines. Then read the file back line by line and print each line using strip() to remove extra whitespace.`,
      sample_input: 'PREP CHECKED\nIGNITION STARTED\nLAUNCHED',
      sample_output: 'PREP CHECKED\nIGNITION STARTED\nLAUNCHED\n',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['read mode', 'line-by-line reading', 'strip()', 'data retrieval', 'log analysis'],
        estimated_time_minutes: 10
      },

      // Session-level content
      session_title: 'Session 5: File Handling',

      // Case-specific content
      case_number: 3,
      case_title: 'Reading Recovery Data from Mission Logs',
      case_overview: `Cadets will retrieve data from mission logs by reading files line-by-line. This helps them understand how to review previous operations, search for errors, or generate summaries. The read mode is essential for post-mission analysis and recovering information from log files after communication losses or system reboots.`,
      case_explanation: `Use "r" mode to open a file for reading. Loop through the file line by line and use strip() to remove extra whitespace. This helps visualize complete mission history and is crucial for analyzing what happened during spacecraft operations.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 208 if it exists
    await problemsCollection.deleteOne({ problem_id: 208 });
    await testCasesCollection.deleteMany({ problem_id: 208 });

    // Insert problem 208
    const problemResult = await problemsCollection.insertOne(problem208);
    console.log('Problem 208 inserted');

    // Test cases for Problem 208
    const testCases = [
      {
        test_case_id: 2081,
        problem_id: 208,
        input: 'PREP CHECKED\nIGNITION STARTED\nLAUNCHED',
        expected_output: 'PREP CHECKED\nIGNITION STARTED\nLAUNCHED\n',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2082,
        problem_id: 208,
        input: 'SYSTEMS ONLINE\nCREW READY\nLIFTOFF COMPLETE',
        expected_output: 'SYSTEMS ONLINE\nCREW READY\nLIFTOFF COMPLETE\n',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 208`);

    console.log('\n✅ Problem 208 (Level 4, Session 5, Case 3: Reading Recovery Data) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem208()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
