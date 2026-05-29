import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem240() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 240: Level 4, Session 10, Case 5 - Image Display and Movement
    const problem240 = {
      problem_id: 240,
      session_id: 43, // Level 4, Session 10
      title: 'Image Display and Movement',
      description: 'Learn to load, resize, and move images on screen using keyboard input.',
      difficulty: 'Medium',
      question: `Create a Pygame window (500x400) that loads an image "bee.png" and resizes it to 100x100 pixels (not 50x50). The image starts at position (200, 150). Allow movement using WASD keys: A moves left (x -= 2), D moves right (x += 2), W moves up (y -= 2), S moves down (y += 2). Use clock.tick(30) for 30 FPS. Print "Image movement active" when initialized.`,

      compiler_comment: '# Write your code here\n',
      sample_input: '',
      sample_output: 'Image movement active',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['pygame.image.load()', 'pygame.transform.scale()', 'image manipulation', 'WASD keys', 'sprite movement'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 10: Pygame Events and Interactions',

      // Case-specific content
      case_number: 5,
      case_title: 'Image Display and Movement',
      case_overview: `This case introduces you to image manipulation in Pygame. Learn how to load an image (e.g., a player character or object), resize it to fit within the screen, and move it around using keyboard input. Working with images is essential for games or graphical applications, where sprites (images) replace simple geometric shapes.`,
      case_explanation: `pygame.image.load("bee.png") loads the image file (ensure it's in the same folder as the Python script). pygame.transform.scale(image, (100, 100)) resizes the image to 100x100 pixels. screen.blit(image, (x, y)) draws the image at the updated position based on WASD key inputs.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 240 if it exists
    await problemsCollection.deleteOne({ problem_id: 240 });
    await testCasesCollection.deleteMany({ problem_id: 240 });

    // Insert problem 240
    const problemResult = await problemsCollection.insertOne(problem240);
    console.log('Problem 240 inserted');

    // Test cases for Problem 240 - Pygame problems only need 2 test cases (no input variation)
    const testCases = [
      // Visible test case
      {
        test_case_id: 2401,
        problem_id: 240,
        input: '',
        expected_output: 'Image movement active',
        is_hidden: false,
        weight: 50
      },
      // Hidden test case
      {
        test_case_id: 2402,
        problem_id: 240,
        input: '',
        expected_output: 'Image movement active',
        is_hidden: true,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 240`);

    console.log('\n✅ Problem 240 (Level 4, Session 10, Case 5: Image Movement) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem240()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
