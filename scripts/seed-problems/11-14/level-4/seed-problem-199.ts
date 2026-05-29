import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem199() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 199: Level 4, Session 3, Case 6 - Cosmic Fault Resilience System
    const problem199 = {
      problem_id: 199,
      session_id: 36, // Level 4, Session 3
      title: 'Cosmic Fault Resilience System – Fortifying Space Systems Against Anomalies',
      description: 'Build a comprehensive fault-resilient spacecraft system using finally blocks and custom user-defined exceptions.',
      difficulty: 'Hard',
      question: `Build a fault-resilient system with custom exceptions and finally blocks.

1. Define custom exceptions: SensorMalfunction, TransmissionCorrupted, ComputationError
2. Use try-finally: print "Solar panels deployed", ensure "Power lines disconnected safely"
3. Check temperature > 100: print "Cooling System Overload!" else "Cooling temperature normal"
4. Raise exception based on error_type, handle with recovery_status (recovery_fail prints "Fallback System Activated" + "Mission Abort Initiated")
5. Print "Log entry recorded: {log_status}" and "All operations complete"

Inputs: value, temperature, error_type, recovery_status, log_status`,      sample_input: '50\n120\nsensor_fail\nrecovery_fail\nsuccess',
      sample_output: 'Solar panels deployed\nPower lines disconnected safely\nCooling System Overload!\nSensorMalfunction raised\nFallback System Activated\nMission Abort Initiated\nLog entry recorded: success\nAll operations complete',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['finally block', 'user-defined exceptions', 'raise statement', 'nested try-except', 'file logging', 'guaranteed cleanup', 'custom exception classes', 'multi-layer recovery'],
        estimated_time_minutes: 40
      },

      // Session-level content
      session_title: 'Session 3: Finally Block and User-Defined Exceptions',

      // Case-specific content
      case_number: 6,
      case_title: 'Cosmic Fault Resilience System – Fortifying Space Systems Against Anomalies',
      case_overview: `A comprehensive fault-resilient command system that combines finally blocks for guaranteed cleanup with custom exception classes (OverloadError, SealLockError). Ensures security gates release locks and files close properly even during surge failures.`,
      case_explanation: `Implement 5 interconnected systems: guaranteed execution with finally, conditional raise statements, custom exception definitions, nested multi-layer recovery with cascading fallbacks, and file logging with timestamps. Demonstrates complete exception handling mastery.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 199 if it exists
    await problemsCollection.deleteOne({ problem_id: 199 });
    await testCasesCollection.deleteMany({ problem_id: 199 });

    // Insert problem 199
    const problemResult = await problemsCollection.insertOne(problem199);
    console.log('Problem 199 inserted');

    // Test cases for Problem 199 (7 test cases)
    const testCases = [
      // Visible test case
      {
        test_case_id: 1991,
        problem_id: 199,
        input: '50\n120\nsensor_fail\nrecovery_fail\nsuccess',
        expected_output: 'Solar panels deployed\nPower lines disconnected safely\nCooling System Overload!\nSensorMalfunction raised\nFallback System Activated\nMission Abort Initiated\nLog entry recorded: success\nAll operations complete',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1992,
        problem_id: 199,
        input: '75\n90\ntransmission_corrupt\nrecovery_success\nerror_log',
        expected_output: 'Solar panels deployed\nPower lines disconnected safely\nCooling temperature normal\nTransmissionCorrupted raised\nRecovery successful\nLog entry recorded: error_log\nAll operations complete',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1993,
        problem_id: 199,
        input: '100\n105\ncomputation_error\nrecovery_fail\nfailure',
        expected_output: 'Solar panels deployed\nPower lines disconnected safely\nCooling System Overload!\nComputationError raised\nFallback System Activated\nMission Abort Initiated\nLog entry recorded: failure\nAll operations complete',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1994,
        problem_id: 199,
        input: '25\n85\nsensor_fail\nrecovery_success\nnormal',
        expected_output: 'Solar panels deployed\nPower lines disconnected safely\nCooling temperature normal\nSensorMalfunction raised\nRecovery successful\nLog entry recorded: normal\nAll operations complete',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1995,
        problem_id: 199,
        input: '60\n110\ntransmission_corrupt\nrecovery_fail\ncritical',
        expected_output: 'Solar panels deployed\nPower lines disconnected safely\nCooling System Overload!\nTransmissionCorrupted raised\nFallback System Activated\nMission Abort Initiated\nLog entry recorded: critical\nAll operations complete',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 1996,
        problem_id: 199,
        input: '80\n95\ncomputation_error\nrecovery_success\noperational',
        expected_output: 'Solar panels deployed\nPower lines disconnected safely\nCooling temperature normal\nComputationError raised\nRecovery successful\nLog entry recorded: operational\nAll operations complete',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1997,
        problem_id: 199,
        input: '45\n115\nsensor_fail\nrecovery_fail\nemergency',
        expected_output: 'Solar panels deployed\nPower lines disconnected safely\nCooling System Overload!\nSensorMalfunction raised\nFallback System Activated\nMission Abort Initiated\nLog entry recorded: emergency\nAll operations complete',
        is_hidden: true,
        weight: 15
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 199`);

    console.log('\n✅ Problem 199 (Level 4, Session 3, Case 6: Cosmic Fault Resilience System) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem199()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
