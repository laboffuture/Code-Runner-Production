import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem20() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 20: Session 4, Case 5 - Ternary Operator (Final Task)
    const problem20 = {
      problem_id: 20,
      session_id: 4,
      title: 'Ternary Operator',
      description: 'Build a mission status checker that uses the ternary operator to quickly determine whether the mission is ready based on battery level and system readiness.',
      question: `Create a variable battery_level and assign it a value.
Create a variable system_ready and assign it a value (True or False).
Use a ternary operator to determine the mission status.
The mission is ready if:
battery_level >= 60
AND system_ready is True
Store the result in a variable called mission_status.
Print the mission status.`,
      difficulty: 'Easy',
      example_code: '# Build your Mission Logic System\n# Your code here:\n',
      sample_input: '',
      sample_output: 'Mission Ready',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['arithmetic operators', 'assignment operators', 'logical operators', 'conditionals', 'if-else', 'boolean logic', 'decision making'],
        space_theme: true,
        estimated_time_minutes: 15,
        test_protocol: 'Students should create fuel_level=100, oxygen_level=80, engine_ready=True, reduce fuel by 25 using -=, check all three conditions with and, and print "Launch Approved!" or "Launch Denied!" based on conditions'
      },
      // Case-specific content
      case_number: 5,
      case_title: 'Ternary Operator',
      case_overview: `This Python program will combines all operator types to create a mission launch approval system.`,
      case_code: `# Sample Example:
battery_level = 80
system_ready = False
mission_status = "Launch Approved" if battery_level > 75 and system_ready else "Launch Delayed"
print(mission_status)

# Now try for our task.`,
      case_explanation: `● The ternary operator syntax in Python is:
  value_if_true if condition else value_if_false
● Use and to combine multiple conditions.
● The entire decision can be written in one line using the ternary operator.
● If both conditions are true → "Mission Ready"
● Otherwise → "Mission Not Ready"`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 20
    const testCases20 = [
      {
        problem_id: 20,
        test_case_id: 1,
        input: '',
        expected_output: 'Mission Ready',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 20
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 20 },
      { $set: problem20 },
      { upsert: true }
    );

    console.log('Problem 20 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 20
    await testCasesCollection.deleteMany({ problem_id: 20 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases20);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 20 (Session 4, Case 5: Mission Logic System) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem20()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
