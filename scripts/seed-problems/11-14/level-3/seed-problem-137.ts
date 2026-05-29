import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem137() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 137: Level 3, Session 3, Case 5 - Sorting Signal Packets
    const problem137 = {
      problem_id: 137,
      session_id: 25, // Level 3, Session 3
      title: 'Sorting Signal Packets',
      description: 'The operator.itemgetter creates efficient functions for extracting specific fields from data structures, essential for sorting complex data.',
      difficulty: 'Easy',
      question: `Can you read N packets as 'priority,timestamp' pairs and output them sorted by priority (ascending), then by timestamp (ascending) if priorities match?`,      sample_input: '3\n5,100\n2,150\n5,90',
      sample_output: '2,150\n5,90\n5,100',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['operator module', 'itemgetter', 'sorting', 'tuple processing', 'multi-field sort'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 3: Functional Programming and Modular Data Handling',

      // Case-specific content
      case_number: 5,
      case_title: 'Sorting Signal Packets',
      case_overview: `The operator.itemgetter extracts specific elements from tuples for efficient sorting and data extraction.`,
      case_explanation: `Import operator. Parse each packet as tuple (priority, timestamp). Use sorted() with key=itemgetter(0,1) for multi-field sorting.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 137 - 7 test cases (2 visible + 5 hidden)
    const testCases137 = [
      {
        test_case_id: 1371,
        problem_id: 137,
        input: '3\n5,100\n2,150\n5,90',
        expected_output: '2,150\n5,90\n5,100',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1372,
        problem_id: 137,
        input: '2\n10,500\n10,400',
        expected_output: '10,400\n10,500',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1373,
        problem_id: 137,
        input: '4\n3,200\n1,100\n3,150\n2,300',
        expected_output: '1,100\n2,300\n3,150\n3,200',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1374,
        problem_id: 137,
        input: '5\n7,50\n7,30\n7,40\n7,20\n7,10',
        expected_output: '7,10\n7,20\n7,30\n7,40\n7,50',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1375,
        problem_id: 137,
        input: '6\n4,100\n2,200\n4,50\n1,300\n2,150\n3,250',
        expected_output: '1,300\n2,150\n2,200\n3,250\n4,50\n4,100',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1376,
        problem_id: 137,
        input: '1\n9,999',
        expected_output: '9,999',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1377,
        problem_id: 137,
        input: '5\n5,500\n3,300\n1,100\n4,400\n2,200',
        expected_output: '1,100\n2,200\n3,300\n4,400\n5,500',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 137 });
    await problemsCollection.insertOne(problem137);
    console.log('Problem 137 inserted');

    await testCasesCollection.deleteMany({ problem_id: 137 });
    await testCasesCollection.insertMany(testCases137);
    console.log(`${testCases137.length} test cases inserted for Problem 137`);

    console.log('\n✅ Problem 137 (Level 3, Session 3, Case 5: Sorting Signal Packets) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem137()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
