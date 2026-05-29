import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem238() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 238: Level 4, Session 10, Case 3 - Displaying Text on Screen
    const problem238 = {
      problem_id: 238,
      session_id: 43, // Level 4, Session 10
      title: 'Displaying Text on Screen',
      description: 'Learn to render and display text on screen using Pygame font system.',
      difficulty: 'Easy',
      question: `Create a Pygame window (400x300) with gray background (200, 200, 200). Display your name "John Doe" at the top center of the screen (approximately position 150, 30) using a system font size 40 in black color (0, 0, 0). Use pygame.font.SysFont() to create the font and render() to create the text surface. Print "Text display active" when initialized.`,

      sample_input: '',
      sample_output: 'Text display active',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['pygame.font.SysFont()', 'font.render()', 'blit()', 'text display', 'screen positioning'],
        estimated_time_minutes: 10
      },

      // Session-level content
      session_title: 'Session 10: Pygame Events and Interactions',

      // Case-specific content
      case_number: 3,
      case_title: 'Displaying Text on Screen',
      case_overview: `Displaying text is essential in most interactive programs and games. Learn how to display static text on the screen, such as messages, instructions, or game scores. Text is used in many applications, from showing messages to the user to displaying scores and instructions.`,
      case_explanation: `pygame.font.SysFont(None, 40) loads a default system font with size 40. font.render("John Doe", True, (0, 0, 0)) renders the text in black. screen.blit(text, (150, 30)) places the rendered text at the specified position on the screen.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 238 if it exists
    await problemsCollection.deleteOne({ problem_id: 238 });
    await testCasesCollection.deleteMany({ problem_id: 238 });

    // Insert problem 238
    const problemResult = await problemsCollection.insertOne(problem238);
    console.log('Problem 238 inserted');

    // Test cases for Problem 238 - Pygame problems only need 2 test cases (no input variation)
    const testCases = [
      // Visible test case
      {
        test_case_id: 2381,
        problem_id: 238,
        input: '',
        expected_output: 'Text display active',
        is_hidden: false,
        weight: 50
      },
      // Hidden test case
      {
        test_case_id: 2382,
        problem_id: 238,
        input: '',
        expected_output: 'Text display active',
        is_hidden: true,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 238`);

    console.log('\n✅ Problem 238 (Level 4, Session 10, Case 3: Displaying Text) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem238()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
