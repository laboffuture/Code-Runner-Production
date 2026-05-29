import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem99() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 99: Level 2, Session 7, Case 3 - Returning Values from Functions
    const problem99 = {
      problem_id: 99,
      session_id: 18, // Level 2, Session 7
      title: 'Returning Values from Functions',
      description: 'Learn to use return statements to send values back from functions.',
      difficulty: 'Easy',
      question: `Read two integers a and b. Define a function multiply(a, b) that returns a * b. Call the function with the two inputs and print the returned result.`,      sample_input: '3\n4',
      sample_output: '12',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['functions', 'return statement', 'function return values', 'storing results', 'multiplication'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 7: User-Defined Functions',

      // Case-specific content
      case_number: 3,
      case_title: 'Returning Values from Functions',
      case_overview: `Master return statements - create functions that send values back to be used in other parts of your program.`,
      case_code: `# Function with Conditional Return
def check_temperature(temp):
    if temp > 100:
        return "Too hot"
    elif temp < 0:
        return "Too cold"
    else:
        return "Normal"

# Call and print results
print(check_temperature(150))  # Prints: Too hot
print(check_temperature(-10))  # Prints: Too cold
print(check_temperature(25))   # Prints: Normal`,
      case_explanation: `Define function: def multiply(a, b): return a * b. Read two inputs as integers. Call multiply(a, b) and print the result. The return value is the product.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 99 if it exists
    await problemsCollection.deleteOne({ problem_id: 99 });
    await testCasesCollection.deleteMany({ problem_id: 99 });

    // Insert problem 99
    const problemResult = await problemsCollection.insertOne(problem99);
    console.log('Problem 99 inserted');

    // Test cases for Problem 99 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 991,
        problem_id: 99,
        input: '3\n4',
        expected_output: '12',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 992,
        problem_id: 99,
        input: '5\n7',
        expected_output: '35',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 993,
        problem_id: 99,
        input: '10\n10',
        expected_output: '100',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 994,
        problem_id: 99,
        input: '2\n8',
        expected_output: '16',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 995,
        problem_id: 99,
        input: '9\n3',
        expected_output: '27',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 996,
        problem_id: 99,
        input: '6\n6',
        expected_output: '36',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 997,
        problem_id: 99,
        input: '12\n5',
        expected_output: '60',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 99`);

    console.log('\n✅ Problem 99 (Level 2, Session 7, Case 3: Returning Values from Functions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem99()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
