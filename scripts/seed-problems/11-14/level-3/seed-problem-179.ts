import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem179() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 179: Level 3, Session 10, Case 5 - Classic Polymorphism
    const problem179 = {
      problem_id: 179,
      session_id: 32, // Level 3, Session 10
      title: 'Same Method in Different Classes – Classic Polymorphism',
      description: 'Understand how unrelated classes can share method names with different implementations.',
      difficulty: 'Medium',
      question: `Can you create three unrelated classes (Fan, Car, Computer) that all have a start() method but perform completely different actions? Take 3 inputs for object types ("Fan", "Car", or "Computer"), create objects based on input, and call their start() methods in order to demonstrate polymorphism.`,      sample_input: 'Fan\nCar\nComputer',
      sample_output: 'Fan is spinning.\nCar engine started.\nComputer booting up.',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['polymorphism', 'duck typing', 'method interface', 'same method different classes', 'OOP'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 10: Polymorphism',

      // Case-specific content
      case_number: 5,
      case_title: 'Same Method in Different Classes – Classic Polymorphism',
      case_overview: `Classic polymorphism allows unrelated classes to implement the same method name with different behaviors. The same interface enables uniform calling while maintaining unique implementations.`,
      case_explanation: `Create Fan, Car, and Computer classes, each with start() method printing unique messages. Create objects of all three classes and call start() on each to demonstrate polymorphic behavior.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 179 if it exists
    await problemsCollection.deleteOne({ problem_id: 179 });
    await testCasesCollection.deleteMany({ problem_id: 179 });

    // Insert problem 179
    const problemResult = await problemsCollection.insertOne(problem179);
    console.log('Problem 179 inserted');

    // Test cases for Problem 179
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1791,
        problem_id: 179,
        input: 'Fan\nCar\nComputer',
        expected_output: 'Fan is spinning.\nCar engine started.\nComputer booting up.',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1792,
        problem_id: 179,
        input: 'Computer\nFan\nCar',
        expected_output: 'Computer booting up.\nFan is spinning.\nCar engine started.',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1793,
        problem_id: 179,
        input: 'Fan\nFan\nFan',
        expected_output: 'Fan is spinning.\nFan is spinning.\nFan is spinning.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1794,
        problem_id: 179,
        input: 'Car\nCar\nComputer',
        expected_output: 'Car engine started.\nCar engine started.\nComputer booting up.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1795,
        problem_id: 179,
        input: 'Computer\nComputer\nComputer',
        expected_output: 'Computer booting up.\nComputer booting up.\nComputer booting up.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1796,
        problem_id: 179,
        input: 'Car\nFan\nCar',
        expected_output: 'Car engine started.\nFan is spinning.\nCar engine started.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1797,
        problem_id: 179,
        input: 'Fan\nComputer\nFan',
        expected_output: 'Fan is spinning.\nComputer booting up.\nFan is spinning.',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 179`);

    console.log('\n✅ Problem 179 (Level 3, Session 10, Case 5: Classic Polymorphism) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem179()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
