import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem15() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 15: Session 3, Case 5 - Final Mission Calculator (Comprehensive Task)
    const problem15 = {
      problem_id: 15,
      session_id: 3,
      title: 'Mission Fuel Calculator',
      description: 'Build a comprehensive program that collects user input, performs calculations, and displays mission fuel requirements.',
      question: `Build a Mission Fuel Calculator that:
1. Gets the cadet's name using input()
2. Gets the number of mission days using input() and converts to integer
3. Gets the daily fuel consumption in liters using input() and converts to float
4. Calculates total fuel needed (days × consumption)
5. Prints: "Cadet [Name], your spacecraft will need [total] liters of fuel for [days] days."`,
      difficulty: 'Intro',
      example_code: '# Write your code here\n',
      sample_input: 'Alex\n10\n5.5',
      sample_output: 'Cadet Alex, your spacecraft will need 55.0 liters of fuel for 10 days.',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['input() function', 'type conversion', 'int()', 'float()', 'arithmetic operations', 'string formatting', 'multi-step program'],
        space_theme: true,
        estimated_time_minutes: 15,
        test_protocol: 'Students should collect 3 inputs (name, days, fuel), convert appropriately, calculate total, and print in exact format'
      },
      // Case-specific content
      case_number: 5,
      case_title: 'Mission Fuel Calculator',
      case_overview: `Build a program that collects multiple inputs, performs calculations, and displays a comprehensive mission report.`,
      case_code: `# Example: Simple calculator
pilot = input()
missions = int(input())
hours = float(input())
total_hours = missions * hours
print("Pilot", pilot, "will fly for", total_hours, "hours")`,
      case_explanation: `● Collect 3 different inputs
● Name: string (no conversion)
● Days: integer (use int())
● Fuel: float (use float())
● Calculate: total = days × consumption
● Print in exact format`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 15
    const testCases15 = [
      {
        problem_id: 15,
        test_case_id: 1,
        input: 'Alex\n10\n5.5',
        expected_output: 'Cadet Alex, your spacecraft will need 55.0 liters of fuel for 10 days.',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 15,
        test_case_id: 2,
        input: 'Nova\n7\n8.2',
        expected_output: 'Cadet Nova, your spacecraft will need 57.39999999999999 liters of fuel for 7 days.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 15,
        test_case_id: 3,
        input: 'Zara\n30\n12.5',
        expected_output: 'Cadet Zara, your spacecraft will need 375.0 liters of fuel for 30 days.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 15
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 15 },
      { $set: problem15 },
      { upsert: true }
    );

    console.log('Problem 15 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 15
    await testCasesCollection.deleteMany({ problem_id: 15 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases15);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 15 (Session 3, Case 5: Mission Fuel Calculator) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem15()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
