import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem47() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 47: Session 10, Case 2 - Range with Start and Stop
    const problem47 = {
      problem_id: 47,
      session_id: 10,
      title: 'Range with Start and Stop',
      description: 'Use range(start, stop) to control where the sequence begins and ends.',
      difficulty: 'Hard',
      question: `Use input() to get a start number (convert to integer).
Use input() to get a stop number (convert to integer).
Use a for loop with range(start, stop) to iterate from start to stop-1.
Inside the loop, print "Deck Clear " followed by the level number.
Outside the loop (no indentation), print "Scan complete".`,
      example_code: '# Write your code here\n',
      sample_input: '5\n10',
      sample_output: 'Deck Clear 5\nDeck Clear 6\nDeck Clear 7\nDeck Clear 8\nDeck Clear 9\nScan complete',
      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect user data
- Convert string input to integers using int()
- Use range() with two parameters (start, stop)
- Understand that range(start, stop) includes start but excludes stop
- Print formatted output inside a loop
- Execute code outside the loop after all iterations
- Understand indentation and scope (inside vs outside loop)`,

      concepts: `- For Loops: Iterating through custom number ranges
- range(start, stop): Creating sequences from start to stop-1
- Start and Stop Values: Understanding inclusion and exclusion in range
- Loop Scope: Code inside loop runs multiple times, code outside runs once
- Indentation: Determining what code is inside or outside the loop
- Sequential Execution: Loop completes all iterations before continuing`,

      metadata: {
        concepts: ['range', 'for-loop', 'loops', 'start-stop', 'iteration', 'loop-scope'],
        space_theme: true,
        estimated_time_minutes: 12
      },
      // Case-specific content
      case_number: 2,
      case_title: 'Range with Start and Stop',
      case_overview: `Use range(start, stop) to control where the sequence begins and ends.`,

      case_code: `# Get start and stop numbers from user
start = int(input())
stop = int(input())

# Loop from start to stop-1
for level in range(start, stop):
    print("Deck Clear", level)

# This runs once after the loop completes
print("Scan complete")`,

      case_explanation: `- \`range(start, stop)\` includes start but excludes stop
- \`range(5, 10)\` produces: 5, 6, 7, 8, 9
- Code outside the loop runs once after all iterations
- Indentation determines scope (inside vs outside loop)
- Use \`input()\` twice for start and stop, convert both to integers
- Use \`for level in range(start, stop):\` to iterate
- Inside loop (indented 4 spaces): \`print("Deck Clear", level)\`
- Outside loop (no indentation): \`print("Scan complete")\`
- The "Scan complete" message appears only once at the end`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 47
    const testCases47 = [
      {
        problem_id: 47,
        test_case_id: 1,
        input: '5\n10',
        expected_output: 'Deck Clear 5\nDeck Clear 6\nDeck Clear 7\nDeck Clear 8\nDeck Clear 9\nScan complete',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 47,
        test_case_id: 2,
        input: '1\n5',
        expected_output: 'Deck Clear 1\nDeck Clear 2\nDeck Clear 3\nDeck Clear 4\nScan complete',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 47,
        test_case_id: 3,
        input: '10\n15',
        expected_output: 'Deck Clear 10\nDeck Clear 11\nDeck Clear 12\nDeck Clear 13\nDeck Clear 14\nScan complete',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 47
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 47 },
      { $set: problem47 },
      { upsert: true }
    );

    console.log('Problem 47 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 47
    await testCasesCollection.deleteMany({ problem_id: 47 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases47);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 47 (Session 10, Case 2: Range with Start and Stop) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem47()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
