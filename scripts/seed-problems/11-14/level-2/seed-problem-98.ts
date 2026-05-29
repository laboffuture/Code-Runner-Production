import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem98() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 98: Level 2, Session 7, Case 2 - Functions with Parameters
    const problem98 = {
      problem_id: 98,
      session_id: 18, // Level 2, Session 7
      title: 'Functions with Parameters',
      description: 'Learn to define functions with parameters and pass values to them when calling.',
      difficulty: 'Easy',
      question: `Practice creating functions with parameters.

Your program should:
- Take a string input (name)
- Define a function called introduce(person) that takes one parameter
- Inside the function, print "Nice to meet you, <person>!"
- Call the function with the input name

Example:
Input: Alice
Output: Nice to meet you, Alice!`,

      example_code: '# Write your code here\n',
      sample_input: 'Alice',
      sample_output: 'Nice to meet you, Alice!',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['functions', 'parameters', 'function arguments', 'passing values', 'function calls'],
        estimated_time_minutes: 10
      },
      // Case-specific content
      case_number: 2,
      case_title: 'Functions with Parameters',
      case_overview: `Master parameters - create functions that accept input values to make them more flexible and reusable.`,      case_explanation: `Functions with Parameters:

● Parameters are variables defined in the function definition
● They act as placeholders for values passed when calling the function
● Arguments are the actual values passed to the function
● Parameters make functions flexible and reusable
● You can pass different values each time you call the function
● The parameter name is local to the function

Input Format:
- A string (name)

Output Format:
Print "Nice to meet you, <name>!" using the introduce function.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 98 if it exists
    await problemsCollection.deleteOne({ problem_id: 98 });
    await testCasesCollection.deleteMany({ problem_id: 98 });

    // Insert problem 98
    const problemResult = await problemsCollection.insertOne(problem98);
    console.log('Problem 98 inserted');

    // Test cases for Problem 98 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 981,
        problem_id: 98,
        input: 'Alice',
        expected_output: 'Nice to meet you, Alice!',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 982,
        problem_id: 98,
        input: 'Bob',
        expected_output: 'Nice to meet you, Bob!',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 983,
        problem_id: 98,
        input: 'Commander',
        expected_output: 'Nice to meet you, Commander!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 984,
        problem_id: 98,
        input: 'Astronaut',
        expected_output: 'Nice to meet you, Astronaut!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 985,
        problem_id: 98,
        input: 'Charlie',
        expected_output: 'Nice to meet you, Charlie!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 986,
        problem_id: 98,
        input: 'Dr. Smith',
        expected_output: 'Nice to meet you, Dr. Smith!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 987,
        problem_id: 98,
        input: 'Explorer',
        expected_output: 'Nice to meet you, Explorer!',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 98`);

    console.log('\n✅ Problem 98 (Level 2, Session 7, Case 2: Functions with Parameters) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem98()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
