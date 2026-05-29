import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem23() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    const problem23 = {
      problem_id: 23,
      session_id: 5,
      title: 'Using Comparison Operators',
      description: 'Learn to use comparison operators like != to check if values are different.',
      difficulty: 'Easy',
      question: `Write a program that asks the user for a system_status. If the status is not equal to "OK", print "System malfunction detected!"`,
      example_code: '# Write your code here\n',
      sample_input: 'ERROR',
      sample_output: 'System malfunction detected!',

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect system status data
- Use comparison operator (!=) to check inequality
- Use if statement to execute code conditionally
- Work with string comparisons
- Print output when condition is met`,

      concepts: `- Conditionals: Making decisions with if statements
- Comparison Operators: Using != to check if values are different
- Input/Output: Reading user input and displaying results
- String Comparison: Comparing text values`,

      metadata: {
        concepts: ['conditionals', 'comparison-operators', 'not-equal', 'input', 'string-comparison'],
        space_theme: true,
        estimated_time_minutes: 15
      },

      // Case-specific content
      case_number: 3,
      case_title: 'Using Comparison Operators',
      case_overview: `Learn to use different comparison operators, focusing on != (not equal).`,
      case_code: `# Sample Example:
password = input()
if password != "1234":
    print("Access denied!")`,
      case_explanation: `| Operator | Meaning |
|----------|---------|
| == | Equal to |
| != | Not equal to |
| > | Greater than |
| < | Less than |
| >= | Greater than or equal |
| <= | Less than or equal |`,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Test cases for Problem 23
    const testCases = [
      {
        problem_id: 23,
        test_case_id: 1,
        input: 'ERROR',
        expected_output: 'System malfunction detected!',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 23,
        test_case_id: 2,
        input: 'FAIL',
        expected_output: 'System malfunction detected!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 23,
        test_case_id: 3,
        input: 'OK',
        expected_output: '',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 23,
        test_case_id: 4,
        input: 'WARNING',
        expected_output: 'System malfunction detected!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 23,
        test_case_id: 5,
        input: 'ok',
        expected_output: 'System malfunction detected!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
    ];

    const result = await problemsCollection.updateOne(
      { problem_id: 23 },
      { $set: problem23 },
      { upsert: true }
    );

    console.log('Problem 23 upserted:', result.upsertedId || 'Updated existing');

    await testCasesCollection.deleteMany({ problem_id: 23 });
    const testResult = await testCasesCollection.insertMany(testCases);
    console.log('Test cases inserted:', testResult.insertedCount);

    console.log('\n✅ Problem 23 (Session 5, Case 3: Using Comparison Operators) seeded successfully!');
    console.log('   📊 Test cases: 1 visible + 4 hidden');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem23()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
