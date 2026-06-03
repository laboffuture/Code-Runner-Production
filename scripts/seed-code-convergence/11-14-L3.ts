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
      title: 'Project COSMIC LINK - Interstellar AI Signal Processor',
      description: 'Build an intelligent signal processor to classify cosmic transmissions from VORAX-9. Combine classes, encapsulation, lists, conditionals, and functional programming to detect, classify, and respond to signals. Unlock GALACTIC COMMAND!',
      difficulty: 'Hard',
      question: `Build the COSMIC LINK signal processor.

Read 3 signals. For each signal, read 3 lines:
1. Source name
2. Signal strength (a whole number)
3. Message

Classify each signal by its strength:
- strength greater than 70 -> Friendly
- strength of 70 or less -> Unknown

Then PRINT exactly these 4 lines (replace each <...> with your value):
Total Signals Detected: <how many signals in total>
Friendly Signals: <how many had strength greater than 70>
Unknown Signals: <how many had strength 70 or less>
COSMIC LINK LIVE - STREAMS CLASSIFIED

Tip: you can use a class to model each signal if you like - the grader only checks what you print.`,

      compiler_comment: '# Write your code here\n',
      sample_input: 'Alpha-1\n85\nFriendly approach detected\nBeta-2\n60\nUnknown origin signal\nGamma-3\n95\nAllied transmission received',
      sample_output: 'Total Signals Detected: 3\nFriendly Signals: 2\nUnknown Signals: 1\nCOSMIC LINK LIVE - STREAMS CLASSIFIED',

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
      case_title: 'Project COSMIC LINK - Interstellar AI Signal Processor',
      case_explanation: `Read 3 signals - each is 3 lines: source name, strength (a whole number), message. Count how many have strength greater than 70 (Friendly) and how many are 70 or less (Unknown). Then print the 4 result lines exactly as shown. You may model a signal with a class if you like (a good use of what you learned this level), but only your printed output is graded.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing code convergence problem if it exists
    await problemsCollection.deleteOne({ problem_id: 181 });
    await testCasesCollection.deleteMany({ problem_id: 181 });

    // Insert code convergence problem
    const problemResult = await problemsCollection.insertOne(codeConvergence);
    // Test cases for Code Convergence L3 (7 test cases: 2 visible, 5 hidden)
    // Test cases use VARIED Friendly/Unknown splits (0/3, 1/2, 2/1, 3/0) and a
    // strength-exactly-70 boundary case, so the printed counts can only be produced
    // by actually reading the input and applying the >70 rule (no hard-coding).
    const SUMMARY = (f) => `Total Signals Detected: 3\nFriendly Signals: ${f}\nUnknown Signals: ${3 - f}\nCOSMIC LINK LIVE - STREAMS CLASSIFIED`;
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1811,
        problem_id: 181,
        input: 'Alpha-1\n85\nFriendly approach detected\nBeta-2\n60\nUnknown origin signal\nGamma-3\n95\nAllied transmission received',
        expected_output: SUMMARY(2), // 85,95 friendly; 60 unknown
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1812,
        problem_id: 181,
        input: 'Nova-7\n50\nFaint static burst\nDelta-5\n45\nUnidentified frequency\nOrion-9\n30\nWeak unknown ping',
        expected_output: SUMMARY(0), // all <= 70 => 0 friendly
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1813,
        problem_id: 181,
        input: 'Phoenix-3\n80\nAlliance beacon active\nVega-4\n90\nClear ally channel\nZenith-8\n100\nTrusted source verified',
        expected_output: SUMMARY(3), // all > 70 => 3 friendly
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1814,
        problem_id: 181,
        input: 'Titan-2\n70\nBorderline reading\nSirius-6\n71\nJust-friendly signal\nLunar-1\n69\nJust-unknown signal',
        expected_output: SUMMARY(1), // boundary: 70 -> Unknown, 71 -> Friendly, 69 -> Unknown
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1815,
        problem_id: 181,
        input: 'Cosmos-5\n95\nDiplomatic channel open\nNebula-3\n72\nPeaceful intentions confirmed\nAurora-7\n55\nWeakened signal detected',
        expected_output: SUMMARY(2), // 95,72 friendly; 55 unknown
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 1816,
        problem_id: 181,
        input: 'Polaris-9\n65\nDistorted communication\nEclipse-2\n68\nFaded transmission\nHorizon-6\n71\nCooperative mission active',
        expected_output: SUMMARY(1), // only 71 friendly
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1817,
        problem_id: 181,
        input: 'Voyager-4\n100\nMedical assistance transmitted\nComet-8\n99\nAllied support confirmed\nStarlight-1\n98\nRescue beacon active',
        expected_output: SUMMARY(3), // all > 70 => 3 friendly
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
