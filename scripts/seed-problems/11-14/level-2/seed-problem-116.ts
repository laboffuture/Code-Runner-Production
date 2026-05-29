import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem116() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 116: Level 2, Session 10, Case 2 - Conversion Functions
    const problem116 = {
      problem_id: 116,
      session_id: 21, // Level 2, Session 10
      title: 'Conversion Functions',
      description: 'Learn to convert between data types using int(), float(), and str().',
      difficulty: 'Easy',
      question: `Take a string number as input. Convert it to integer using int() and to float using float(), then print their sum.`,      sample_input: '42',
      sample_output: '84.0',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['built-in functions', 'type conversion', 'int()', 'float()', 'str()', 'casting'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 10: Built-in Functions Mastery',

      // Case-specific content
      case_number: 2,
      case_title: 'Conversion Functions',
      case_overview: `Master type conversion - use int(), float(), and str() to convert between different data types.`,
      case_code: `# Converting Between Types
distance = 384.4  # Float
light_years = 2537000  # Integer

# Convert float to int
distance_km = int(distance)
print(distance_km)  # Prints: 384

# Convert int to string
ly_text = str(light_years)
print(ly_text)  # Prints: 2537000`,
      case_explanation: `Type conversion functions like int() and float() transform data from one type to another, useful when you need to perform operations.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 116 if it exists
    await problemsCollection.deleteOne({ problem_id: 116 });
    await testCasesCollection.deleteMany({ problem_id: 116 });

    // Insert problem 116
    const problemResult = await problemsCollection.insertOne(problem116);
    console.log('Problem 116 inserted');

    // Test cases for Problem 116 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1161,
        problem_id: 116,
        input: '42',
        expected_output: '84.0',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1162,
        problem_id: 116,
        input: '100',
        expected_output: '200.0',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1163,
        problem_id: 116,
        input: '25',
        expected_output: '50.0',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1164,
        problem_id: 116,
        input: '50',
        expected_output: '100.0',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1165,
        problem_id: 116,
        input: '75',
        expected_output: '150.0',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1166,
        problem_id: 116,
        input: '10',
        expected_output: '20.0',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1167,
        problem_id: 116,
        input: '33',
        expected_output: '66.0',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 116`);

    console.log('\n✅ Problem 116 (Level 2, Session 10, Case 2: Conversion Functions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem116()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
