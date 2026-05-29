import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem225() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 225: Level 4, Session 8, Case 2 - Creating a New File Safely
    const problem225 = {
      problem_id: 225,
      session_id: 41, // Level 4, Session 8
      title: 'Creating a New File Safely',
      description: 'Learn to create files safely using x mode with exception handling to prevent overwriting.',
      difficulty: 'Medium',
      question: `Read a filename and content from input (2 lines). Remove the file if it exists. Try creating the file using "x" mode (exclusive creation) and write the content. Use try-except to handle FileExistsError. If created successfully, print "File created successfully." If it already exists, print "File already exists."`,
      sample_input: 'mylog.txt\nName: John Doe - Subject: Python Programming',
      sample_output: 'File created successfully.',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['x mode', 'FileExistsError', 'try-except', 'safe file creation', 'exception handling'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 8: OS Module and File Handling with Exception Handling',

      // Case-specific content
      case_number: 2,
      case_title: 'Creating a New File Safely',
      case_overview: `When creating files, we need to be careful not to overwrite existing content. That's why we use "x" mode—it creates a file only if it doesn't already exist. If the file is already there, Python will raise an exception instead of crashing, allowing us to handle it gracefully.`,
      case_explanation: `"x" mode tries to create a new file only. try-except prevents the program from crashing if the file already exists. FileExistsError is caught and handled with a friendly message, making your program more robust.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 225 if it exists
    await problemsCollection.deleteOne({ problem_id: 225 });
    await testCasesCollection.deleteMany({ problem_id: 225 });

    // Insert problem 225
    const problemResult = await problemsCollection.insertOne(problem225);
    console.log('Problem 225 inserted');

    // Test cases for Problem 225
    const testCases = [
      {
        test_case_id: 2251,
        problem_id: 225,
        input: 'mylog.txt\nName: John Doe - Subject: Python Programming',
        expected_output: 'File created successfully.',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2252,
        problem_id: 225,
        input: 'data.txt\nTemperature: 25C - Status: Normal',
        expected_output: 'File created successfully.',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 225`);

    console.log('\n✅ Problem 225 (Level 4, Session 8, Case 2: Creating Files Safely) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem225()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
