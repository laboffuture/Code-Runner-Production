import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem160() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 160: Level 3, Session 7, Case 4 - Implementing Multi-Layer Security
    const problem160 = {
      problem_id: 160,
      session_id: 29, // Level 3, Session 7
      title: 'Implementing Multi-Layer Security',
      description: 'In complex systems, sometimes multiple layers of security are necessary. This involves applying multiple validation checks within the same system, such as validating both a PIN code and an access key.',
      difficulty: 'Medium',
      question: `Your spacecraft's vault system requires two-factor authentication for maximum security. Can you create a SecureVault class that only grants access when both the PIN code and access key are correct?`,      sample_input: '1234\nABCD\n1234\nABCD',
      sample_output: 'Access Granted',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['multi-factor authentication', 'encapsulation', 'private attributes', 'validation', 'security', 'methods'],
        estimated_time_minutes: 18
      },

      // Session-level content
      session_title: 'Session 7: Encapsulation & Access Modifiers',

      // Case-specific content
      case_number: 4,
      case_title: 'Implementing Multi-Layer Security',
      case_overview: `Multi-layer security validates multiple credentials before granting access. Both the PIN and access key must match the stored values to authorize entry.`,
      case_explanation: `Store PIN and access key as private attributes (__pin_code, __access_key). Use verify_access() to check if both attempts match before granting access.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 160 if it exists
    await problemsCollection.deleteOne({ problem_id: 160 });
    await testCasesCollection.deleteMany({ problem_id: 160 });

    // Insert problem 160
    const problemResult = await problemsCollection.insertOne(problem160);
    console.log('Problem 160 inserted');

    // Test cases for Problem 160
    const testCases = [
      // Visible test case
      {
        test_case_id: 1601,
        problem_id: 160,
        input: '1234\nABCD\n1234\nABCD',
        expected_output: 'Access Granted',
        is_hidden: false,
        weight: 20
      },
      // Hidden test cases
      {
        test_case_id: 1602,
        problem_id: 160,
        input: '5678\nXYZ1\n5678\nXYZ1',
        expected_output: 'Access Granted',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1603,
        problem_id: 160,
        input: '1234\nABCD\n1234\nWRONG',
        expected_output: 'Access Denied',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1604,
        problem_id: 160,
        input: '1234\nABCD\n9999\nABCD',
        expected_output: 'Access Denied',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1605,
        problem_id: 160,
        input: '9876\nSECRET\n9999\nWRONG',
        expected_output: 'Access Denied',
        is_hidden: true,
        weight: 20
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 160`);

    console.log('\n✅ Problem 160 (Level 3, Session 7, Case 4: Implementing Multi-Layer Security) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem160()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
