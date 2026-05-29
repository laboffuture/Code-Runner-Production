import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem41() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 41: Session 9, Case 1 - Basic For Loop over a List
    const problem41 = {
      problem_id: 41,
      session_id: 9,
      title: 'Basic For Loop over a List',
      description: 'Loop through a list of items using for.',
      difficulty: 'Medium',
      question: `Use input() three times to get three mission names.
Create a list called missions with these three items.
Use a for loop to iterate through missions.
Inside the loop, print "Mission: " followed by the mission name.`,
      example_code: '# Write your code here\n',
      sample_input: 'Apollo\nArtemis\nVoyager',
      sample_output: 'Mission: Apollo\nMission: Artemis\nMission: Voyager',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['loops', 'for-loop', 'iteration', 'lists', 'list-iteration'],
        space_theme: true,
        estimated_time_minutes: 12,
        test_protocol: 'Students should use for loop to iterate through list items'
      },
      // Case-specific content
      case_number: 1,
      case_title: 'Basic For Loop over a List',
      case_overview: `Loop through a list of items using for.`,
      case_code: `# Sample Example:
planets = ["Mercury", "Venus", "Earth", "Mars"]
for planet in planets:
    print("Exploring:", planet)

# Now you try this for our task`,
      case_explanation: `The loop goes through each element in the list. On each iteration, the loop variable takes the value of the current item. Syntax: for item in list_name:. The loop body must be indented (4 spaces).`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 41
    const testCases41 = [
      {
        problem_id: 41,
        test_case_id: 1,
        input: 'Apollo\nArtemis\nVoyager',
        expected_output: 'Mission: Apollo\nMission: Artemis\nMission: Voyager',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 41,
        test_case_id: 2,
        input: 'Alpha\nBeta\nGamma',
        expected_output: 'Mission: Alpha\nMission: Beta\nMission: Gamma',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 41,
        test_case_id: 3,
        input: 'Mars\nJupiter\nSaturn',
        expected_output: 'Mission: Mars\nMission: Jupiter\nMission: Saturn',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 41
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 41 },
      { $set: problem41 },
      { upsert: true }
    );

    console.log('Problem 41 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 41
    await testCasesCollection.deleteMany({ problem_id: 41 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases41);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 41 (Session 9, Case 1: Basic For Loop over a List) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem41()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
