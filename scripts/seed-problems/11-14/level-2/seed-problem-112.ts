import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem112() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 112: Level 2, Session 9, Case 4 - Using Global Scope
    const problem112 = {
      problem_id: 112,
      session_id: 20, // Level 2, Session 9
      title: 'Using Global Scope',
      description: 'Learn to use global keyword to modify variables defined at module level.',
      difficulty: 'Medium',
      question: `Take two strings (old_mission and new_mission) as input. Create a global variable with old_mission value. Define a function update() that uses global keyword to change it to new_mission. Call update(), then print "Mission: <new_mission>".`,      sample_input: 'Mars\nJupiter',
      sample_output: 'Mission: Jupiter',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 120,

      metadata: {
        space_theme: true,
        concepts: ['global keyword', 'global scope', 'module-level variables', 'variable modification', 'scope rules'],
        estimated_time_minutes: 15
      },
      // Session-level content
      session_title: 'Session 9: Nested User-Defined Functions & Function Scope',

      // Case-specific content
      case_number: 4,
      case_title: 'Using Global Scope',
      case_overview: `Master global keyword - modify variables defined at module level from within functions.`,
      case_code: `# Global Counter Across Functions
count = 0

def increment():
    global count
    count += 1

def decrement():
    global count
    count -= 1

def show():
    print(f'Count: {count}')

increment()
increment()
decrement()
show()  # Prints: Count: 1`,
      case_explanation: `Use global keyword to modify module-level variables from within functions. Without it, assignment creates a new local variable instead of modifying the global one.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 112 if it exists
    await problemsCollection.deleteOne({ problem_id: 112 });
    await testCasesCollection.deleteMany({ problem_id: 112 });

    // Insert problem 112
    const problemResult = await problemsCollection.insertOne(problem112);
    console.log('Problem 112 inserted');

    // Test cases for Problem 112 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1121,
        problem_id: 112,
        input: 'Mars\nJupiter',
        expected_output: 'Mission: Jupiter',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1122,
        problem_id: 112,
        input: 'Venus\nSaturn',
        expected_output: 'Mission: Saturn',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1123,
        problem_id: 112,
        input: 'Apollo\nArtemis',
        expected_output: 'Mission: Artemis',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1124,
        problem_id: 112,
        input: 'Mercury\nNeptune',
        expected_output: 'Mission: Neptune',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1125,
        problem_id: 112,
        input: 'Orion\nDragon',
        expected_output: 'Mission: Dragon',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1126,
        problem_id: 112,
        input: 'Voyager\nPioneer',
        expected_output: 'Mission: Pioneer',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1127,
        problem_id: 112,
        input: 'Galileo\nCassini',
        expected_output: 'Mission: Cassini',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 112`);

    console.log('\n✅ Problem 112 (Level 2, Session 9, Case 4: Using Global Scope) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem112()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
