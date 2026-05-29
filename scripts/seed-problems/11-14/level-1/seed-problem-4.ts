import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem4() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 4: Case 4 - Using Variables in Output
    const problem4 = {
      problem_id: 4,
      session_id: 1,
      title: 'Using Variables in Output',
      description: 'Learn to store values in variables and print them for dynamic output.',
      question: `Create two variables:
- astronaut = "Commander Ray"
- mission = "Lunar Orbiter 1"
Then print: Commander Ray is leading the Lunar Orbiter 1`,
      difficulty: 'Intro',
      example_code: '# Write your code here\n',
      sample_input: '',
      sample_output: 'Commander Ray is leading the Lunar Orbiter 1',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['variables', 'print() function', 'combining variables and text', 'dynamic output'],
        space_theme: true,
        estimated_time_minutes: 7
      },
      // Case-specific content
      case_number: 4,
      case_title: 'Using Variables in Output',
      case_overview: `Learn to store values in variables and use them in print statements. Variables make your code reusable and dynamic!`,
      case_code: `# Combine variables with text:
age = 25
print("My name is", name, "and I am", age, "years old")

# The above prints: My name is Alice and I am 25 years old`,
      case_explanation: `Variables in Python:
● Variables store values that you can reuse
● Create a variable: variable_name = value
● Text values need quotes: name = "Alice"
● Numbers don't need quotes: age = 25
● Use variables in print() just like any other value`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 4 - Simple for intro level
    const testCases4 = [
      {
        problem_id: 4,
        test_case_id: 1,
        input: '',
        expected_output: 'Commander Ray is leading the Lunar Orbiter 1',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 4
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 4 },
      { $set: problem4 },
      { upsert: true }
    );


    // Delete existing test cases for problem 4
    await testCasesCollection.deleteMany({ problem_id: 4 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases4);

  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
}

// Run the seed function
seedProblem4()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
