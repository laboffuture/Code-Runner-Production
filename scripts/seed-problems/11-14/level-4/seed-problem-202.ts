import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem202() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 202: Level 4, Session 4, Case 3 - Appending to a File
    const problem202 = {
      problem_id: 202,
      session_id: 37, // Level 4, Session 4
      title: 'Appending to a File',
      description: 'Learn to add new content to an existing file without deleting the old content using append mode.',
      difficulty: 'Medium',
      question: `Read two messages from input (initial message and new message to append). First, create "mynote.txt" in write mode and write the initial message. Close it. Then open "mynote.txt" in append mode, write a newline followed by the new message, and close it. Finally, read the entire file content and print it.`,
      sample_input: 'Hello, this is my first note!\nHere\'s something new I learned today.',
      sample_output: 'Hello, this is my first note!\nHere\'s something new I learned today.\n',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['append mode', 'adding without erasing', 'newline character', 'preserving data'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 4: Python File Handling Basics',

      // Case-specific content
      case_number: 3,
      case_title: 'Appending to a File',
      case_overview: `Appending lets you add new notes to your file without deleting old ones. It's like adding a new line to your notebook without tearing out the old page.`,
      case_explanation: `Use "a" for append mode. Use \\n to move the new text to a new line. The old content stays safe while new messages stack below it.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 202 if it exists
    await problemsCollection.deleteOne({ problem_id: 202 });
    await testCasesCollection.deleteMany({ problem_id: 202 });

    // Insert problem 202
    const problemResult = await problemsCollection.insertOne(problem202);
    console.log('Problem 202 inserted');

    // Test cases for Problem 202
    const testCases = [
      {
        test_case_id: 2021,
        problem_id: 202,
        input: 'Hello, this is my first note!\nHere\'s something new I learned today.',
        expected_output: 'Hello, this is my first note!\nHere\'s something new I learned today.\n',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2022,
        problem_id: 202,
        input: 'Mission log day 1\nUpdate: All systems operational',
        expected_output: 'Mission log day 1\nUpdate: All systems operational\n',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 202`);

    console.log('\n✅ Problem 202 (Level 4, Session 4, Case 3: Appending to a File) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem202()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
