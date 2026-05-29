import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedCodeConvergenceL4() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Code Convergence L4: Project GALACTIC COMMAND
    const codeConvergenceL4 = {
      problem_id: 242,
      session_id: 44, // Level 4, Code Convergence
      title: 'Project GALACTIC COMMAND – The Final Defense System',
      description: 'The Nova Network is failing! Build a fully integrated spacecraft AI controller combining everything from Level 4: Object-Oriented Programming, file handling, exception handling, and Pygame. Create GALACTIC COMMAND and restore the network!',

      difficulty: 'Hard',
      question: `Build a spacecraft control system with these components:

1. Create a GalacticCommand class with methods for mission control
2. Create a MissionLogger class that saves actions to a file
3. Use custom exceptions with try-except for error handling
4. Build a Pygame window to display system status`,

      example_code: '# Project GALACTIC COMMAND - The Final Defense System\n# Write your code here\n',
      sample_input: '',
      sample_output: 'Command Core initialized\nMission Logger active\nException handling secured\nDashboard online\nSystem integration complete',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 4,
      max_score: 200,

      metadata: {
        space_theme: true,
        story_linked: true,
        is_final_task: true,
        is_capstone: true,
        is_code_convergence: true,
        unlocks_next_level: false,
        concepts: [
          'Object-Oriented Programming',
          'Classes and Methods',
          'File I/O',
          'Append mode',
          'Logging',
          'Exception Handling',
          'Custom Exceptions',
          'Try-Except',
          'Pygame Integration',
          'Window Creation',
          'Text Rendering',
          'Display Updates',
          'System Integration',
          'Modular Design',
          'State Management',
          'Real-time Monitoring'
        ],
        estimated_time_minutes: 60,
        galactic_command_phase: 'complete',
        narrative_beat: 'NOVA NETWORK RESTORED - VORAX-9 STABLE',
        prerequisite_sessions: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43]
      },

      // Session-level content
      session_title: 'Code Convergence: Project GALACTIC COMMAND',
      session_introduction: `The ultimate test of your Python mastery. Project GALACTIC COMMAND demands you integrate every concept learned across Level 4—from exception handling and file operations to object-oriented programming and Pygame visualization. This is where theory becomes practice, where individual skills converge into a unified system that can control an entire spacecraft AI. GALACTIC COMMAND must handle mission states, log operations, manage exceptions, and provide real-time visual feedback under extreme conditions. The fate of the Nova Network depends on your ability to bring all systems together.`,

      // Case-specific content
      case_number: 1,
      case_title: 'Project GALACTIC COMMAND – The Final Defense System',
      case_explanation: `Build the Galactic Command System by integrating all Level 4 concepts: Create a GalacticCommand class for spacecraft operations, implement MissionLogger for real-time file logging, define custom exceptions for error handling, build a Pygame dashboard for live status display, and connect all components in a main integration loop. This comprehensive project demonstrates mastery of OOP, file I/O, exception handling, and Pygame, simulating a real spacecraft AI control system with modular design and clean interfacing.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    await problemsCollection.deleteOne({ problem_id: 242 });
    await testCasesCollection.deleteMany({ problem_id: 242 });

    const problemResult = await problemsCollection.insertOne(codeConvergenceL4);
    const testCases = [
      {
        test_case_id: 2421,
        problem_id: 242,
        input: '',
        expected_output: 'Command Core initialized\nMission Logger active\nException handling secured\nDashboard online\nSystem integration complete',
        is_hidden: false,
        weight: 20
      },
      {
        test_case_id: 2422,
        problem_id: 242,
        input: '',
        expected_output: 'Command Core initialized\nMission Logger active\nException handling secured\nDashboard online\nSystem integration complete',
        is_hidden: true,
        weight: 20
      },
      {
        test_case_id: 2423,
        problem_id: 242,
        input: '',
        expected_output: 'Command Core initialized\nMission Logger active\nException handling secured\nDashboard online\nSystem integration complete',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 2424,
        problem_id: 242,
        input: '',
        expected_output: 'Command Core initialized\nMission Logger active\nException handling secured\nDashboard online\nSystem integration complete',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 2425,
        problem_id: 242,
        input: '',
        expected_output: 'Command Core initialized\nMission Logger active\nException handling secured\nDashboard online\nSystem integration complete',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 2426,
        problem_id: 242,
        input: '',
        expected_output: 'Command Core initialized\nMission Logger active\nException handling secured\nDashboard online\nSystem integration complete',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 2427,
        problem_id: 242,
        input: '',
        expected_output: 'Command Core initialized\nMission Logger active\nException handling secured\nDashboard online\nSystem integration complete',
        is_hidden: true,
        weight: 10
      }
    ];
    await testCasesCollection.insertMany(testCases);
  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
}

seedCodeConvergenceL4()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
