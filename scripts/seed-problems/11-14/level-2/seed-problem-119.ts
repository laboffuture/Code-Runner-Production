import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem119() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 119: Level 2, Session 10, Case 5 - Input and Output Functions
    const problem119 = {
      problem_id: 119,
      session_id: 21, // Level 2, Session 10
      title: 'Input and Output Functions',
      description: 'Master input() and print() to communicate with users and display formatted output.',
      difficulty: 'Easy',
      question: `Take two strings as input: a name and a role. Print the message: "Commander <name>, you are now assigned as the <role>."`,      sample_input: 'Alex\nNavigation Officer',
      sample_output: 'Commander Alex, you are now assigned as the Navigation Officer.',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['built-in functions', 'input()', 'print()', 'user input', 'output formatting', 'string formatting'],
        estimated_time_minutes: 10
      },
      // Session-level content
      session_title: 'Session 10: Built-in Functions Mastery',

      // Case-specific content
      case_number: 5,
      case_title: 'Input and Output Functions',
      case_overview: `Master input() and print() - essential functions for user interaction and displaying results.`,
      case_code: `# Input and Multiple Outputs
planet = input()
distance = input()
status = input()

print(f'Destination: {planet}')
print(f'Distance: {distance} km')
print(f'Status: {status}')`,
      case_explanation: `input() receives user data and print() displays output, often combined with f-strings for formatted messages.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 119 if it exists
    await problemsCollection.deleteOne({ problem_id: 119 });
    await testCasesCollection.deleteMany({ problem_id: 119 });

    // Insert problem 119
    const problemResult = await problemsCollection.insertOne(problem119);
    console.log('Problem 119 inserted');

    // Test cases for Problem 119 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1191,
        problem_id: 119,
        input: 'Alex\nNavigation Officer',
        expected_output: 'Commander Alex, you are now assigned as the Navigation Officer.',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1192,
        problem_id: 119,
        input: 'Sam\nEngineer',
        expected_output: 'Commander Sam, you are now assigned as the Engineer.',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1193,
        problem_id: 119,
        input: 'Jordan\nPilot',
        expected_output: 'Commander Jordan, you are now assigned as the Pilot.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1194,
        problem_id: 119,
        input: 'Casey\nScience Officer',
        expected_output: 'Commander Casey, you are now assigned as the Science Officer.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1195,
        problem_id: 119,
        input: 'Taylor\nCommunications Specialist',
        expected_output: 'Commander Taylor, you are now assigned as the Communications Specialist.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1196,
        problem_id: 119,
        input: 'Morgan\nMedical Officer',
        expected_output: 'Commander Morgan, you are now assigned as the Medical Officer.',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1197,
        problem_id: 119,
        input: 'Riley\nFlight Director',
        expected_output: 'Commander Riley, you are now assigned as the Flight Director.',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 119`);

    console.log('\n✅ Problem 119 (Level 2, Session 10, Case 5: Input and Output Functions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem119()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
