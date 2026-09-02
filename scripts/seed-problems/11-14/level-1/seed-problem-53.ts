import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem53() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 53: Session 3, Final Task - Mission Control Calculator (Authentication Gateway)
    const problem53 = {
      problem_id: 53,
      session_id: 3,
      title: 'Mission Control Calculator',
      description: `NOVA-12's main command console is locked. Security protocols demand proof of authorization.

Astra: "To unlock the console, calculate mission-critical fuel parameters. Only authorized personnel can perform these calculations correctly."

Build the Mission Control Calculator to prove your capability and unlock access.`,
      question: `Your program should:
1. Ask for the user's name
2. Ask for number of mission days
3. Ask for daily fuel consumption in liters
4. Calculate total fuel: total_fuel = days × consumption
5. Print the authentication message:
   \`"Cadet [Name], your spacecraft will need [total] liters of fuel for [days] days."\``,

      difficulty: 'Intro',
      example_code: `# Mission Control Calculator - Authentication Gateway
# Your code here
`,

      sample_input: `Leo
15
250.5`,
      sample_output: `Cadet Leo, your spacecraft will need 3757.5 liters of fuel for 15 days.`,

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use \`input()\` to collect user data
- Convert strings to appropriate numeric types (int, float)
- Perform arithmetic calculations (multiplication)
- Format output with variables and calculated results`,

      concepts: `- Input Function: Reading user input with \`input()\`
- Type Conversion: Converting strings to int and float
- Arithmetic Operations: Multiplication for fuel calculation
- String Formatting: Creating formatted authentication messages`,

      metadata: {
        concepts: ['input', 'type conversion', 'int', 'float', 'arithmetic', 'multiplication', 'string formatting'],
        space_theme: true,
        story_linked: true,
        estimated_time_minutes: 20,
        is_final_task: true
      },



      // Case-specific content (Final Task)
      case_number: 6,
      case_title: 'Mission Control Calculator - Authentication Gateway',
      // case_overview removed for final tasks (Case 6)
      case_code: `# Get cadet name
name = input()

# Get mission days and convert to integer
days = int(input())

# Get daily fuel consumption and convert to float
daily_fuel = float(input())

# Calculate total fuel
total_fuel = days * daily_fuel

# Print authentication message
print("Cadet", name, "authenticated. Mission fuel required:", total_fuel, "liters")`,
      case_explanation: `How to Approach This Problem:
1. Get Cadet Name:
2. Get Mission Days:
3. Get Daily Fuel Consumption:
4. Calculate Total Fuel:
   - Multiply days by consumption
5. Print Authentication Message:
   - Use string formatting or concatenation`,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Upsert problem 53
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 53 },
      { $set: problem53 },
      { upsert: true }
    );

    console.log('Problem 53 upserted:', problemResult.upsertedId || 'Updated existing');

    // Test cases for Problem 53
    const testCases53 = [
      // Visible test case
      {
        problem_id: 53,
        test_case_id: 1,
        input: 'Leo\n15\n250.5',
        expected_output: 'Cadet Leo, your spacecraft will need 3757.5 liters of fuel for 15 days.',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test cases
      {
        problem_id: 53,
        test_case_id: 2,
        input: 'Nila\n10\n150.5',
        expected_output: 'Cadet Nila, your spacecraft will need 1505.0 liters of fuel for 10 days.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 53,
        test_case_id: 3,
        input: 'Kenji\n7\n300.0',
        expected_output: 'Cadet Kenji, your spacecraft will need 2100.0 liters of fuel for 7 days.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 53,
        test_case_id: 4,
        input: 'Astra\n30\n175.8',
        expected_output: 'Cadet Astra, your spacecraft will need 5274.0 liters of fuel for 30 days.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 53,
        test_case_id: 5,
        input: 'Commander Nova\n21\n425.3',
        expected_output: 'Cadet Commander Nova, your spacecraft will need 8931.300000000001 liters of fuel for 21 days.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Delete existing test cases for problem 53
    await testCasesCollection.deleteMany({ problem_id: 53 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases53);
    console.log(`${testCasesResult.insertedCount} test cases inserted for Problem 53`);

    console.log('\n✅ Problem 53 (Session 3, Final Task: Mission Control Calculator) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem53()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
