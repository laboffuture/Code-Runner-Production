import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem201() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 201: Level 4, Session 4, Case 2 - Reading from a File
    const problem201 = {
      problem_id: 201,
      session_id: 37, // Level 4, Session 4
      title: 'Reading from a File',
      description: 'Learn to open and read content from existing files to retrieve saved information.',
      difficulty: 'Easy',
      question: `Read a message from input, create a file called "mynote.txt" in write mode, write that message to it, and close the file. Then open "mynote.txt" in read mode, read its content, print the content, and close the file.`,
      sample_input: 'Hello, this is my first note!',
      sample_output: 'Hello, this is my first note!\n',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['read mode', 'read()', 'opening files', 'displaying content', 'file retrieval'],
        estimated_time_minutes: 10
      },

      // Session-level content
      session_title: 'Session 4: Python File Handling Basics',

      // Case-specific content
      case_number: 2,
      case_title: 'Reading from a File',
      case_overview: `Just like flipping to a page in your diary, you can open a file and read the message inside. Python lets you open a saved file and display the text it contains.`,
      case_explanation: `Use open("mynote.txt", "r") for read mode. Use read() to grab everything in the file. Use print() to show it on the screen. Don't forget to close() the file.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 201 if it exists
    await problemsCollection.deleteOne({ problem_id: 201 });
    await testCasesCollection.deleteMany({ problem_id: 201 });

    // Insert problem 201
    const problemResult = await problemsCollection.insertOne(problem201);
    console.log('Problem 201 inserted');

    // Test cases for Problem 201
    const testCases = [
      {
        test_case_id: 2011,
        problem_id: 201,
        input: 'Hello, this is my first note!',
        expected_output: 'Hello, this is my first note!\n',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2012,
        problem_id: 201,
        input: 'Today I learned file handling!',
        expected_output: 'Today I learned file handling!\n',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 201`);

    console.log('\n✅ Problem 201 (Level 4, Session 4, Case 2: Reading from a File) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem201()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
