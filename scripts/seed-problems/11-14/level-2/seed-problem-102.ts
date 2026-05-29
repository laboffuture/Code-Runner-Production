import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem102() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 102: Level 2, Session 7, Case 6 - Galactic Command Center
    const problem102 = {
      problem_id: 102,
      session_id: 18, // Level 2, Session 7
      title: 'Galactic Command Center',
      description: `Systems spike again aboard NOVA-12! Routine subsystem checks are consuming critical crew time that should be spent interpreting the mysterious signal patterns.

Create the Galactic Command Center automation library that runs thermal, thruster, and communications health checks automatically, displaying green/yellow/red status reports so the crew can focus on decoding the message.`,
      difficulty: 'Medium',
      question: `The automated health monitor must check subsystem status values and report conditions. Write a program with user-defined functions that accepts mission parameters, prints diagnostic readings, and returns formatted status reports to minimize manual system checks during the signal investigation.`,      sample_input: 'Apollo 11\n1969\n3',
      sample_output: 'Apollo 11 1969 3\nMission Apollo 11 was launched in 1969 with a crew of 3 astronauts.',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 120,

      metadata: {
        space_theme: true,
        story_linked: true,
        is_final_task: true,
        is_capstone: true,
        concepts: [
          'functions',
          'def keyword',
          'multiple parameters',
          'return statement',
          'function calls',
          'print and return',
          'integration'
        ],
        estimated_time_minutes: 20
      },
      // Session-level content
      session_title: 'Session 7: User-Defined Functions',

      // Case-specific content
      case_number: 6,
      case_title: 'Galactic Command Center',
      case_explanation: `Define function with multiple parameters. Use print inside function for diagnostic output. Return formatted status string. Call function and store result.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 102 if it exists
    await problemsCollection.deleteOne({ problem_id: 102 });
    await testCasesCollection.deleteMany({ problem_id: 102 });

    // Insert problem 102
    const problemResult = await problemsCollection.insertOne(problem102);
    console.log('Problem 102 inserted');

    // Test cases for Problem 102 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1021,
        problem_id: 102,
        input: 'Apollo 11\n1969\n3',
        expected_output: 'Apollo 11 1969 3\nMission Apollo 11 was launched in 1969 with a crew of 3 astronauts.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1022,
        problem_id: 102,
        input: 'Voyager 1\n1977\n0',
        expected_output: 'Voyager 1 1977 0\nMission Voyager 1 was launched in 1977 with a crew of 0 astronauts.',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1023,
        problem_id: 102,
        input: 'Artemis 1\n2022\n0',
        expected_output: 'Artemis 1 2022 0\nMission Artemis 1 was launched in 2022 with a crew of 0 astronauts.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1024,
        problem_id: 102,
        input: 'SpaceX Demo-2\n2020\n2',
        expected_output: 'SpaceX Demo-2 2020 2\nMission SpaceX Demo-2 was launched in 2020 with a crew of 2 astronauts.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1025,
        problem_id: 102,
        input: 'Gemini 4\n1965\n2',
        expected_output: 'Gemini 4 1965 2\nMission Gemini 4 was launched in 1965 with a crew of 2 astronauts.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1026,
        problem_id: 102,
        input: 'ISS Expedition 1\n2000\n3',
        expected_output: 'ISS Expedition 1 2000 3\nMission ISS Expedition 1 was launched in 2000 with a crew of 3 astronauts.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1027,
        problem_id: 102,
        input: 'Mars Rover\n2021\n0',
        expected_output: 'Mars Rover 2021 0\nMission Mars Rover was launched in 2021 with a crew of 0 astronauts.',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 102`);

    console.log('\n✅ Problem 102 (Level 2, Session 7, Case 6: Mission Functions - Final Challenge) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem102()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
