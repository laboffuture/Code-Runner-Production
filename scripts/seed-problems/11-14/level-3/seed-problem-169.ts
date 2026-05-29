import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem169() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 169: Level 3, Session 9, Case 1 - Multiple Inheritance
    const problem169 = {
      problem_id: 169,
      session_id: 31, // Level 3, Session 9
      title: 'Multiple Inheritance',
      description: 'Explore how a single class can inherit capabilities from multiple parent classes simultaneously.',
      difficulty: 'Medium',
      question: `Can you create a MissionAI that inherits from multiple parent classes with conditional prefixes?`,      sample_input: 'Nexus',
      sample_output: 'MixAI: Navigating space.\nMixAI: Sending signal.',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['multiple inheritance', 'inheritance', 'parent classes', 'child class', 'code reuse', 'OOP', 'conditional logic', 'nested conditionals', 'modulo operator'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 9: Mastering Inheritance - Advanced',

      // Case-specific content
      case_number: 1,
      case_title: 'Multiple Inheritance',
      case_overview: `Multiple inheritance lets classes inherit features from multiple parents simultaneously.`,
      case_explanation: `Build MissionAI inheriting from Navigator and Communicator with conditional prefixes based on AI name.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 169 if it exists
    await problemsCollection.deleteOne({ problem_id: 169 });
    await testCasesCollection.deleteMany({ problem_id: 169 });

    // Insert problem 169
    const problemResult = await problemsCollection.insertOne(problem169);
    console.log('Problem 169 inserted');

    // Test cases for Problem 169
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1691,
        problem_id: 169,
        input: 'Nexus',
        expected_output: 'MixAI: Navigating space.\nMixAI: Sending signal.', // len=5, odd, <6
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1692,
        problem_id: 169,
        input: 'Quantum',
        expected_output: 'ComboAI: Navigating space.\nComboAI: Sending signal.', // len=7, odd, >=6
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1693,
        problem_id: 169,
        input: 'Matrix',
        expected_output: 'MultiAI: Navigating space.\nMultiAI: Sending signal.', // len=6, even, >=6
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1694,
        problem_id: 169,
        input: 'Core',
        expected_output: 'DualAI: Navigating space.\nDualAI: Sending signal.', // len=4, even, <6
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1695,
        problem_id: 169,
        input: 'AI',
        expected_output: 'DualAI: Navigating space.\nDualAI: Sending signal.', // len=2, even, <6
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1696,
        problem_id: 169,
        input: 'Fusion',
        expected_output: 'MultiAI: Navigating space.\nMultiAI: Sending signal.', // len=6, even, >=6
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1697,
        problem_id: 169,
        input: 'Nova',
        expected_output: 'DualAI: Navigating space.\nDualAI: Sending signal.', // len=4, even, <6
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 169`);

    console.log('\n✅ Problem 169 (Level 3, Session 9, Case 1: Multiple Inheritance) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem169()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
