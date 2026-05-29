import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem46() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 46: Session 10, Case 1 - Basic Range Loop
    const problem46 = {
      problem_id: 46,
      session_id: 10,
      title: 'Basic Range Loop',
      description: 'Use range() to generate a sequence of numbers for iteration.',
      difficulty: 'Hard',
      question: `Use input() to get a number (convert to integer).
Use a for loop with range(n) to iterate from 0 to n-1.
Inside the loop, print "Step " followed by the current number.`,
      example_code: '# Write your code here\n',
      sample_input: '4',
      sample_output: 'Step 0\nStep 1\nStep 2\nStep 3',
      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect user data
- Convert string input to integers using int()
- Use for loops to iterate through sequences
- Use range(n) to generate numbers from 0 to n-1
- Print formatted output with variables
- Understand zero-based counting in Python`,

      concepts: `- For Loops: Iterating through sequences with for loop syntax
- range() Function: Generating number sequences from 0 to n-1
- Zero-Based Counting: Understanding that range(n) starts at 0
- Loop Variables: Using the loop counter in print statements
- String Formatting: Creating output with text and numbers
- Stop Value Exclusion: range(n) excludes n itself`,

      metadata: {
        concepts: ['range', 'for-loop', 'loops', 'basics', 'iteration'],
        space_theme: true,
        estimated_time_minutes: 10
      },
      // Case-specific content
      case_number: 1,
      case_title: 'Basic Range Loop',
      case_overview: `Use range() to generate a sequence of numbers for iteration.`,

      case_code: `# Get the number from user
n = int(input())

# Loop from 0 to n-1
for i in range(n):
    print("Step", i)`,

      case_explanation: `- \`range(n)\` generates numbers from 0 to n-1
- \`range(5)\` produces: 0, 1, 2, 3, 4 (always starts from 0 by default)
- Excludes the stop value (n is not included)
- Use \`n = int(input())\` to get and convert the number
- Use \`for i in range(n):\` to iterate
- Inside loop (indented): \`print("Step", i)\`
- Make sure to use exact output format with space after "Step"`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 46
    const testCases46 = [
      {
        problem_id: 46,
        test_case_id: 1,
        input: '4',
        expected_output: 'Step 0\nStep 1\nStep 2\nStep 3',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 46,
        test_case_id: 2,
        input: '6',
        expected_output: 'Step 0\nStep 1\nStep 2\nStep 3\nStep 4\nStep 5',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 46,
        test_case_id: 3,
        input: '3',
        expected_output: 'Step 0\nStep 1\nStep 2',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 46
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 46 },
      { $set: problem46 },
      { upsert: true }
    );

    console.log('Problem 46 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 46
    await testCasesCollection.deleteMany({ problem_id: 46 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases46);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 46 (Session 10, Case 1: Basic Range Loop) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem46()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
