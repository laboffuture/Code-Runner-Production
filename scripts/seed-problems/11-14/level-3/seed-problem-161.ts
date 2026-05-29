import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem161() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 161: Level 3, Session 7, Case 5 - Access Control with Role-Based Permissions
    const problem161 = {
      problem_id: 161,
      session_id: 29, // Level 3, Session 7
      title: 'Access Control with Role-Based Permissions',
      description: 'In large systems, different users might have different roles and levels of access. This explores how to apply role-based access control (RBAC) where users are assigned roles that determine the data they can access.',
      difficulty: 'Medium',
      question: `Your mission control system assigns different access levels based on crew roles. Can you create an AccessControl class where Commanders get full access (with PIN verification), Users get limited access, and Guests are denied entry?`,      sample_input: 'Commander\n9876\n9876',
      sample_output: 'Access Granted: Commander',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['role-based access control', 'RBAC', 'encapsulation', 'private attributes', 'conditionals', 'security'],
        estimated_time_minutes: 20
      },

      // Session-level content
      session_title: 'Session 7: Encapsulation & Access Modifiers',

      // Case-specific content
      case_number: 5,
      case_title: 'Access Control with Role-Based Permissions',
      case_overview: `Role-based access control assigns different permission levels to different user roles. Access rights depend on the user's role and validation requirements.`,
      case_explanation: `Store role and admin PIN as private attributes. Check role in access_vault(): Commander needs correct PIN for full access, User gets limited access without PIN check, others are denied.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 161 if it exists
    await problemsCollection.deleteOne({ problem_id: 161 });
    await testCasesCollection.deleteMany({ problem_id: 161 });

    // Insert problem 161
    const problemResult = await problemsCollection.insertOne(problem161);
    console.log('Problem 161 inserted');

    // Test cases for Problem 161
    const testCases = [
      // Visible test case
      {
        test_case_id: 1611,
        problem_id: 161,
        input: 'Commander\n9876\n9876',
        expected_output: 'Access Granted: Commander',
        is_hidden: false,
        weight: 20
      },
      // Hidden test cases
      {
        test_case_id: 1612,
        problem_id: 161,
        input: 'User\n9876\n1234',
        expected_output: 'Access Granted: User - Limited View',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1613,
        problem_id: 161,
        input: 'Commander\n9876\n1111',
        expected_output: 'Access Denied',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1614,
        problem_id: 161,
        input: 'Guest\n9876\n9876',
        expected_output: 'Access Denied',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1615,
        problem_id: 161,
        input: 'User\n5555\n9999',
        expected_output: 'Access Granted: User - Limited View',
        is_hidden: true,
        weight: 20
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 161`);

    console.log('\n✅ Problem 161 (Level 3, Session 7, Case 5: Access Control with Role-Based Permissions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem161()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
