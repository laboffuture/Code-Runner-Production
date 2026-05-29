import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem175() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 175: Level 3, Session 10, Case 1 - Function Overriding
    const problem175 = {
      problem_id: 175,
      session_id: 32, // Level 3, Session 10
      title: 'Function Overriding – Making AI Think Differently',
      description: 'Explore how different AI classes can share the same method name but behave uniquely based on their specialization.',
      difficulty: 'Medium',
      question: `Can you create a base Animal class with a speak() method, then build specialized Dog and Cat classes that override this method with their own unique sounds? Take 2 inputs for animal types ("Dog" or "Cat"), create objects for each, and call their speak() methods in order.`,      sample_input: 'Dog\nCat',
      sample_output: 'The dog barks.\nThe cat meows.',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['polymorphism', 'function overriding', 'method overriding', 'inheritance', 'OOP'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 10: Polymorphism',

      // Case-specific content
      case_number: 1,
      case_title: 'Function Overriding – Making AI Think Differently',
      case_overview: `Function overriding allows child classes to replace parent methods with specialized behavior. Each child maintains the same method name while implementing unique functionality.`,
      case_explanation: `Create Animal class with speak() method. Create Dog and Cat classes inheriting Animal, each overriding speak() with unique messages. Create objects and call speak() to show different behaviors.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 175 if it exists
    await problemsCollection.deleteOne({ problem_id: 175 });
    await testCasesCollection.deleteMany({ problem_id: 175 });

    // Insert problem 175
    const problemResult = await problemsCollection.insertOne(problem175);
    console.log('Problem 175 inserted');

    // Test cases for Problem 175
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1751,
        problem_id: 175,
        input: 'Dog\nCat',
        expected_output: 'The dog barks.\nThe cat meows.',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1752,
        problem_id: 175,
        input: 'Cat\nDog',
        expected_output: 'The cat meows.\nThe dog barks.',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1753,
        problem_id: 175,
        input: 'Dog\nDog',
        expected_output: 'The dog barks.\nThe dog barks.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1754,
        problem_id: 175,
        input: 'Cat\nCat',
        expected_output: 'The cat meows.\nThe cat meows.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1755,
        problem_id: 175,
        input: 'Dog\nCat',
        expected_output: 'The dog barks.\nThe cat meows.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1756,
        problem_id: 175,
        input: 'Cat\nDog',
        expected_output: 'The cat meows.\nThe dog barks.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1757,
        problem_id: 175,
        input: 'Dog\nDog',
        expected_output: 'The dog barks.\nThe dog barks.',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 175`);

    console.log('\n✅ Problem 175 (Level 3, Session 10, Case 1: Function Overriding) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem175()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
