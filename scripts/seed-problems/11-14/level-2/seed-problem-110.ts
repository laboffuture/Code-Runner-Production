import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem110() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 110: Level 2, Session 9, Case 2 - Understanding Local Scope
    const problem110 = {
      problem_id: 110,
      session_id: 20, // Level 2, Session 9
      title: 'Understanding Local Scope',
      description: 'Learn that variables inside functions are local and not accessible outside.',
      difficulty: 'Easy',
      question: `Take a rank as input. Define a function pilot() that creates a local variable with the input value and prints "Rank: <rank>". Call the function.`,      sample_input: 'Captain',
      sample_output: 'Rank: Captain',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['local scope', 'function scope', 'local variables', 'variable visibility', 'encapsulation'],
        estimated_time_minutes: 10
      },
      // Session-level content
      session_title: 'Session 9: Nested User-Defined Functions & Function Scope',

      // Case-specific content
      case_number: 2,
      case_title: 'Understanding Local Scope',
      case_overview: `Master local scope - variables inside functions are local and cannot be accessed outside.`,
      case_code: `# Local Scope with Multiple Functions
def function_a():
    value = 10
    print(f'Function A: {value}')

def function_b():
    value = 20  # Different local variable
    print(f'Function B: {value}')

function_a()  # Prints: Function A: 10
function_b()  # Prints: Function B: 20`,
      case_explanation: `Variables defined inside a function are local and cannot be accessed outside the function. Each function has its own separate local scope.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 110 if it exists
    await problemsCollection.deleteOne({ problem_id: 110 });
    await testCasesCollection.deleteMany({ problem_id: 110 });

    // Insert problem 110
    const problemResult = await problemsCollection.insertOne(problem110);
    console.log('Problem 110 inserted');

    // Test cases for Problem 110 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1101,
        problem_id: 110,
        input: 'Captain',
        expected_output: 'Rank: Captain',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1102,
        problem_id: 110,
        input: 'Commander',
        expected_output: 'Rank: Commander',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1103,
        problem_id: 110,
        input: 'Lieutenant',
        expected_output: 'Rank: Lieutenant',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1104,
        problem_id: 110,
        input: 'Admiral',
        expected_output: 'Rank: Admiral',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1105,
        problem_id: 110,
        input: 'Colonel',
        expected_output: 'Rank: Colonel',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1106,
        problem_id: 110,
        input: 'General',
        expected_output: 'Rank: General',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1107,
        problem_id: 110,
        input: 'Major',
        expected_output: 'Rank: Major',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 110`);

    console.log('\n✅ Problem 110 (Level 2, Session 9, Case 2: Understanding Local Scope) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem110()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
