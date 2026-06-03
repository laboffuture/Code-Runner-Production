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
      title: 'Project GALACTIC COMMAND - The Final Defense System',
      description: 'The Nova Network is failing! Build the GALACTIC COMMAND defense controller, bringing together Level 4 skills - object-oriented classes, a custom exception, try-except error handling, and a mission logger - to charge the ship\'s defense systems and restore the network!',

      difficulty: 'Hard',
      question: `Build GALACTIC COMMAND - the final defense system. Route power to the ship's defense systems, rejecting any unknown system with a custom exception.

The valid systems are: SHIELD, LASER, ENGINE.

Read the input:
- First line: N, the number of charge commands (a whole number).
- Next N lines: each is a SYSTEM and a POWER level separated by a space, e.g. "SHIELD 80".

Build it with a class, a custom exception, and a logger:
- Create a custom exception called UnknownSystemError.
- Create a MissionLogger class that keeps a list of log entries.
- Create a GalacticCommand class that tracks how many systems it has charged and uses the logger.
- For each command, try to charge the system:
  - If the system is one of the 3 valid systems, print "<SYSTEM> charged to <POWER>%", count it as charged, and add "<SYSTEM>=<POWER>" to the mission log.
  - If the system is anything else, raise UnknownSystemError and catch it, then print "ALERT: Unknown system '<SYSTEM>'" (do NOT log it).
- After all commands, print "Defense grid online: <count> systems charged".
- Then print "Mission Log:" and, on the lines after it, every logged entry in the order they were charged (print nothing extra if the log is empty).

PRINT exactly those lines, in order. Example -
Input:
3
SHIELD 80
WARP 50
LASER 95
Output:
SHIELD charged to 80%
ALERT: Unknown system 'WARP'
LASER charged to 95%
Defense grid online: 2 systems charged
Mission Log:
SHIELD=80
LASER=95

Note: the count line always reads "... systems charged" even when the count is 1 (keep it exactly as shown).

Optional flavour (not graded): you can add a Pygame window that shows the defense grid lighting up - only what you PRINT is graded.`,

      example_code: '# Project GALACTIC COMMAND - The Final Defense System\n# Write your code here\n',
      sample_input: '3\nSHIELD 80\nWARP 50\nLASER 95',
      sample_output: "SHIELD charged to 80%\nALERT: Unknown system 'WARP'\nLASER charged to 95%\nDefense grid online: 2 systems charged\nMission Log:\nSHIELD=80\nLASER=95",

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
      session_introduction: `The ultimate test of your Python mastery. Project GALACTIC COMMAND brings together the core skills of Level 4 - object-oriented classes, custom exceptions, try-except error handling, and logging - into one working system. You will charge the ship's defense systems, reject unknown ones with your own exception, keep a mission log, and report the final status. This is where individual skills converge into a unified spacecraft AI controller. The fate of the Nova Network depends on your ability to bring all systems together.`,

      // Case-specific content
      case_number: 1,
      case_title: 'Project GALACTIC COMMAND - The Final Defense System',
      case_explanation: `Integrate Level 4 ideas into one stdout-graded program: OOP, a custom exception, try/except, and a logger. Define class UnknownSystemError(Exception): pass; a MissionLogger holding a list of entries; and a GalacticCommand with a charged counter that uses the logger. Read N, loop N times reading "SYSTEM POWER" via input().split(). In a try/except: if SYSTEM is in {"SHIELD","LASER","ENGINE"} print "<SYSTEM> charged to <POWER>%", increment the counter, and log "<SYSTEM>=<POWER>"; else raise UnknownSystemError(system) and catch it to print "ALERT: Unknown system '<SYSTEM>'" (unknown systems are not logged). After the loop print "Defense grid online: <count> systems charged", then "Mission Log:" followed by each logged entry on its own line (nothing extra if empty). The mission log is printed back so the logging is graded via stdout. A Pygame status window is optional flavour, not graded - only your printed output is checked.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    await problemsCollection.deleteOne({ problem_id: 242 });
    await testCasesCollection.deleteMany({ problem_id: 242 });

    const problemResult = await problemsCollection.insertOne(codeConvergenceL4);
    // Varied, input-driven test cases (mixed valid/unknown, all-valid, all-unknown,
    // counts 0/1/2/3) so the output can only be produced by reading input and running
    // the class + custom-exception logic - a hard-coded program cannot pass.
    const testCases = [
      {
        test_case_id: 2421,
        problem_id: 242,
        input: '3\nSHIELD 80\nWARP 50\nLASER 95',
        expected_output: "SHIELD charged to 80%\nALERT: Unknown system 'WARP'\nLASER charged to 95%\nDefense grid online: 2 systems charged\nMission Log:\nSHIELD=80\nLASER=95",
        is_hidden: false,
        weight: 20
      },
      {
        test_case_id: 2422,
        problem_id: 242,
        input: '2\nENGINE 60\nSHIELD 100',
        expected_output: 'ENGINE charged to 60%\nSHIELD charged to 100%\nDefense grid online: 2 systems charged\nMission Log:\nENGINE=60\nSHIELD=100',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 2423,
        problem_id: 242,
        input: '4\nWARP 30\nTELEPORT 40\nSHIELD 75\nLASER 88',
        expected_output: "ALERT: Unknown system 'WARP'\nALERT: Unknown system 'TELEPORT'\nSHIELD charged to 75%\nLASER charged to 88%\nDefense grid online: 2 systems charged\nMission Log:\nSHIELD=75\nLASER=88",
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 2424,
        problem_id: 242,
        input: '2\nGHOST 30\nPHANTOM 40',
        expected_output: "ALERT: Unknown system 'GHOST'\nALERT: Unknown system 'PHANTOM'\nDefense grid online: 0 systems charged\nMission Log:",
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 2425,
        problem_id: 242,
        input: '3\nENGINE 100\nLASER 90\nSHIELD 80',
        expected_output: 'ENGINE charged to 100%\nLASER charged to 90%\nSHIELD charged to 80%\nDefense grid online: 3 systems charged\nMission Log:\nENGINE=100\nLASER=90\nSHIELD=80',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 2426,
        problem_id: 242,
        input: '5\nSHIELD 60\nGHOST 10\nLASER 70\nENGINE 85\nPHANTOM 20',
        expected_output: "SHIELD charged to 60%\nALERT: Unknown system 'GHOST'\nLASER charged to 70%\nENGINE charged to 85%\nALERT: Unknown system 'PHANTOM'\nDefense grid online: 3 systems charged\nMission Log:\nSHIELD=60\nLASER=70\nENGINE=85",
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 2427,
        problem_id: 242,
        input: '1\nLASER 42',
        expected_output: 'LASER charged to 42%\nDefense grid online: 1 systems charged\nMission Log:\nLASER=42',
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
