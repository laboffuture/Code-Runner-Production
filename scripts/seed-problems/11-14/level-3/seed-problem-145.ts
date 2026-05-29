import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem145() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 145: Level 3, Session 5, Case 1 - Creating a Class with Attributes
    const problem145 = {
      problem_id: 145,
      session_id: 27, // Level 3, Session 5
      title: 'Creating a Class with Attributes',
      description: 'A class holds related data using attributes, which represent the state or properties of an object and are initialized using the __init__() method.',
      difficulty: 'Easy',
      question: `Can you create a Student class with name and grade attributes, and a display method? Extract the grade number from grade (e.g., '7th' -> 7). If grade number is even, print 'Even Grade: [name] - [grade]'. If odd, print 'Odd Grade: [name] - [grade]'.`,      sample_input: 'Anya\n7th',
      sample_output: 'Odd Grade: Anya - 7th',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'attributes', '__init__', 'self', 'object creation', 'data storage', 'string slicing', 'conditional logic'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 5: Classes with Attributes and Methods',

      // Case-specific content
      case_number: 1,
      case_title: 'Creating a Class with Attributes',
      case_overview: `A class holds data using attributes initialized via __init__(), allowing objects to store unique values efficiently.`,
      case_explanation: `Create Student class with __init__(name, grade) and display() method. Extract grade number using int(grade[:-2]) or similar. Check if grade_num % 2 == 0 for even/odd, print accordingly.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 145 - 7 test cases (2 visible + 5 hidden)
    const testCases145 = [
      {
        test_case_id: 1451,
        problem_id: 145,
        input: 'Anya\n7th',
        expected_output: 'Odd Grade: Anya - 7th',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1452,
        problem_id: 145,
        input: 'Ravi\n8th',
        expected_output: 'Even Grade: Ravi - 8th',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1453,
        problem_id: 145,
        input: 'Maya\n6th',
        expected_output: 'Even Grade: Maya - 6th',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1454,
        problem_id: 145,
        input: 'Zara\n9th',
        expected_output: 'Odd Grade: Zara - 9th',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1455,
        problem_id: 145,
        input: 'Kiran\n10th',
        expected_output: 'Even Grade: Kiran - 10th',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1456,
        problem_id: 145,
        input: 'Arjun\n5th',
        expected_output: 'Odd Grade: Arjun - 5th',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1457,
        problem_id: 145,
        input: 'Leena\n11th',
        expected_output: 'Odd Grade: Leena - 11th',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 145 });
    await problemsCollection.insertOne(problem145);
    console.log('Problem 145 inserted');

    await testCasesCollection.deleteMany({ problem_id: 145 });
    await testCasesCollection.insertMany(testCases145);
    console.log(`${testCases145.length} test cases inserted for Problem 145`);

    console.log('\n✅ Problem 145 (Level 3, Session 5, Case 1: Creating a Class with Attributes) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem145()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
