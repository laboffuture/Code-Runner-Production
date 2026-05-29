import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem241() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 241: Level 4, Session 10, Case 6 - Celestial Command Interface
    const problem241 = {
      problem_id: 241,
      session_id: 43, // Level 4, Session 10
      title: 'Celestial Command Interface – Enhancing Mission Control with Dynamic Inputs',
      description: 'Build a complete interactive mission control system integrating all Pygame concepts.',
      difficulty: 'Hard',
      question: `Build the Celestial Command Interface—an interactive mission control system. With storms peaking, the team interacts rapidly with the console to trigger safe-mode, re-attempt links, and acknowledge alerts. Create interactive controls with keys to toggle modes, custom events for timed checks, text overlays for warnings, and icons for subsystem states.

Create a Pygame window (800x600) titled "Celestial Command Interface". Display spacecraft velocity starting at 300 km/h at position (50, 50) and system status "Normal" at position (50, 80). Use font size 30.

Implement keyboard controls: UP arrow increases velocity by 10, DOWN arrow decreases by 10. When 'E' key is pressed, change system status to "CRITICAL" and display "Emergency: System Failure" at position (50, 150) in red color (255, 0, 0).

Create a custom event that triggers every 3 seconds to perform a system check. When triggered, print "System check performed" and display "Auto-check active" at position (50, 200).

Load a spacecraft image "ship.png", resize it to 80x80 pixels, and display at position (400, 300). Allow R key to rotate image by 45 degrees, F key to flip horizontally, and S key to scale up by 1.2x.

Display a text input area at position (50, 400) with prompt "Enter command:". Allow typing with keyboard and display typed text at position (50, 430). Use BACKSPACE to delete characters.

Print appropriate status messages for initialization, emergency triggers, and system checks.`,

      sample_input: '',
      sample_output: 'Interface initialized\nSystem check performed\nAuto-check active',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['complete Pygame integration', 'custom events', 'keyboard input', 'text handling', 'image manipulation', 'pygame.transform', 'dynamic updates', 'event system'],
        estimated_time_minutes: 40
      },

      // Session-level content
      session_title: 'Session 10: Pygame Events and Interactions',

      // Case-specific content
      case_number: 6,
      case_title: 'Celestial Command Interface – Enhancing Mission Control with Dynamic Inputs',
      case_overview: `You are tasked with designing a Celestial Command Interface—an interactive system that will manage spacecraft operations using real-time inputs, alerts, and visuals. This system will include dynamic updates for mission parameters, control options for the spacecraft, and a real-time status dashboard.`,
      case_explanation: `Integrate all Pygame concepts: window creation, keyboard input with arrow keys and letter keys, custom events with set_timer(), dynamic text rendering, image loading and transformation (rotate, flip, scale), real-time text input with KEYDOWN and unicode, and comprehensive event handling. This demonstrates complete mastery of Pygame for building interactive mission control interfaces.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 241 if it exists
    await problemsCollection.deleteOne({ problem_id: 241 });
    await testCasesCollection.deleteMany({ problem_id: 241 });

    // Insert problem 241
    const problemResult = await problemsCollection.insertOne(problem241);
    console.log('Problem 241 inserted');

    // Test cases for Problem 241 - Pygame problems only need 2 test cases (no input variation)
    const testCases = [
      // Visible test case
      {
        test_case_id: 2411,
        problem_id: 241,
        input: '',
        expected_output: 'Interface initialized\nSystem check performed\nAuto-check active',
        is_hidden: false,
        weight: 50
      },
      // Hidden test case
      {
        test_case_id: 2412,
        problem_id: 241,
        input: '',
        expected_output: 'Interface initialized\nSystem check performed\nAuto-check active',
        is_hidden: true,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 241`);

    console.log('\n✅ Problem 241 (Level 4, Session 10, Case 6: Celestial Command Interface) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem241()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
