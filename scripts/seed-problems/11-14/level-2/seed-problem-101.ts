import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem101() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 101: Level 2, Session 7, Case 5 - Functions Without Return Statements
    const problem101 = {
      problem_id: 101,
      session_id: 18, // Level 2, Session 7
      title: 'Functions Without Return Statements',
      description: 'Learn that functions can perform actions without returning values.',
      difficulty: 'Intro',
      question: `Take a message as input. Define a function display_message(msg) that prints the message. Call the function with the input message.`,      sample_input: 'Never give up, astronaut!',
      sample_output: 'Never give up, astronaut!',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 0,
      max_score: 80,

      metadata: {
        space_theme: true,
        concepts: ['functions', 'void functions', 'functions without return', 'print statements', 'function execution'],
        estimated_time_minutes: 8
      },
      // Session-level content
      session_title: 'Session 7: User-Defined Functions',

      // Case-specific content
      case_number: 5,
      case_title: 'Functions Without Return Statements',
      case_overview: `Understand that not all functions need to return values - some just perform actions like printing.`,
      case_code: `# Function That Modifies Data Without Returning
def update_inventory(items, new_item):
    items.append(new_item)
    items.sort()
    # No return - modifies the list directly

equipment = ['helmet', 'boots']
update_inventory(equipment, 'gloves')
print(equipment)  # Prints: ['boots', 'gloves', 'helmet']`,
      case_explanation: `Functions don't need return statements if they only perform actions like printing. Call them with () to execute their code.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 101 if it exists
    await problemsCollection.deleteOne({ problem_id: 101 });
    await testCasesCollection.deleteMany({ problem_id: 101 });

    // Insert problem 101
    const problemResult = await problemsCollection.insertOne(problem101);
    console.log('Problem 101 inserted');

    // Test cases for Problem 101 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1011,
        problem_id: 101,
        input: 'Never give up, astronaut!',
        expected_output: 'Never give up, astronaut!',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1012,
        problem_id: 101,
        input: 'Welcome aboard!',
        expected_output: 'Welcome aboard!',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1013,
        problem_id: 101,
        input: 'Mission accomplished!',
        expected_output: 'Mission accomplished!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1014,
        problem_id: 101,
        input: 'Houston, we have a problem',
        expected_output: 'Houston, we have a problem',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1015,
        problem_id: 101,
        input: 'Systems are operational',
        expected_output: 'Systems are operational',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1016,
        problem_id: 101,
        input: 'Ready for launch',
        expected_output: 'Ready for launch',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1017,
        problem_id: 101,
        input: 'All clear',
        expected_output: 'All clear',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 101`);

    console.log('\n✅ Problem 101 (Level 2, Session 7, Case 5: Functions Without Return Statements) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem101()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
