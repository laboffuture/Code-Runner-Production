import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem64() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 64: Level 2, Session 1, Case 4 - Multiple Layers of Nesting
    const problem64 = {
      problem_id: 64,
      session_id: 12, // Level 2, Session 1
      title: 'Multiple Layers of Nesting',
      description: 'Learn to create three levels of nested loops for handling complex multi-dimensional iterations.',
      difficulty: 'Medium',
      question: `Build a program that prints all station-module-sensor combinations. Take three inputs: number of stations, modules per station, and sensors per module. Display three numbers separated by spaces for each combination, starting from 1.`,      sample_input: '2\n2\n2',
      sample_output: `1 1 1
1 1 2
1 2 1
1 2 2
2 1 1
2 1 2
2 2 1
2 2 2`,

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: false,
        story_linked: false,
        estimated_time_minutes: 25
      },
      // Session-level content
      session_title: 'Session 1: Nested Loops',

      // Case-specific content
      case_number: 4,
      case_title: 'Multiple Layers of Nesting',
      case_overview: `Learn to create three levels of nested loops for handling complex multi-dimensional iterations.`,
      case_explanation: `Place one loop inside another, and then a third loop inside that - each loop handles one dimension of the data.`,
      case_code: `# Generate RGB color value combinations using three nested loops
red_levels = int(input())
green_levels = int(input())
blue_levels = int(input())

# Three nested loops for RGB combinations
for r in range(red_levels):
    for g in range(green_levels):
        for b in range(blue_levels):
            print(f"RGB({r}, {g}, {b})")`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 64 if it exists
    await problemsCollection.deleteOne({ problem_id: 64 });
    await testCasesCollection.deleteMany({ problem_id: 64 });

    // Insert problem 64
    const problemResult = await problemsCollection.insertOne(problem64);
    console.log('Problem 64 inserted');

    // Test cases for Problem 64 - 8 test cases
    const testCases = [
      {
        test_case_id: 641,
        problem_id: 64,
        input: '2\n2\n2',
        expected_output: '1 1 1\n1 1 2\n1 2 1\n1 2 2\n2 1 1\n2 1 2\n2 2 1\n2 2 2',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 642,
        problem_id: 64,
        input: '1\n2\n3',
        expected_output: '1 1 1\n1 1 2\n1 1 3\n1 2 1\n1 2 2\n1 2 3',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 643,
        problem_id: 64,
        input: '2\n3\n2',
        expected_output: '1 1 1\n1 1 2\n1 2 1\n1 2 2\n1 3 1\n1 3 2\n2 1 1\n2 1 2\n2 2 1\n2 2 2\n2 3 1\n2 3 2',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 644,
        problem_id: 64,
        input: '3\n2\n2',
        expected_output: '1 1 1\n1 1 2\n1 2 1\n1 2 2\n2 1 1\n2 1 2\n2 2 1\n2 2 2\n3 1 1\n3 1 2\n3 2 1\n3 2 2',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 645,
        problem_id: 64,
        input: '2\n2\n3',
        expected_output: '1 1 1\n1 1 2\n1 1 3\n1 2 1\n1 2 2\n1 2 3\n2 1 1\n2 1 2\n2 1 3\n2 2 1\n2 2 2\n2 2 3',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 646,
        problem_id: 64,
        input: '1\n3\n2',
        expected_output: '1 1 1\n1 1 2\n1 2 1\n1 2 2\n1 3 1\n1 3 2',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 647,
        problem_id: 64,
        input: '3\n1\n2',
        expected_output: '1 1 1\n1 1 2\n2 1 1\n2 1 2\n3 1 1\n3 1 2',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 64`);

    console.log('\n✅ Problem 64 (Level 2, Session 1, Case 4: Multiple Layers of Nesting) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem64()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
