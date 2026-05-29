import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem25() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    const problem25 = {
      problem_id: 25,
      session_id: 5,
      title: 'Decision Chain',
      description: 'Combine multiple if-elif-else statements to make complex decisions based on multiple conditions.',
      difficulty: 'Easy',
      question: `Write a program that asks the user for fuel level and altitude. Check the following conditions in order:
- If fuel >= 80 AND altitude >= 5000, print "Launch approved."
- If fuel >= 50 AND altitude >= 3000, print "Launch on standby."
- If fuel < 50, print "Insufficient fuel."
- Otherwise, print "Altitude too low."`,
      example_code: '# Write your code here\n',
      sample_input: '85\n5500',
      sample_output: 'Launch approved.',

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect fuel and altitude data
- Convert inputs to integers using int()
- Use logical operator (and) to combine conditions
- Use if-elif-else statement to handle multiple decision paths
- Print appropriate output for each condition`,

      concepts: `- Conditionals: Making complex decisions with if-elif-else
- Logical Operators: Using 'and' to combine multiple conditions
- Comparison Operators: Using >= and < to compare values
- Input/Output: Reading multiple user inputs and displaying results
- Type Conversion: Converting strings to integers`,

      metadata: {
        concepts: ['conditionals', 'elif', 'multiple-conditions', 'logical-operators', 'decision-making'],
        space_theme: true,
        estimated_time_minutes: 20
      },

      // Case-specific content
      case_number: 5,
      case_title: 'Decision Chain',
      case_overview: `Create a decision chain that checks multiple conditions to determine if a spacecraft can launch.`,
      case_code: `# Sample Example:
speed = int(input())
weather = input()
if speed >= 100 and weather == "clear":
    print("Flight ready")
elif speed >= 100:
    print("Wait for better weather")
elif weather == "clear":
    print("Increase speed")
else:
    print("Not ready")`,
      case_explanation: `How to Approach This Problem:

1. Read fuel level: fuel = int(input())

2. Read altitude: altitude = int(input())

3. Build the decision chain in this exact order:

if fuel >= 80 and altitude >= 5000: → "Launch approved."

elif fuel >= 50 and altitude >= 3000: → "Launch on standby."

elif fuel < 50: → "Insufficient fuel."

else: → "Altitude too low."

Order matters! Check the best condition first and work down.`,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Test cases for Problem 25
    const testCases = [
      {
        problem_id: 25,
        test_case_id: 1,
        input: '85\n5500',
        expected_output: 'Launch approved.',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 25,
        test_case_id: 2,
        input: '60\n4000',
        expected_output: 'Launch on standby.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 25,
        test_case_id: 3,
        input: '40\n6000',
        expected_output: 'Insufficient fuel.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 25,
        test_case_id: 4,
        input: '90\n2000',
        expected_output: 'Altitude too low.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
      {
        problem_id: 25,
        test_case_id: 5,
        input: '80\n5000',
        expected_output: 'Launch approved.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date(),
      },
    ];

    const result = await problemsCollection.updateOne(
      { problem_id: 25 },
      { $set: problem25 },
      { upsert: true }
    );

    console.log('Problem 25 upserted:', result.upsertedId || 'Updated existing');

    await testCasesCollection.deleteMany({ problem_id: 25 });
    const testResult = await testCasesCollection.insertMany(testCases);
    console.log('Test cases inserted:', testResult.insertedCount);

    console.log('\n✅ Problem 25 (Session 5, Case 5: Decision Chain) seeded successfully!');
    console.log('   📊 Test cases: 1 visible + 4 hidden');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem25()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
