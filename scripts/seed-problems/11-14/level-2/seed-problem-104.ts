import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem104() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 104: Level 2, Session 8, Case 2 - Default Arguments
    const problem104 = {
      problem_id: 104,
      session_id: 19, // Level 2, Session 8
      title: 'Default Arguments',
      description: 'Learn to create functions with default values that can be overridden when needed.',
      difficulty: 'Easy',
      question: `Take a string input. Define a function fuel_check(level="Full") with a default parameter that prints "Fuel level: <level>". Call it twice: first without arguments, then with the input value.`,      sample_input: 'Half',
      sample_output: 'Fuel level: Full\nFuel level: Half',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['functions', 'default arguments', 'default parameters', 'optional parameters', 'parameter defaults'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 8: Functions with Arguments',

      // Case-specific content
      case_number: 2,
      case_title: 'Default Arguments',
      case_overview: `Master default arguments - functions with preset values that can be overridden when needed.`,
      case_code: `# Function with Multiple Default Arguments
def calculate_speed(distance, time=10, unit='km/h'):
    speed = distance / time
    print(f'Speed: {speed} {unit}')

# Uses both defaults
calculate_speed(100)  # Prints: Speed: 10.0 km/h

# Override one default
calculate_speed(100, 5)  # Prints: Speed: 20.0 km/h

# Override both defaults
calculate_speed(100, 5, 'm/s')  # Prints: Speed: 20.0 m/s`,
      case_explanation: `Default arguments use parameter=value syntax and provide fallback values when no argument is passed. You can override defaults by passing values when calling the function.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 104 if it exists
    await problemsCollection.deleteOne({ problem_id: 104 });
    await testCasesCollection.deleteMany({ problem_id: 104 });

    // Insert problem 104
    const problemResult = await problemsCollection.insertOne(problem104);
    console.log('Problem 104 inserted');

    // Test cases for Problem 104 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1041,
        problem_id: 104,
        input: 'Half',
        expected_output: 'Fuel level: Full\nFuel level: Half',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1042,
        problem_id: 104,
        input: 'Empty',
        expected_output: 'Fuel level: Full\nFuel level: Empty',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1043,
        problem_id: 104,
        input: 'Low',
        expected_output: 'Fuel level: Full\nFuel level: Low',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1044,
        problem_id: 104,
        input: 'Critical',
        expected_output: 'Fuel level: Full\nFuel level: Critical',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1045,
        problem_id: 104,
        input: '75%',
        expected_output: 'Fuel level: Full\nFuel level: 75%',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1046,
        problem_id: 104,
        input: 'Optimal',
        expected_output: 'Fuel level: Full\nFuel level: Optimal',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1047,
        problem_id: 104,
        input: 'Reserved',
        expected_output: 'Fuel level: Full\nFuel level: Reserved',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 104`);

    console.log('\n✅ Problem 104 (Level 2, Session 8, Case 2: Default Arguments) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem104()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
