import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem19() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 19: Session 4, Case 4 - Combining All Operators
    const problem19 = {
      problem_id: 19,
      session_id: 4,
      title: 'Combining All Operators',
      description: 'Learn to combine arithmetic, assignment, and logical operators to build smarter programs that compute, update, and make decisions.',
      question: `Create a variable days_remaining to a value.
Create a variable days_passed to a value.
Use -= to subtract days_passed from days_remaining.
Create a variable food_packs to a value.
Check if food_packs >= days_remaining.
Store result in enough_food.
Print "Food sufficient for mission? " followed by enough_food.`,
      difficulty: 'Easy',
      example_code: '# Combine all operators to solve complex problems\n# Your code here:\n',
      sample_input: '',
      sample_output: 'Food sufficient for mission? True',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['arithmetic operators', 'assignment operators', 'logical operators', 'comparisons', 'decision making', 'combining operators'],
        space_theme: true,
        estimated_time_minutes: 12,
        test_protocol: 'Students should create days_remaining=10, use -= to subtract 1, create food_packs=25, use >= comparison to check if food_packs >= days_remaining, and print "Food sufficient for mission? True"'
      },
      // Case-specific content
      case_number: 4,
      case_title: 'Combining All Operators',
      case_overview: `By combining arithmetic, assignment, and logical operators, programs can calculate, update, and make decisions dynamically. This mirrors real mission control, where data is computed, adjusted, and evaluated to guide critical actions.`,
      case_code: `# Sample Example:
battery_level = 100
battery_level -= 20
backup_power = 30
power_sufficient = (battery_level + backup_power) > 100
print("Power backup ready?", power_sufficient)

# Now you try this for our task.`,
      case_explanation: `Combining Operators:
● Arithmetic: Perform calculations (+, -, *, /, %)
● Assignment: Update values (=, +=, -=, *=, /=)
● Comparison: Compare values (>, <, >=, <=, ==, !=)
● Logical: Combine conditions (and, or, not)`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 19
    const testCases19 = [
      {
        problem_id: 19,
        test_case_id: 1,
        input: '',
        expected_output: 'Food sufficient for mission? True',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 19
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 19 },
      { $set: problem19 },
      { upsert: true }
    );

    console.log('Problem 19 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 19
    await testCasesCollection.deleteMany({ problem_id: 19 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases19);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 19 (Session 4, Case 4: Combining All Operators) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem19()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
