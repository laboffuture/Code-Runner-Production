import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem157() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 157: Level 3, Session 7, Case 1 - Understanding Public, Protected, and Private Attributes
    const problem157 = {
      problem_id: 157,
      session_id: 29, // Level 3, Session 7
      title: 'Securing Crew Data with Access Levels',
      description: 'Access modifiers define how class attributes are accessed from outside the class. Public attributes are accessible anywhere. Protected attributes suggest limited access. Private attributes are strongly restricted and cannot be accessed directly.',
      difficulty: 'Easy',
      question: `Create a CrewMember class with public name, protected _email, and private __password. Print name with prefix based on length: len>=10+even='Senior Crew:', len>=10+odd='Lead Crew:', len<10+even='Crew:', len<10+odd='New Crew:', then print email.`,      sample_input: 'Captain Nova\nnova@ship.com\nsecret123',
      sample_output: 'Senior Crew: Captain Nova\nnova@ship.com',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['encapsulation', 'access modifiers', 'public attributes', 'protected attributes', 'private attributes', 'classes', 'OOP', 'conditional logic', 'nested conditionals', 'modulo operator'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 7: Encapsulation & Access Modifiers',

      // Case-specific content
      case_number: 1,
      case_title: 'Securing Crew Data with Access Levels',
      case_overview: `Different types of information need different levels of protection. Public data can be accessed freely, protected data should be handled carefully, and private data must remain hidden from external access.`,
      case_explanation: `Create CrewMember class with public (name), protected (_email), and private (__password) attributes. Print name with conditional prefix based on length: use nested if-else to check len>=10 or <10, then even/odd. Prefixes: len>=10+even='Senior Crew:', len>=10+odd='Lead Crew:', len<10+even='Crew:', len<10+odd='New Crew:'. Then print protected email.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 157 if it exists
    await problemsCollection.deleteOne({ problem_id: 157 });
    await testCasesCollection.deleteMany({ problem_id: 157 });

    // Insert problem 157
    const problemResult = await problemsCollection.insertOne(problem157);
    console.log('Problem 157 inserted');

    // Test cases for Problem 157
    const testCases = [
      // Visible test case
      {
        test_case_id: 1571,
        problem_id: 157,
        input: 'Captain Nova\nnova@ship.com\nsecret123',
        expected_output: 'Senior Crew: Captain Nova\nnova@ship.com', // len=12, even, >=10
        is_hidden: false,
        weight: 20
      },
      // Hidden test cases
      {
        test_case_id: 1572,
        problem_id: 157,
        input: 'Engineer Smith\nsmith@ship.com\npass456',
        expected_output: 'Senior Crew: Engineer Smith\nsmith@ship.com', // len=14, even, >=10
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1573,
        problem_id: 157,
        input: 'Dr. Chen\nchen@med.ship\nmedical789',
        expected_output: 'Crew: Dr. Chen\nchen@med.ship', // len=8, even, <10
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1574,
        problem_id: 157,
        input: 'Pilot Ray\nray@nav.ship\nfly999',
        expected_output: 'New Crew: Pilot Ray\nray@nav.ship', // len=9, odd, <10
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1575,
        problem_id: 157,
        input: 'Admiral Lee\nadmiral@command.ship\ntopsecret',
        expected_output: 'Lead Crew: Admiral Lee\nadmiral@command.ship', // len=11, odd, >=10
        is_hidden: true,
        weight: 20
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 157`);

    console.log('\n✅ Problem 157 (Level 3, Session 7, Case 1: Understanding Public, Protected, and Private Attributes) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem157()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
