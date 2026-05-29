import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem24() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    const problem24 = {
      problem_id: 24,
      session_id: 5,
      title: 'Using Multiple Conditions with elif',
      description: 'Learn to handle multiple conditions using elif statements.',
      difficulty: 'Easy',
      question: `Write a program that asks the user for a test score (0-100). Print the grade based on these conditions:
- If score >= 90, print "Grade: A"
- If score >= 80, print "Grade: B"
- If score >= 70, print "Grade: C"
- If score >= 60, print "Grade: D"
- Otherwise, print "Grade: F"`,
      example_code: '# Write your code here\n',
      sample_input: '95',
      sample_output: 'Grade: A',

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect test score data
- Convert input to integer using int()
- Use comparison operators (>=) to check multiple conditions
- Use if-elif-else statement to handle multiple cases
- Print appropriate output for each condition`,

      concepts: `- Conditionals: Making decisions with if-elif-else statements
- Comparison Operators: Using >= to compare values
- Input/Output: Reading user input and displaying results
- Type Conversion: Converting strings to integers
- Control Flow: Choosing between multiple code paths`,

      metadata: {
        concepts: ['conditionals', 'elif', 'multiple-conditions', 'input', 'type-conversion'],
        space_theme: true,
        estimated_time_minutes: 20
      },

      // Case-specific content
      case_number: 4,
      case_title: 'Using Multiple Conditions with elif',
      case_overview: `Handle multiple conditions using if-elif-else chains.`,
      case_code: `# Sample Example:
altitude = int(input())
if altitude > 10000:
    print("High altitude")
elif altitude > 5000:
    print("Medium altitude")
else:
    print("Low altitude")`,
      case_explanation: `if condition1:
    # Runs if condition1 is True
elif condition2:
    # Runs if condition1 is False and condition2 is True
else:
    # Runs if all conditions are False`,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Test cases for Problem 24
    const testCases = [
      {
        problem_id: 24,
        test_case_id: 1,
        input: '95',
        expected_output: 'Grade: A',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 24,
        test_case_id: 2,
        input: '85',
        expected_output: 'Grade: B',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 24,
        test_case_id: 3,
        input: '75',
        expected_output: 'Grade: C',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 24,
        test_case_id: 4,
        input: '65',
        expected_output: 'Grade: D',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 24,
        test_case_id: 5,
        input: '50',
        expected_output: 'Grade: F',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 24,
        test_case_id: 6,
        input: '90',
        expected_output: 'Grade: A',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
    ];

    const result = await problemsCollection.updateOne(
      { problem_id: 24 },
      { $set: problem24 },
      { upsert: true }
    );

    console.log('Problem 24 upserted:', result.upsertedId || 'Updated existing');

    await testCasesCollection.deleteMany({ problem_id: 24 });
    const testResult = await testCasesCollection.insertMany(testCases);
    console.log('Test cases inserted:', testResult.insertedCount);

    console.log('\n✅ Problem 24 (Session 5, Case 4: Using Multiple Conditions with elif) seeded successfully!');
    console.log('   📊 Test cases: 1 visible + 5 hidden');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem24()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
