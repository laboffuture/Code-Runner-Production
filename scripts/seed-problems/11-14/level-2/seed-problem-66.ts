import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem66() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 66: Level 2, Session 1, Case 6 - Final Task: Cosmic Navigation Matrix
    const problem66 = {
      problem_id: 66,
      session_id: 12, // Level 2, Session 1
      title: 'Cosmic Navigation Matrix',
      description: `NOVA-12 enters the turbulent approach to Erevos-7. Asteroid clusters and electrical storms force the crew to chart a safer holding path through the sector grid.

Create the path-planner that navigates NOVA-12 through the sector grid to a collision-free parking orbit.`,
      difficulty: 'Hard',
      question: `NOVA-12's navigation matrix displays mission phases with their orbital stages. Write a program that takes the number of missions and stages, then displays each mission number followed by its stage numbers indented with 2 spaces.`,      sample_input: '2\n3',
      sample_output: `Mission 1
  Stage 1
  Stage 2
  Stage 3
Mission 2
  Stage 1
  Stage 2
  Stage 3`,

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 3,
      max_score: 150,

      metadata: {
        space_theme: true,
        story_linked: true,
        estimated_time_minutes: 30,
        is_final_task: true,
        is_capstone: true,
        concepts: ['nested_loops', 'for loops', 'range', 'iteration', 'grid navigation']
      },
      // Session-level content
      session_title: 'Session 1: Nested Loops',

      // Case-specific content
      case_number: 6,
      case_title: 'Cosmic Navigation Matrix',
      case_explanation: `Use nested for loops with range(). Outer loop for missions, inner loop for stages. Indent stage output with 2 spaces.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 66 if it exists
    await problemsCollection.deleteOne({ problem_id: 66 });
    await testCasesCollection.deleteMany({ problem_id: 66 });

    // Insert problem 66
    const problemResult = await problemsCollection.insertOne(problem66);
    console.log('Problem 66 inserted');

    // Test cases for Problem 66 (7 test cases: 2 visible + 5 hidden)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 661,
        problem_id: 66,
        input: '2\n3',
        expected_output: 'Mission 1\n  Stage 1\n  Stage 2\n  Stage 3\nMission 2\n  Stage 1\n  Stage 2\n  Stage 3',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 662,
        problem_id: 66,
        input: '3\n2',
        expected_output: 'Mission 1\n  Stage 1\n  Stage 2\nMission 2\n  Stage 1\n  Stage 2\nMission 3\n  Stage 1\n  Stage 2',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 663,
        problem_id: 66,
        input: '3\n3',
        expected_output: 'Mission 1\n  Stage 1\n  Stage 2\n  Stage 3\nMission 2\n  Stage 1\n  Stage 2\n  Stage 3\nMission 3\n  Stage 1\n  Stage 2\n  Stage 3',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 664,
        problem_id: 66,
        input: '1\n4',
        expected_output: 'Mission 1\n  Stage 1\n  Stage 2\n  Stage 3\n  Stage 4',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 665,
        problem_id: 66,
        input: '4\n2',
        expected_output: 'Mission 1\n  Stage 1\n  Stage 2\nMission 2\n  Stage 1\n  Stage 2\nMission 3\n  Stage 1\n  Stage 2\nMission 4\n  Stage 1\n  Stage 2',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 666,
        problem_id: 66,
        input: '2\n4',
        expected_output: 'Mission 1\n  Stage 1\n  Stage 2\n  Stage 3\n  Stage 4\nMission 2\n  Stage 1\n  Stage 2\n  Stage 3\n  Stage 4',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 667,
        problem_id: 66,
        input: '5\n1',
        expected_output: 'Mission 1\n  Stage 1\nMission 2\n  Stage 1\nMission 3\n  Stage 1\nMission 4\n  Stage 1\nMission 5\n  Stage 1',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 66`);

    console.log('\n✅ Problem 66 (Level 2, Session 1, Case 6: Final Task - Cosmic Navigation Matrix) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem66()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
