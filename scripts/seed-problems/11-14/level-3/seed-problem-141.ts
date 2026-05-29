import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem141() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 141: Level 3, Session 4, Case 3 - Using Multiple Objects
    const problem141 = {
      problem_id: 141,
      session_id: 26, // Level 3, Session 4
      title: 'Using Multiple Objects',
      description: 'One class can create many independent objects, each with its own data, like using one cookie cutter to make many unique cookies.',
      difficulty: 'Medium',
      question: `Can you create N Product objects with name and price attributes, and display each using a show method?`,      sample_input: '2\nPencil 2.5\nNotebook 5.0',
      sample_output: 'Pencil costs $2.5.\nNotebook costs $5.0.',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'multiple objects', 'loops', 'object management', 'list of objects'],
        estimated_time_minutes: 18
      },

      // Session-level content
      session_title: 'Session 4: Using Classes and Objects in Python',

      // Case-specific content
      case_number: 3,
      case_title: 'Using Multiple Objects',
      case_overview: `One class creates many independent objects with unique data, managing similar items efficiently in programs.`,
      case_explanation: `Define Product class with __init__(name, price) and show() method. Read N, loop N times reading name and price, create objects, call show().`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 141 - 7 test cases (2 visible + 5 hidden)
    const testCases141 = [
      {
        test_case_id: 1411,
        problem_id: 141,
        input: '2\nPencil 2.5\nNotebook 5.0',
        expected_output: 'Pencil costs $2.5.\nNotebook costs $5.0.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1412,
        problem_id: 141,
        input: '1\nHelmet 149.99',
        expected_output: 'Helmet costs $149.99.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1413,
        problem_id: 141,
        input: '3\nPen 1.2\nEraser 0.5\nRuler 3.0',
        expected_output: 'Pen costs $1.2.\nEraser costs $0.5.\nRuler costs $3.0.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1414,
        problem_id: 141,
        input: '4\nBackpack 45.0\nWater 2.5\nSnack 5.5\nMap 8.0',
        expected_output: 'Backpack costs $45.0.\nWater costs $2.5.\nSnack costs $5.5.\nMap costs $8.0.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1415,
        problem_id: 141,
        input: '2\nTablet 299.99\nCharger 19.99',
        expected_output: 'Tablet costs $299.99.\nCharger costs $19.99.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1416,
        problem_id: 141,
        input: '5\nApple 0.5\nBanana 0.3\nOrange 0.7\nGrape 2.0\nMango 1.5',
        expected_output: 'Apple costs $0.5.\nBanana costs $0.3.\nOrange costs $0.7.\nGrape costs $2.0.\nMango costs $1.5.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1417,
        problem_id: 141,
        input: '1\nSpaceSuit 999.99',
        expected_output: 'SpaceSuit costs $999.99.',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 141 });
    await problemsCollection.insertOne(problem141);
    console.log('Problem 141 inserted');

    await testCasesCollection.deleteMany({ problem_id: 141 });
    await testCasesCollection.insertMany(testCases141);
    console.log(`${testCases141.length} test cases inserted for Problem 141`);

    console.log('\n✅ Problem 141 (Level 3, Session 4, Case 3: Using Multiple Objects) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem141()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
