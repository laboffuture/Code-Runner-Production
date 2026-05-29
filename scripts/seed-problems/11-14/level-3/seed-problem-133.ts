import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem133() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 133: Level 3, Session 3, Case 1 - Generating Infinite Signal Streams
    const problem133 = {
      problem_id: 133,
      session_id: 25, // Level 3, Session 3
      title: 'Generating Infinite Signal Streams',
      description: 'The itertools module generates efficient iterators for processing sequences, enabling infinite streams and advanced iteration patterns.',
      difficulty: 'Easy',
      question: `Can you create an infinite cycle from comma-separated signal frequencies and output the first 20 values separated by spaces?`,      sample_input: '100,200,150,175',
      sample_output: '100 200 150 175 100 200 150 175 100 200 150 175 100 200 150 175 100 200 150 175',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['itertools', 'cycle', 'islice', 'infinite iterators', 'list processing'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 3: Functional Programming and Modular Data Handling',

      // Case-specific content
      case_number: 1,
      case_title: 'Generating Infinite Signal Streams',
      case_overview: `The itertools module creates efficient iterators for cycling through sequences and slicing infinite streams.`,
      case_explanation: `Import itertools. Use cycle() to create an infinite iterator from the comma-separated input, then islice() to get first 20 values.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 133 - 7 test cases (2 visible + 5 hidden)
    const testCases133 = [
      {
        test_case_id: 1331,
        problem_id: 133,
        input: '100,200,150,175',
        expected_output: '100 200 150 175 100 200 150 175 100 200 150 175 100 200 150 175 100 200 150 175',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1332,
        problem_id: 133,
        input: '5,10,15',
        expected_output: '5 10 15 5 10 15 5 10 15 5 10 15 5 10 15 5 10 15 5 10',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1333,
        problem_id: 133,
        input: '42,84',
        expected_output: '42 84 42 84 42 84 42 84 42 84 42 84 42 84 42 84 42 84 42 84',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1334,
        problem_id: 133,
        input: '1,2,3,4,5',
        expected_output: '1 2 3 4 5 1 2 3 4 5 1 2 3 4 5 1 2 3 4 5',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1335,
        problem_id: 133,
        input: '99,88,77,66',
        expected_output: '99 88 77 66 99 88 77 66 99 88 77 66 99 88 77 66 99 88 77 66',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1336,
        problem_id: 133,
        input: '7',
        expected_output: '7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1337,
        problem_id: 133,
        input: '10,20,30,40,50,60',
        expected_output: '10 20 30 40 50 60 10 20 30 40 50 60 10 20 30 40 50 60 10 20',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 133 });
    await problemsCollection.insertOne(problem133);
    console.log('Problem 133 inserted');

    await testCasesCollection.deleteMany({ problem_id: 133 });
    await testCasesCollection.insertMany(testCases133);
    console.log(`${testCases133.length} test cases inserted for Problem 133`);

    console.log('\n✅ Problem 133 (Level 3, Session 3, Case 1: Generating Infinite Signal Streams) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem133()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
