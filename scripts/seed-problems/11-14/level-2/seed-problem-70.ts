import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem70() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 70: Level 2, Session 2, Case 4 - While Loop with Counters and Conditions
    const problem70 = {
      problem_id: 70,
      session_id: 13, // Level 2, Session 2
      title: 'While Loop with Counters and Conditions',
      description: 'Combine counters and conditions in a while loop to limit the number of attempts.',
      difficulty: 'Easy',
      question: `Create a power-up collector program. Take two inputs: maximum power level and increment value. Start from 0 and display "Power: 0". Keep adding the increment and displaying each new power level. Continue while the current power is less than or equal to the maximum. After the loop ends, print "Full power!".`,      sample_input: '12\n3',
      sample_output: 'Power: 0\nPower: 3\nPower: 6\nPower: 9\nPower: 12\nFull power!',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 120,

      metadata: {
        space_theme: true,
        concepts: ['while loops', 'counters', 'multiple conditions', 'logical operators'],
        estimated_time_minutes: 15
      },
      // Session-level content
      session_title: 'Session 2: Basic While Loop',

      // Case-specific content
      case_number: 4,
      case_title: 'While Loop with Counters and Conditions',
      case_overview: `Combine counters with multiple conditions to create more sophisticated loops. Perfect for limited-attempt scenarios like password validation or game lives.`,
      case_explanation: `Initialize power at 0, use while loop with condition (current_power <= max_power), print inside the loop, then increment. After loop ends, print the completion message.`,
      case_code: `# Search for target in sequence
target = int(input())
current = 1

while current * current < target:
    print(f"Checking: {current}")
    current += 1

print(f"Found: {current}")

# Searches for specific condition, not accumulation
# Uses mathematical comparison`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 70 if it exists
    await problemsCollection.deleteOne({ problem_id: 70 });
    await testCasesCollection.deleteMany({ problem_id: 70 });

    // Insert problem 70
    const problemResult = await problemsCollection.insertOne(problem70);
    console.log('Problem 70 inserted');

    // Test cases for Problem 70
    const testCases = [
      // Visible test cases
      {
        test_case_id: 701,
        problem_id: 70,
        input: '12\n3',
        expected_output: 'Power: 0\nPower: 3\nPower: 6\nPower: 9\nPower: 12\nFull power!',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 702,
        problem_id: 70,
        input: '5\n5',
        expected_output: 'Power: 0\nPower: 5\nFull power!',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 703,
        problem_id: 70,
        input: '20\n4',
        expected_output: 'Power: 0\nPower: 4\nPower: 8\nPower: 12\nPower: 16\nPower: 20\nFull power!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 704,
        problem_id: 70,
        input: '15\n7',
        expected_output: 'Power: 0\nPower: 7\nPower: 14\nFull power!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 705,
        problem_id: 70,
        input: '8\n2',
        expected_output: 'Power: 0\nPower: 2\nPower: 4\nPower: 6\nPower: 8\nFull power!',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 706,
        problem_id: 70,
        input: '25\n10',
        expected_output: 'Power: 0\nPower: 10\nPower: 20\nFull power!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 707,
        problem_id: 70,
        input: '12\n5',
        expected_output: 'Power: 0\nPower: 5\nPower: 10\nFull power!',
        is_hidden: true,
        weight: 15
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 70`);

    console.log('\n✅ Problem 70 (Level 2, Session 2, Case 4: While Loop with Counters and Conditions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem70()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
