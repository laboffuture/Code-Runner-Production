import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem67() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 67: Level 2, Session 2, Case 1 - Basic While Loop
    const problem67 = {
      problem_id: 67,
      session_id: 13, // Level 2, Session 2
      title: 'Basic While Loop',
      description: 'Learn the fundamentals of while loops by printing numbers from 1 to 10.',
      difficulty: 'Intro',
      question: `Create a program that prints countdown numbers from a starting value down to 1. Take one integer input as the starting number and display each number on a new line.`,      sample_input: '5',
      sample_output: '5\n4\n3\n2\n1',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['while loops', 'counters', 'loop conditions', 'incrementing'],
        estimated_time_minutes: 10
      },
      // Session-level content
      session_title: 'Session 2: Basic While Loop',

      // Case-specific content
      case_number: 1,
      case_title: 'While Loop',
      case_overview: `Learn to create a simple while loop that counts from 1 to 10. Master the three essential components: initialization, condition, and increment.`,
      case_explanation: `Initialize a counter variable before the loop, check the condition in while, and update the counter inside the loop body.`,
      case_code: `# While Loop - Sum accumulator
total = 0
num = int(input())

while num > 0:
    total += num
    num = int(input())

print(f"Total: {total}")

# Accumulates input values until 0 is entered
# Different from simple counting`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 67 if it exists
    await problemsCollection.deleteOne({ problem_id: 67 });
    await testCasesCollection.deleteMany({ problem_id: 67 });

    // Insert problem 67
    const problemResult = await problemsCollection.insertOne(problem67);
    console.log('Problem 67 inserted');

    // Test cases for Problem 67
    const testCases = [
      // Visible test cases
      {
        test_case_id: 671,
        problem_id: 67,
        input: '5',
        expected_output: '5\n4\n3\n2\n1',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 672,
        problem_id: 67,
        input: '3',
        expected_output: '3\n2\n1',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 673,
        problem_id: 67,
        input: '10',
        expected_output: '10\n9\n8\n7\n6\n5\n4\n3\n2\n1',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 674,
        problem_id: 67,
        input: '7',
        expected_output: '7\n6\n5\n4\n3\n2\n1',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 675,
        problem_id: 67,
        input: '1',
        expected_output: '1',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 676,
        problem_id: 67,
        input: '8',
        expected_output: '8\n7\n6\n5\n4\n3\n2\n1',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 677,
        problem_id: 67,
        input: '15',
        expected_output: '15\n14\n13\n12\n11\n10\n9\n8\n7\n6\n5\n4\n3\n2\n1',
        is_hidden: true,
        weight: 15
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 67`);

    console.log('\n✅ Problem 67 (Level 2, Session 2, Case 1: Basic While Loop) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem67()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
