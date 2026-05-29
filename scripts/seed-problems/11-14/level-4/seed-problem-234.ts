import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem234() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 234: Level 4, Session 9, Case 5 - Dynamic Display Refresh
    const problem234 = {
      problem_id: 234,
      session_id: 42, // Level 4, Session 9
      title: 'Dynamic Display Refresh',
      description: 'Learn to create dynamic visual displays that update and change colors based on threshold values.',
      difficulty: 'Medium',
      question: `Create a Pygame window with dynamic display that refreshes based on fuel and oxygen levels. Draw fuel bar (position 50, 450) that turns red (255, 0, 0) if fuel < 30, otherwise green (0, 255, 0). Draw oxygen bar (position 50, 480) that turns orange (255, 165, 0) if oxygen < 40, otherwise blue (0, 0, 255). Add text labels "Fuel:" at position (10, 450) and "Oxygen:" at position (10, 480). Clear and redraw the screen each update. Print "Dynamic display active" when rendering.`,

      compiler_comment: '',
      sample_input: '',
      sample_output: 'Dynamic display active',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['screen.fill()', 'conditional rendering', 'color changes', 'dynamic updates', 'threshold logic'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 9: Pygame Basics and Visual Representation',

      // Case-specific content
      case_number: 5,
      case_title: 'Dynamic Display Refresh',
      case_overview: `Combine keyboard input, drawing, and real-time updates in one game loop. Use conditional logic to change bar colors based on low thresholds.`,
      case_explanation: `Use fill() to clear screen each frame. Change bar colors based on thresholds (fuel < 30 = red, oxygen < 40 = orange). Redraw bars and text every iteration.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 234 if it exists
    await problemsCollection.deleteOne({ problem_id: 234 });
    await testCasesCollection.deleteMany({ problem_id: 234 });

    // Insert problem 234
    const problemResult = await problemsCollection.insertOne(problem234);
    console.log('Problem 234 inserted');

    // Test cases for Problem 234 - Pygame problems only need 2 test cases (no input variation)
    const testCases = [
      // Visible test case
      {
        test_case_id: 2341,
        problem_id: 234,
        input: '',
        expected_output: 'Dynamic display active',
        is_hidden: false,
        weight: 50
      },
      // Hidden test case
      {
        test_case_id: 2342,
        problem_id: 234,
        input: '',
        expected_output: 'Dynamic display active',
        is_hidden: true,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 234`);

    console.log('\n✅ Problem 234 (Level 4, Session 9, Case 5: Dynamic Display) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem234()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
