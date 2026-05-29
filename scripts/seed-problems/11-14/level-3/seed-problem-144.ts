import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem144() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 144: Level 3, Session 4, Case 6 - Galactic AI Blueprints (FINAL TASK)
    const problem144 = {
      problem_id: 144,
      session_id: 26, // Level 3, Session 4
      title: 'Galactic AI Blueprints – Crafting the Cosmic Minds',
      description: 'Build a fully functional AI assistant using Object-Oriented Programming, combining class creation, multiple methods, multiple objects, and user interaction.',
      difficulty: 'Hard',
      question: `Can you create an AIAssistant class with name and purpose attributes, an introduce method, and a perform_task method with conditional logic? If purpose is 'defense', add 'Alert: Security protocol activated!' before task. If purpose is 'medical', add 'Health check: All systems normal.' before task.`,      sample_input: 'Nova\nnavigation\nscan asteroid',
      sample_output: 'My name is Nova and my purpose is navigation.\nNova is performing: scan asteroid',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'objects', 'multiple methods', 'user input', 'OOP integration', 'AI simulation', 'conditional logic'],
        estimated_time_minutes: 25
      },

      // Session-level content
      session_title: 'Session 4: Using Classes and Objects in Python',

      // Case-specific content
      case_number: 6,
      case_title: 'Galactic AI Blueprints – Crafting the Cosmic Minds',
      case_explanation: `Create AIAssistant class with __init__(name, purpose), introduce() and perform_task(task) methods. In perform_task(), check if purpose == 'defense', print security alert first. If purpose == 'medical', print health check first. Then print task message.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 144 - 7 test cases (2 visible + 5 hidden)
    const testCases144 = [
      {
        test_case_id: 1441,
        problem_id: 144,
        input: 'Nova\nnavigation\nscan asteroid',
        expected_output: 'My name is Nova and my purpose is navigation.\nNova is performing: scan asteroid',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1442,
        problem_id: 144,
        input: 'Atlas\ncommunication\nrelay message',
        expected_output: 'My name is Atlas and my purpose is communication.\nAtlas is performing: relay message',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1443,
        problem_id: 144,
        input: 'Orion\ndefense\nmonitor threats',
        expected_output: 'My name is Orion and my purpose is defense.\nAlert: Security protocol activated!\nOrion is performing: monitor threats',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1444,
        problem_id: 144,
        input: 'Luna\nresearch\nanalyze samples',
        expected_output: 'My name is Luna and my purpose is research.\nLuna is performing: analyze samples',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1445,
        problem_id: 144,
        input: 'Titan\nmaintenance\nrepair hull',
        expected_output: 'My name is Titan and my purpose is maintenance.\nTitan is performing: repair hull',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1446,
        problem_id: 144,
        input: 'Cosmo\nexploration\nmap sector',
        expected_output: 'My name is Cosmo and my purpose is exploration.\nCosmo is performing: map sector',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1447,
        problem_id: 144,
        input: 'Vega\nmedical\ncheck vitals',
        expected_output: 'My name is Vega and my purpose is medical.\nHealth check: All systems normal.\nVega is performing: check vitals',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 144 });
    await problemsCollection.insertOne(problem144);
    console.log('Problem 144 inserted');

    await testCasesCollection.deleteMany({ problem_id: 144 });
    await testCasesCollection.insertMany(testCases144);
    console.log(`${testCases144.length} test cases inserted for Problem 144`);

    console.log('\n✅ Problem 144 (Level 3, Session 4, Case 6: Galactic AI Blueprints) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem144()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
