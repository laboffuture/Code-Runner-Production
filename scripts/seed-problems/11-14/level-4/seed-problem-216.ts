import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem216() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 216: Level 4, Session 6, Case 5 - Reading All Lines with readlines()
    const problem216 = {
      problem_id: 216,
      session_id: 39, // Level 4, Session 6
      title: 'Reading All Lines with readlines()',
      description: 'Learn to read all file lines as a list using readlines() for easy iteration and processing.',
      difficulty: 'Medium',
      question: `Read 3 items from input (one per line). Write them to "wishlist.txt" with newlines. Then use readlines() to get all lines as a list, and print each item with numbering using a loop. Format each line as "Item 1: [content]", "Item 2: [content]", "Item 3: [content]" where [content] is stripped of extra whitespace.`,
      sample_input: 'Learn Machine Learning\nMaster Data Structures\nBuild Real Projects',
      sample_output: 'Item 1: Learn Machine Learning\nItem 2: Master Data Structures\nItem 3: Build Real Projects',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['readlines()', 'list of lines', 'looping through files', 'enumerate()', 'strip()'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 6: File Handling Functions',

      // Case-specific content
      case_number: 5,
      case_title: 'Reading All Lines with readlines() – Store as a List',
      case_overview: `Sometimes we want to take all lines from a file and work with them like a list. For example, if you have saved 10 exam scores and want to loop through them to find the average, readlines() is your tool! It reads every line and stores it as a list, so each item in the list is one line from the file. This makes it easy to loop, search, or edit content line-by-line.`,
      case_explanation: `readlines() returns all lines as a list of strings. Each item in the list is a line from the file. This makes it perfect for looping through file contents, processing each line individually, or searching for specific entries.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 216 if it exists
    await problemsCollection.deleteOne({ problem_id: 216 });
    await testCasesCollection.deleteMany({ problem_id: 216 });

    // Insert problem 216
    const problemResult = await problemsCollection.insertOne(problem216);
    console.log('Problem 216 inserted');

    // Test cases for Problem 216
    const testCases = [
      {
        test_case_id: 2161,
        problem_id: 216,
        input: 'Learn Machine Learning\nMaster Data Structures\nBuild Real Projects',
        expected_output: 'Item 1: Learn Machine Learning\nItem 2: Master Data Structures\nItem 3: Build Real Projects',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2162,
        problem_id: 216,
        input: 'Practice Coding Daily\nRead Tech Books\nJoin Hackathons',
        expected_output: 'Item 1: Practice Coding Daily\nItem 2: Read Tech Books\nItem 3: Join Hackathons',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 216`);

    console.log('\n✅ Problem 216 (Level 4, Session 6, Case 5: Reading with readlines()) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem216()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
