import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem21() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    const problem21 = {
      problem_id: 21,
      session_id: 5,
      title: 'Simple If Statement',
      description: 'Learn to use the if statement to check a condition.',
      difficulty: 'Easy',
      question: `Write a program that asks the user for the temperature in degrees Celsius. If the temperature is greater than 30, print "It's a hot day!"`,
      example_code: '# Write your code here\n',
      sample_input: '35',
      sample_output: "It's a hot day!",

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect temperature data
- Convert input to integer using int()
- Use comparison operator (>) to check conditions
- Use if statement to execute code conditionally
- Print output only when condition is met`,

      concepts: `- Conditionals: Making decisions with if statements
- Comparison Operators: Using > to compare values
- Input/Output: Reading user input and displaying results
- Type Conversion: Converting strings to integers`,

      metadata: {
        concepts: ['conditionals', 'if-statement', 'comparison-operators', 'input', 'type-conversion'],
        space_theme: true,
        estimated_time_minutes: 15
      },

      // Case-specific content
      case_number: 1,
      case_title: 'Simple If Statement',
      case_overview: `Check a condition and run a block of code only if it's true.`,
      case_code: `# Sample Example:
speed = int(input())
if speed > 50:
    print("Speed is too high!")`,
      case_explanation: `The if statement executes code only when a condition is True.`,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Test cases for Problem 21
    const testCases = [
      {
        problem_id: 21,
        test_case_id: 1,
        input: '35',
        expected_output: "It's a hot day!",
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 21,
        test_case_id: 2,
        input: '31',
        expected_output: "It's a hot day!",
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 21,
        test_case_id: 3,
        input: '25',
        expected_output: '',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 21,
        test_case_id: 4,
        input: '100',
        expected_output: "It's a hot day!",
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 21,
        test_case_id: 5,
        input: '30',
        expected_output: '',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
    ];

    const result = await problemsCollection.updateOne(
      { problem_id: 21 },
      { $set: problem21 },
      { upsert: true }
    );

    console.log('Problem 21 upserted:', result.upsertedId || 'Updated existing');

    await testCasesCollection.deleteMany({ problem_id: 21 });
    const testResult = await testCasesCollection.insertMany(testCases);
    console.log('Test cases inserted:', testResult.insertedCount);

    console.log('\n✅ Problem 21 (Session 5, Case 1: Simple If Statement) seeded successfully!');
    console.log('   📊 Test cases: 1 visible + 4 hidden');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem21()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
