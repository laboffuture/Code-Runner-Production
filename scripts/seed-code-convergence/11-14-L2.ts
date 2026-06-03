import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedCodeConvergenceL2() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');
    const codeConvergenceL2 = {
      problem_id: 1000,
      session_id: 22, 
      title: 'Project ORBITRON - Mission Control Dashboard',
      description: `NOVA-12 is caught in a massive storm. Systems are failing and signals are fragmenting. You must build ORBITRON -a unified Mission Control Dashboard that processes spacecraft telemetry in real-time. Integrate power monitoring, signal filtering, and event tracking to stabilize the spacecraft and decode an urgent message hidden in the chaos.`,

      difficulty: 'Hard',
      question: `Build the ORBITRON Mission Control Dashboard.

Read 4 lines of input:
1. Mission name
2. Fuel level readings - space-separated integers (e.g. 85 92 78 95 88)
3. Signal codes - space-separated words (e.g. ALPHA BETA GAMMA ALPHA DELTA)
4. Mission events - separated by a comma and a space (e.g. Launch, Orbit Achieved, Storm Detected). An event can contain spaces, so strip the space after each comma.

Then PRINT exactly these 5 lines (replace each <...> with your value):
Mission Name: <name>
Maximum Fuel Level: <the highest fuel reading>
Number of Signals: <the number of DIFFERENT signal codes>
Most Recent Event: <the last event in the list>
Mission <name> is active with max fuel level <max> and <count> signals received.

Note: "different signal codes" means repeats count once - so ALPHA BETA GAMMA ALPHA DELTA has 4 different codes.

Tip: you may organise your code with a function if you like - the grader only checks what you print.`,

      example_code: '# Project ORBITRON - Mission Control Dashboard\n# Write your code here\n',
      sample_input: 'NOVA-12\n85 92 78 95 88\nALPHA BETA GAMMA ALPHA DELTA\nLaunch, Orbit Achieved, Storm Detected, Filters Applied',
      sample_output: `Mission Name: NOVA-12
Maximum Fuel Level: 95
Number of Signals: 4
Most Recent Event: Filters Applied
Mission NOVA-12 is active with max fuel level 95 and 4 signals received.`,

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 4,
      max_score: 200,

      metadata: {
        space_theme: true,
        story_linked: true,
        is_final_task: true,
        is_capstone: true,
        is_code_convergence: true,
        unlocks_next_level: true,
        concepts: [
          'functions',
          'parameters',
          'return values',
          'input()',
          'int()',
          'max()',
          'len()',
          'list',
          'set',
          'split()',
          'map()',
          'strip()',
          'indexing',
          'integration',
          'data processing'
        ],
        estimated_time_minutes: 35,
        orbitron_phase: 'complete',
        narrative_beat: 'ORBITRON decodes distress call from VORAX-9'
      },

      session_title: 'Code Convergence: Project ORBITRON',
      session_introduction: `The ultimate test of your Python mastery. Project ORBITRON demands you integrate every concept learned across Level 2 -from basic variables to complex data structures, from simple loops to sophisticated functions. This is where theory becomes practice, where individual skills converge into a unified system that can save lives in the depths of space. ORBITRON must process real-time data, filter noise, and decode critical messages while managing spacecraft systems under extreme conditions.`,

      case_number: 6,
      case_title: 'Project ORBITRON - Mission Control Dashboard',
      case_explanation: `Read the 4 input lines. Fuel: fuels = list(map(int, input().split())) then max(fuels). Signals: count DIFFERENT codes with len(set(input().split())). Events: split on the comma and strip the spaces - events = [e.strip() for e in input().split(",")] - then the last event is events[-1]. PRINT the 5 lines exactly as shown (a function is optional; only your printed output is graded).`,

      created_at: new Date(),
      updated_at: new Date()
    };

    await problemsCollection.deleteOne({ problem_id: 1000 });
    await testCasesCollection.deleteMany({ problem_id: 1000 });

    const problemResult = await problemsCollection.insertOne(codeConvergenceL2);
    const testCases = [
      {
        test_case_id: 10001,
        problem_id: 1000,
        input: 'NOVA-12\n85 92 78 95 88\nALPHA BETA GAMMA ALPHA DELTA\nLaunch, Orbit Achieved, Storm Detected, Filters Applied',
        expected_output: `Mission Name: NOVA-12
Maximum Fuel Level: 95
Number of Signals: 4
Most Recent Event: Filters Applied
Mission NOVA-12 is active with max fuel level 95 and 4 signals received.`,
        is_hidden: false,
        weight: 12
      },
      {
        test_case_id: 10002,
        problem_id: 1000,
        input: 'VORAX-9\n60 75 82 68\nX1 Y2 Z3 X1\nDistress, Signal Lost, Reconnected',
        expected_output: `Mission Name: VORAX-9
Maximum Fuel Level: 82
Number of Signals: 3
Most Recent Event: Reconnected
Mission VORAX-9 is active with max fuel level 82 and 3 signals received.`,
        is_hidden: false,
        weight: 12
      },
      // Hidden test cases
      {
        test_case_id: 10003,
        problem_id: 1000,
        input: 'ORBITRON-PRIME\n100 98 99 97 100 95\nA B C D E F A B\nInitialization, Calibration, Systems Check, All Green',
        expected_output: `Mission Name: ORBITRON-PRIME
Maximum Fuel Level: 100
Number of Signals: 6
Most Recent Event: All Green
Mission ORBITRON-PRIME is active with max fuel level 100 and 6 signals received.`,
        is_hidden: true,
        weight: 13
      },
      {
        test_case_id: 10004,
        problem_id: 1000,
        input: 'ARTEMIS\n45 50 48 52 49\nRED BLUE GREEN RED BLUE\nLaunch, Boost, Separation, Orbit Insertion, Stabilization',
        expected_output: `Mission Name: ARTEMIS
Maximum Fuel Level: 52
Number of Signals: 3
Most Recent Event: Stabilization
Mission ARTEMIS is active with max fuel level 52 and 3 signals received.`,
        is_hidden: true,
        weight: 13
      },
      {
        test_case_id: 10005,
        problem_id: 1000,
        input: 'PHOENIX\n70 85 90 88 92 87\nP1 P2 P3 P4 P1 P2\nIgnition, Liftoff, Stage1, Stage2, Orbit, Deployment, Mission Success',
        expected_output: `Mission Name: PHOENIX
Maximum Fuel Level: 92
Number of Signals: 4
Most Recent Event: Mission Success
Mission PHOENIX is active with max fuel level 92 and 4 signals received.`,
        is_hidden: true,
        weight: 13
      },
      {
        test_case_id: 10006,
        problem_id: 1000,
        input: 'EREVOS-7\n55 60 58 62 59 61\nSTORM THUNDER LIGHTNING STORM WIND\nApproach, Entry, Turbulence Detected, Shields Up, Navigation Adjusted, Stable',
        expected_output: `Mission Name: EREVOS-7
Maximum Fuel Level: 62
Number of Signals: 4
Most Recent Event: Stable
Mission EREVOS-7 is active with max fuel level 62 and 4 signals received.`,
        is_hidden: true,
        weight: 13
      },
      {
        test_case_id: 10007,
        problem_id: 1000,
        input: 'COSMIC-LINK\n80 85 83 88 86\nNODE1 NODE2 NODE3 NODE1 NODE4\nConnection Established, Data Sync, Network Active',
        expected_output: `Mission Name: COSMIC-LINK
Maximum Fuel Level: 88
Number of Signals: 4
Most Recent Event: Network Active
Mission COSMIC-LINK is active with max fuel level 88 and 4 signals received.`,
        is_hidden: true,
        weight: 12
      },
      {
        test_case_id: 10008,
        problem_id: 1000,
        input: 'ASTRA-COMMAND\n90 93 91 95 92 94\nCOMM1 COMM2 COMM3 COMM4 COMM5 COMM1 COMM2\nBoot, Systems Online, Full Power, Command Ready, Awaiting Orders',
        expected_output: `Mission Name: ASTRA-COMMAND
Maximum Fuel Level: 95
Number of Signals: 5
Most Recent Event: Awaiting Orders
Mission ASTRA-COMMAND is active with max fuel level 95 and 5 signals received.`,
        is_hidden: true,
        weight: 12
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
}

// Run the seed function
seedCodeConvergenceL2()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
