import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem146() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 146: Level 3, Session 5, Case 2 - Adding Methods for Actions
    const problem146 = {
      problem_id: 146,
      session_id: 27, // Level 3, Session 5
      title: 'Adding Methods for Actions',
      description: 'Methods are functions inside a class that describe object behavior, using self to access and modify attributes, promoting cleaner and reusable code.',
      difficulty: 'Medium',
      question: `Can you create a Student class with name and grade attributes, and an update_grade method? Extract grade numbers from both grades. If sum of grade numbers is even, print 'Level Up: [name] is in grade [grade].' and 'Level Up: [name] is now in grade [new_grade].' If odd, use 'Promotion: ' prefix.`,      sample_input: 'Ravi\n7th\n8th',
      sample_output: 'Promotion: Ravi is in grade 7th.\nPromotion: Ravi is now in grade 8th.',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'methods', 'self', 'attribute modification', 'object behavior', 'string slicing', 'conditional logic', 'arithmetic'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 5: Classes with Attributes and Methods',

      // Case-specific content
      case_number: 2,
      case_title: 'Adding Methods for Actions',
      case_overview: `Methods use self to access and modify object attributes, encapsulating logic within objects for cleaner code.`,
      case_explanation: `Create Student class with __init__(name, grade) and update_grade(new_grade) method. Extract grade numbers using int(grade[:-2]) from both current and new grades. Sum them. If sum is even, use 'Level Up:' prefix. If sum is odd, use 'Promotion:' prefix for both print statements.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 146 - 7 test cases (2 visible + 5 hidden)
    const testCases146 = [
      {
        test_case_id: 1461,
        problem_id: 146,
        input: 'Ravi\n7th\n8th',
        expected_output: 'Promotion: Ravi is in grade 7th.\nPromotion: Ravi is now in grade 8th.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1462,
        problem_id: 146,
        input: 'Anya\n6th\n7th',
        expected_output: 'Promotion: Anya is in grade 6th.\nPromotion: Anya is now in grade 7th.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1463,
        problem_id: 146,
        input: 'Maya\n7th\n9th',
        expected_output: 'Level Up: Maya is in grade 7th.\nLevel Up: Maya is now in grade 9th.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1464,
        problem_id: 146,
        input: 'Kiran\n9th\n10th',
        expected_output: 'Promotion: Kiran is in grade 9th.\nPromotion: Kiran is now in grade 10th.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1465,
        problem_id: 146,
        input: 'Zara\n6th\n8th',
        expected_output: 'Level Up: Zara is in grade 6th.\nLevel Up: Zara is now in grade 8th.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1466,
        problem_id: 146,
        input: 'Arjun\n9th\n11th',
        expected_output: 'Level Up: Arjun is in grade 9th.\nLevel Up: Arjun is now in grade 11th.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1467,
        problem_id: 146,
        input: 'Leena\n7th\n8th',
        expected_output: 'Promotion: Leena is in grade 7th.\nPromotion: Leena is now in grade 8th.',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 146 });
    await problemsCollection.insertOne(problem146);
    console.log('Problem 146 inserted');

    await testCasesCollection.deleteMany({ problem_id: 146 });
    await testCasesCollection.insertMany(testCases146);
    console.log(`${testCases146.length} test cases inserted for Problem 146`);

    console.log('\n✅ Problem 146 (Level 3, Session 5, Case 2: Adding Methods for Actions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem146()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
