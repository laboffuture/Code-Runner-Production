import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem68() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 68: Level 2, Session 2, Case 2 - Using While Loop with Input
    const problem68 = {
      problem_id: 68,
      session_id: 13, // Level 2, Session 2
      title: 'Using While Loop with Input',
      description: 'Create an interactive program that waits for a specific command using a while loop.',
      difficulty: 'Intro',
      question: `Create a security scanner program. Take multiple space readings as input (one per line) until the user enters "0". Display each reading as "Reading: [value]". When "0" is entered, print "Scan complete!" and stop.`,      sample_input: '125\n340\n0',
      sample_output: 'Reading: 125\nReading: 340\nScan complete!',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['while loops', 'user input', 'loop conditions', 'string comparison'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 2: Basic While Loop',

      // Case-specific content
      case_number: 2,
      case_title: 'Using While Loop with Input',
      case_overview: `Combine while loops with user input to create interactive programs that wait for specific responses. Perfect for menus, validation, and command-based systems.`,
      case_explanation: `Use a while loop to repeatedly get input and check if it matches your stop condition before continuing or breaking out.`,
      case_code: `# Password validator with limited attempts
attempts = 0
max_attempts = 3

while attempts < max_attempts:
    password = input()
    if password == "secure":
        print("Access granted!")
        break
    attempts += 1
    print(f"Wrong! {max_attempts - attempts} tries left")
else:
    print("Locked out!")

# Uses counter with max limit, not sentinel value`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 68 if it exists
    await problemsCollection.deleteOne({ problem_id: 68 });
    await testCasesCollection.deleteMany({ problem_id: 68 });

    // Insert problem 68
    const problemResult = await problemsCollection.insertOne(problem68);
    console.log('Problem 68 inserted');

    // Test cases for Problem 68
    const testCases = [
      // Visible test cases
      {
        test_case_id: 681,
        problem_id: 68,
        input: '125\n340\n0',
        expected_output: 'Reading: 125\nReading: 340\nScan complete!',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 682,
        problem_id: 68,
        input: '50\n0',
        expected_output: 'Reading: 50\nScan complete!',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 683,
        problem_id: 68,
        input: '100\n200\n300\n0',
        expected_output: 'Reading: 100\nReading: 200\nReading: 300\nScan complete!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 684,
        problem_id: 68,
        input: '999\n555\n222\n111\n0',
        expected_output: 'Reading: 999\nReading: 555\nReading: 222\nReading: 111\nScan complete!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 685,
        problem_id: 68,
        input: '0',
        expected_output: 'Scan complete!',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 686,
        problem_id: 68,
        input: '75\n150\n0',
        expected_output: 'Reading: 75\nReading: 150\nScan complete!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 687,
        problem_id: 68,
        input: '10\n20\n30\n40\n50\n0',
        expected_output: 'Reading: 10\nReading: 20\nReading: 30\nReading: 40\nReading: 50\nScan complete!',
        is_hidden: true,
        weight: 15
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 68`);

    console.log('\n✅ Problem 68 (Level 2, Session 2, Case 2: Using While Loop with Input) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem68()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
