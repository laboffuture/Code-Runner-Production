import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem97() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 97: Level 2, Session 7, Case 1 - Creating and Calling a Simple Function
    const problem97 = {
      problem_id: 97,
      session_id: 18, // Level 2, Session 7
      title: 'Creating and Calling a Simple Function',
      description: 'Learn to define and call simple functions using def keyword.',
      difficulty: 'Intro',
      question: `Take a greeting message as input. Define a function greet(message) that prints the message. Call the function with the input message.`,      sample_input: 'Welcome to the Space Station!',
      sample_output: 'Welcome to the Space Station!',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 0,
      max_score: 80,

      metadata: {
        space_theme: true,
        concepts: ['functions', 'def keyword', 'function definition', 'function call', 'basic functions'],
        estimated_time_minutes: 8
      },
      // Session-level content
      session_title: 'Session 7: User-Defined Functions',

      // Case-specific content
      case_number: 1,
      case_title: 'Creating and Calling a Simple Function',
      case_overview: `Master the basics of functions - define a function using def and call it to execute its code.`,
      case_code: `# Function with Return Value
def get_mission_name():
    return "Apollo 11"

# Store the returned value
mission = get_mission_name()
print(mission)  # Prints: Apollo 11

# Can use return value directly
print(get_mission_name())  # Prints: Apollo 11`,
      case_explanation: `Use def function_name(): to define a function. Indent the function body. Call it by writing function_name() to execute the code inside.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 97 if it exists
    await problemsCollection.deleteOne({ problem_id: 97 });
    await testCasesCollection.deleteMany({ problem_id: 97 });

    // Insert problem 97
    const problemResult = await problemsCollection.insertOne(problem97);
    console.log('Problem 97 inserted');

    // Test cases for Problem 97 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 971,
        problem_id: 97,
        input: 'Welcome to the Space Station!',
        expected_output: 'Welcome to the Space Station!',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 972,
        problem_id: 97,
        input: 'Hello, Explorer!',
        expected_output: 'Hello, Explorer!',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 973,
        problem_id: 97,
        input: 'Greetings from Earth',
        expected_output: 'Greetings from Earth',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 974,
        problem_id: 97,
        input: 'Prepare for departure',
        expected_output: 'Prepare for departure',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 975,
        problem_id: 97,
        input: 'Mission control online',
        expected_output: 'Mission control online',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 976,
        problem_id: 97,
        input: 'Initiating launch sequence',
        expected_output: 'Initiating launch sequence',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 977,
        problem_id: 97,
        input: 'Godspeed',
        expected_output: 'Godspeed',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 97`);

    console.log('\n✅ Problem 97 (Level 2, Session 7, Case 1: Creating and Calling a Simple Function) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem97()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
