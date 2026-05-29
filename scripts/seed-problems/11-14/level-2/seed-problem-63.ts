import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem63() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 63: Level 2, Session 1, Case 3 - Nested Loops with Variable Steps
    const problem63 = {
      problem_id: 63,
      session_id: 12, // Level 2, Session 1
      title: 'Nested Loops with Variable Steps',
      description: 'Master nested loops using custom step values including negative steps for countdown sequences.',
      difficulty: 'Medium',
      question: `Create a program that displays engine-thrust combinations with custom intervals. Take three inputs: number of engines, maximum thrust level, and step value. Display "Engine [number] - [thrust]" for each combination, where thrust goes from 0 to maximum using the step interval.`,      sample_input: '2\n20\n10',
      sample_output: `Engine 1 - 0
Engine 1 - 10
Engine 1 - 20
Engine 2 - 0
Engine 2 - 10
Engine 2 - 20`,

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: false,
        story_linked: false,
        estimated_time_minutes: 20
      },
      // Session-level content
      session_title: 'Session 1: Nested Loops',

      // Case-specific content
      case_number: 3,
      case_title: 'Nested Loops with Variable Steps',
      case_overview: `Master nested loops using custom step values to iterate through engines and thrust levels with variable increments.`,
      case_explanation: `Use the third parameter of range() to control how much to skip between iterations in your inner loop.`,
      case_code: `# Countdown timer with custom intervals using nested loops
timers = int(input())
start_time = int(input())
interval = int(input())

# Outer loop for different timers
for timer_num in range(1, timers + 1):
    print(f"Timer {timer_num}:")
    # Inner loop counts down with custom interval
    for time in range(start_time, -1, -interval):
        print(f"  {time} seconds")`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 63 if it exists
    await problemsCollection.deleteOne({ problem_id: 63 });
    await testCasesCollection.deleteMany({ problem_id: 63 });

    // Insert problem 63
    const problemResult = await problemsCollection.insertOne(problem63);
    console.log('Problem 63 inserted');

    // Test cases for Problem 63 - 8 test cases
    const testCases = [
      {
        test_case_id: 631,
        problem_id: 63,
        input: '2\n20\n10',
        expected_output: 'Engine 1 - 0\nEngine 1 - 10\nEngine 1 - 20\nEngine 2 - 0\nEngine 2 - 10\nEngine 2 - 20',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 632,
        problem_id: 63,
        input: '1\n30\n15',
        expected_output: 'Engine 1 - 0\nEngine 1 - 15\nEngine 1 - 30',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 633,
        problem_id: 63,
        input: '3\n10\n5',
        expected_output: 'Engine 1 - 0\nEngine 1 - 5\nEngine 1 - 10\nEngine 2 - 0\nEngine 2 - 5\nEngine 2 - 10\nEngine 3 - 0\nEngine 3 - 5\nEngine 3 - 10',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 634,
        problem_id: 63,
        input: '2\n40\n20',
        expected_output: 'Engine 1 - 0\nEngine 1 - 20\nEngine 1 - 40\nEngine 2 - 0\nEngine 2 - 20\nEngine 2 - 40',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 635,
        problem_id: 63,
        input: '4\n15\n5',
        expected_output: 'Engine 1 - 0\nEngine 1 - 5\nEngine 1 - 10\nEngine 1 - 15\nEngine 2 - 0\nEngine 2 - 5\nEngine 2 - 10\nEngine 2 - 15\nEngine 3 - 0\nEngine 3 - 5\nEngine 3 - 10\nEngine 3 - 15\nEngine 4 - 0\nEngine 4 - 5\nEngine 4 - 10\nEngine 4 - 15',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 636,
        problem_id: 63,
        input: '1\n20\n10',
        expected_output: 'Engine 1 - 0\nEngine 1 - 10\nEngine 1 - 20',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 637,
        problem_id: 63,
        input: '3\n30\n10',
        expected_output: 'Engine 1 - 0\nEngine 1 - 10\nEngine 1 - 20\nEngine 1 - 30\nEngine 2 - 0\nEngine 2 - 10\nEngine 2 - 20\nEngine 2 - 30\nEngine 3 - 0\nEngine 3 - 10\nEngine 3 - 20\nEngine 3 - 30',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 63`);

    console.log('\n✅ Problem 63 (Level 2, Session 1, Case 3: Nested Loops with Variable Steps) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem63()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
