import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem71() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 71: Level 2, Session 2, Case 5 - While Loop with Else Block
    const problem71 = {
      problem_id: 71,
      session_id: 13, // Level 2, Session 2
      title: 'While Loop with Else Block',
      description: 'Learn to use the else clause with while loops for cleanup code that runs when the loop completes normally.',
      difficulty: 'Easy',
      question: `Create a rocket stage separation tracker. Take an integer input for the number of stages. Count up from 1 to that number, displaying "Stage [number] active". After the loop completes normally, print "Mission complete!".`,      sample_input: '5',
      sample_output: 'Stage 1 active\nStage 2 active\nStage 3 active\nStage 4 active\nStage 5 active\nMission complete!',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 120,

      metadata: {
        space_theme: true,
        concepts: ['while loops', 'else clause', 'countdown', 'loop completion'],
        estimated_time_minutes: 15
      },
      // Session-level content
      session_title: 'Session 2: Basic While Loop',

      // Case-specific content
      case_number: 5,
      case_title: 'While Loop with Else Block',
      case_overview: `Discover the while-else pattern: the else block runs when the loop completes normally (not via break). Perfect for countdown sequences and completion messages.`,
      case_explanation: `Initialize a counter, use a while loop with a condition, and add an else block at the same indentation as while that runs when the loop finishes.`,
      case_code: `# Input validator with else clause
numbers = []
valid = True

while len(numbers) < 3:
    num = int(input())
    if num < 0:
        print("Invalid input!")
        valid = False
        break
    numbers.append(num)
else:
    print(f"All valid! Sum: {sum(numbers)}")

# else only runs if break NOT used
# Different from always-completing countdown`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 71 if it exists
    await problemsCollection.deleteOne({ problem_id: 71 });
    await testCasesCollection.deleteMany({ problem_id: 71 });

    // Insert problem 71
    const problemResult = await problemsCollection.insertOne(problem71);
    console.log('Problem 71 inserted');

    // Test cases for Problem 71 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 711,
        problem_id: 71,
        input: '5',
        expected_output: 'Stage 1 active\nStage 2 active\nStage 3 active\nStage 4 active\nStage 5 active\nMission complete!',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 712,
        problem_id: 71,
        input: '3',
        expected_output: 'Stage 1 active\nStage 2 active\nStage 3 active\nMission complete!',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 713,
        problem_id: 71,
        input: '10',
        expected_output: 'Stage 1 active\nStage 2 active\nStage 3 active\nStage 4 active\nStage 5 active\nStage 6 active\nStage 7 active\nStage 8 active\nStage 9 active\nStage 10 active\nMission complete!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 714,
        problem_id: 71,
        input: '1',
        expected_output: 'Stage 1 active\nMission complete!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 715,
        problem_id: 71,
        input: '7',
        expected_output: 'Stage 1 active\nStage 2 active\nStage 3 active\nStage 4 active\nStage 5 active\nStage 6 active\nStage 7 active\nMission complete!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 716,
        problem_id: 71,
        input: '0',
        expected_output: 'Mission complete!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 717,
        problem_id: 71,
        input: '8',
        expected_output: 'Stage 1 active\nStage 2 active\nStage 3 active\nStage 4 active\nStage 5 active\nStage 6 active\nStage 7 active\nStage 8 active\nMission complete!',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 71`);

    console.log('\n✅ Problem 71 (Level 2, Session 2, Case 5: While Loop with Else Block) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem71()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
