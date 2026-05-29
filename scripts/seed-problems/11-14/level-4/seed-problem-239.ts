import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem239() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 239: Level 4, Session 10, Case 4 - Typing Text with Keyboard
    const problem239 = {
      problem_id: 239,
      session_id: 43, // Level 4, Session 10
      title: 'Typing Text with Keyboard',
      description: 'Learn to capture keyboard input dynamically and display typed text in real-time.',
      difficulty: 'Medium',
      question: `Create a Pygame window (500x300) that allows users to type text dynamically. Display a prompt "Enter your name: " at position (50, 80). Below it at position (50, 120), display the text being typed by the user. Handle BACKSPACE to delete the last character. Use event.unicode to capture typed characters. Print "Text input active" when initialized.`,

      sample_input: '',
      sample_output: 'Text input active',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['pygame.KEYDOWN', 'event.unicode', 'K_BACKSPACE', 'dynamic text input', 'real-time typing'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 10: Pygame Events and Interactions',

      // Case-specific content
      case_number: 4,
      case_title: 'Typing Text with Keyboard',
      case_overview: `Building on keyboard input concepts, this case focuses on typing text dynamically with the keyboard. You will allow the user to type their input directly into the program, and display the typed text on the screen as they type. This is a crucial feature for applications like chat boxes, forms, and text-based games.`,
      case_explanation: `event.unicode captures the typed character. K_BACKSPACE checks if the backspace key is pressed and removes the last character using string slicing [:-1]. This enables real-time text input similar to text boxes in applications.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 239 if it exists
    await problemsCollection.deleteOne({ problem_id: 239 });
    await testCasesCollection.deleteMany({ problem_id: 239 });

    // Insert problem 239
    const problemResult = await problemsCollection.insertOne(problem239);
    console.log('Problem 239 inserted');

    // Test cases for Problem 239 - Pygame problems only need 2 test cases (no input variation)
    const testCases = [
      // Visible test case
      {
        test_case_id: 2391,
        problem_id: 239,
        input: '',
        expected_output: 'Text input active',
        is_hidden: false,
        weight: 50
      },
      // Hidden test case
      {
        test_case_id: 2392,
        problem_id: 239,
        input: '',
        expected_output: 'Text input active',
        is_hidden: true,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 239`);

    console.log('\n✅ Problem 239 (Level 4, Session 10, Case 4: Typing Text) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem239()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
