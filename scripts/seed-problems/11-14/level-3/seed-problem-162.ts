import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem162() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 162: Level 3, Session 7, Case 6 - Galactic Security Vault (Final Task)
    const problem162 = {
      problem_id: 162,
      session_id: 29, // Level 3, Session 7
      title: 'Galactic Security Vault – Protecting Classified Data',
      description: 'Deep Space Command has intercepted encrypted fragments containing Nova Network keys. Your mission is to build a Galactic Security Vault that protects these classified materials using advanced encapsulation protocols. The vault must isolate private security keys from public logs while allowing controlled access through secure methods. This system combines all security principles learned in this session.',
      difficulty: 'Hard',
      question: `Create a Vault class with private __pin_code, protected _access_level, and public vault_id. Implement get_pin(), set_pin() (validate 4-digit only), and unlock_vault(). Create vault1, set vault2=vault1, update via vault2, print both PINs, then unlock.`,

      sample_input: '1234\nTop-Secret\nVX-01\n9999\n9999',
      sample_output: 'PIN updated successfully.\nVault1 PIN: 9999\nVault2 PIN: 9999\nAccess Granted',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['encapsulation', 'access modifiers', 'private attributes', 'protected attributes', 'public attributes', 'getters', 'setters', 'validation', 'object references', 'conditional methods', 'OOP'],
        estimated_time_minutes: 30
      },

      // Session-level content
      session_title: 'Session 7: Encapsulation & Access Modifiers',

      // Case-specific content
      case_number: 6,
      case_title: 'Galactic Security Vault – Protecting Classified Data',
      case_overview: `This final mission combines all Session 7 concepts: access modifiers (private __pin_code, protected _access_level, public vault_id), controlled data access through getter/setter methods with validation, object reference behavior demonstration, and conditional authorization logic.`,
      case_explanation: `Build Vault class with three access levels. Implement get_pin() and set_pin() with 4-digit validation. Create two references (vault2 = vault1), update via one reference, print both to show shared state. Add unlock_vault() method to check PIN and grant/deny access.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 162 if it exists
    await problemsCollection.deleteOne({ problem_id: 162 });
    await testCasesCollection.deleteMany({ problem_id: 162 });

    // Insert problem 162
    const problemResult = await problemsCollection.insertOne(problem162);
    console.log('Problem 162 inserted');

    // Test cases for Problem 162 (7 test cases for final task)
    const testCases = [
      // Visible test case
      {
        test_case_id: 1621,
        problem_id: 162,
        input: '1234\nTop-Secret\nVX-01\n9999\n9999',
        expected_output: 'PIN updated successfully.\nVault1 PIN: 9999\nVault2 PIN: 9999\nAccess Granted',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1622,
        problem_id: 162,
        input: '1234\nTop-Secret\nVX-01\n999\n1234',
        expected_output: 'Invalid PIN! Must be 4 digits.\nVault1 PIN: 1234\nVault2 PIN: 1234\nAccess Granted',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1623,
        problem_id: 162,
        input: '5678\nSecret\nVX-02\n1111\n9999',
        expected_output: 'PIN updated successfully.\nVault1 PIN: 1111\nVault2 PIN: 1111\nAccess Denied',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1624,
        problem_id: 162,
        input: '0000\nConfidential\nVX-03\n4321\n4321',
        expected_output: 'PIN updated successfully.\nVault1 PIN: 4321\nVault2 PIN: 4321\nAccess Granted',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1625,
        problem_id: 162,
        input: '9876\nRestricted\nVX-04\n12345\n0000',
        expected_output: 'Invalid PIN! Must be 4 digits.\nVault1 PIN: 9876\nVault2 PIN: 9876\nAccess Denied',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 1626,
        problem_id: 162,
        input: '2468\nClassified\nVX-05\n8642\n8642',
        expected_output: 'PIN updated successfully.\nVault1 PIN: 8642\nVault2 PIN: 8642\nAccess Granted',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1627,
        problem_id: 162,
        input: '7777\nTop-Secret\nVX-06\n11\n7777',
        expected_output: 'Invalid PIN! Must be 4 digits.\nVault1 PIN: 7777\nVault2 PIN: 7777\nAccess Granted',
        is_hidden: true,
        weight: 15
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 162`);

    console.log('\n✅ Problem 162 (Level 3, Session 7, Case 6: Secure Mission Database System - FINAL TASK) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem162()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
