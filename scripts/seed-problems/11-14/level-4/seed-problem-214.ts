import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem214() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 214: Level 4, Session 6, Case 3 - Reading Everything with read()
    const problem214 = {
      problem_id: 214,
      session_id: 39, // Level 4, Session 6
      title: 'Reading Everything with read()',
      description: 'Learn to read entire file contents at once using the read() function for complete data retrieval.',
      difficulty: 'Easy',
      question: `Read 3 items from input (one per line). Write them to "wishlist.txt" with newlines. Then read the entire file content using read() and print it.`,
      sample_input: 'Learn Machine Learning\nMaster Data Structures\nBuild Real Projects',
      sample_output: 'Learn Machine Learning\nMaster Data Structures\nBuild Real Projects\n',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['read()', 'reading full content', 'with statement', 'displaying file content'],
        estimated_time_minutes: 10
      },

      // Session-level content
      session_title: 'Session 6: File Handling Functions',

      // Case-specific content
      case_number: 3,
      case_title: 'Reading Everything with read() – Full View',
      case_overview: `The read() function reads the entire content of a file at once and shows it as one big string. This is useful when you want to look at everything inside the file—like reading a full letter or essay. But remember, if the file is big, read() will grab it all, so it's best used when you know the file isn't too large.`,
      case_explanation: `Use read() to read everything from start to end. The with open(...) statement automatically closes the file when done. This is perfect for viewing complete file contents in one go.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 214 if it exists
    await problemsCollection.deleteOne({ problem_id: 214 });
    await testCasesCollection.deleteMany({ problem_id: 214 });

    // Insert problem 214
    const problemResult = await problemsCollection.insertOne(problem214);
    console.log('Problem 214 inserted');

    // Test cases for Problem 214
    const testCases = [
      {
        test_case_id: 2141,
        problem_id: 214,
        input: 'Learn Machine Learning\nMaster Data Structures\nBuild Real Projects',
        expected_output: 'Learn Machine Learning\nMaster Data Structures\nBuild Real Projects\n',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2142,
        problem_id: 214,
        input: 'Practice Coding Daily\nRead Tech Books\nJoin Hackathons',
        expected_output: 'Practice Coding Daily\nRead Tech Books\nJoin Hackathons\n',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 214`);

    console.log('\n✅ Problem 214 (Level 4, Session 6, Case 3: Reading with read()) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem214()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
