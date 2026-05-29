import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem166() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 166: Level 3, Session 8, Case 4 - Method Overriding
    const problem166 = {
      problem_id: 166,
      session_id: 30, // Level 3, Session 8
      title: 'Overriding Inherited Methods – Changing Behavior',
      description: 'Discover how child classes can replace inherited methods with their own specialized versions.',
      difficulty: 'Medium',
      question: `Can you create a MarsRover that overrides its parent Rover's identify() method with specialized behavior and conditional prefixes?`,      sample_input: 'Spirit',
      sample_output: 'Advanced Rover: Generic Rover\nAdvanced Rover: Mars Exploration Rover',

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
      session_title: 'Session 8: Mastering Inheritance - Beginner',

      // Case-specific content
      case_number: 4,
      case_title: 'Overriding Inherited Methods – Changing Behavior',
      case_overview: `Method overriding lets child classes replace inherited methods with specialized versions.`,
      case_explanation: `Build Rover and MarsRover with overridden methods using conditional prefixes based on rover name.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 166 if it exists
    await problemsCollection.deleteOne({ problem_id: 166 });
    await testCasesCollection.deleteMany({ problem_id: 166 });

    // Insert problem 166
    const problemResult = await problemsCollection.insertOne(problem166);
    console.log('Problem 166 inserted');

    // Test cases for Problem 166
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1661,
        problem_id: 166,
        input: 'Spirit',
        expected_output: 'Advanced Rover: Generic Rover\nAdvanced Rover: Mars Exploration Rover', // len=6, even, >=6
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1662,
        problem_id: 166,
        input: 'Opportunity',
        expected_output: 'Elite Rover: Generic Rover\nElite Rover: Mars Exploration Rover', // len=11, odd, >=6
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1663,
        problem_id: 166,
        input: 'Curiosity',
        expected_output: 'Elite Rover: Generic Rover\nElite Rover: Mars Exploration Rover', // len=9, odd, >=6
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1664,
        problem_id: 166,
        input: 'Perseverance',
        expected_output: 'Advanced Rover: Generic Rover\nAdvanced Rover: Mars Exploration Rover', // len=12, even, >=6
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1665,
        problem_id: 166,
        input: 'Sojourner',
        expected_output: 'Elite Rover: Generic Rover\nElite Rover: Mars Exploration Rover', // len=9, odd, >=6
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1666,
        problem_id: 166,
        input: 'Zhurong',
        expected_output: 'Elite Rover: Generic Rover\nElite Rover: Mars Exploration Rover', // len=7, odd, >=6
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1667,
        problem_id: 166,
        input: 'Yutu',
        expected_output: 'Base Rover: Generic Rover\nBase Rover: Mars Exploration Rover', // len=4, even, <6
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 166`);

    console.log('\n✅ Problem 166 (Level 3, Session 8, Case 4: Method Overriding) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem166()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
