import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem30() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    const problem30 = {
      problem_id: 30,
      session_id: 6,
      title: 'Nested If-Else with External Flags',
      description: 'Combine nested if-else statements with flag variables to control program flow based on multiple sequential checks.',
      difficulty: 'Medium',
      question: `Use input() to get power (convert to integer).
Use input() to get cooling (convert to integer).
Use input() to get pressure_ok (string: "True" or "False").
Use input() to get radiation_safe (string: "True" or "False").
Create reactor_ready = False.
Check if power > 80, then if cooling > 70, then if pressure_ok == "True" and radiation_safe == "True", set reactor_ready = True.
If reactor_ready is True, print "Reactor Startup Approved."
Else print "Reactor Startup Denied."`,
      example_code: '# Write your code here\n',
      sample_input: '95\n75\nTrue\nTrue',
      sample_output: 'Reactor Startup Approved.',

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect power, cooling, pressure, and radiation safety data
- Convert input to integers using int()
- Create and use a boolean flag variable to track state
- Use deeply nested if statements (three levels) for sequential checks
- Use logical operator (and) to combine multiple conditions
- Set flag to True only when all conditions are met
- Make final decision based on flag value`,

      concepts: `- Flag Variables: Using boolean variables to track state across nested conditions
- Nested If Statements: Creating three-level decision structures
- Logical AND Operator: Combining multiple conditions with 'and'
- State Tracking: Storing the result of multiple checks in a variable
- Sequential Validation: Checking conditions one after another
- Final Decision Logic: Using the flag to make the ultimate decision`,

      metadata: {
        concepts: ['nested-if', 'flags', 'boolean-logic', 'state-tracking', 'final-task'],
        space_theme: true,
        estimated_time_minutes: 18
      },
      // Case-specific content
      case_number: 5,
      case_title: 'Nested If-Else with External Flags',
      case_overview: `In this final task, you'll combine everything you've learned about nested if-else statements with flag variables. A flag is a boolean variable that stores the result of multiple condition checks.`,
      case_explanation: `Use a boolean variable (flag) to track if all conditions pass. Start with flag = False. Use nested ifs to check conditions. If all pass, set flag = True. After checks, use the flag to make final decision.`,
      case_code: `# Sample Example:
fuel = int(input())
oxygen = int(input())
engine = input()
weather = input()
launch_ready = False

if fuel > 60:
    if oxygen > 70:
        if engine == "True" and weather == "True":
            launch_ready = True

if launch_ready:
    print("Launch Approved.")
else:
    print("Launch Denied.")`,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const testCases30 = [
      {
        problem_id: 30,
        test_case_id: 1,
        input: '95\n75\nTrue\nTrue',
        expected_output: 'Reactor Startup Approved.',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 30,
        test_case_id: 2,
        input: '70\n75\nTrue\nTrue',
        expected_output: 'Reactor Startup Denied.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 30,
        test_case_id: 3,
        input: '95\n65\nTrue\nTrue',
        expected_output: 'Reactor Startup Denied.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 30,
        test_case_id: 4,
        input: '95\n75\nFalse\nTrue',
        expected_output: 'Reactor Startup Denied.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 30,
        test_case_id: 5,
        input: '100\n80\nTrue\nTrue',
        expected_output: 'Reactor Startup Approved.',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    const result = await problemsCollection.updateOne(
      { problem_id: 30 },
      { $set: problem30 },
      { upsert: true }
    );

    console.log('Problem 30 upserted:', result.upsertedId || 'Updated existing');

    await testCasesCollection.deleteMany({ problem_id: 30 });
    const testCasesResult = await testCasesCollection.insertMany(testCases30);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 30 (Session 6, Case 5: Nested If-Else with External Flags) seeded successfully!');
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

seedProblem30()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
