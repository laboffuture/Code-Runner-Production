import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem17() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 17: Session 4, Case 2 - Updating Mission Values
    const problem17 = {
      problem_id: 17,
      session_id: 4,
      title: 'Updating Mission Values',
      description: 'Learn to use assignment operators to update and modify variable values efficiently.',
      question: `Create a variable mission_days to a value.
Create a variable additional_days to a value.
Use += to add additional_days to mission_days.
Print "Updated mission duration: " followed by mission_days.`,
      difficulty: 'Easy',
      example_code: '# Use assignment operators to update values\n# Your code here:\n',
      sample_input: '',
      sample_output: 'Updated mission duration: 7',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['assignment operators', 'updating values', 'compound assignment', 'variables'],
        space_theme: true,
        estimated_time_minutes: 10,
        test_protocol: 'Students should create variable mission_days=5, use += to add 2, and print "Updated mission duration: 7"'
      },
      // Case-specific content
      case_number: 2,
      case_title: 'Updating Mission Values',
      case_overview: `In addition to storing values in variables, assignment operators in Python allow you to update and change those values while your program executes.`,
      case_code: `# Sample Example:
battery_level = 100
battery_level -= 15
print("Battery remaining:", battery_level)

# Now you try  this for our task.`,
      case_explanation: `| Operator | Example | Meaning |
|----------|---------|---------|
| = | x = 5 | Assign value |
| += | x += 3 | Add and assign |
| -= | x -= 2 | Subtract and assign |
| *= | x *= 4 | Multiply and assign |
| /= | x /= 2 | Divide and assign |`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 17
    const testCases17 = [
      {
        problem_id: 17,
        test_case_id: 1,
        input: '',
        expected_output: 'Updated mission duration: 7',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 17
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 17 },
      { $set: problem17 },
      { upsert: true }
    );

    console.log('Problem 17 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 17
    await testCasesCollection.deleteMany({ problem_id: 17 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases17);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 17 (Session 4, Case 2: Updating Mission Values) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem17()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
