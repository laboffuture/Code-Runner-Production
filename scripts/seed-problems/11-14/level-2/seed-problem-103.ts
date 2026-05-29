import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem103() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 103: Level 2, Session 8, Case 1 - Required Arguments
    const problem103 = {
      problem_id: 103,
      session_id: 19, // Level 2, Session 8
      title: 'Required Arguments',
      description: 'Learn about functions that require all arguments to be passed in the correct position.',
      difficulty: 'Easy',
      question: `Take two strings date and location as input. Define a function mission_log(date, location) that prints "<date> <location>". Call the function with the input values.`,      sample_input: '2024-12-01\nCape Canaveral',
      sample_output: '2024-12-01 Cape Canaveral',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['functions', 'required arguments', 'positional arguments', 'function parameters', 'argument order'],
        estimated_time_minutes: 10
      },
      // Session-level content
      session_title: 'Session 8: Functions with Arguments',

      // Case-specific content
      case_number: 1,
      case_title: 'Required Arguments',
      case_overview: `Master required arguments - functions that need all arguments to be passed in the correct position.`,
      case_code: `# Function with Three Required Arguments
def calculate_fuel(distance, efficiency, reserve):
    needed = distance / efficiency
    total = needed + reserve
    print(f'Fuel needed: {needed}L, Total: {total}L')

# All three arguments required
calculate_fuel(450, 15, 10)
# Prints: Fuel needed: 30.0L, Total: 40.0L`,
      case_explanation: `Required arguments must be provided in the correct order when calling the function. Omitting any argument will cause an error.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 103 if it exists
    await problemsCollection.deleteOne({ problem_id: 103 });
    await testCasesCollection.deleteMany({ problem_id: 103 });

    // Insert problem 103
    const problemResult = await problemsCollection.insertOne(problem103);
    console.log('Problem 103 inserted');

    // Test cases for Problem 103 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1031,
        problem_id: 103,
        input: '2024-12-01\nCape Canaveral',
        expected_output: '2024-12-01 Cape Canaveral',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1032,
        problem_id: 103,
        input: '2025-03-15\nBaikonur Cosmodrome',
        expected_output: '2025-03-15 Baikonur Cosmodrome',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1033,
        problem_id: 103,
        input: '2023-07-20\nKennedy Space Center',
        expected_output: '2023-07-20 Kennedy Space Center',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1034,
        problem_id: 103,
        input: '2024-01-10\nVandenberg',
        expected_output: '2024-01-10 Vandenberg',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1035,
        problem_id: 103,
        input: '2022-11-05\nGuiana Space Centre',
        expected_output: '2022-11-05 Guiana Space Centre',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1036,
        problem_id: 103,
        input: '2024-06-30\nWallops Island',
        expected_output: '2024-06-30 Wallops Island',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1037,
        problem_id: 103,
        input: '2025-09-12\nTanegashima',
        expected_output: '2025-09-12 Tanegashima',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 103`);

    console.log('\n✅ Problem 103 (Level 2, Session 8, Case 1: Required Arguments) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem103()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
