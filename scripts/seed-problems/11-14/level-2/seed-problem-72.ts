import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem72() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 72: Level 2, Session 2, Case 6 - Galactic Navigation System
    const problem72 = {
      problem_id: 72,
      session_id: 13, // Level 2, Session 2
      title: 'Galactic Navigation System',
      description: `Sudden plasma gusts nudge NOVA-12 off its planned trajectory! The autopilot must make continuous micro-adjustments with manual override capability.

Create the autonomous navigation system that keeps NOVA-12 on course with command validation and abort functionality.`,
      difficulty: 'Medium',
      question: `Create a command system that accepts commands continuously until "launch" or "abort" is received. Valid commands: "check", "prepare", "ready", "launch", "abort". For each iteration: print "Enter command: ", read input, count it (valid or invalid), check if valid - if invalid print "Invalid command!", if "launch" print "Mission complete! Total commands: X", if "abort" print "Mission aborted!".`,      sample_input: 'check\nprepare\nlaunch',
      sample_output: 'Enter command: \nEnter command: \nEnter command: \nMission complete! Total commands: 3',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 3,
      max_score: 150,

      metadata: {
        space_theme: true,
        story_linked: true,
        is_final_task: true,
        is_capstone: true,
        concepts: ['while loops', 'user input', 'break', 'counters', 'else clause', 'input validation'],
        estimated_time_minutes: 25
      },
      // Session-level content
      session_title: 'Session 2: Basic While Loop',

      // Case-specific content
      case_number: 6,
      case_title: 'Galactic Navigation System',
      case_explanation: `Use while True loop. Inside: print prompt, read command, increment counter, validate command with if-elif. If invalid print error message. If "launch" break and print success. If "abort" break and print abort.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 72 if it exists
    await problemsCollection.deleteOne({ problem_id: 72 });
    await testCasesCollection.deleteMany({ problem_id: 72 });

    // Insert problem 72
    const problemResult = await problemsCollection.insertOne(problem72);
    console.log('Problem 72 inserted');

    // Test cases for Problem 72 (7 test cases: 2 visible + 5 hidden)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 721,
        problem_id: 72,
        input: 'check\nprepare\nlaunch',
        expected_output: 'Enter command: \nEnter command: \nEnter command: \nMission complete! Total commands: 3',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 722,
        problem_id: 72,
        input: 'check\nabort',
        expected_output: 'Enter command: \nEnter command: \nMission aborted!',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 723,
        problem_id: 72,
        input: 'check\nprepare\nready\nlaunch',
        expected_output: 'Enter command: \nEnter command: \nEnter command: \nEnter command: \nMission complete! Total commands: 4',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 724,
        problem_id: 72,
        input: 'check\ninvalid\nprepare\nlaunch',
        expected_output: 'Enter command: \nEnter command: \nInvalid command!\nEnter command: \nEnter command: \nMission complete! Total commands: 4',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 725,
        problem_id: 72,
        input: 'ready\nlaunch',
        expected_output: 'Enter command: \nEnter command: \nMission complete! Total commands: 2',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 726,
        problem_id: 72,
        input: 'check\nprepare\nready\nabort',
        expected_output: 'Enter command: \nEnter command: \nEnter command: \nEnter command: \nMission aborted!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 727,
        problem_id: 72,
        input: 'wrong\nbad\ncheck\nlaunch',
        expected_output: 'Enter command: \nInvalid command!\nEnter command: \nInvalid command!\nEnter command: \nEnter command: \nMission complete! Total commands: 4',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 72`);

    console.log('\n✅ Problem 72 (Level 2, Session 2, Case 6: Space Mission Control) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem72()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
