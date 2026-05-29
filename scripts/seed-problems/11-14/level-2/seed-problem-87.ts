import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem87() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 87: Level 2, Session 5, Case 3 - Index and Slicing Tuples
    const problem87 = {
      problem_id: 87,
      session_id: 16, // Level 2, Session 5
      title: 'Index and Slicing Tuples',
      description: 'Learn to use index() to find element position and slice tuples to extract portions.',
      difficulty: 'Easy',
      question: `Create a tuple with N strings from input. Find and print the index of string S using index(). Print the sliced tuple from start to end index.`,      sample_input: '4\nred\nblue\ngreen\nblue\nblue\n1\n3',
      sample_output: '1\n(\'blue\', \'green\')',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['tuples', 'index() method', 'slicing', 'tuple operations', 'searching'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 5: Tuples (Built-in Methods, Functions, and Operations)',

      // Case-specific content
      case_number: 3,
      case_title: 'Index and Slicing Tuples',
      case_overview: `Master finding element positions with index() and extracting tuple portions using slicing syntax.`,
      case_code: `# Tuple Operations
colors = ("red", "blue")
numbers = (1, 2, 3)

# Concatenate tuples with +
combined = colors + numbers
print(combined)  # Prints: ('red', 'blue', 1, 2, 3)

# Repeat tuples with *
repeated = colors * 2
print(repeated)  # Prints: ('red', 'blue', 'red', 'blue')`,
      case_explanation: `Use tuple.index(value) to find the position of first occurrence of a value. Use tuple[start:end] to slice and extract elements from start index up to (but not including) end index.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 87 if it exists
    await problemsCollection.deleteOne({ problem_id: 87 });
    await testCasesCollection.deleteMany({ problem_id: 87 });

    // Insert problem 87
    const problemResult = await problemsCollection.insertOne(problem87);
    console.log('Problem 87 inserted');

    // Test cases for Problem 87 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 871,
        problem_id: 87,
        input: '4\nred\nblue\ngreen\nblue\nblue\n1\n3',
        expected_output: '1\n(\'blue\', \'green\')',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 872,
        problem_id: 87,
        input: '5\napple\nbanana\napple\norange\ngrape\napple\n0\n3',
        expected_output: '0\n(\'apple\', \'banana\', \'apple\')',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 873,
        problem_id: 87,
        input: '6\na\nb\nc\nd\ne\nf\nc\n2\n5',
        expected_output: '2\n(\'c\', \'d\', \'e\')',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 874,
        problem_id: 87,
        input: '3\nMars\nVenus\nEarth\nVenus\n0\n2',
        expected_output: '1\n(\'Mars\', \'Venus\')',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 875,
        problem_id: 87,
        input: '7\nx\ny\nz\ny\na\nb\nc\ny\n1\n4',
        expected_output: '1\n(\'y\', \'z\', \'y\')',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 876,
        problem_id: 87,
        input: '5\nAlpha\nBeta\nGamma\nDelta\nEpsilon\nGamma\n1\n3',
        expected_output: '2\n(\'Beta\', \'Gamma\')',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 877,
        problem_id: 87,
        input: '4\nOne\nTwo\nThree\nFour\nTwo\n2\n4',
        expected_output: '1\n(\'Three\', \'Four\')',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 87`);

    console.log('\n✅ Problem 87 (Level 2, Session 5, Case 3: Index and Slicing Tuples) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem87()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
