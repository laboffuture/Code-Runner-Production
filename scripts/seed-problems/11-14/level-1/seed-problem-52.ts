import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem52() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 52: Session 2, Final Task - Mission Setup: Preparing Rover Data
    const problem52 = {
      problem_id: 52,
      session_id: 2,
      title: 'Mission Setup: Preparing Rover Data',
      description: `NOVA-12's power rails awaken. Now it's time to initialize the spacecraft's essential subsystems.

Astra: "The ship needs to remember its identity. Initialize the core status log with current values—spaceship name, target distance, crew count, and system status."

Create the mission report using the correct data types for each parameter.`,

      question: `Write a Python program that asks the user to enter:
1. The name of their spaceship
2. The distance to their target planet
3. The number of astronauts onboard
4. Whether the systems are online
After collecting all inputs, print each value on a separate line in the same order.`,
      difficulty: 'Intro',
      example_code: `# Mission Setup: Preparing Rover Data
# Get spaceship name (string)
spaceship_name = input()
print(spaceship_name)`,
      sample_input: `NOVA-12
384.4
3
True`,
      sample_output: `NOVA-12
384.4
3
True`,

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use \`input()\` to collect user data
- Store values in variables with appropriate data types
- Work with strings, floats, integers, and booleans
- Print values in the correct order`,

      concepts: `- Variables: Storing mission-critical data
- Data Types: Understanding string, float, int, and bool
- Input/Output: Reading user input and displaying results
- Type Conversion: Converting input strings to appropriate types`,

      metadata: {
        concepts: ['variables', 'data types', 'input', 'type conversion', 'strings', 'integers', 'floats', 'booleans'],
        space_theme: true,
        story_linked: true,
        estimated_time_minutes: 20,
        is_final_task: true
      },
      // Case-specific content (Final Task)
      case_number: 6,
      case_title: 'Mission Setup: Preparing Rover Data - Final Mission Task',
      // case_overview removed for final tasks (Case 6)
      case_code: `# Get spaceship name (string)
spaceship_name = input()

# Get distance (float)
distance = input()

# Get crew count (integer)
crew_count = input()

# Get systems status (boolean)
systems_online = input()

# Print all values
print(spaceship_name)
print(distance)
print(crew_count)
print(systems_online)`,
      case_explanation: `1. Get Spaceship Name (String):
   - Use \`input()\` to read the spaceship name
   - Use \`input()\` to read the distance
   - Use \`input()\` to read the crew size
   - Use \`input()\` to read "True" or "False"
5. Print All Values:
   - Print each variable on a separate line`,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Upsert problem 52
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 52 },
      { $set: problem52 },
      { upsert: true }
    );

    console.log('Problem 52 upserted:', problemResult.upsertedId || 'Updated existing');

    // Test cases for Problem 52
    const testCases52 = [
      // Visible test case
      {
        problem_id: 52,
        test_case_id: 1,
        input: 'NOVA-12\n384.4\n3\nTrue',
        expected_output: 'NOVA-12\n384.4\n3\nTrue',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test cases
      {
        problem_id: 52,
        test_case_id: 2,
        input: 'Orion Explorer\n150.2\n5\nFalse',
        expected_output: 'Orion Explorer\n150.2\n5\nFalse',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 52,
        test_case_id: 3,
        input: 'Stellar Voyager\n892.7\n12\nTrue',
        expected_output: 'Stellar Voyager\n892.7\n12\nTrue',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 52,
        test_case_id: 4,
        input: 'Cosmos-1\n55.8\n2\nTrue',
        expected_output: 'Cosmos-1\n55.8\n2\nTrue',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 52,
        test_case_id: 5,
        input: 'Deep Space Nine\n1250.5\n8\nFalse',
        expected_output: 'Deep Space Nine\n1250.5\n8\nFalse',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Delete existing test cases for problem 52
    await testCasesCollection.deleteMany({ problem_id: 52 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases52);
    console.log(`${testCasesResult.insertedCount} test cases inserted for Problem 52`);

    console.log('\n✅ Problem 52 (Session 2, Final Task: Mission Setup - Preparing Rover Data) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem52()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
