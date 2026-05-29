import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem111() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 111: Level 2, Session 9, Case 3 - Using Nonlocal Variables
    const problem111 = {
      problem_id: 111,
      session_id: 20, // Level 2, Session 9
      title: 'Using Nonlocal Variables',
      description: 'Learn to use nonlocal keyword to modify variables from the outer function.',
      difficulty: 'Medium',
      question: `Take two strings (old_name and new_name) as input. Define a function satellite() with a variable holding old_name. Inside it, define rename() that uses nonlocal to change the variable to new_name. Call rename(), then print "Satellite: <new_name>". Call satellite().`,      sample_input: 'Hubble\nJames Webb',
      sample_output: 'Satellite: James Webb',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 120,

      metadata: {
        space_theme: true,
        concepts: ['nonlocal keyword', 'nested scope', 'variable modification', 'enclosing scope', 'scope resolution'],
        estimated_time_minutes: 15
      },
      // Session-level content
      session_title: 'Session 9: Nested User-Defined Functions & Function Scope',

      // Case-specific content
      case_number: 3,
      case_title: 'Using Nonlocal Variables',
      case_overview: `Master nonlocal keyword - modify variables from the outer (enclosing) function scope.`,
      case_code: `# Nonlocal with Counter
def counter():
    count = 0

    def add():
        nonlocal count
        count += 5

    def show():
        print(f'Total: {count}')

    add()
    add()
    show()  # Prints: Total: 10

counter()`,
      case_explanation: `Use nonlocal keyword to modify variables from the outer function's scope. Without it, assignment creates a new local variable instead of modifying the outer one.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 111 if it exists
    await problemsCollection.deleteOne({ problem_id: 111 });
    await testCasesCollection.deleteMany({ problem_id: 111 });

    // Insert problem 111
    const problemResult = await problemsCollection.insertOne(problem111);
    console.log('Problem 111 inserted');

    // Test cases for Problem 111 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1111,
        problem_id: 111,
        input: 'Hubble\nJames Webb',
        expected_output: 'Satellite: James Webb',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1112,
        problem_id: 111,
        input: 'Voyager\nPioneer',
        expected_output: 'Satellite: Pioneer',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1113,
        problem_id: 111,
        input: 'Sputnik\nGalileo',
        expected_output: 'Satellite: Galileo',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1114,
        problem_id: 111,
        input: 'Cassini\nJuno',
        expected_output: 'Satellite: Juno',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1115,
        problem_id: 111,
        input: 'Kepler\nTESS',
        expected_output: 'Satellite: TESS',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1116,
        problem_id: 111,
        input: 'Chandra\nNuSTAR',
        expected_output: 'Satellite: NuSTAR',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1117,
        problem_id: 111,
        input: 'Spitzer\nEuclid',
        expected_output: 'Satellite: Euclid',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 111`);

    console.log('\n✅ Problem 111 (Level 2, Session 9, Case 3: Using Nonlocal Variables) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem111()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
