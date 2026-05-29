import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem44() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 44: Session 9, Case 4 - Nested For Loop
    const problem44 = {
      problem_id: 44,
      session_id: 9,
      title: 'Nested For Loop',
      description: 'A loop inside another loop is called a nested loop.',
      difficulty: 'Medium',
      question: `Use input() to get the outer range end (convert to integer).
Use input() to get the inner range end (convert to integer).
Use nested for loops: outer loop with range(1, outer_end + 1) and inner loop with range(1, inner_end + 1).
Inside the inner loop, print the coordinates in format: (x, y) using print(f"({x}, {y})").`,
      example_code: '# Write your code here\n',
      sample_input: '2\n3',
      sample_output: '(1, 1)\n(1, 2)\n(1, 3)\n(2, 1)\n(2, 2)\n(2, 3)',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['loops', 'for-loop', 'nested-loops', 'iteration', 'cartesian-product'],
        space_theme: true,
        estimated_time_minutes: 15,
        test_protocol: 'Students should use nested for loops to generate all combinations'
      },
      // Case-specific content
      case_number: 4,
      case_title: 'Nested For Loop',
      case_overview: `A loop inside another loop is called a nested loop.`,
      case_code: `# Sample Example:
for x in ["A", "B"]:
    for y in [1, 2]:
        print(x, y)

# Now you try this for our task`,
      case_explanation: `Outer loop runs over letters/numbers. Inner loop runs completely for each outer iteration. Indentation: 4 spaces for outer loop, 8 spaces for inner loop, 12 spaces for inner body. Creates all combinations (Cartesian product).`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 44
    const testCases44 = [
      {
        problem_id: 44,
        test_case_id: 1,
        input: '2\n3',
        expected_output: '(1, 1)\n(1, 2)\n(1, 3)\n(2, 1)\n(2, 2)\n(2, 3)',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 44,
        test_case_id: 2,
        input: '3\n2',
        expected_output: '(1, 1)\n(1, 2)\n(2, 1)\n(2, 2)\n(3, 1)\n(3, 2)',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 44,
        test_case_id: 3,
        input: '2\n2',
        expected_output: '(1, 1)\n(1, 2)\n(2, 1)\n(2, 2)',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 44
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 44 },
      { $set: problem44 },
      { upsert: true }
    );

    console.log('Problem 44 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 44
    await testCasesCollection.deleteMany({ problem_id: 44 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases44);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 44 (Session 9, Case 4: Nested For Loop) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem44()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
