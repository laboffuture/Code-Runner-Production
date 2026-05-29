import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem43() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 43: Session 9, Case 3 - For Loop with Conditional Logic
    const problem43 = {
      problem_id: 43,
      session_id: 9,
      title: 'For Loop with Conditional Logic',
      description: 'Add if statements inside loops to add logic.',
      difficulty: 'Medium',
      question: `Use input() to get a start number (convert to integer).
Use input() to get an end number (convert to integer).
Use input() to get a divisor number (convert to integer).
Use a for loop with range(start, end + 1) to iterate through numbers.
Inside the loop, check if the number is divisible by the divisor using % divisor == 0.
If true, print the number followed by " is divisible by " followed by the divisor.
If false, print the number followed by " is not divisible by " followed by the divisor.`,
      example_code: '# Write your code here\n',
      sample_input: '10\n15\n3',
      sample_output: '10 is not divisible by 3\n11 is not divisible by 3\n12 is divisible by 3\n13 is not divisible by 3\n14 is not divisible by 3\n15 is divisible by 3',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['loops', 'for-loop', 'conditionals', 'if-else', 'modulo', 'nested-control'],
        space_theme: true,
        estimated_time_minutes: 15,
        test_protocol: 'Students should combine for loops with conditional statements using modulo operator'
      },
      // Case-specific content
      case_number: 3,
      case_title: 'For Loop with Conditional Logic',
      case_overview: `Add if statements inside loops to add logic.`,
      case_code: `# Sample Example:
for number in range(1, 6):
    if number % 2 == 0:
        print(number, "is even")
    else:
        print(number, "is odd")

# Now you try this for our task`,
      case_explanation: `Combine loops with if-else for decision making. Modulo operator % returns remainder of division. number % divisor == 0 means evenly divisible. Indentation: 4 spaces for loop, 8 spaces for if/else.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 43
    const testCases43 = [
      {
        problem_id: 43,
        test_case_id: 1,
        input: '10\n15\n3',
        expected_output: '10 is not divisible by 3\n11 is not divisible by 3\n12 is divisible by 3\n13 is not divisible by 3\n14 is not divisible by 3\n15 is divisible by 3',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 43,
        test_case_id: 2,
        input: '1\n10\n2',
        expected_output: '1 is not divisible by 2\n2 is divisible by 2\n3 is not divisible by 2\n4 is divisible by 2\n5 is not divisible by 2\n6 is divisible by 2\n7 is not divisible by 2\n8 is divisible by 2\n9 is not divisible by 2\n10 is divisible by 2',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 43,
        test_case_id: 3,
        input: '20\n25\n5',
        expected_output: '20 is divisible by 5\n21 is not divisible by 5\n22 is not divisible by 5\n23 is not divisible by 5\n24 is not divisible by 5\n25 is divisible by 5',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 43
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 43 },
      { $set: problem43 },
      { upsert: true }
    );

    console.log('Problem 43 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 43
    await testCasesCollection.deleteMany({ problem_id: 43 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases43);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 43 (Session 9, Case 3: For Loop with Conditional Logic) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem43()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
