import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem233() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 233: Level 4, Session 9, Case 4 - Responding to Key Inputs
    const problem233 = {
      problem_id: 233,
      session_id: 42, // Level 4, Session 9
      title: 'Responding to Key Inputs',
      description: 'Learn to handle keyboard events and modify program state based on user input.',
      difficulty: 'Medium',
      question: `Create an event loop that responds to keyboard inputs to modify fuel and oxygen values. Start with fuel = 80, oxygen = 90. Print initial values immediately in format: "Fuel: [value], Oxygen: [value]". Left arrow decreases fuel by 10, right arrow increases fuel by 10. Down arrow decreases oxygen by 10, up arrow increases oxygen by 10. Use max(0, value) and min(100, value) to keep values within bounds. After every change, print the updated values.`,

      compiler_comment: '',
      sample_input: '',
      sample_output: 'Fuel: 80, Oxygen: 90',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['pygame.event.get()', 'KEYDOWN', 'event handling', 'keyboard input', 'arrow keys'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 9: Pygame Basics and Visual Representation',

      // Case-specific content
      case_number: 4,
      case_title: 'Responding to Key Inputs',
      case_overview: `Handle keyboard input to modify fuel and oxygen values using arrow keys. Learn event handling in Pygame.`,
      case_explanation: `Use event.type == KEYDOWN to detect key presses. Check event.key for arrow keys (K_LEFT, K_RIGHT, K_UP, K_DOWN). Use min() and max() to keep values in bounds.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 233 if it exists
    await problemsCollection.deleteOne({ problem_id: 233 });
    await testCasesCollection.deleteMany({ problem_id: 233 });

    // Insert problem 233
    const problemResult = await problemsCollection.insertOne(problem233);
    console.log('Problem 233 inserted');

    // Test cases for Problem 233 - Pygame problems only need 2 test cases (no input variation)
    const testCases = [
      // Visible test case
      {
        test_case_id: 2331,
        problem_id: 233,
        input: '',
        expected_output: 'Fuel: 80, Oxygen: 90',
        is_hidden: false,
        weight: 50
      },
      // Hidden test case
      {
        test_case_id: 2332,
        problem_id: 233,
        input: '',
        expected_output: 'Fuel: 80, Oxygen: 90',
        is_hidden: true,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 233`);

    console.log('\n✅ Problem 233 (Level 4, Session 9, Case 4: Key Inputs) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem233()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
