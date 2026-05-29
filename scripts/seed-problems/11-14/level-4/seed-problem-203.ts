import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem203() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 203: Level 4, Session 4, Case 4 - Using With Statement for Safe File Handling
    const problem203 = {
      problem_id: 203,
      session_id: 37, // Level 4, Session 4
      title: 'Using With Statement for Safe File Handling',
      description: 'Learn to use the with statement for safer file handling that automatically closes files.',
      difficulty: 'Medium',
      question: `Read a message from input. Use the with statement to create "mynote.txt" in write mode and write the message. Then use another with statement to open "mynote.txt" in read mode, read its content, and print it. Files should automatically close after each operation.`,
      sample_input: 'Hello, this is my first note!',
      sample_output: 'Hello, this is my first note!\n',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['with statement', 'context managers', 'automatic file closing', 'safe file handling'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 4: Python File Handling Basics',

      // Case-specific content
      case_number: 4,
      case_title: 'Using With Statement for Safe File Handling',
      case_overview: `The with statement is a smarter way to handle files. It automatically closes the file once work is done—like a book that magically returns itself to the shelf after you finish reading.`,
      case_explanation: `Use with open("mynote.txt", "r") as file: to open safely. The file auto-closes when the indented block ends. No need to call close() manually.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 203 if it exists
    await problemsCollection.deleteOne({ problem_id: 203 });
    await testCasesCollection.deleteMany({ problem_id: 203 });

    // Insert problem 203
    const problemResult = await problemsCollection.insertOne(problem203);
    console.log('Problem 203 inserted');

    // Test cases for Problem 203
    const testCases = [
      {
        test_case_id: 2031,
        problem_id: 203,
        input: 'Hello, this is my first note!',
        expected_output: 'Hello, this is my first note!\n',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2032,
        problem_id: 203,
        input: 'With statement makes file handling safer',
        expected_output: 'With statement makes file handling safer\n',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 203`);

    console.log('\n✅ Problem 203 (Level 4, Session 4, Case 4: With Statement) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem203()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
