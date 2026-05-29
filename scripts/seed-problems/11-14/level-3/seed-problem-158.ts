import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem158() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 158: Level 3, Session 7, Case 2 - Using Getters and Setters
    const problem158 = {
      problem_id: 158,
      session_id: 29, // Level 3, Session 7
      title: 'Validating Fuel Updates',
      description: 'Since private attributes cannot be accessed directly, getters and setters are used to safely retrieve and update values. These special methods help in managing how data is exposed, ensuring that only valid or authorized operations are allowed.',
      difficulty: 'Easy',
      question: `Your spacecraft's fuel management system needs controlled access to prevent invalid fuel amounts. Can you create a FuelTank class that safely retrieves the current fuel level and only updates it when the new amount is valid (non-negative)?`,      sample_input: '1000\n1500',
      sample_output: '1000\n1500',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['getters', 'setters', 'encapsulation', 'private attributes', 'data validation', 'methods'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 7: Encapsulation & Access Modifiers',

      // Case-specific content
      case_number: 2,
      case_title: 'Validating Fuel Updates',
      case_overview: `Private attributes cannot be accessed directly. Getter methods provide safe retrieval, while setter methods validate data before allowing updates.`,
      case_explanation: `Use get_fuel() to retrieve the private fuel value. Use set_fuel(amount) to update only if the amount is valid (>= 0).`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 158 if it exists
    await problemsCollection.deleteOne({ problem_id: 158 });
    await testCasesCollection.deleteMany({ problem_id: 158 });

    // Insert problem 158
    const problemResult = await problemsCollection.insertOne(problem158);
    console.log('Problem 158 inserted');

    // Test cases for Problem 158
    const testCases = [
      // Visible test case
      {
        test_case_id: 1581,
        problem_id: 158,
        input: '1000\n1500',
        expected_output: '1000\n1500',
        is_hidden: false,
        weight: 20
      },
      // Hidden test cases
      {
        test_case_id: 1582,
        problem_id: 158,
        input: '500\n750',
        expected_output: '500\n750',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1583,
        problem_id: 158,
        input: '2000\n2500',
        expected_output: '2000\n2500',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1584,
        problem_id: 158,
        input: '100\n0',
        expected_output: '100\n0',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 1585,
        problem_id: 158,
        input: '800\n-50',
        expected_output: '800\n800',
        is_hidden: true,
        weight: 20
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 158`);

    console.log('\n✅ Problem 158 (Level 3, Session 7, Case 2: Using Getters and Setters) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem158()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
