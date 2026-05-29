import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem200() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 200: Level 4, Session 4, Case 1 - Writing to a File
    const problem200 = {
      problem_id: 200,
      session_id: 37, // Level 4, Session 4
      title: 'Writing to a File',
      description: 'Learn to create files and write content to them using Python file handling basics.',
      difficulty: 'Easy',
      question: `Read a message from input, create a file called "diary.txt" in write mode, write that message to it, and close the file. Then read the file back, print its contents, and print the character count on a new line.`,      sample_input: 'My favorite hobby is coding!',
      sample_output: 'My favorite hobby is coding!\n28\n',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['file creation', 'write mode', 'open()', 'write()', 'close()', 'file handling basics'],
        estimated_time_minutes: 10
      },

      // Session-level content
      session_title: 'Session 4: Python File Handling Basics',

      // Case-specific content
      case_number: 1,
      case_title: 'Writing to a File',
      case_overview: `Writing to a file in Python works like writing in a notebook—you create a file and save a message inside it. The message is saved permanently and can be read later, even after your program stops.`,
      case_explanation: `Use open("diary.txt", "w") to create a file in write mode. Use write() to put your message into the file. Use close() to save the changes properly.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 200 if it exists
    await problemsCollection.deleteOne({ problem_id: 200 });
    await testCasesCollection.deleteMany({ problem_id: 200 });

    // Insert problem 200
    const problemResult = await problemsCollection.insertOne(problem200);
    console.log('Problem 200 inserted');

    // Test cases for Problem 200
    const testCases = [
      {
        test_case_id: 2001,
        problem_id: 200,
        input: 'My favorite hobby is coding!',
        expected_output: 'My favorite hobby is coding!\n28\n',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2002,
        problem_id: 200,
        input: 'Python is awesome!',
        expected_output: 'Python is awesome!\n18\n',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 200`);

    console.log('\n✅ Problem 200 (Level 4, Session 4, Case 1: Writing to a File) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem200()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
