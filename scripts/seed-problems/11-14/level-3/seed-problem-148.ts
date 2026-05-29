import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem148() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 148: Level 3, Session 5, Case 4 - Conditional Logic in Methods
    const problem148 = {
      problem_id: 148,
      session_id: 27, // Level 3, Session 5
      title: 'Conditional Logic in Methods',
      description: 'Methods can include conditional statements to control object behavior based on attributes, enabling dynamic decision-making that makes programs flexible.',
      difficulty: 'Easy',
      question: `Can you create a Student class with name and score attributes, and a check_pass method with conditional logic? If score is even and >= 50, print 'Success: [name] has passed.' If score is odd and >= 50, print 'Victory: [name] has passed.' If score is even and < 50, print 'Failure: [name] has failed.' If score is odd and < 50, print 'Defeat: [name] has failed.'`,      sample_input: 'Rohit\n45',
      sample_output: 'Defeat: Rohit has failed.',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'methods', 'conditional logic', 'if-else', 'decision making', 'nested conditionals', 'modulo operator', 'even/odd checking'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 5: Classes with Attributes and Methods',

      // Case-specific content
      case_number: 4,
      case_title: 'Conditional Logic in Methods',
      case_overview: `Methods with conditionals enable objects to respond dynamically based on their state, adding intelligence to behavior.`,
      case_explanation: `Create Student class with __init__(name, score) and check_pass() method. Check two conditions: (1) if score >= 50 (pass) or < 50 (fail), and (2) if score % 2 == 0 (even) or odd. Use nested if-else: even+pass='Success:', odd+pass='Victory:', even+fail='Failure:', odd+fail='Defeat:' prefix.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 148 - 7 test cases (2 visible + 5 hidden)
    const testCases148 = [
      {
        test_case_id: 1481,
        problem_id: 148,
        input: 'Rohit\n45',
        expected_output: 'Defeat: Rohit has failed.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1482,
        problem_id: 148,
        input: 'Anya\n75',
        expected_output: 'Victory: Anya has passed.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1483,
        problem_id: 148,
        input: 'Ravi\n50',
        expected_output: 'Success: Ravi has passed.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1484,
        problem_id: 148,
        input: 'Maya\n49',
        expected_output: 'Defeat: Maya has failed.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1485,
        problem_id: 148,
        input: 'Kiran\n88',
        expected_output: 'Success: Kiran has passed.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1486,
        problem_id: 148,
        input: 'Zara\n32',
        expected_output: 'Failure: Zara has failed.',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1487,
        problem_id: 148,
        input: 'Arjun\n65',
        expected_output: 'Victory: Arjun has passed.',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 148 });
    await problemsCollection.insertOne(problem148);
    console.log('Problem 148 inserted');

    await testCasesCollection.deleteMany({ problem_id: 148 });
    await testCasesCollection.insertMany(testCases148);
    console.log(`${testCases148.length} test cases inserted for Problem 148`);

    console.log('\n✅ Problem 148 (Level 3, Session 5, Case 4: Conditional Logic in Methods) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem148()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
