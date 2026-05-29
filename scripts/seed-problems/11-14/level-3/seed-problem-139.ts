import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem139() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 139: Level 3, Session 4, Case 1 - Creating a Simple Class
    const problem139 = {
      problem_id: 139,
      session_id: 26, // Level 3, Session 4
      title: 'Creating a Simple Class',
      description: 'In Python, a class is like a blueprint that defines what properties an object should have and what it can do, helping you reuse the same structure without rewriting code.',
      difficulty: 'Easy',
      question: `Can you create an Animal class with a name attribute and a speak method that prints '[name] makes a sound.'?`,      sample_input: 'Tiger',
      sample_output: 'Tiger makes a sound.',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'objects', '__init__', 'self', 'methods', 'OOP basics'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 4: Using Classes and Objects in Python',

      // Case-specific content
      case_number: 1,
      case_title: 'Creating a Simple Class',
      case_overview: `A class is a blueprint defining object properties and behaviors, enabling code reuse through Object-Oriented Programming.`,
      case_explanation: `Define class Animal with __init__(self, name) to store name. Add speak(self) method to print the message. Read input, create object, call speak().`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 139 - 7 test cases (2 visible + 5 hidden)
    const testCases139 = [
      {
        test_case_id: 1391,
        problem_id: 139,
        input: 'Tiger',
        expected_output: 'Tiger makes a sound.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1392,
        problem_id: 139,
        input: 'Lion',
        expected_output: 'Lion makes a sound.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1393,
        problem_id: 139,
        input: 'Eagle',
        expected_output: 'Eagle makes a sound.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1394,
        problem_id: 139,
        input: 'Dolphin',
        expected_output: 'Dolphin makes a sound.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1395,
        problem_id: 139,
        input: 'Wolf',
        expected_output: 'Wolf makes a sound.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1396,
        problem_id: 139,
        input: 'Elephant',
        expected_output: 'Elephant makes a sound.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1397,
        problem_id: 139,
        input: 'Penguin',
        expected_output: 'Penguin makes a sound.',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 139 });
    await problemsCollection.insertOne(problem139);
    console.log('Problem 139 inserted');

    await testCasesCollection.deleteMany({ problem_id: 139 });
    await testCasesCollection.insertMany(testCases139);
    console.log(`${testCases139.length} test cases inserted for Problem 139`);

    console.log('\n✅ Problem 139 (Level 3, Session 4, Case 1: Creating a Simple Class) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem139()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
