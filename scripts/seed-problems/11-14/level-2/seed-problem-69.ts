import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem69() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 69: Level 2, Session 2, Case 3 - Using Break in a While Loop
    const problem69 = {
      problem_id: 69,
      session_id: 13, // Level 2, Session 2
      title: 'Using Break in a While Loop',
      description: 'Learn to use the break statement to exit a while loop when a specific condition is met.',
      difficulty: 'Intro',
      question: `Build a navigation system that tracks coordinates. Keep taking X and Y coordinates as input (two numbers per line). When X equals 0, print "Destination reached!" and stop. Otherwise, display "Position: X Y" for each coordinate pair.`,      sample_input: '5\n3\n0\n0',
      sample_output: 'Position: 5 3\nDestination reached!',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['while loops', 'break statement', 'infinite loops', 'loop control'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 2: Basic While Loop',

      // Case-specific content
      case_number: 3,
      case_title: 'Using Break in a While Loop',
      case_overview: `Master the break statement to exit loops early. Create infinite loops with while True and use break to exit when specific conditions are met.`,
      case_explanation: `Use while True for an infinite loop, read input, check your condition, and use break to exit when met.`,
      case_code: `# List builder with capacity limit
capacity = 5
items = []

while len(items) < capacity:
    item = input()
    items.append(item)
    print(f"Added: {item}")

print(f"List full! Total: {len(items)}")

# Uses length check, not break statement
# Automatic exit when condition false`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 69 if it exists
    await problemsCollection.deleteOne({ problem_id: 69 });
    await testCasesCollection.deleteMany({ problem_id: 69 });

    // Insert problem 69
    const problemResult = await problemsCollection.insertOne(problem69);
    console.log('Problem 69 inserted');

    // Test cases for Problem 69
    const testCases = [
      // Visible test cases
      {
        test_case_id: 691,
        problem_id: 69,
        input: '5\n3\n0\n0',
        expected_output: 'Position: 5 3\nDestination reached!',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 692,
        problem_id: 69,
        input: '0\n0',
        expected_output: 'Destination reached!',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 693,
        problem_id: 69,
        input: '10\n20\n5\n8\n0\n0',
        expected_output: 'Position: 10 20\nPosition: 5 8\nDestination reached!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 694,
        problem_id: 69,
        input: '1\n1\n2\n2\n3\n3\n0\n0',
        expected_output: 'Position: 1 1\nPosition: 2 2\nPosition: 3 3\nDestination reached!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 695,
        problem_id: 69,
        input: '100\n50\n0\n25',
        expected_output: 'Position: 100 50\nDestination reached!',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 696,
        problem_id: 69,
        input: '-5\n-10\n0\n0',
        expected_output: 'Position: -5 -10\nDestination reached!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 697,
        problem_id: 69,
        input: '8\n16\n4\n12\n0\n5',
        expected_output: 'Position: 8 16\nPosition: 4 12\nDestination reached!',
        is_hidden: true,
        weight: 15
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 69`);

    console.log('\n✅ Problem 69 (Level 2, Session 2, Case 3: Using Break in a While Loop) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem69()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
