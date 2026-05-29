import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem143() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 143: Level 3, Session 4, Case 5 - Using Data to Make Calculations
    const problem143 = {
      problem_id: 143,
      session_id: 26, // Level 3, Session 4
      title: 'Using Data to Make Calculations',
      description: 'Objects can use their stored data to perform calculations automatically, organizing code and avoiding formula repetition.',
      difficulty: 'Easy',
      question: `Can you create a Rectangle class with length and width attributes, and an area method that returns the calculated area?`,      sample_input: '8\n4',
      sample_output: 'The area of the rectangle is: 32',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'calculations', 'return values', 'methods with logic', 'encapsulation'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 4: Using Classes and Objects in Python',

      // Case-specific content
      case_number: 5,
      case_title: 'Using Data to Make Calculations',
      case_overview: `Objects use stored data to automate calculations, keeping code organized and avoiding formula repetition.`,
      case_explanation: `Create Rectangle class with __init__(length, width) and area() method returning length * width. Read 2 inputs, create object, print result.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 143 - 7 test cases (2 visible + 5 hidden)
    const testCases143 = [
      {
        test_case_id: 1431,
        problem_id: 143,
        input: '8\n4',
        expected_output: 'The area of the rectangle is: 32',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1432,
        problem_id: 143,
        input: '5\n3',
        expected_output: 'The area of the rectangle is: 15',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1433,
        problem_id: 143,
        input: '10\n10',
        expected_output: 'The area of the rectangle is: 100',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1434,
        problem_id: 143,
        input: '7\n6',
        expected_output: 'The area of the rectangle is: 42',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1435,
        problem_id: 143,
        input: '12\n5',
        expected_output: 'The area of the rectangle is: 60',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1436,
        problem_id: 143,
        input: '15\n8',
        expected_output: 'The area of the rectangle is: 120',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1437,
        problem_id: 143,
        input: '20\n3',
        expected_output: 'The area of the rectangle is: 60',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 143 });
    await problemsCollection.insertOne(problem143);
    console.log('Problem 143 inserted');

    await testCasesCollection.deleteMany({ problem_id: 143 });
    await testCasesCollection.insertMany(testCases143);
    console.log(`${testCases143.length} test cases inserted for Problem 143`);

    console.log('\n✅ Problem 143 (Level 3, Session 4, Case 5: Using Data to Make Calculations) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem143()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
