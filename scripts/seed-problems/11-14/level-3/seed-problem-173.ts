import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem173() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 173: Level 3, Session 9, Case 5 - Method Resolution Order (MRO)
    const problem173 = {
      problem_id: 173,
      session_id: 31, // Level 3, Session 9
      title: 'Method Resolution Order (MRO) in Multiple Inheritance',
      description: 'Explore how Python determines which method to call when multiple parent classes have methods with the same name.',
      difficulty: 'Medium',
      question: `Can you demonstrate Python's Method Resolution Order (MRO) using multiple inheritance with conflicting method names?`,      sample_input: 'Alpha',
      sample_output: 'Scanner reporting: All clear.\n(<class \'__main__.CommanderAI\'>, <class \'__main__.ScannerAI\'>, <class \'__main__.LoggerAI\'>, <class \'object\'>)',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['MRO', 'method resolution order', 'multiple inheritance', '__mro__', 'inheritance order', 'OOP', 'class initialization'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 9: Mastering Inheritance - Advanced',

      // Case-specific content
      case_number: 5,
      case_title: 'Method Resolution Order (MRO) in Multiple Inheritance',
      case_overview: `MRO determines which parent's method is called when multiple parents have conflicting method names.`,
      case_explanation: `Build CommanderAI inheriting from ScannerAI and LoggerAI to demonstrate MRO with conflicting method names.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 173 if it exists
    await problemsCollection.deleteOne({ problem_id: 173 });
    await testCasesCollection.deleteMany({ problem_id: 173 });

    // Insert problem 173
    const problemResult = await problemsCollection.insertOne(problem173);
    console.log('Problem 173 inserted');

    // Test cases for Problem 173
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1731,
        problem_id: 173,
        input: 'Alpha',
        expected_output: 'Scanner reporting: All clear.\n(<class \'__main__.CommanderAI\'>, <class \'__main__.ScannerAI\'>, <class \'__main__.LoggerAI\'>, <class \'object\'>)',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1732,
        problem_id: 173,
        input: 'Bravo',
        expected_output: 'Scanner reporting: All clear.\n(<class \'__main__.CommanderAI\'>, <class \'__main__.ScannerAI\'>, <class \'__main__.LoggerAI\'>, <class \'object\'>)',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1733,
        problem_id: 173,
        input: 'Charlie',
        expected_output: 'Scanner reporting: All clear.\n(<class \'__main__.CommanderAI\'>, <class \'__main__.ScannerAI\'>, <class \'__main__.LoggerAI\'>, <class \'object\'>)',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1734,
        problem_id: 173,
        input: 'Delta',
        expected_output: 'Scanner reporting: All clear.\n(<class \'__main__.CommanderAI\'>, <class \'__main__.ScannerAI\'>, <class \'__main__.LoggerAI\'>, <class \'object\'>)',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1735,
        problem_id: 173,
        input: 'Echo',
        expected_output: 'Scanner reporting: All clear.\n(<class \'__main__.CommanderAI\'>, <class \'__main__.ScannerAI\'>, <class \'__main__.LoggerAI\'>, <class \'object\'>)',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1736,
        problem_id: 173,
        input: 'Foxtrot',
        expected_output: 'Scanner reporting: All clear.\n(<class \'__main__.CommanderAI\'>, <class \'__main__.ScannerAI\'>, <class \'__main__.LoggerAI\'>, <class \'object\'>)',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1737,
        problem_id: 173,
        input: 'Golf',
        expected_output: 'Scanner reporting: All clear.\n(<class \'__main__.CommanderAI\'>, <class \'__main__.ScannerAI\'>, <class \'__main__.LoggerAI\'>, <class \'object\'>)',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 173`);

    console.log('\n✅ Problem 173 (Level 3, Session 9, Case 5: Method Resolution Order) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem173()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
