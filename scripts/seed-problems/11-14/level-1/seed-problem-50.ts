import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem50() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 50: Session 10, Case 5 - Nested Loops with Range
    const problem50 = {
      problem_id: 50,
      session_id: 10,
      title: 'Nested Loops with Range',
      description: 'Use nested for loops with range() to create multi-level iterations.',
      difficulty: 'Hard',
      question: `Use input() to get the number of stages (convert to integer).
Use input() to get the number of systems (convert to integer).
Use nested for loops: outer loop with range(1, stages + 1) and inner loop with range(1, systems + 1).
In the outer loop, print "Stage " followed by the stage number.
In the inner loop, print " -> Checking system " followed by the system number.`,
      example_code: '# Write your code here\n',
      sample_input: '3\n2',
      sample_output: 'Stage 1\n -> Checking system 1\n -> Checking system 2\nStage 2\n -> Checking system 1\n -> Checking system 2\nStage 3\n -> Checking system 1\n -> Checking system 2',
      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect user data
- Convert string input to integers using int()
- Create nested for loops (loop within a loop)
- Use range() with start and stop parameters
- Understand hierarchical iteration (inner loop completes fully for each outer iteration)
- Print formatted output at different nesting levels
- Master multiple levels of indentation`,

      concepts: `- Nested Loops: Placing one loop inside another loop
- range() Function: Creating number sequences starting from 1
- Hierarchical Iteration: Inner loop executes completely for each outer loop iteration
- Multi-Level Indentation: Understanding 4, 8, and 12 space indentation
- Loop Nesting: Outer loop controls stages, inner loop controls systems
- Complete Inner Execution: Inner loop finishes all iterations before outer continues`,

      metadata: {
        concepts: ['range', 'for-loop', 'nested-loops', 'iteration', 'multi-level', 'final-task'],
        space_theme: true,
        estimated_time_minutes: 18
      },
      // Case-specific content
      case_number: 5,
      case_title: 'Nested Loops with Range',
      case_overview: `Use nested for loops with range() to create multi-level iterations.`,

      case_code: `# Get stages and systems from user
stages = int(input())
systems = int(input())

# Outer loop for stages
for stage in range(1, stages + 1):
    print("Stage", stage)
    # Inner loop for systems
    for system in range(1, systems + 1):
        print(" -> Checking system", system)`,

      case_explanation: `- Nested loops with \`range()\` create hierarchical iterations where the inner loop completes fully for each outer loop iteration
- The outer loop runs for each stage, and the inner loop runs completely for each stage iteration
- Use \`input()\` twice for stages and systems, converting both to integers
- Outer loop: \`for stage in range(1, stages + 1):\`
- Print in outer: \`print("Stage", stage)\`
- Inner loop: \`for system in range(1, systems + 1):\`
- Print in inner: \`print(" -> Checking system", system)\`
- Note the arrow symbol (->) and leading space in the system print
- The inner loop executes fully for each outer iteration`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 50
    const testCases50 = [
      {
        problem_id: 50,
        test_case_id: 1,
        input: '3\n2',
        expected_output: 'Stage 1\n -> Checking system 1\n -> Checking system 2\nStage 2\n -> Checking system 1\n -> Checking system 2\nStage 3\n -> Checking system 1\n -> Checking system 2',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 50,
        test_case_id: 2,
        input: '2\n3',
        expected_output: 'Stage 1\n -> Checking system 1\n -> Checking system 2\n -> Checking system 3\nStage 2\n -> Checking system 1\n -> Checking system 2\n -> Checking system 3',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 50,
        test_case_id: 3,
        input: '4\n2',
        expected_output: 'Stage 1\n -> Checking system 1\n -> Checking system 2\nStage 2\n -> Checking system 1\n -> Checking system 2\nStage 3\n -> Checking system 1\n -> Checking system 2\nStage 4\n -> Checking system 1\n -> Checking system 2',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 50,
        test_case_id: 4,
        input: '2\n4',
        expected_output: 'Stage 1\n -> Checking system 1\n -> Checking system 2\n -> Checking system 3\n -> Checking system 4\nStage 2\n -> Checking system 1\n -> Checking system 2\n -> Checking system 3\n -> Checking system 4',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 50
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 50 },
      { $set: problem50 },
      { upsert: true }
    );

    console.log('Problem 50 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 50
    await testCasesCollection.deleteMany({ problem_id: 50 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases50);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 50 (Session 10, Case 5: Nested Loops with Range) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem50()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
