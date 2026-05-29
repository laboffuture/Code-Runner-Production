import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem113() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 113: Level 2, Session 9, Case 5 - Returning a Nested Function
    const problem113 = {
      problem_id: 113,
      session_id: 20, // Level 2, Session 9
      title: 'Returning a Nested Function',
      description: 'Learn to return nested functions and call them as objects.',
      difficulty: 'Medium',
      question: `Take a message as input. Define a function create_alert() that contains a nested function show() which returns the input message. Return the show function object (not calling it). Assign the returned function to a variable and call it to print the message.`,      sample_input: 'Caution: System Overload',
      sample_output: 'Caution: System Overload',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 120,

      metadata: {
        space_theme: true,
        concepts: ['returning functions', 'function objects', 'closures', 'first-class functions', 'higher-order functions'],
        estimated_time_minutes: 15
      },
      // Session-level content
      session_title: 'Session 9: Nested User-Defined Functions & Function Scope',

      // Case-specific content
      case_number: 5,
      case_title: 'Returning a Nested Function',
      case_overview: `Master returning functions - treat functions as objects that can be returned and assigned to variables.`,
      case_code: `# Function Factory
def create_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply

# Create different multiplier functions
double = create_multiplier(2)
triple = create_multiplier(3)

print(double(5))  # Prints: 10
print(triple(5))  # Prints: 15`,
      case_explanation: `Functions are first-class objects and can be returned from other functions. Return the function name without parentheses, assign it to a variable, then call it with parentheses.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 113 if it exists
    await problemsCollection.deleteOne({ problem_id: 113 });
    await testCasesCollection.deleteMany({ problem_id: 113 });

    // Insert problem 113
    const problemResult = await problemsCollection.insertOne(problem113);
    console.log('Problem 113 inserted');

    // Test cases for Problem 113 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1131,
        problem_id: 113,
        input: 'Caution: System Overload',
        expected_output: 'Caution: System Overload',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1132,
        problem_id: 113,
        input: 'Warning: Low Fuel',
        expected_output: 'Warning: Low Fuel',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1133,
        problem_id: 113,
        input: 'Alert: Incoming Asteroid',
        expected_output: 'Alert: Incoming Asteroid',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1134,
        problem_id: 113,
        input: 'Notice: Docking Complete',
        expected_output: 'Notice: Docking Complete',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1135,
        problem_id: 113,
        input: 'Error: Communication Lost',
        expected_output: 'Error: Communication Lost',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1136,
        problem_id: 113,
        input: 'Info: Orbit Stable',
        expected_output: 'Info: Orbit Stable',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1137,
        problem_id: 113,
        input: 'Critical: Hull Breach',
        expected_output: 'Critical: Hull Breach',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 113`);

    console.log('\n✅ Problem 113 (Level 2, Session 9, Case 5: Returning a Nested Function) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem113()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
