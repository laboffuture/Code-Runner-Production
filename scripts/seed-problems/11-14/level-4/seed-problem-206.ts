import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem206() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 206: Level 4, Session 5, Case 1 - Writing Mission Logs to Text Files
    const problem206 = {
      problem_id: 206,
      session_id: 38, // Level 4, Session 5
      title: 'Writing Mission Logs to Text Files',
      description: 'Learn to create files and write structured mission data using write mode for logging launch sequences.',
      difficulty: 'Easy',
      question: `Read 3 log entries from input (one per line). Write them to a file called "mission_log.txt" with each entry on a new line. Then read the file back and print its entire contents.`,
      sample_input: 'PREP CHECKED\nIGNITION STARTED\nLAUNCHED',
      sample_output: 'PREP CHECKED\nIGNITION STARTED\nLAUNCHED\n',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['write mode', 'file creation', 'open()', 'write()', 'mission logging', 'structured data'],
        estimated_time_minutes: 10
      },

      // Session-level content
      session_title: 'Session 5: File Handling',

      // Case-specific content
      case_number: 1,
      case_title: 'Writing Mission Logs to Text Files',
      case_overview: `Cadets will learn how to record mission events by writing structured data into a new text file. This technique is essential for logging launch sequences, system checks, and key milestones. By using write mode, they'll understand how files are created and how existing files are overwritten during mission initialization.`,
      case_explanation: `Use open() with "w" mode to create a new file or overwrite existing content. The write() method adds text data to the file. This is ideal for logging mission data during initialization. Remember to close the file or use the with statement for automatic closing.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 206 if it exists
    await problemsCollection.deleteOne({ problem_id: 206 });
    await testCasesCollection.deleteMany({ problem_id: 206 });

    // Insert problem 206
    const problemResult = await problemsCollection.insertOne(problem206);
    console.log('Problem 206 inserted');

    // Test cases for Problem 206
    const testCases = [
      {
        test_case_id: 2061,
        problem_id: 206,
        input: 'PREP CHECKED\nIGNITION STARTED\nLAUNCHED',
        expected_output: 'PREP CHECKED\nIGNITION STARTED\nLAUNCHED\n',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2062,
        problem_id: 206,
        input: 'SYSTEMS ONLINE\nCOURSE PLOTTED\nENGINES READY',
        expected_output: 'SYSTEMS ONLINE\nCOURSE PLOTTED\nENGINES READY\n',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 206`);

    console.log('\n✅ Problem 206 (Level 4, Session 5, Case 1: Writing Mission Logs) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem206()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
