import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem235() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 235: Level 4, Session 9, Case 6 - Mission Dashboard
    const problem235 = {
      problem_id: 235,
      session_id: 42, // Level 4, Session 9
      title: 'Mission Dashboard – Building a Space Command Interface',
      description: 'Build a complete interactive dashboard integrating all Pygame concepts with graphics, events, and animations.',
      difficulty: 'Hard',
      question: `Build a complete Mission Dashboard for spacecraft status visualization. The chamber brightens and the crew needs a live console to see subsystem states at a glance while Astra reaches for the core.

Initialize a Pygame window (900x600) with title "Mission Dashboard" and dark background. Draw five status bars for Power (80), Cooling (70), Data Bus (90), Security Gate (60), and AI Core (85) positioned vertically with 40px spacing from y=100. Bar colors: green if value > 70, orange if 40-70, red if < 40. Width = value * 2, height = 25.

Implement keyboard controls: UP/DOWN arrows adjust all systems by 5, LEFT/RIGHT adjust Power only. Keep values 0-100. Add animated star (white circle, radius 3) at y=50 that moves right 5px per frame, resetting to 0 when x > 900.

Display status text at bottom showing system values and overall status: "OPTIMAL" if all > 60, "CRITICAL" if any < 30. Print appropriate messages for initialization, rendering, and updates.`,

      compiler_comment: '',
      sample_input: '',
      sample_output: 'Dashboard initialized\nStatus bars rendered\nAnimation active\nStatus: OPTIMAL',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['complete Pygame integration', 'graphics', 'interactivity', 'animation', 'event handling', 'conditional rendering', 'game loop'],
        estimated_time_minutes: 35
      },

      // Session-level content
      session_title: 'Session 9: Pygame Basics and Visual Representation',

      // Case-specific content
      case_number: 6,
      case_title: 'Mission Dashboard – Building a Space Command Interface',
      case_overview: `Build a complete Mission Dashboard combining all Pygame concepts: status bars with conditional colors, keyboard controls, animation, and status display.`,
      case_explanation: `Combine window setup, conditional drawing, text rendering, keyboard events, and animation. All messages print once before the game loop starts.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 235 if it exists
    await problemsCollection.deleteOne({ problem_id: 235 });
    await testCasesCollection.deleteMany({ problem_id: 235 });

    // Insert problem 235
    const problemResult = await problemsCollection.insertOne(problem235);
    console.log('Problem 235 inserted');

    // Test cases for Problem 235 - Pygame problems only need 2 test cases (no input variation)
    const testCases = [
      // Visible test case
      {
        test_case_id: 2351,
        problem_id: 235,
        input: '',
        expected_output: 'Dashboard initialized\nStatus bars rendered\nAnimation active\nStatus: OPTIMAL',
        is_hidden: false,
        weight: 50
      },
      // Hidden test case
      {
        test_case_id: 2352,
        problem_id: 235,
        input: '',
        expected_output: 'Dashboard initialized\nStatus bars rendered\nAnimation active\nStatus: OPTIMAL',
        is_hidden: true,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 235`);

    console.log('\n✅ Problem 235 (Level 4, Session 9, Case 6: Mission Dashboard) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem235()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
