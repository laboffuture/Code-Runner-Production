import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedCodeConvergenceL3() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Code Convergence: Level 3 - Project COSMIC LINK
    const codeConvergence = {
      problem_id: 181,
      session_id: 33, // Level 3, Code Convergence
      title: 'Project COSMIC LINK – Interstellar AI Signal Processor',
      description: 'Build an intelligent signal processor to classify cosmic transmissions from VORAX-9. Combine classes, encapsulation, lists, conditionals, and functional programming to detect, classify, and respond to signals. Unlock GALACTIC COMMAND!',
      difficulty: 'Hard',
      question: `Build a signal processing system combining all Python fundamentals:

1. Create Signal objects with encapsulation
2. Classify signals using conditional logic
3. Manage data with lists and loops
4. Generate alerts using function parameters`,

      compiler_comment: '# Write your code here\n',
      sample_input: 'Alpha-1\n85\nFriendly approach detected\nBeta-2\n60\nUnknown origin signal\nGamma-3\n95\nAllied transmission received',
      sample_output: 'Total Signals Detected: 3\nFriendly Signals: 2\nUnknown Signals: 1\nCOSMIC LINK LIVE – STREAMS CLASSIFIED',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        is_code_convergence: true,
        concepts: ['classes', 'OOP', 'encapsulation', 'private attributes', 'magic methods', '__str__', '__init__', 'lists', 'loops', 'conditionals', 'functions', '*args', '**kwargs', 'input/output', 'signal processing', 'classification'],
        estimated_time_minutes: 45,
        prerequisites: ['Session 1-10 complete']
      },

      // Session-level content
      session_title: 'Code Convergence: Project COSMIC LINK',

      // Case-specific content
      case_number: 1,
      case_title: 'Project COSMIC LINK – Interstellar AI Signal Processor',
      case_explanation: `Signal class needs __init__ and __str__. SignalClassifier uses private __type with getter/setter. Process 3 signals (source, strength, message), classify by strength > 70, separate into lists. Alert function uses *args. Final summary shows counts and status.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing code convergence problem if it exists
    await problemsCollection.deleteOne({ problem_id: 181 });
    await testCasesCollection.deleteMany({ problem_id: 181 });

    // Insert code convergence problem
    const problemResult = await problemsCollection.insertOne(codeConvergence);
    // Test cases for Code Convergence L3 (7 test cases: 2 visible, 5 hidden)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1811,
        problem_id: 181,
        input: 'Alpha-1\n85\nFriendly approach detected\nBeta-2\n60\nUnknown origin signal\nGamma-3\n95\nAllied transmission received',
        expected_output: 'Total Signals Detected: 3\nFriendly Signals: 2\nUnknown Signals: 1\nCOSMIC LINK LIVE – STREAMS CLASSIFIED',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1812,
        problem_id: 181,
        input: 'Nova-7\n75\nPeaceful contact initiated\nDelta-5\n50\nUnidentified frequency\nOrion-9\n80\nCooperative signal confirmed',
        expected_output: 'Total Signals Detected: 3\nFriendly Signals: 2\nUnknown Signals: 1\nCOSMIC LINK LIVE – STREAMS CLASSIFIED',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1813,
        problem_id: 181,
        input: 'Phoenix-3\n90\nAlliance beacon active\nVega-4\n65\nCryptic transmission\nZenith-8\n71\nTrusted source verified',
        expected_output: 'Total Signals Detected: 3\nFriendly Signals: 2\nUnknown Signals: 1\nCOSMIC LINK LIVE – STREAMS CLASSIFIED',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1814,
        problem_id: 181,
        input: 'Titan-2\n100\nEmergency aid provided\nSirius-6\n55\nAmbiguous message\nLunar-1\n78\nFriendly forces deployed',
        expected_output: 'Total Signals Detected: 3\nFriendly Signals: 2\nUnknown Signals: 1\nCOSMIC LINK LIVE – STREAMS CLASSIFIED',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1815,
        problem_id: 181,
        input: 'Cosmos-5\n82\nDiplomatic channel open\nNebula-3\n45\nWeakened signal detected\nAurora-7\n88\nPeaceful intentions confirmed',
        expected_output: 'Total Signals Detected: 3\nFriendly Signals: 2\nUnknown Signals: 1\nCOSMIC LINK LIVE – STREAMS CLASSIFIED',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 1816,
        problem_id: 181,
        input: 'Polaris-9\n92\nRescue operation confirmed\nEclipse-2\n58\nDistorted communication\nHorizon-6\n74\nCooperative mission active',
        expected_output: 'Total Signals Detected: 3\nFriendly Signals: 2\nUnknown Signals: 1\nCOSMIC LINK LIVE – STREAMS CLASSIFIED',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1817,
        problem_id: 181,
        input: 'Voyager-4\n98\nMedical assistance transmitted\nComet-8\n62\nUncertain broadcast\nStarlight-1\n76\nAllied support confirmed',
        expected_output: 'Total Signals Detected: 3\nFriendly Signals: 2\nUnknown Signals: 1\nCOSMIC LINK LIVE – STREAMS CLASSIFIED',
        is_hidden: true,
        weight: 15
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
seedCodeConvergenceL3()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
