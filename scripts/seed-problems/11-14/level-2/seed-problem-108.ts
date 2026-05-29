import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem108() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 108: Level 2, Session 8, Case 6 - Advanced Command Center
    const problem108 = {
      problem_id: 108,
      session_id: 19, // Level 2, Session 8
      title: 'Advanced Command Center',
      description: `The electrical storm intensifies around NOVA-12! Health checks must adapt to varying storm intensity levels and fuel reserve modes in real-time as conditions shift.

Create the Advanced Command Center with parameterized diagnostics that accept custom thresholds and operational modes, returning context-aware advisories tuned to current mission conditions.`,
      difficulty: 'Hard',
      question: `Create function mission_report(mission_name, duration=5, *modules, **extra_info) that prints mission info in format shown in sample. Read: name, duration, module_count, modules, kwarg_count, key-value pairs. Always call mission_report(name, duration, *modules, **kwargs) regardless of duration value. Always print "Extra Info:" header even if no kwargs.`,      sample_input: 'Voyager\n0\n3\nCamera\nRadio\nPower\n1\nStatus\nActive',
      sample_output: 'Mission: Voyager\nDuration: 0 days\nModules:\n- Camera\n- Radio\n- Power\nExtra Info:\n- Status: Active',

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
          'functions',
          'required arguments',
          'default arguments',
          '*args',
          '**kwargs',
          'mixed parameters',
          'integration'
        ],
        estimated_time_minutes: 25
      },
      // Session-level content
      session_title: 'Session 8: Functions with Arguments',

      // Case-specific content
      case_number: 6,
      case_title: 'Advanced Command Center',
      case_explanation: `def mission_report(mission_name, duration=5, *modules, **extra_info): print sections line by line. Always print "Extra Info:" header. If extra_info has items, print "- key: value" for each. Read inputs, build list/dict. Always call mission_report(name, duration, *modules, **kwargs) with all parameters.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 108 if it exists
    await problemsCollection.deleteOne({ problem_id: 108 });
    await testCasesCollection.deleteMany({ problem_id: 108 });

    // Insert problem 108
    const problemResult = await problemsCollection.insertOne(problem108);
    console.log('Problem 108 inserted');

    // Test cases for Problem 108 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1081,
        problem_id: 108,
        input: 'Apollo\n7\n2\nCommand Module\nLunar Module\n2\nCommander\nArmstrong\nLandingSite\nSea of Tranquility',
        expected_output: 'Mission: Apollo\nDuration: 7 days\nModules:\n- Command Module\n- Lunar Module\nExtra Info:\n- Commander: Armstrong\n- LandingSite: Sea of Tranquility',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1082,
        problem_id: 108,
        input: 'Voyager\n0\n3\nCamera\nRadio\nPower\n1\nStatus\nActive',
        expected_output: 'Mission: Voyager\nDuration: 0 days\nModules:\n- Camera\n- Radio\n- Power\nExtra Info:\n- Status: Active',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1083,
        problem_id: 108,
        input: 'Artemis\n10\n4\nOrion\nSLS\nGateway\nHLS\n3\nCrew\n4\nDestination\nMoon\nYear\n2025',
        expected_output: 'Mission: Artemis\nDuration: 10 days\nModules:\n- Orion\n- SLS\n- Gateway\n- HLS\nExtra Info:\n- Crew: 4\n- Destination: Moon\n- Year: 2025',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1084,
        problem_id: 108,
        input: 'ISS\n0\n1\nLab\n0',
        expected_output: 'Mission: ISS\nDuration: 0 days\nModules:\n- Lab\nExtra Info:',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1085,
        problem_id: 108,
        input: 'Mars2020\n687\n5\nRover\nHelicopter\nDrill\nCamera\nSensors\n4\nLanding\n2021\nSite\nJezero\nDistance\n293million_miles\nStatus\nOperational',
        expected_output: 'Mission: Mars2020\nDuration: 687 days\nModules:\n- Rover\n- Helicopter\n- Drill\n- Camera\n- Sensors\nExtra Info:\n- Landing: 2021\n- Site: Jezero\n- Distance: 293million_miles\n- Status: Operational',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1086,
        problem_id: 108,
        input: 'Hubble\n30\n2\nTelescope\nSolar_Panels\n2\nOrbit\nLEO\nLaunched\n1990',
        expected_output: 'Mission: Hubble\nDuration: 30 days\nModules:\n- Telescope\n- Solar_Panels\nExtra Info:\n- Orbit: LEO\n- Launched: 1990',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1087,
        problem_id: 108,
        input: 'Gemini\n14\n1\nCapsule\n1\nCrew\n2',
        expected_output: 'Mission: Gemini\nDuration: 14 days\nModules:\n- Capsule\nExtra Info:\n- Crew: 2',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 108`);

    console.log('\n✅ Problem 108 (Level 2, Session 8, Case 6: Mission Configurator - Final Challenge) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem108()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
