import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem117() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 117: Level 2, Session 10, Case 3 - Math Functions
    const problem117 = {
      problem_id: 117,
      session_id: 21, // Level 2, Session 10
      title: 'Math Functions',
      description: 'Learn to use max(), min(), sum(), and abs() for mathematical operations.',
      difficulty: 'Easy',
      question: `Take 5 integers as input (one per line). Create a list with these numbers, then print the maximum using max(), minimum using min(), and their sum using sum().`,      sample_input: '10\n5\n-3\n8\n0',
      sample_output: '10\n-3\n20',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['built-in functions', 'max()', 'min()', 'sum()', 'abs()', 'mathematical operations'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 10: Built-in Functions Mastery',

      // Case-specific content
      case_number: 3,
      case_title: 'Math Functions',
      case_overview: `Master mathematical functions - use max(), min(), sum(), and abs() for quick calculations.`,
      case_code: `# Using abs() for Absolute Values
altitude = -150  # Below sea level
temperature = -25  # Degrees Celsius

# abs() removes negative sign
depth = abs(altitude)
print(depth)  # Prints: 150

temp_diff = abs(temperature)
print(temp_diff)  # Prints: 25`,
      case_explanation: `Math functions like max(), min(), and sum() work on collections to find the largest value, smallest value, and total respectively.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 117 if it exists
    await problemsCollection.deleteOne({ problem_id: 117 });
    await testCasesCollection.deleteMany({ problem_id: 117 });

    // Insert problem 117
    const problemResult = await problemsCollection.insertOne(problem117);
    console.log('Problem 117 inserted');

    // Test cases for Problem 117 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1171,
        problem_id: 117,
        input: '10\n5\n-3\n8\n0',
        expected_output: '10\n-3\n20',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1172,
        problem_id: 117,
        input: '25\n15\n5\n20\n10',
        expected_output: '25\n5\n75',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1173,
        problem_id: 117,
        input: '-5\n0\n5\n10\n15',
        expected_output: '15\n-5\n25',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1174,
        problem_id: 117,
        input: '100\n50\n25\n75\n0',
        expected_output: '100\n0\n250',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1175,
        problem_id: 117,
        input: '7\n14\n21\n28\n35',
        expected_output: '35\n7\n105',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1176,
        problem_id: 117,
        input: '-10\n-20\n-5\n-15\n-25',
        expected_output: '-5\n-25\n-75',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1177,
        problem_id: 117,
        input: '3\n6\n9\n12\n15',
        expected_output: '15\n3\n45',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 117`);

    console.log('\n✅ Problem 117 (Level 2, Session 10, Case 3: Math Functions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem117()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
