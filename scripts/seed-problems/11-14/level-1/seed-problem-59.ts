import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem59() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 59: Session 9 Final Task - Satellite Launch Countdown
    const problem59 = {
      problem_id: 59,
      session_id: 9,
      title: 'Satellite Launch Countdown',
      description: `NOVA-12's engines ignite and the ship lifts off from its dormant position. In low orbit, minor attitude and thrust corrections are required while systems settle after years of sleep. The ship's stabilization module needs a precise countdown sequence to coordinate the orbital maneuver systems.

Astra: "Commander, we're approaching launch sequence. The orbital stabilization requires a precise countdown protocol—each second is critical for the engines to fire in perfect synchronization. We need a for loop to iterate through the countdown and ensure all systems engage at the right moment."

Your mission is to demonstrate the countdown sequence for NOVA-12's orbital launch.`,

      question: `Commander, initiate the Satellite Launch Countdown!
Your program should execute the orbital launch sequence:
- Create a countdown from 10 to 1 using a for loop with range()
- Print "T-minus [seconds] seconds" for each countdown number
- After the countdown completes, print "Launch initiated!"
The countdown loop must iterate in reverse order to properly synchronize the engine firing sequence.`,

      difficulty: 'Medium',
      example_code: `# Satellite Launch Countdown
# Your code here
`,
      sample_input: '',
      sample_output: `T-minus 10 seconds
T-minus 9 seconds
T-minus 8 seconds
T-minus 7 seconds
T-minus 6 seconds
T-minus 5 seconds
T-minus 4 seconds
T-minus 3 seconds
T-minus 2 seconds
T-minus 1 seconds
Launch initiated!`,
      age_group: '11-14',
      level_number: 1,

      objectives: `- Use a for loop to iterate through a sequence
- Use range() with three parameters (start, stop, step)
- Understand reverse iteration with negative step values
- Print formatted countdown messages using string concatenation
- Execute code after loop completion
- Display countdown sequence in descending order`,

      concepts: `- For Loops: Iterating through sequences with for loop syntax
- range() Function: Creating number sequences with start, stop, and step parameters
- Reverse Iteration: Using negative step (-1) to count backwards
- Loop Variables: Using loop counter in print statements
- String Formatting: Creating dynamic messages with variables
- Sequential Execution: Understanding that code after loop runs when loop completes`,

      metadata: {
        concepts: ['for loops', 'range', 'countdown', 'iteration', 'reverse order'],
        space_theme: true,
        story_linked: true,
        estimated_time_minutes: 25,
        is_final_task: true
      },

      // Case-specific content (Final Task)
      case_number: 6,
      case_title: 'Satellite Launch Countdown - Orbital Maneuver System',
      // case_overview removed for final tasks (Case 6)

      case_code: `# Create countdown from 10 to 1
for seconds in range(10, 0, -1):
    print(f"T-minus {seconds} seconds")

# Print launch message after countdown
print("Launch initiated!")`,

      case_explanation: `- Use \`for\` loop with \`range(10, 0, -1)\` to count down from 10 to 1
- \`range(10, 0, -1)\` means: start at 10, stop before 0, step by -1 (counting backwards)
- Inside the loop, print "T-minus [seconds] seconds" for each iteration
- After the loop completes, print "Launch initiated!" to confirm sequence completion`,

      created_at: new Date(),
      updated_at: new Date()
    };

    await problemsCollection.deleteOne({ problem_id: 59 });
    await problemsCollection.insertOne(problem59);
    console.log('Problem 59 (Session 9 Final Task) inserted');

    // Test cases for Problem 59
    const testCases59 = [
      {
        test_case_id: 'tc_59_1',
        problem_id: 59,
        input: '',
        expected_output: `T-minus 10 seconds
T-minus 9 seconds
T-minus 8 seconds
T-minus 7 seconds
T-minus 6 seconds
T-minus 5 seconds
T-minus 4 seconds
T-minus 3 seconds
T-minus 2 seconds
T-minus 1 seconds
Launch initiated!`,
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        test_case_id: 'tc_59_2',
        problem_id: 59,
        input: '',
        expected_output: `T-minus 10 seconds
T-minus 9 seconds
T-minus 8 seconds
T-minus 7 seconds
T-minus 6 seconds
T-minus 5 seconds
T-minus 4 seconds
T-minus 3 seconds
T-minus 2 seconds
T-minus 1 seconds
Launch initiated!`,
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    await testCasesCollection.deleteMany({ problem_id: 59 });
    await testCasesCollection.insertMany(testCases59);
    console.log(`${testCases59.length} test cases inserted for Problem 59`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.close();
  }
}

seedProblem59();
