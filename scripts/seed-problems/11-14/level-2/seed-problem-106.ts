import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem106() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 106: Level 2, Session 8, Case 4 - Variable-Length Arguments (*args)
    const problem106 = {
      problem_id: 106,
      session_id: 19, // Level 2, Session 8
      title: 'Variable-Length Arguments',
      description: 'Learn to create functions that accept any number of positional arguments using *args.',
      difficulty: 'Medium',
      question: `Take integer N and N integers (frequencies) as input. Define a function record_signals(*frequencies) that accepts any number of arguments and prints "Signal: <frequency>" for each. Call the function with all input frequencies.`,      sample_input: '3\n100\n200\n300',
      sample_output: 'Signal: 100\nSignal: 200\nSignal: 300',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 120,

      metadata: {
        space_theme: true,
        concepts: ['functions', '*args', 'variable-length arguments', 'arbitrary arguments', 'tuple unpacking'],
        estimated_time_minutes: 15
      },
      // Session-level content
      session_title: 'Session 8: Functions with Arguments',

      // Case-specific content
      case_number: 4,
      case_title: 'Variable-Length Arguments',
      case_overview: `Master *args - functions that accept any number of positional arguments, useful when input count is unknown.`,
      case_code: `# Variable-Length Arguments with Processing
def find_maximum(*values):
    if len(values) == 0:
        return None
    max_val = values[0]
    for val in values:
        if val > max_val:
            max_val = val
    return max_val

# Can accept any number of arguments
print(find_maximum(10, 25, 15))  # Prints: 25
print(find_maximum(3, 7, 2, 9, 4))  # Prints: 9
print(find_maximum(100))  # Prints: 100`,
      case_explanation: `Use *args to accept any number of positional arguments, which are collected into a tuple. This is useful when the number of inputs is unknown or varies.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 106 if it exists
    await problemsCollection.deleteOne({ problem_id: 106 });
    await testCasesCollection.deleteMany({ problem_id: 106 });

    // Insert problem 106
    const problemResult = await problemsCollection.insertOne(problem106);
    console.log('Problem 106 inserted');

    // Test cases for Problem 106 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1061,
        problem_id: 106,
        input: '3\n100\n200\n300',
        expected_output: 'Signal: 100\nSignal: 200\nSignal: 300',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1062,
        problem_id: 106,
        input: '2\n500\n750',
        expected_output: 'Signal: 500\nSignal: 750',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1063,
        problem_id: 106,
        input: '4\n88\n99\n110\n121',
        expected_output: 'Signal: 88\nSignal: 99\nSignal: 110\nSignal: 121',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1064,
        problem_id: 106,
        input: '1\n1420',
        expected_output: 'Signal: 1420',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1065,
        problem_id: 106,
        input: '5\n50\n100\n150\n200\n250',
        expected_output: 'Signal: 50\nSignal: 100\nSignal: 150\nSignal: 200\nSignal: 250',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1066,
        problem_id: 106,
        input: '6\n2400\n5000\n8000\n12000\n15000\n18000',
        expected_output: 'Signal: 2400\nSignal: 5000\nSignal: 8000\nSignal: 12000\nSignal: 15000\nSignal: 18000',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1067,
        problem_id: 106,
        input: '3\n440\n880\n1320',
        expected_output: 'Signal: 440\nSignal: 880\nSignal: 1320',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 106`);

    console.log('\n✅ Problem 106 (Level 2, Session 8, Case 4: Variable-Length Arguments) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem106()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
