import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem42() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 42: Session 9, Case 2 - For Loop with range()
    const problem42 = {
      problem_id: 42,
      session_id: 9,
      title: 'For Loop with range()',
      description: 'Use range(start, stop) to repeat something a specific number of times.',
      difficulty: 'Medium',
      question: `Use input() to get a start number (convert to integer).
Use input() to get an end number (convert to integer).
Use a for loop with range(start, end + 1) to iterate from start to end (inclusive).
Inside the loop, print "Level " followed by the current number.`,
      example_code: '# Write your code here\n',
      sample_input: '1\n3',
      sample_output: 'Level 1\nLevel 2\nLevel 3',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['loops', 'for-loop', 'range', 'iteration', 'range-function'],
        space_theme: true,
        estimated_time_minutes: 12,
        test_protocol: 'Students should use range() function with for loop to generate number sequences'
      },
      // Case-specific content
      case_number: 2,
      case_title: 'For Loop with range()',
      case_overview: `Use range(start, stop) to repeat something a specific number of times.`,
      case_code: `# Sample Example:
for i in range(1, 6):
    print("Rocket Stage", i)

# Now you try this for our task`,
      case_explanation: `range(start, stop) generates numbers from start up to (but not including) stop. range(1, 6) produces: 1, 2, 3, 4, 5. To include the end number, use range(start, end + 1). The loop variable takes each value in the sequence.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 42
    const testCases42 = [
      {
        problem_id: 42,
        test_case_id: 1,
        input: '1\n3',
        expected_output: 'Level 1\nLevel 2\nLevel 3',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 42,
        test_case_id: 2,
        input: '5\n8',
        expected_output: 'Level 5\nLevel 6\nLevel 7\nLevel 8',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 42,
        test_case_id: 3,
        input: '10\n12',
        expected_output: 'Level 10\nLevel 11\nLevel 12',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 42
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 42 },
      { $set: problem42 },
      { upsert: true }
    );

    console.log('Problem 42 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 42
    await testCasesCollection.deleteMany({ problem_id: 42 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases42);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 42 (Session 9, Case 2: For Loop with range()) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem42()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
