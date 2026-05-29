import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem126() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 126: Level 3, Session 1, Case 6 - Cosmic Data Relay – Deep Space Command Module
    const problem126 = {
      problem_id: 126,
      session_id: 23, // Level 3, Session 1
      title: 'Cosmic Data Relay – Deep Space Command Module',
      description: 'NOVA-12 holds position above Erevos-7. Raw bursts of code hit the antenna—fragments of alien logic that need decoding. Your relay system must tag transmissions, measure signal degradation, and route messages through multiple stations before the data stream collapses.',
      difficulty: 'Hard',
      question: `The NOVA-12 relay system needs three functions: transmit (adds station tags to messages), signal_strength (calculates signal decay as 100/distance), and relay_chain (routes messages through stations with [ENTRY], [RELAY], [EXIT] markers). Can you implement this system to process incoming transmissions based on the function name provided?`,      sample_input: 'transmit\nHello World\nStation-A',
      sample_output: 'Hello World [Station-A]',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['functions', 'string manipulation', 'conditionals', 'loops', 'enumerate', 'list operations'],
        estimated_time_minutes: 25
      },

      // Session-level content
      session_title: 'Session 1: Python Modules',

      // Case-specific content
      case_number: 6,
      case_title: 'Cosmic Data Relay – Deep Space Command Module',
      case_explanation: `Use split(',') to convert the station string into a list. Loop through with enumerate() to detect first (index 0) and last (index == len-1) positions for proper message tags.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 126 - 7 test cases (2 visible + 5 hidden)
    const testCases126 = [
      {
        test_case_id: 1261,
        problem_id: 126,
        input: 'transmit\nHello World\nStation-A',
        expected_output: 'Hello World [Station-A]',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1262,
        problem_id: 126,
        input: 'signal_strength\n150',
        expected_output: '0.67',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1263,
        problem_id: 126,
        input: 'relay_chain\nData Package Alpha\nStation-X,Station-Y,Station-Z',
        expected_output: '[ENTRY] Data Package Alpha\n[RELAY] Data Package Alpha\nData Package Alpha [EXIT]',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1264,
        problem_id: 126,
        input: 'transmit\nEmergency Alert\nHub-7',
        expected_output: 'Emergency Alert [Hub-7]',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1265,
        problem_id: 126,
        input: 'signal_strength\n50',
        expected_output: '2.00',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1266,
        problem_id: 126,
        input: 'relay_chain\nQuick Message\nAlpha,Beta',
        expected_output: '[ENTRY] Quick Message\nQuick Message [EXIT]',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1267,
        problem_id: 126,
        input: 'relay_chain\nCritical Update\nNode-1,Node-2,Node-3,Node-4',
        expected_output: '[ENTRY] Critical Update\n[RELAY] Critical Update\n[RELAY] Critical Update\nCritical Update [EXIT]',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 126 });
    await problemsCollection.insertOne(problem126);
    console.log('Problem 126 inserted');

    await testCasesCollection.deleteMany({ problem_id: 126 });
    await testCasesCollection.insertMany(testCases126);
    console.log(`${testCases126.length} test cases inserted for Problem 126`);

    console.log('\n✅ Problem 126 (Level 3, Session 1, Case 6: Cosmic Data Relay – Deep Space Command Module) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem126()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
