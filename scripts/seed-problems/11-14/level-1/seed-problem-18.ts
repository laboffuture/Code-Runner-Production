import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem18() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 18: Session 4, Case 3 - Logical Operators
    const problem18 = {
      problem_id: 18,
      session_id: 4,
      title: 'Logical Operators',
      description: 'Learn to use logical operators (and, or, not) to make decisions based on multiple conditions.',
      question: `Create a variable systems_ready and give value for that.
Create a variable fuel_level and give value for it.
Use 'and' to check: systems_ready and fuel_level > 50.
Store the result in mission_go.
Print "Mission Ready? " followed by mission_go.`,
      difficulty: 'Easy',
      example_code: '# Use logical operators to evaluate conditions\n# Your code here:\n',
      sample_input: '',
      sample_output: 'Mission Ready? True',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['logical operators', 'boolean logic', 'and', 'or', 'not', 'conditions', 'decision making'],
        space_theme: true,
        estimated_time_minutes: 12,
        test_protocol: 'Students should create systems_ready=True, fuel_level=80, use and operator to check both conditions, and print "Mission Ready? True"'
      },
      // Case-specific content
      case_number: 3,
      case_title: 'Logical Operators',
      case_overview: `Logical operators like and, or, and not help programs make decisions by combining conditions. In the mission code, they determine if both systems are ready and fuel is sufficient for launch.`,
      case_code: `# Sample Example:
oxygen_ready = True
temperature = 25
safe_environment = oxygen_ready and temperature < 30
print("Safe to proceed?", safe_environment)

# Now you try for our task.`,
      case_explanation: `| Operator | Symbol | Description |
|----------|--------|-------------|
| AND | and | True if both conditions are true |
| OR | or | True if any one is true |
| NOT | not | Inverts the result |`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 18
    const testCases18 = [
      {
        problem_id: 18,
        test_case_id: 1,
        input: '',
        expected_output: 'Mission Ready? True',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 18
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 18 },
      { $set: problem18 },
      { upsert: true }
    );

    console.log('Problem 18 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 18
    await testCasesCollection.deleteMany({ problem_id: 18 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases18);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 18 (Session 4, Case 3: Logical Operators) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem18()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
