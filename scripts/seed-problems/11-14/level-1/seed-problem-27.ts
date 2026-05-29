import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem27() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 27: Session 6, Case 2 - Nested If-Else
    const problem27 = {
      problem_id: 27,
      session_id: 6,
      title: 'Nested If-Else',
      description: 'Learn to use nested if-else statements to handle multiple decision paths based on layered conditions.',
      difficulty: 'Easy',
      question: `Use input() to get speed (convert to integer).
Check if speed >= 50.
If true, print "Speed is sufficient."
Inside that if block, check if speed >= 100.
If true, print "Speed is excellent."
If false, print "Speed is moderate."
If outer condition false (speed < 50), print "Speed too low."`,
      example_code: '# Write your code here\n',
      sample_input: '85',
      sample_output: 'Speed is sufficient.\nSpeed is moderate.',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['nested-if', 'if-else', 'conditionals', 'decision-making', 'comparison-operators'],
        space_theme: true,
        estimated_time_minutes: 12,
        test_protocol: 'Students should use nested if-else to check speed conditions at multiple levels'
      },
      // Case-specific content
      case_number: 2,
      case_title: 'Nested If-Else',
      case_overview: `In this case, you'll learn how to use nested if-else statements to create multiple decision paths. By placing an if-else block inside another if statement, you can handle different scenarios based on layered conditions.`,
      case_code: `# Sample Example:
oxygen_level = int(input("Enter oxygen level: "))
if oxygen_level >= 60:
    print("Oxygen is at acceptable level.")
    if oxygen_level >= 80:
        print("Oxygen is optimal.")
    else:
        print("Oxygen is just above minimum.")
else:
    print("Oxygen too low. Cannot proceed.")

# Now you try for our task`,
      case_explanation: `Outer if checks first condition. If true, execute its block which contains another if-else. The inner if-else creates two paths within the outer condition. If outer condition is false, outer else executes.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 27
    const testCases27 = [
      {
        problem_id: 27,
        test_case_id: 1,
        input: '85',
        expected_output: 'Speed is sufficient.\nSpeed is moderate.',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 27,
        test_case_id: 2,
        input: '120',
        expected_output: 'Speed is sufficient.\nSpeed is excellent.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 27,
        test_case_id: 3,
        input: '30',
        expected_output: 'Speed too low.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 27,
        test_case_id: 4,
        input: '50',
        expected_output: 'Speed is sufficient.\nSpeed is moderate.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 27,
        test_case_id: 5,
        input: '100',
        expected_output: 'Speed is sufficient.\nSpeed is excellent.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 27
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 27 },
      { $set: problem27 },
      { upsert: true }
    );

    console.log('Problem 27 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 27
    await testCasesCollection.deleteMany({ problem_id: 27 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases27);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 27 (Session 6, Case 2: Nested If-Else) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem27()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
