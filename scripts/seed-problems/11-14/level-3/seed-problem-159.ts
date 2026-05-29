import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem159() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 159: Level 3, Session 7, Case 3 - Protecting Sensitive Data with Encapsulation
    const problem159 = {
      problem_id: 159,
      session_id: 29, // Level 3, Session 7
      title: 'Protecting Sensitive Data with Encapsulation',
      description: 'Encapsulation helps reduce code errors and makes programs more secure. It hides internal data that does not need to be exposed and ensures that changes only happen in controlled ways.',
      difficulty: 'Easy',
      question: `Your space station's security system stores sensitive PIN codes that must never be exposed directly. Can you create a SecurityModule class where the PIN remains private but can be retrieved through a secure getter method?`,      sample_input: '1234',
      sample_output: '1234',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['encapsulation', 'data protection', 'private attributes', 'getters', 'security', 'information hiding'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 7: Encapsulation & Access Modifiers',

      // Case-specific content
      case_number: 3,
      case_title: 'Protecting Sensitive Data with Encapsulation',
      case_overview: `Encapsulation protects critical data from unauthorized access by hiding private attributes and providing controlled access only through designated methods.`,
      case_explanation: `Store the PIN as a private attribute (__pin). Create a get_pin() method to provide controlled access without allowing direct modification.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 159 if it exists
    await problemsCollection.deleteOne({ problem_id: 159 });
    await testCasesCollection.deleteMany({ problem_id: 159 });

    // Insert problem 159
    const problemResult = await problemsCollection.insertOne(problem159);
    console.log('Problem 159 inserted');

    // Test cases for Problem 159
    const testCases = [
      // Visible test case
      {
        test_case_id: 1591,
        problem_id: 159,
        input: '1234',
        expected_output: '1234',
        is_hidden: false,
        weight: 20
      },
      // Hidden test cases
      {
        test_case_id: 1592,
        problem_id: 159,
        input: '5678',
        expected_output: '5678',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1593,
        problem_id: 159,
        input: '9999',
        expected_output: '9999',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1594,
        problem_id: 159,
        input: '0000',
        expected_output: '0000',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1595,
        problem_id: 159,
        input: '4321',
        expected_output: '4321',
        is_hidden: true,
        weight: 20
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 159`);

    console.log('\n✅ Problem 159 (Level 3, Session 7, Case 3: Protecting Sensitive Data with Encapsulation) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem159()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
