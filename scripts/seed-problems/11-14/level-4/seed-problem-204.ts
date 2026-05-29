import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem204() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 204: Level 4, Session 4, Case 5 - Writing Multiple Lines with Lists
    const problem204 = {
      problem_id: 204,
      session_id: 37, // Level 4, Session 4
      title: 'Writing Multiple Lines with Lists',
      description: 'Learn to write multiple lines to a file efficiently using lists and the writelines() method.',
      difficulty: 'Medium',
      question: `Read 3 lines from input. Create a list with these 3 lines (add \\n to each line). Use writelines() to write all lines to "shopping.txt" in one operation. Then read the file back and print its entire contents.`,
      sample_input: 'Shopping List:\n1. Apples\n2. Bananas',
      sample_output: 'Shopping List:\n1. Apples\n2. Bananas\n',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['writelines()', 'list of strings', 'efficient multi-line writing', 'batch operations'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 4: Python File Handling Basics',

      // Case-specific content
      case_number: 5,
      case_title: 'Writing Multiple Lines with Lists',
      case_overview: `Instead of writing each line one by one, Python allows you to store all lines in a list and write them all at once. It's faster and neater for storing multiple pieces of information.`,
      case_explanation: `Create a list with multiple strings, each ending with \\n. Use writelines() to write all items from the list into the file at once.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 204 if it exists
    await problemsCollection.deleteOne({ problem_id: 204 });
    await testCasesCollection.deleteMany({ problem_id: 204 });

    // Insert problem 204
    const problemResult = await problemsCollection.insertOne(problem204);
    console.log('Problem 204 inserted');

    // Test cases for Problem 204
    const testCases = [
      {
        test_case_id: 2041,
        problem_id: 204,
        input: 'Shopping List:\n1. Apples\n2. Bananas',
        expected_output: 'Shopping List:\n1. Apples\n2. Bananas\n',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2042,
        problem_id: 204,
        input: 'Mission Log:\nDay 1: Launch successful\nDay 2: Orbit achieved',
        expected_output: 'Mission Log:\nDay 1: Launch successful\nDay 2: Orbit achieved\n',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 204`);

    console.log('\n✅ Problem 204 (Level 4, Session 4, Case 5: Writing Multiple Lines) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem204()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
