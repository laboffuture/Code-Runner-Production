import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem56() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 56: Session 6, Final Task - Multi-System Decision Matrix
    const problem56 = {
      problem_id: 56,
      session_id: 6,
      title: 'Multi-System Decision Matrix',
      description: `First engine power-up is NOVA-12's most dangerous moment. The crew needs an emergency decision system to prevent catastrophic failures.

Astra: "Build the Multi-System Decision Matrix. Check fuel, oxygen, engine, weather, and battery in sequence—all must pass for launch approval. Each parameter acts as a gate. If any single check fails, identify the specific issue immediately."

Create the system that validates all critical parameters before engine fire.`,

      question: `Your program should check the following systems in this exact order:
1. Ask for fuel level
2. Check if fuel > 60
   - If fuel fails, print: \"Launch denied: Insufficient fuel"\
3. If fuel passes, ask for oxygen level
4. Check if oxygen > 70
   - If oxygen fails, print: \"Launch denied: Low oxygen"\
5. If oxygen passes, ask for engine_ready
6. Check if engine_ready == "True"
   - If engine fails, print: \"Launch denied: Engine not ready"\
7. If engine passes, ask for weather_clear
8. Check if weather_clear == "True"
   - If weather fails, print: \"Launch denied: Bad weather"\
9. If weather passes, ask for battery level
10. Check if battery > 50
    - If battery fails, print: \"Launch denied: Low battery"\
11. If ALL checks pass, print: \"Launch Approved"\"`,

      difficulty: 'Easy',
      example_code: `# Multi-System Decision Matrix
# Your code here
`,

      sample_input: `80
85
True
True
60`,
      sample_output: `Launch Approved`,

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use \`input()\` to collect multiple system status values
- Apply comparison operators (\`>\`) for threshold validation
- Work with string comparisons for boolean status checks
- Implement nested \`if/else\` statements for sequential decision-making
- Create a multi-layered validation system with specific error messages
- Understand how nested conditionals create decision trees
- Build robust safety systems that identify specific failure points`,

      concepts: `- Nested Conditionals: Creating if statements inside other if statements
- Sequential Validation: Checking conditions in a specific order
- Early Exit Pattern: Stopping validation when a condition fails
- Comparison Operators: Using \`>\` for numerical thresholds
- String Comparison: Checking equality with \`==\` for boolean strings
- Decision Trees: How nested logic creates branching validation paths
- Defensive Programming: Identifying and reporting specific failure modes
- Multi-System Integration: Validating multiple independent parameters`,

      metadata: {
        concepts: ['nested conditionals', 'sequential validation', 'comparison operators', 'string comparison', 'decision trees', 'multi-system validation'],
        space_theme: true,
        story_linked: true,
        estimated_time_minutes: 30,
        is_final_task: true
      },
      // Case-specific content (Final Task)
      case_number: 6,
      case_title: 'Multi-System Decision Matrix - Launch Safety Gateway',
      // case_overview removed for final tasks (Case 6)
      case_explanation: `fuel = int(input())
if fuel > 60:
    oxygen = int(input())
    if oxygen > 70:
        engine_ready = input()
        if engine_ready == "True":
            weather_clear = input()
            if weather_clear == "True":
                battery = int(input())
                if battery > 50:
                    print("Launch Approved")
                else:
                    print("Launch denied: Low battery")
            else:
                print("Launch denied: Bad weather")
        else:
            print("Launch denied: Engine not ready")
    else:
        print("Launch denied: Low oxygen")
else:
    print("Launch denied: Insufficient fuel")`,

      case_code: `# Example: Multi-System Decision Matrix
# Get fuel level
fuel = int(input())
# Check fuel first
if fuel > 60:
    # Fuel passed, check oxygen
    oxygen = int(input())
    if oxygen > 70:
        # Oxygen passed, check engine
        engine_ready = input()
        if engine_ready == "True":
            # Engine passed, check weather
            weather_clear = input()
            if weather_clear == "True":
                # Weather passed, check battery
                battery = int(input())
                if battery > 50:
                    # All checks passed!
                    print("Launch Approved")
                else:
                    print("Launch denied: Low battery")
            else:
                print("Launch denied: Bad weather")
        else:
            print("Launch denied: Engine not ready")
    else:
        print("Launch denied: Low oxygen")
else:
    print("Launch denied: Insufficient fuel")`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Upsert problem 56
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 56 },
      { $set: problem56 },
      { upsert: true }
    );

    console.log('Problem 56 upserted:', problemResult.upsertedId || 'Updated existing');

    // Test cases for Problem 56
    const testCases56 = [
      // Visible test case - all systems pass
      {
        problem_id: 56,
        test_case_id: 1,
        input: '80\n85\nTrue\nTrue\n60',
        expected_output: 'Launch Approved',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test case - fuel fails
      {
        problem_id: 56,
        test_case_id: 2,
        input: '50',
        expected_output: 'Launch denied: Insufficient fuel',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test case - oxygen fails
      {
        problem_id: 56,
        test_case_id: 3,
        input: '80\n65',
        expected_output: 'Launch denied: Low oxygen',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test case - engine fails
      {
        problem_id: 56,
        test_case_id: 4,
        input: '80\n85\nFalse',
        expected_output: 'Launch denied: Engine not ready',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test case - weather fails
      {
        problem_id: 56,
        test_case_id: 5,
        input: '80\n85\nTrue\nFalse',
        expected_output: 'Launch denied: Bad weather',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test case - battery fails
      {
        problem_id: 56,
        test_case_id: 6,
        input: '80\n85\nTrue\nTrue\n45',
        expected_output: 'Launch denied: Low battery',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test case - boundary case (all at minimum passing values)
      {
        problem_id: 56,
        test_case_id: 7,
        input: '61\n71\nTrue\nTrue\n51',
        expected_output: 'Launch Approved',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Delete existing test cases for problem 56
    await testCasesCollection.deleteMany({ problem_id: 56 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases56);
    console.log(`${testCasesResult.insertedCount} test cases inserted for Problem 56`);

    console.log('\n✅ Problem 56 (Session 6, Final Task: Multi-System Decision Matrix) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem56()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
