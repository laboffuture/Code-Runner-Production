import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem109() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 109: Level 2, Session 9, Case 1 - Defining a Function Inside Another
    const problem109 = {
      problem_id: 109,
      session_id: 20, // Level 2, Session 9
      title: 'Defining a Function Inside Another',
      description: 'Learn how to define a function inside another function and call it internally.',
      difficulty: 'Easy',
      question: `Take a message as input. Define a function spaceship() that contains an inner function launch() which prints the message. Call the inner function from within the outer function, then call spaceship().`,      sample_input: 'Launching spaceship.',
      sample_output: 'Launching spaceship.',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['nested functions', 'inner functions', 'function scope', 'encapsulation', 'modular code'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 9: Nested User-Defined Functions & Function Scope',

      // Case-specific content
      case_number: 1,
      case_title: 'Defining a Function Inside Another',
      case_overview: `Master nested functions - define functions inside other functions to create private helper functions.`,
      case_code: `# Nested Function with Return Value
def calculate_orbit():
    def get_radius():
        return 6371 + 400  # Earth radius + altitude

    radius = get_radius()
    circumference = 2 * 3.14 * radius
    return circumference

result = calculate_orbit()
print(f'Orbit: {result} km')  # Prints: Orbit: 42535.64 km`,
      case_explanation: `Nested functions are defined inside other functions and can only be called from within the outer function. They help organize code and create private helper functions.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 109 if it exists
    await problemsCollection.deleteOne({ problem_id: 109 });
    await testCasesCollection.deleteMany({ problem_id: 109 });

    // Insert problem 109
    const problemResult = await problemsCollection.insertOne(problem109);
    console.log('Problem 109 inserted');

    // Test cases for Problem 109 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1091,
        problem_id: 109,
        input: 'Launching spaceship.',
        expected_output: 'Launching spaceship.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1092,
        problem_id: 109,
        input: 'Engines ignited.',
        expected_output: 'Engines ignited.',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1093,
        problem_id: 109,
        input: 'All systems go!',
        expected_output: 'All systems go!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1094,
        problem_id: 109,
        input: 'Countdown initiated.',
        expected_output: 'Countdown initiated.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1095,
        problem_id: 109,
        input: 'Mission successful.',
        expected_output: 'Mission successful.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1096,
        problem_id: 109,
        input: 'Preparing for orbit.',
        expected_output: 'Preparing for orbit.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1097,
        problem_id: 109,
        input: 'Liftoff!',
        expected_output: 'Liftoff!',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 109`);

    console.log('\n✅ Problem 109 (Level 2, Session 9, Case 1: Defining a Function Inside Another) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem109()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
