import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem195() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 195: Level 4, Session 3, Case 2 - Triggering Custom Anomalies with Raise
    const problem195 = {
      problem_id: 195,
      session_id: 36, // Level 4, Session 3
      title: 'Triggering Custom Anomalies with Raise',
      description: 'Learn to manually trigger exceptions using the raise statement when specific conditions are met.',
      difficulty: 'Easy',
      question: `Create a pressure monitoring system that checks if pressure exceeds safe limits (150). If the pressure value exceeds 150, use raise to trigger an Exception with the message "Critical Alert: Pressure exceeds safe limits!"`,      sample_input: '180',
      sample_output: 'Critical Alert: Pressure exceeds safe limits!',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['raise statement', 'manual exceptions', 'conditional error triggering', 'safety thresholds'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 3: Finally Block and User-Defined Exceptions',

      // Case-specific content
      case_number: 2,
      case_title: 'Triggering Custom Anomalies with Raise',
      case_overview: `Simulate unexpected space issues like temperature spikes or sensor loss by using raise to manually trigger exceptions during specific mission conditions.`,
      case_explanation: `Check if pressure input exceeds 150. If true, use raise Exception() to trigger a critical alert. If pressure is safe, print "Pressure within safe limits."`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 195 if it exists
    await problemsCollection.deleteOne({ problem_id: 195 });
    await testCasesCollection.deleteMany({ problem_id: 195 });

    // Insert problem 195
    const problemResult = await problemsCollection.insertOne(problem195);
    console.log('Problem 195 inserted');

    // Test cases for Problem 195
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1951,
        problem_id: 195,
        input: '180',
        expected_output: 'Critical Alert: Pressure exceeds safe limits!',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1952,
        problem_id: 195,
        input: '120',
        expected_output: 'Pressure within safe limits.',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1953,
        problem_id: 195,
        input: '200',
        expected_output: 'Critical Alert: Pressure exceeds safe limits!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1954,
        problem_id: 195,
        input: '100',
        expected_output: 'Pressure within safe limits.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1955,
        problem_id: 195,
        input: '151',
        expected_output: 'Critical Alert: Pressure exceeds safe limits!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1956,
        problem_id: 195,
        input: '150',
        expected_output: 'Pressure within safe limits.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1957,
        problem_id: 195,
        input: '175',
        expected_output: 'Critical Alert: Pressure exceeds safe limits!',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 195`);

    console.log('\n✅ Problem 195 (Level 4, Session 3, Case 2: Raise Statement) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem195()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
