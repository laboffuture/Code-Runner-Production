import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem26() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    const problem26 = {
      problem_id: 26,
      session_id: 6,
      title: 'Simple Nested If',
      description: 'Learn to use nested if statements to make multi-level decisions based on multiple conditions.',
      difficulty: 'Easy',
      question: `Use input() to get fuel_level (convert to integer).
Check if fuel_level > 50.
If true, print "Fuel level is sufficient."
Inside that if block, check if fuel_level > 75.
If true, print "Fuel level is excellent."`,
      example_code: '# Write your code here\n',
      sample_input: '80',
      sample_output: 'Fuel level is sufficient.\nFuel level is excellent.',

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect fuel level data
- Convert input to integer using int()
- Use nested if statements for multi-level decisions
- Use comparison operators (>) to check conditions
- Print appropriate messages based on nested conditions`,

      concepts: `- Nested Conditionals: Placing if statements inside other if statements
- Multi-level Decisions: Making sequential decisions based on conditions
- Comparison Operators: Using > to compare values
- Input/Output: Reading user input and displaying results
- Code Indentation: Understanding how indentation defines nested blocks`,

      metadata: {
        concepts: ['nested-if', 'conditionals', 'multi-level-decisions', 'comparison-operators'],
        space_theme: true,
        estimated_time_minutes: 12
      },

      // Case-specific content
      case_number: 1,
      case_title: 'Simple Nested If',
      case_overview: `Learn to use nested if statements to check conditions within conditions, creating multi-level decision-making logic.`,
      case_code: `# Sample Example:
temperature = int(input())
if temperature > 20:
    print("Temperature is comfortable.")
    if temperature > 30:
        print("It's getting hot!")`,
      case_explanation: `Nested If Structure:
● Outer if checks first condition
● If outer condition is True, its code block runs
● Inside that block, you can have another if (nested if)
● The nested if only runs if the outer if was True`,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const testCases26 = [
      {
        problem_id: 26,
        test_case_id: 1,
        input: '80',
        expected_output: 'Fuel level is sufficient.\nFuel level is excellent.',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 26,
        test_case_id: 2,
        input: '60',
        expected_output: 'Fuel level is sufficient.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 26,
        test_case_id: 3,
        input: '40',
        expected_output: '',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 26,
        test_case_id: 4,
        input: '76',
        expected_output: 'Fuel level is sufficient.\nFuel level is excellent.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 26,
        test_case_id: 5,
        input: '50',
        expected_output: '',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    const result = await problemsCollection.updateOne(
      { problem_id: 26 },
      { $set: problem26 },
      { upsert: true }
    );

    console.log('Problem 26 upserted:', result.upsertedId || 'Updated existing');

    await testCasesCollection.deleteMany({ problem_id: 26 });
    const testCasesResult = await testCasesCollection.insertMany(testCases26);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 26 (Session 6, Case 1: Simple Nested If) seeded successfully!');
    console.log('   📊 Test cases: 1 visible + 4 hidden');
    console.log('   ⚠️  CONVERTED: Hardcoded → Input-based');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem26()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
