import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem16() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 16: Session 4, Case 1 - Performing Calculations
    const problem16 = {
      problem_id: 16,
      session_id: 4,
      title: 'Performing Calculations',
      description: 'Learn to use arithmetic operators to perform basic mathematical operations.',
      question: `Create a variable fuel_used and give value to it.
Create a variable fuel_remaining and give value to it.
Calculate total_fuel by adding fuel_used and fuel_remaining.
Print "Total fuel: " followed by total_fuel.`,
      difficulty: 'Easy',
      example_code: '# Perform calculations using arithmetic operators\n# Your code here:\n',
      sample_input: '',
      sample_output: 'Total fuel: 500',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['arithmetic operators', 'addition', 'subtraction', 'variables', 'calculations'],
        space_theme: true,
        estimated_time_minutes: 10,
        test_protocol: 'Students should create variables fuel_used=150 and fuel_remaining=350, calculate total_fuel by adding them, and print "Total fuel: 500"'
      },
      // Case-specific content
      case_number: 1,
      case_title: 'Performing Calculations',
      case_overview: `Basic mathematical operations like addition, subtraction, multiplication, and division are carried out in Python using arithmetic operators.`,
      case_code: `# Sample Example:
crew_members = 8
backup_crew = 4
total_crew = crew_members + backup_crew
print("Total crew:", total_crew)

# Now you try for our task`,
      case_explanation: `| Operator | Symbol | Example | Meaning |
|----------|--------|---------|---------|
| Add | + | 5 + 3 → 8 | Addition |
| Subtract | - | 10 - 4 → 6 | Subtraction |
| Multiply | * | 6 * 2 → 12 | Multiplication |
| Divide | / | 8 / 2 → 4.0 | Division (float) |
| Modulus | % | 10 % 3 → 1 | Remainder |`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 16
    const testCases16 = [
      {
        problem_id: 16,
        test_case_id: 1,
        input: '',
        expected_output: 'Total fuel: 500',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 16
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 16 },
      { $set: problem16 },
      { upsert: true }
    );

    console.log('Problem 16 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 16
    await testCasesCollection.deleteMany({ problem_id: 16 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases16);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 16 (Session 4, Case 1: Performing Calculations) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem16()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
