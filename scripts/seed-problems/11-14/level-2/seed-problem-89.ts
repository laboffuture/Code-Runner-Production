import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem89() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 89: Level 2, Session 5, Case 5 - Checking Membership and Using (in)
    const problem89 = {
      problem_id: 89,
      session_id: 16, // Level 2, Session 5
      title: 'Checking Membership and Using (in)',
      description: 'Learn to use the in operator to check if a value exists in a tuple.',
      difficulty: 'Easy',
      question: `Create a tuple with N strings from input. Check if string S exists in the tuple using in operator. Print "Found" if it exists, else print "Not Found".`,      sample_input: '3\nMercury\nVenus\nEarth\nEarth',
      sample_output: 'Found',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['tuples', 'membership testing', 'in operator', 'boolean logic', 'conditionals'],
        estimated_time_minutes: 10
      },
      // Session-level content
      session_title: 'Session 5: Tuples (Built-in Methods, Functions, and Operations)',

      // Case-specific content
      case_number: 5,
      case_title: 'Checking Membership and Using (in)',
      case_overview: `Master membership testing - use the in operator to quickly check if a value exists in a tuple.`,
      case_code: `# Tuple Comparisons
tuple1 = (1, 2, 3)
tuple2 = (1, 2, 4)
tuple3 = (1, 2, 3)

# Compare tuples
print(tuple1 == tuple3)  # Prints: True
print(tuple1 < tuple2)   # Prints: True (compares element by element)

# Tuples can be sorted
print(sorted((5, 1, 3)))  # Prints: [1, 3, 5]`,
      case_explanation: `Use value in tuple to check if a value exists in the tuple, which returns True if found and False otherwise. Use not in to check if a value doesn't exist.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 89 if it exists
    await problemsCollection.deleteOne({ problem_id: 89 });
    await testCasesCollection.deleteMany({ problem_id: 89 });

    // Insert problem 89
    const problemResult = await problemsCollection.insertOne(problem89);
    console.log('Problem 89 inserted');

    // Test cases for Problem 89 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 891,
        problem_id: 89,
        input: '3\nMercury\nVenus\nEarth\nEarth',
        expected_output: 'Found',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 892,
        problem_id: 89,
        input: '4\napple\nbanana\norange\ngrape\nmango',
        expected_output: 'Not Found',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 893,
        problem_id: 89,
        input: '5\nAlpha\nBeta\nGamma\nDelta\nEpsilon\nGamma',
        expected_output: 'Found',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 894,
        problem_id: 89,
        input: '2\nMars\nJupiter\nSaturn',
        expected_output: 'Not Found',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 895,
        problem_id: 89,
        input: '6\na\nb\nc\nd\ne\nf\na',
        expected_output: 'Found',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 896,
        problem_id: 89,
        input: '4\nOne\nTwo\nThree\nFour\nFive',
        expected_output: 'Not Found',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 897,
        problem_id: 89,
        input: '7\nRed\nGreen\nBlue\nYellow\nOrange\nPurple\nPink\nBlue',
        expected_output: 'Found',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 89`);

    console.log('\n✅ Problem 89 (Level 2, Session 5, Case 5: Checking Membership and Using (in)) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem89()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
