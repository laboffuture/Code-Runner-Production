import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem48() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 48: Session 10, Case 3 - Using Step in Range
    const problem48 = {
      problem_id: 48,
      session_id: 10,
      title: 'Using Step in Range',
      description: 'Use range(start, stop, step) to control the increment or decrement between numbers.',
      difficulty: 'Hard',
      question: `Use input() to get a start temperature (convert to integer).
Use input() to get a stop temperature (convert to integer).
Use input() to get a step value (convert to integer).
Use a for loop with range(start, stop, step) to iterate with the given step.
Inside the loop, print "Temperature: " followed by the current temperature.`,
      example_code: '# Write your code here\n',
      sample_input: '100\n60\n-10',
      sample_output: 'Temperature: 100\nTemperature: 90\nTemperature: 80\nTemperature: 70',
      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect user data
- Convert string input to integers using int()
- Use range() with three parameters (start, stop, step)
- Understand positive step values for counting up
- Understand negative step values for counting down
- Print formatted output with specific spacing
- Understand how step determines the increment/decrement between numbers`,

      concepts: `- For Loops: Iterating through custom sequences with step values
- range(start, stop, step): Creating sequences with custom increments
- Positive Step: Counting up with specified intervals
- Negative Step: Counting down with specified intervals
- Step Value: The difference between consecutive numbers in the sequence
- Stop Value Exclusion: range still excludes the stop value regardless of step
- Increment/Decrement Control: Using step to control sequence progression`,

      metadata: {
        concepts: ['range', 'for-loop', 'loops', 'step', 'iteration', 'increment-decrement'],
        space_theme: true,
        estimated_time_minutes: 15
      },
      // Case-specific content
      case_number: 3,
      case_title: 'Using Step in Range',
      case_overview: `Use range(start, stop, step) to control the increment or decrement between numbers.`,

      case_code: `# Get start, stop, and step from user
start = int(input())
stop = int(input())
step = int(input())

# Loop with custom step value
for temp in range(start, stop, step):
    print("Temperature:", temp)`,

      case_explanation: `- \`range(start, stop, step)\` controls the increment/decrement
- Positive step: counts up (e.g., \`range(0, 10, 2)\` → 0, 2, 4, 6, 8)
- Negative step: counts down (e.g., \`range(100, 60, -10)\` → 100, 90, 80, 70)
- Step determines the difference between consecutive numbers
- Stop value is still excluded
- Use \`input()\` three times for start, stop, step
- Convert all to integers
- Use \`for temp in range(start, stop, step):\` to iterate
- Inside loop (indented): \`print("Temperature:", temp)\`
- Negative step makes the sequence count backwards
- Make sure to use exact output format with space after colon`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 48
    const testCases48 = [
      {
        problem_id: 48,
        test_case_id: 1,
        input: '100\n60\n-10',
        expected_output: 'Temperature: 100\nTemperature: 90\nTemperature: 80\nTemperature: 70',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 48,
        test_case_id: 2,
        input: '0\n20\n5',
        expected_output: 'Temperature: 0\nTemperature: 5\nTemperature: 10\nTemperature: 15',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 48,
        test_case_id: 3,
        input: '50\n10\n-8',
        expected_output: 'Temperature: 50\nTemperature: 42\nTemperature: 34\nTemperature: 26\nTemperature: 18',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 48,
        test_case_id: 4,
        input: '10\n50\n10',
        expected_output: 'Temperature: 10\nTemperature: 20\nTemperature: 30\nTemperature: 40',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 48
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 48 },
      { $set: problem48 },
      { upsert: true }
    );

    console.log('Problem 48 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 48
    await testCasesCollection.deleteMany({ problem_id: 48 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases48);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 48 (Session 10, Case 3: Using Step in Range) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem48()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
