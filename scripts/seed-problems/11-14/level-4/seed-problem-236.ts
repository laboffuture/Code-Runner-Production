import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem236() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 236: Level 4, Session 10, Case 1 - Keyboard Input – Moving a Square
    const problem236 = {
      problem_id: 236,
      session_id: 43, // Level 4, Session 10
      title: 'Keyboard Input – Moving a Square',
      description: 'Learn to handle keyboard input to move objects on screen using arrow keys.',
      difficulty: 'Easy',
      question: `Create a Pygame window (300x300) with a blue square (30x30) starting at position (50, 50). The square should move left and right using arrow keys (LEFT moves by -5, RIGHT moves by +5). Add functionality to move the square up and down using UP arrow (y -= 5) and DOWN arrow (y += 5). Use clock.tick(30) for 30 FPS. Print "Square movement active" when initialized.`,

      sample_input: '',
      sample_output: 'Square movement active',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['pygame.key.get_pressed()', 'keyboard input', 'object movement', 'arrow keys', 'FPS control'],
        estimated_time_minutes: 10
      },

      // Session-level content
      session_title: 'Session 10: Pygame Events and Interactions',

      // Case-specific content
      case_number: 1,
      case_title: 'Keyboard Input – Moving a Square',
      case_overview: `You will learn the basic concept of keyboard input handling. Create a square that moves around the screen based on which arrow keys are pressed. This is a fundamental concept for interactive programs, where user input directly controls objects on the screen.`,
      case_explanation: `pygame.key.get_pressed() captures the state of all keys, allowing you to detect if a key is pressed. x -= 5 and x += 5 move the square left and right based on key input. clock.tick(30) ensures the loop runs at 30 frames per second for smooth movement.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 236 if it exists
    await problemsCollection.deleteOne({ problem_id: 236 });
    await testCasesCollection.deleteMany({ problem_id: 236 });

    // Insert problem 236
    const problemResult = await problemsCollection.insertOne(problem236);
    console.log('Problem 236 inserted');

    // Test cases for Problem 236 - Pygame problems only need 2 test cases (no input variation)
    const testCases = [
      // Visible test case
      {
        test_case_id: 2361,
        problem_id: 236,
        input: '',
        expected_output: 'Square movement active',
        is_hidden: false,
        weight: 50
      },
      // Hidden test case
      {
        test_case_id: 2362,
        problem_id: 236,
        input: '',
        expected_output: 'Square movement active',
        is_hidden: true,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 236`);

    console.log('\n✅ Problem 236 (Level 4, Session 10, Case 1: Keyboard Input) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem236()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
