import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem120() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 120: Level 2, Session 10, Final Task - Mastering Python's Built-ins
    const problem120 = {
      problem_id: 120,
      session_id: 21, // Level 2, Session 10
      title: 'Mastering Python\'s Built-ins',
      description: `Telemetry streams pour in from NOVA-12's critical modules! The mysterious signal pattern is intensifying, but system analytics are too slow. The crew needs a rapid-response tool to process module data instantly—every second counts before the next anomaly surge.

Create the System Status Reporter that analyzes streaming module data using Python's built-in functions to catch the pattern in time.`,
      difficulty: 'Hard',
      question: `Build a program that takes a mission name and module count as input, then collects each module name. Display the mission name, total module count, data type of the collection, all modules in alphabetical order, and the total character count across all module names.`,      sample_input: 'Apollo\n3\nNavigation\nCommunication\nPropulsion',
      sample_output: 'Mission: Apollo\nTotal modules: 3\nData type: <class \'list\'>\nSorted modules: [\'Communication\', \'Navigation\', \'Propulsion\']\nTotal letters: 33',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 3,
      max_score: 150,

      metadata: {
        space_theme: true,
        story_linked: true,
        is_final_task: true,
        is_capstone: true,
        concepts: [
          'input()',
          'int()',
          'range()',
          'len()',
          'type()',
          'sorted()',
          'sum()',
          'list operations',
          'integration'
        ],
        estimated_time_minutes: 25
      },

      // Session-level content
      session_title: 'Built-in Functions Mastery',
      session_introduction: `Python provides powerful built-in functions that help you work with data efficiently. Like a spacecraft's onboard instruments that measure and analyze everything, built-in functions let you inspect, convert, calculate, and manipulate data without writing complex code. Master these essential tools to become a more effective programmer.`,

      // Case-specific content
      case_number: 6,
      case_title: 'Mastering Python\'s Built-ins',
      case_overview: `Build a rapid-analytics system for the Galactic Command Center using all built-in functions learned in this session.`,
      case_explanation: `Use input() and int() to gather mission data, build a list with range() loop for module names, then apply len(), type(), sorted(), and sum() to analyze the collection.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 120 if it exists
    await problemsCollection.deleteOne({ problem_id: 120 });
    await testCasesCollection.deleteMany({ problem_id: 120 });

    // Insert problem 120
    const problemResult = await problemsCollection.insertOne(problem120);
    console.log('Problem 120 inserted');

    // Test cases for Problem 120 (7 test cases: 2 visible + 5 hidden)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1201,
        problem_id: 120,
        input: 'Apollo\n3\nNavigation\nCommunication\nPropulsion',
        expected_output: 'Mission: Apollo\nTotal modules: 3\nData type: <class \'list\'>\nSorted modules: [\'Communication\', \'Navigation\', \'Propulsion\']\nTotal letters: 33',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1202,
        problem_id: 120,
        input: 'Voyager\n2\nCamera\nAntenna',
        expected_output: 'Mission: Voyager\nTotal modules: 2\nData type: <class \'list\'>\nSorted modules: [\'Antenna\', \'Camera\']\nTotal letters: 13',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1203,
        problem_id: 120,
        input: 'Artemis\n4\nOrion\nGateway\nSLS\nHLS',
        expected_output: 'Mission: Artemis\nTotal modules: 4\nData type: <class \'list\'>\nSorted modules: [\'Gateway\', \'HLS\', \'Orion\', \'SLS\']\nTotal letters: 18',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1204,
        problem_id: 120,
        input: 'ISS\n5\nLab\nDocking\nSolar\nCommunications\nLifeSupport',
        expected_output: 'Mission: ISS\nTotal modules: 5\nData type: <class \'list\'>\nSorted modules: [\'Communications\', \'Docking\', \'Lab\', \'LifeSupport\', \'Solar\']\nTotal letters: 40',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1205,
        problem_id: 120,
        input: 'Mars2020\n6\nRover\nHelicopter\nDrill\nCamera\nSensors\nPower',
        expected_output: 'Mission: Mars2020\nTotal modules: 6\nData type: <class \'list\'>\nSorted modules: [\'Camera\', \'Drill\', \'Helicopter\', \'Power\', \'Rover\', \'Sensors\']\nTotal letters: 38',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1206,
        problem_id: 120,
        input: 'Hubble\n3\nTelescope\nSolarPanels\nGyroscope',
        expected_output: 'Mission: Hubble\nTotal modules: 3\nData type: <class \'list\'>\nSorted modules: [\'Gyroscope\', \'SolarPanels\', \'Telescope\']\nTotal letters: 29',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1207,
        problem_id: 120,
        input: 'Gemini\n1\nCapsule',
        expected_output: 'Mission: Gemini\nTotal modules: 1\nData type: <class \'list\'>\nSorted modules: [\'Capsule\']\nTotal letters: 7',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 120`);

    console.log('\n✅ Problem 120 (Level 2, Session 10, Final Task: System Status Reporter) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem120()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
