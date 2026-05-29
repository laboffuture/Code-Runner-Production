import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem171() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 171: Level 3, Session 9, Case 3 - Method Overriding
    const problem171 = {
      problem_id: 171,
      session_id: 31, // Level 3, Session 9
      title: 'Method Overriding',
      description: 'Discover how child classes can replace parent methods with customized versions.',
      difficulty: 'Medium',
      question: `Can you create a ThermalSensor that overrides its parent Sensor's status() method with specialized behavior?`,      sample_input: 'Celsius',
      sample_output: 'TempSensor: Thermal sensor activated.',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['method overriding', 'inheritance', 'polymorphism', 'specialized behavior', 'OOP', 'conditional logic', 'nested conditionals', 'modulo operator'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 9: Mastering Inheritance - Advanced',

      // Case-specific content
      case_number: 3,
      case_title: 'Method Overriding',
      case_overview: `Method overriding lets child classes replace parent methods with specialized functionality.`,
      case_explanation: `Build ThermalSensor that overrides Sensor's status() method with conditional prefixes based on sensor name.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 171 if it exists
    await problemsCollection.deleteOne({ problem_id: 171 });
    await testCasesCollection.deleteMany({ problem_id: 171 });

    // Insert problem 171
    const problemResult = await problemsCollection.insertOne(problem171);
    console.log('Problem 171 inserted');

    // Test cases for Problem 171
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1711,
        problem_id: 171,
        input: 'Celsius',
        expected_output: 'TempSensor: Thermal sensor activated.', // len=7, odd, >=6
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1712,
        problem_id: 171,
        input: 'Pyrometer',
        expected_output: 'TempSensor: Thermal sensor activated.', // len=9, odd, >=6
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1713,
        problem_id: 171,
        input: 'Kelvin',
        expected_output: 'HeatSensor: Thermal sensor activated.', // len=6, even, >=6
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1714,
        problem_id: 171,
        input: 'IR',
        expected_output: 'Thermal: Thermal sensor activated.', // len=2, even, <6
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1715,
        problem_id: 171,
        input: 'Heat',
        expected_output: 'Thermal: Thermal sensor activated.', // len=4, even, <6
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1716,
        problem_id: 171,
        input: 'Temp',
        expected_output: 'Thermal: Thermal sensor activated.', // len=4, even, <6
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1717,
        problem_id: 171,
        input: 'Fire',
        expected_output: 'Thermal: Thermal sensor activated.', // len=4, even, <6
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 171`);

    console.log('\n✅ Problem 171 (Level 3, Session 9, Case 3: Method Overriding) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem171()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
