import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem61() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 61: Level 2, Session 1, Case 1 - Simple Nested Loop
    const problem61 = {
      problem_id: 61,
      session_id: 12, // Level 2, Session 1
      title: 'Simple Nested Loop',
      description: 'Learn how to execute one loop inside another loop to create multi-level iterations.',
      difficulty: 'Medium',
      question: `Create a program that displays all mission-checkpoint pairs. Take two numbers as input: total missions and checkpoints per mission. Display each combination as "Mission [number] - [number]" starting from 1.`,      sample_input: '2\n3',
      sample_output: `Mission 1 - 1
Mission 1 - 2
Mission 1 - 3
Mission 2 - 1
Mission 2 - 2
Mission 2 - 3`,
      age_group: '11-14',
      level_number: 2,

      metadata: {
        concepts: ['nested loops', 'for loops', 'range', 'iteration', 'indentation'],
        space_theme: false,
        story_linked: false,
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 1: Nested Loops',

      // Case-specific content
      case_number: 1,
      case_title: 'Simple Nested Loop',
      case_overview: `Learn how to execute one loop inside another loop to create multi-level iterations for handling missions and checkpoints.`,
      case_explanation: `Outer loop runs completely, and for each iteration of outer loop, the entire inner loop executes.`,
      case_code: `# Print a pattern where each row has increasing stars
height = int(input())

for row in range(1, height + 1):
    # Print row number
    print(f"Row {row}:", end=" ")
    # Print stars equal to row number
    for star in range(row):
        print("*", end="")
    print()  # New line after each row`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 61 - 8 test cases
    const testCases61 = [
      {
        test_case_id: 611,
        problem_id: 61,
        input: '2\n3',
        expected_output: 'Mission 1 - 1\nMission 1 - 2\nMission 1 - 3\nMission 2 - 1\nMission 2 - 2\nMission 2 - 3',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 612,
        problem_id: 61,
        input: '1\n2',
        expected_output: 'Mission 1 - 1\nMission 1 - 2',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 613,
        problem_id: 61,
        input: '3\n2',
        expected_output: 'Mission 1 - 1\nMission 1 - 2\nMission 2 - 1\nMission 2 - 2\nMission 3 - 1\nMission 3 - 2',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 614,
        problem_id: 61,
        input: '2\n4',
        expected_output: 'Mission 1 - 1\nMission 1 - 2\nMission 1 - 3\nMission 1 - 4\nMission 2 - 1\nMission 2 - 2\nMission 2 - 3\nMission 2 - 4',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 615,
        problem_id: 61,
        input: '4\n3',
        expected_output: 'Mission 1 - 1\nMission 1 - 2\nMission 1 - 3\nMission 2 - 1\nMission 2 - 2\nMission 2 - 3\nMission 3 - 1\nMission 3 - 2\nMission 3 - 3\nMission 4 - 1\nMission 4 - 2\nMission 4 - 3',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 616,
        problem_id: 61,
        input: '1\n5',
        expected_output: 'Mission 1 - 1\nMission 1 - 2\nMission 1 - 3\nMission 1 - 4\nMission 1 - 5',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 617,
        problem_id: 61,
        input: '3\n1',
        expected_output: 'Mission 1 - 1\nMission 2 - 1\nMission 3 - 1',
        is_hidden: true,
        weight: 10
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 61 });
    await problemsCollection.insertOne(problem61);
    console.log('Problem 61 inserted');

    await testCasesCollection.deleteMany({ problem_id: 61 });
    await testCasesCollection.insertMany(testCases61);
    console.log(`${testCases61.length} test cases inserted for Problem 61`);

    console.log('\n✅ Problem 61 (Level 2, Session 1, Case 1: Grid Pattern Generator) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem61()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
