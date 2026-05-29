import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem187() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 187: Level 4, Session 1, Case 6 - Galactic Anomaly Detector (Final Task)
    const problem187 = {
      problem_id: 187,
      session_id: 34, // Level 4, Session 1
      title: 'Galactic Anomaly Detector – Fortifying the Cosmic Shield System',
      description: 'Build a comprehensive fault-tolerant system that protects spacecraft from unexpected cosmic disturbances using exception handling.',
      difficulty: 'Hard',
      question: `Can you build a Galactic Anomaly Detector that handles multiple space anomalies? Take 3 inputs: distance, time, and sensor_index. First, calculate velocity (distance/time) and print "Velocity:" followed by the result. Handle ZeroDivisionError by printing "Error: Cannot calculate with zero time". Second, access sensor data at the given index from a pre-defined list [10, 20, 30, 40, 50] and print "Sensor Reading:" followed by the value. Handle IndexError by printing "Error: Sensor index out of range". Finally, print "System Status: Operational" to indicate the shield is active.`,      sample_input: '100\n5\n1',
      sample_output: 'Velocity: 20.0\nSensor Reading: 20\nSystem Status: Operational',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['exception handling', 'try-except', 'ZeroDivisionError', 'IndexError', 'fault-tolerant systems', 'comprehensive error handling'],
        estimated_time_minutes: 25
      },

      // Session-level content
      session_title: 'Session 1: Error Detection and Exception Resolution',
      session_introduction: `As NOVA-12 touches down on the relay platform, sensor feeds glitch from storm residue. The team brings systems online, expecting faults and spikes. Your objective is to create a fault-tolerant 'Cosmic Shield' bootstrap script that wraps all first-reads in try/except and prints stable status lines instead of crashing.`,

      // Case-specific content
      case_number: 6,
      case_title: 'Galactic Anomaly Detector – Fortifying the Cosmic Shield System',
      case_overview: `This comprehensive mission combines all exception handling techniques into a fault-tolerant system that simulates spacecraft protection from cosmic disturbances. Multiple exception types must be handled to ensure continuous operation.`,
      case_explanation: `Build velocity calculator with ZeroDivisionError handling, sensor data accessor with IndexError handling, and status reporter. Use separate try-except blocks for each operation. System must remain operational even when anomalies occur.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 187 if it exists
    await problemsCollection.deleteOne({ problem_id: 187 });
    await testCasesCollection.deleteMany({ problem_id: 187 });

    // Insert problem 187
    const problemResult = await problemsCollection.insertOne(problem187);
    console.log('Problem 187 inserted');

    // Test cases for Problem 187
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1871,
        problem_id: 187,
        input: '100\n5\n1',
        expected_output: 'Velocity: 20.0\nSensor Reading: 20\nSystem Status: Operational',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1872,
        problem_id: 187,
        input: '100\n0\n1',
        expected_output: 'Error: Cannot calculate with zero time\nSensor Reading: 20\nSystem Status: Operational',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1873,
        problem_id: 187,
        input: '200\n10\n3',
        expected_output: 'Velocity: 20.0\nSensor Reading: 40\nSystem Status: Operational',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1874,
        problem_id: 187,
        input: '150\n0\n10',
        expected_output: 'Error: Cannot calculate with zero time\nError: Sensor index out of range\nSystem Status: Operational',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1875,
        problem_id: 187,
        input: '80\n4\n0',
        expected_output: 'Velocity: 20.0\nSensor Reading: 10\nSystem Status: Operational',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1876,
        problem_id: 187,
        input: '120\n6\n8',
        expected_output: 'Velocity: 20.0\nError: Sensor index out of range\nSystem Status: Operational',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1877,
        problem_id: 187,
        input: '100\n5\n4',
        expected_output: 'Velocity: 20.0\nSensor Reading: 50\nSystem Status: Operational',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 187`);

    console.log('\n✅ Problem 187 (Level 4, Session 1, Case 6: Galactic Anomaly Detector - FINAL TASK) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem187()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
