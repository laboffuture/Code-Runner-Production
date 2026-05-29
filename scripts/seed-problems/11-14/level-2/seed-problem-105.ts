import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem105() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 105: Level 2, Session 8, Case 3 - Keyword Arguments
    const problem105 = {
      problem_id: 105,
      session_id: 19, // Level 2, Session 8
      title: 'Keyword Arguments',
      description: 'Learn to pass arguments by parameter name for improved readability and flexibility.',
      difficulty: 'Easy',
      question: `Take two strings name and orbit as input. Define a function satellite_info(name, orbit) that prints "<name> orbits at <orbit>". Call the function using keyword arguments in reversed order (orbit=..., name=...).`,      sample_input: 'Hubble\nLow Earth Orbit',
      sample_output: 'Hubble orbits at Low Earth Orbit',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['functions', 'keyword arguments', 'named parameters', 'argument order', 'readability'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 8: Functions with Arguments',

      // Case-specific content
      case_number: 3,
      case_title: 'Keyword Arguments',
      case_overview: `Master keyword arguments - pass arguments by parameter name for clarity and flexible ordering.`,
      case_code: `# Mixing Positional and Keyword Arguments
def calculate_trajectory(speed, angle, thrust=100):
    distance = speed * angle
    result = distance + thrust
    return result

# Positional for required, keyword for default
value1 = calculate_trajectory(50, 2)  # Uses default thrust
print(value1)  # Prints: 200

# Override default with keyword
value2 = calculate_trajectory(50, 2, thrust=50)
print(value2)  # Prints: 150`,
      case_explanation: `Keyword arguments use parameter_name=value syntax and can be passed in any order. This makes function calls self-documenting and more readable.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 105 if it exists
    await problemsCollection.deleteOne({ problem_id: 105 });
    await testCasesCollection.deleteMany({ problem_id: 105 });

    // Insert problem 105
    const problemResult = await problemsCollection.insertOne(problem105);
    console.log('Problem 105 inserted');

    // Test cases for Problem 105 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1051,
        problem_id: 105,
        input: 'Hubble\nLow Earth Orbit',
        expected_output: 'Hubble orbits at Low Earth Orbit',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1052,
        problem_id: 105,
        input: 'GPS\nMedium Earth Orbit',
        expected_output: 'GPS orbits at Medium Earth Orbit',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1053,
        problem_id: 105,
        input: 'ISS\nLow Earth Orbit',
        expected_output: 'ISS orbits at Low Earth Orbit',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1054,
        problem_id: 105,
        input: 'Voyager\nHeliocentric',
        expected_output: 'Voyager orbits at Heliocentric',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1055,
        problem_id: 105,
        input: 'Starlink\nLow Earth Orbit',
        expected_output: 'Starlink orbits at Low Earth Orbit',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1056,
        problem_id: 105,
        input: 'JWST\nSun-Earth L2',
        expected_output: 'JWST orbits at Sun-Earth L2',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1057,
        problem_id: 105,
        input: 'Galileo\nGeostationary',
        expected_output: 'Galileo orbits at Geostationary',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 105`);

    console.log('\n✅ Problem 105 (Level 2, Session 8, Case 3: Keyword Arguments) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem105()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
