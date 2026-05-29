import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem107() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 107: Level 2, Session 8, Case 5 - Keyword Variable-Length Arguments (**kwargs)
    const problem107 = {
      problem_id: 107,
      session_id: 19, // Level 2, Session 8
      title: 'Keyword Variable-Length Arguments',
      description: 'Learn to create functions that accept any number of keyword arguments using **kwargs.',
      difficulty: 'Medium',
      question: `Take integer N and N pairs of key-value inputs. Define a function log_event(**info) that accepts any number of keyword arguments and prints "<key>: <value>" for each pair. Call the function with all input key-value pairs.`,      sample_input: '3\nEvent\nLaunch\nDate\n2024-12-01\nLocation\nCape Canaveral',
      sample_output: 'Event: Launch\nDate: 2024-12-01\nLocation: Cape Canaveral',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 120,

      metadata: {
        space_theme: true,
        concepts: ['functions', '**kwargs', 'keyword variable-length arguments', 'dictionary arguments', 'key-value pairs'],
        estimated_time_minutes: 18
      },
      // Session-level content
      session_title: 'Session 8: Functions with Arguments',

      // Case-specific content
      case_number: 5,
      case_title: 'Keyword Variable-Length Arguments',
      case_overview: `Master **kwargs - functions that accept any number of keyword arguments for flexible, labeled data inputs.`,
      case_code: `# **kwargs with Iteration
def show_specs(**details):
    for key, value in details.items():
        print(f'{key}: {value}')

# Any number of keyword arguments
show_specs(name='Apollo', year=1969)
# Prints:
# name: Apollo
# year: 1969

show_specs(fuel='RP-1', thrust='7.5M')`,
      case_explanation: `Use **kwargs to accept any number of keyword arguments, which are collected into a dictionary. This is useful for flexible configuration and labeled data inputs.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 107 if it exists
    await problemsCollection.deleteOne({ problem_id: 107 });
    await testCasesCollection.deleteMany({ problem_id: 107 });

    // Insert problem 107
    const problemResult = await problemsCollection.insertOne(problem107);
    console.log('Problem 107 inserted');

    // Test cases for Problem 107 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1071,
        problem_id: 107,
        input: '3\nEvent\nLaunch\nDate\n2024-12-01\nLocation\nCape Canaveral',
        expected_output: 'Event: Launch\nDate: 2024-12-01\nLocation: Cape Canaveral',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1072,
        problem_id: 107,
        input: '2\nMission\nArtemis\nCrew\n4',
        expected_output: 'Mission: Artemis\nCrew: 4',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1073,
        problem_id: 107,
        input: '4\nName\nVoyager\nYear\n1977\nStatus\nActive\nDistance\n14billion_miles',
        expected_output: 'Name: Voyager\nYear: 1977\nStatus: Active\nDistance: 14billion_miles',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1074,
        problem_id: 107,
        input: '1\nSystem\nPropulsion',
        expected_output: 'System: Propulsion',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1075,
        problem_id: 107,
        input: '5\nSatellite\nHubble\nOrbit\nLEO\nLaunched\n1990\nMass\n11110kg\nStatus\nOperational',
        expected_output: 'Satellite: Hubble\nOrbit: LEO\nLaunched: 1990\nMass: 11110kg\nStatus: Operational',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1076,
        problem_id: 107,
        input: '3\nType\nRover\nPlanet\nMars\nName\nPerseverance',
        expected_output: 'Type: Rover\nPlanet: Mars\nName: Perseverance',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1077,
        problem_id: 107,
        input: '2\nCommand\nDock\nTarget\nISS',
        expected_output: 'Command: Dock\nTarget: ISS',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 107`);

    console.log('\n✅ Problem 107 (Level 2, Session 8, Case 5: Keyword Variable-Length Arguments) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem107()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
