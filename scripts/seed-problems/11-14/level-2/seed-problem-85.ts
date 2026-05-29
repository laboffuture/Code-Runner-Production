import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem85() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 85: Level 2, Session 5, Case 1 - Creating and Accessing a Tuple
    const problem85 = {
      problem_id: 85,
      session_id: 16, // Level 2, Session 5
      title: 'Creating and Accessing a Tuple',
      description: 'Learn to create tuples and access their elements using indexing.',
      difficulty: 'Easy',
      question: `Create a tuple with N astronaut names from input. Access and print the astronaut at index I1, then the astronaut at index I2.`,      sample_input: '4\nNeil\nBuzz\nSally\nYuri\n1\n3',
      sample_output: 'Buzz\nYuri',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['tuples', 'tuple creation', 'indexing', 'accessing elements', 'immutable data'],
        estimated_time_minutes: 10
      },
      // Session-level content
      session_title: 'Session 5: Tuples (Built-in Methods, Functions, and Operations)',

      // Case-specific content
      case_number: 1,
      case_title: 'Creating and Accessing a Tuple',
      case_overview: `Master the basics of tuples - creating them with parentheses and accessing elements using indexing, just like lists.`,
      case_code: `# Creating and Accessing Tuples
scores = (85, 90, 78, 92)

# Unpack tuple values
first, second, third, fourth = scores
print(first)   # Prints: 85
print(third)   # Prints: 78

# Tuples use () and are immutable`,
      case_explanation: `Create tuples with parentheses (). Access elements using tuple[index] where indexing starts at 0. Tuples cannot be modified after creation.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 85 if it exists
    await problemsCollection.deleteOne({ problem_id: 85 });
    await testCasesCollection.deleteMany({ problem_id: 85 });

    // Insert problem 85
    const problemResult = await problemsCollection.insertOne(problem85);
    console.log('Problem 85 inserted');

    // Test cases for Problem 85 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 851,
        problem_id: 85,
        input: '4\nNeil\nBuzz\nSally\nYuri\n1\n3',
        expected_output: 'Buzz\nYuri',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 852,
        problem_id: 85,
        input: '3\nAlan\nJohn\nMichael\n0\n2',
        expected_output: 'Alan\nMichael',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 853,
        problem_id: 85,
        input: '5\nAlpha\nBeta\nGamma\nDelta\nEpsilon\n2\n4',
        expected_output: 'Gamma\nEpsilon',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 854,
        problem_id: 85,
        input: '2\nCommander\nPilot\n0\n1',
        expected_output: 'Commander\nPilot',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 855,
        problem_id: 85,
        input: '6\nA\nB\nC\nD\nE\nF\n1\n4',
        expected_output: 'B\nE',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 856,
        problem_id: 85,
        input: '4\nMars\nJupiter\nSaturn\nNeptune\n0\n3',
        expected_output: 'Mars\nNeptune',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 857,
        problem_id: 85,
        input: '5\nOne\nTwo\nThree\nFour\nFive\n2\n2',
        expected_output: 'Three\nThree',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 85`);

    console.log('\n✅ Problem 85 (Level 2, Session 5, Case 1: Creating and Accessing a Tuple) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem85()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
