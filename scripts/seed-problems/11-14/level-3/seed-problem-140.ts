import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem140() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 140: Level 3, Session 4, Case 2 - Adding More Methods
    const problem140 = {
      problem_id: 140,
      session_id: 26, // Level 3, Session 4
      title: 'Adding More Methods',
      description: 'Adding multiple methods to a class makes objects more powerful and flexible, allowing them to perform various related actions while keeping code organized.',
      difficulty: 'Easy',
      question: `Can you create a Student class with name and grade attributes, an introduce method, and a study method for a subject?`,      sample_input: 'Anita\n7\nMath',
      sample_output: 'My name is Anita and I am in grade 7.\nAnita is studying Math.',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'multiple methods', 'self', 'object behavior', 'method calls'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 4: Using Classes and Objects in Python',

      // Case-specific content
      case_number: 2,
      case_title: 'Adding More Methods',
      case_overview: `Multiple methods in a class help objects perform various actions, making classes powerful and flexible.`,
      case_explanation: `Create Student class with __init__(name, grade). Add introduce() to print introduction and study(subject) to print study message.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 140 - 7 test cases (2 visible + 5 hidden)
    const testCases140 = [
      {
        test_case_id: 1401,
        problem_id: 140,
        input: 'Anita\n7\nMath',
        expected_output: 'My name is Anita and I am in grade 7.\nAnita is studying Math.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1402,
        problem_id: 140,
        input: 'Rohan\n8\nScience',
        expected_output: 'My name is Rohan and I am in grade 8.\nRohan is studying Science.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1403,
        problem_id: 140,
        input: 'Maya\n6\nEnglish',
        expected_output: 'My name is Maya and I am in grade 6.\nMaya is studying English.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1404,
        problem_id: 140,
        input: 'Arjun\n9\nHistory',
        expected_output: 'My name is Arjun and I am in grade 9.\nArjun is studying History.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1405,
        problem_id: 140,
        input: 'Priya\n10\nPhysics',
        expected_output: 'My name is Priya and I am in grade 10.\nPriya is studying Physics.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1406,
        problem_id: 140,
        input: 'Karan\n5\nArt',
        expected_output: 'My name is Karan and I am in grade 5.\nKaran is studying Art.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1407,
        problem_id: 140,
        input: 'Zara\n11\nChemistry',
        expected_output: 'My name is Zara and I am in grade 11.\nZara is studying Chemistry.',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 140 });
    await problemsCollection.insertOne(problem140);
    console.log('Problem 140 inserted');

    await testCasesCollection.deleteMany({ problem_id: 140 });
    await testCasesCollection.insertMany(testCases140);
    console.log(`${testCases140.length} test cases inserted for Problem 140`);

    console.log('\n✅ Problem 140 (Level 3, Session 4, Case 2: Adding More Methods) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem140()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
