import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem136() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 136: Level 3, Session 3, Case 4 - Function Composition with reduce and partial
    const problem136 = {
      problem_id: 136,
      session_id: 25, // Level 3, Session 3
      title: 'Function Composition with reduce and partial',
      description: 'Advanced functools features enable function composition and partial application for creating specialized functions from general ones.',
      difficulty: 'Medium',
      question: `Can you read comma-separated integers and output the sum of all values multiplied by 3?`,      sample_input: '10,20,30,40',
      sample_output: '300',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['functools', 'reduce', 'partial', 'operator module', 'function composition'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 3: Functional Programming and Modular Data Handling',

      // Case-specific content
      case_number: 4,
      case_title: 'Function Composition with reduce and partial',
      case_overview: `The functools.reduce applies cumulative operations, while partial pre-fills function arguments.`,
      case_explanation: `Import functools and operator. Use reduce(operator.add, values) to sum, then create partial(operator.mul, 3) to multiply by 3.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 136 - 7 test cases (2 visible + 5 hidden)
    // Formula: sum(values) * 3
    const testCases136 = [
      {
        test_case_id: 1361,
        problem_id: 136,
        input: '10,20,30,40',
        expected_output: '300',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1362,
        problem_id: 136,
        input: '5,15,25',
        expected_output: '135',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1363,
        problem_id: 136,
        input: '100,200,300',
        expected_output: '1800',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1364,
        problem_id: 136,
        input: '7',
        expected_output: '21',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1365,
        problem_id: 136,
        input: '12,18,22,8',
        expected_output: '180',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1366,
        problem_id: 136,
        input: '50,50,50,50',
        expected_output: '600',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1367,
        problem_id: 136,
        input: '1,2,3,4,5,6,7,8,9,10',
        expected_output: '165',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 136 });
    await problemsCollection.insertOne(problem136);
    console.log('Problem 136 inserted');

    await testCasesCollection.deleteMany({ problem_id: 136 });
    await testCasesCollection.insertMany(testCases136);
    console.log(`${testCases136.length} test cases inserted for Problem 136`);

    console.log('\n✅ Problem 136 (Level 3, Session 3, Case 4: Function Composition with reduce and partial) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem136()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
