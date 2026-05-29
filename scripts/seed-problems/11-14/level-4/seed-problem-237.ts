import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem237() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 237: Level 4, Session 10, Case 2 - Custom Events – Auto Color Change
    const problem237 = {
      problem_id: 237,
      session_id: 43, // Level 4, Session 10
      title: 'Custom Events – Auto Color Change',
      description: 'Learn to create custom events that trigger automatic actions at timed intervals.',
      difficulty: 'Medium',
      question: `Create a Pygame window (400x300) with a rectangle (100x100) at position (150, 100). Use a custom event to automatically change the rectangle's color every 1 second (not 2 seconds). Colors should be randomly generated using random.randint(0, 255) for RGB values. Create the custom event using pygame.USEREVENT + 1 and set_timer(). Print "Auto color change active" when initialized.`,

      sample_input: '',
      sample_output: 'Auto color change active',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['pygame.USEREVENT', 'pygame.time.set_timer()', 'custom events', 'random colors', 'timed actions'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 10: Pygame Events and Interactions',

      // Case-specific content
      case_number: 2,
      case_title: 'Custom Events – Auto Color Change',
      case_overview: `Introduction to custom events in your program. Events are the foundation of interactive programs. Create a custom event to change the color of a rectangle automatically at regular time intervals. Instead of requiring user input, this event happens on its own after a set period of time, which helps simulate behavior like automatic animation or timed actions.`,
      case_explanation: `pygame.time.set_timer(CHANGE_COLOR, 1000) triggers the custom event CHANGE_COLOR every 1 second. random.randint(0, 255) generates a random color by picking random RGB values. Custom events allow automated actions without user input.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 237 if it exists
    await problemsCollection.deleteOne({ problem_id: 237 });
    await testCasesCollection.deleteMany({ problem_id: 237 });

    // Insert problem 237
    const problemResult = await problemsCollection.insertOne(problem237);
    console.log('Problem 237 inserted');

    // Test cases for Problem 237 - Pygame problems only need 2 test cases (no input variation)
    const testCases = [
      // Visible test case
      {
        test_case_id: 2371,
        problem_id: 237,
        input: '',
        expected_output: 'Auto color change active',
        is_hidden: false,
        weight: 50
      },
      // Hidden test case
      {
        test_case_id: 2372,
        problem_id: 237,
        input: '',
        expected_output: 'Auto color change active',
        is_hidden: true,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 237`);

    console.log('\n✅ Problem 237 (Level 4, Session 10, Case 2: Custom Events) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem237()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
