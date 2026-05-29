import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem62() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 62: Level 2, Session 1, Case 2 - Nested Loop with Conditional Logic
    const problem62 = {
      problem_id: 62,
      session_id: 12, // Level 2, Session 1
      title: 'Nested Loop with Conditional Logic',
      description: 'Combine nested loops with conditional statements to make decisions during iteration.',
      difficulty: 'Medium',
      question: `Build a program that prints orbit-sensor combinations and marks sensor #2 as checked. Take two inputs (orbits and sensors per orbit). Display "Orbit [number] - [number]" for each pair. When sensor is 2, print "  OK" on the next line (2 spaces before OK).`,      sample_input: '2\n3',
      sample_output: `Orbit 1 - 1
Orbit 1 - 2
  OK
Orbit 1 - 3
Orbit 2 - 1
Orbit 2 - 2
  OK
Orbit 2 - 3`,
      age_group: '11-14',
      level_number: 2,

      metadata: {
        concepts: ['nested loops', 'conditionals', 'if statement', 'iteration', 'decision making'],
        space_theme: false,
        story_linked: false,
        estimated_time_minutes: 18
      },

      // Session-level content
      session_title: 'Session 1: Nested Loops',

      // Case-specific content
      case_number: 2,
      case_title: 'Nested Loop with Conditional Logic',
      case_overview: `Combine nested loops with conditional statements to check each orbit-sensor combination and flag sensor 2.`,
      case_explanation: `Use nested loops with an if statement inside to check when the inner counter equals a specific value.`,
      case_code: `# Count even numbers in a grid using nested loops
rows = int(input())
cols = int(input())

even_count = 0
for r in range(1, rows + 1):
    for c in range(1, cols + 1):
        number = r * c
        print(f"{r} x {c} = {number}")
        if number % 2 == 0:
            even_count += 1

print(f"Total even products: {even_count}")`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 62 - 8 test cases
    const testCases62 = [
      {
        test_case_id: 621,
        problem_id: 62,
        input: '2\n3',
        expected_output: 'Orbit 1 - 1\nOrbit 1 - 2\n  OK\nOrbit 1 - 3\nOrbit 2 - 1\nOrbit 2 - 2\n  OK\nOrbit 2 - 3',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 622,
        problem_id: 62,
        input: '1\n4',
        expected_output: 'Orbit 1 - 1\nOrbit 1 - 2\n  OK\nOrbit 1 - 3\nOrbit 1 - 4',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 623,
        problem_id: 62,
        input: '3\n2',
        expected_output: 'Orbit 1 - 1\nOrbit 1 - 2\n  OK\nOrbit 2 - 1\nOrbit 2 - 2\n  OK\nOrbit 3 - 1\nOrbit 3 - 2\n  OK',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 624,
        problem_id: 62,
        input: '2\n5',
        expected_output: 'Orbit 1 - 1\nOrbit 1 - 2\n  OK\nOrbit 1 - 3\nOrbit 1 - 4\nOrbit 1 - 5\nOrbit 2 - 1\nOrbit 2 - 2\n  OK\nOrbit 2 - 3\nOrbit 2 - 4\nOrbit 2 - 5',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 625,
        problem_id: 62,
        input: '4\n3',
        expected_output: 'Orbit 1 - 1\nOrbit 1 - 2\n  OK\nOrbit 1 - 3\nOrbit 2 - 1\nOrbit 2 - 2\n  OK\nOrbit 2 - 3\nOrbit 3 - 1\nOrbit 3 - 2\n  OK\nOrbit 3 - 3\nOrbit 4 - 1\nOrbit 4 - 2\n  OK\nOrbit 4 - 3',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 626,
        problem_id: 62,
        input: '1\n2',
        expected_output: 'Orbit 1 - 1\nOrbit 1 - 2\n  OK',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 627,
        problem_id: 62,
        input: '3\n4',
        expected_output: 'Orbit 1 - 1\nOrbit 1 - 2\n  OK\nOrbit 1 - 3\nOrbit 1 - 4\nOrbit 2 - 1\nOrbit 2 - 2\n  OK\nOrbit 2 - 3\nOrbit 2 - 4\nOrbit 3 - 1\nOrbit 3 - 2\n  OK\nOrbit 3 - 3\nOrbit 3 - 4',
        is_hidden: true,
        weight: 10
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 62 });
    await problemsCollection.insertOne(problem62);
    console.log('Problem 62 inserted');

    await testCasesCollection.deleteMany({ problem_id: 62 });
    await testCasesCollection.insertMany(testCases62);
    console.log(`${testCases62.length} test cases inserted for Problem 62`);

    console.log('\n✅ Problem 62 (Level 2, Session 1, Case 2: Nested Loop with Conditional Logic) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem62()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
