import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem226() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 226: Level 4, Session 8, Case 3 - Reading a File with Error Handling
    const problem226 = {
      problem_id: 226,
      session_id: 41, // Level 4, Session 8
      title: 'Reading a File with Error Handling',
      description: 'Learn to read files safely using try-except to handle FileNotFoundError gracefully.',
      difficulty: 'Easy',
      question: `Read a filename and content from input (2 lines). Create the file and write the content to it. Then attempt to read the file using try-except to handle FileNotFoundError. If the file exists, print "File Content: [content]". If the file doesn't exist, print "File not found. Please check the name."`,
      sample_input: 'mylog.txt\nName: John Doe - Subject: Python Programming',
      sample_output: 'File Content: Name: John Doe - Subject: Python Programming',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['r mode', 'FileNotFoundError', 'try-except', 'safe file reading', 'exception handling'],
        estimated_time_minutes: 10
      },

      // Session-level content
      session_title: 'Session 8: OS Module and File Handling with Exception Handling',

      // Case-specific content
      case_number: 3,
      case_title: 'Reading a File with Error Handling',
      case_overview: `When trying to open a file that doesn't exist, programs can crash. But using exception handling, we can tell the program to stay calm, show a friendly message, and move on without stopping everything. This makes your programs more reliable and user-friendly.`,
      case_explanation: `"r" mode tries to read the file. If the file doesn't exist, FileNotFoundError occurs. try-except allows us to show a custom message instead of crashing, making the program robust against missing files.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 226 if it exists
    await problemsCollection.deleteOne({ problem_id: 226 });
    await testCasesCollection.deleteMany({ problem_id: 226 });

    // Insert problem 226
    const problemResult = await problemsCollection.insertOne(problem226);
    console.log('Problem 226 inserted');

    // Test cases for Problem 226
    const testCases = [
      {
        test_case_id: 2261,
        problem_id: 226,
        input: 'mylog.txt\nName: John Doe - Subject: Python Programming',
        expected_output: 'File Content: Name: John Doe - Subject: Python Programming',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2262,
        problem_id: 226,
        input: 'report.txt\nMission Status: Complete - Crew: Safe',
        expected_output: 'File Content: Mission Status: Complete - Crew: Safe',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 226`);

    console.log('\n✅ Problem 226 (Level 4, Session 8, Case 3: Reading with Error Handling) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem226()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
