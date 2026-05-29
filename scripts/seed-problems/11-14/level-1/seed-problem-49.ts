import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem49() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 49: Session 10, Case 4 - Range with Conditional Logic
    const problem49 = {
      problem_id: 49,
      session_id: 10,
      title: 'Range with Conditional Logic',
      description: 'Combine range() with if statements to add decision-making logic inside loops.',
      difficulty: 'Hard',
      question: `Use input() to get a start level (convert to integer).
Use input() to get a stop level (convert to integer).
Use input() to get a step value (convert to integer).
Use input() to get a threshold level (convert to integer).
Use a for loop with range(start, stop, step) to iterate through levels.
Inside the loop, print "Battery Level: " followed by the current battery level.
Then check if battery level is less than the threshold.
If true, print "Warning: Low Battery!".`,
      example_code: '# Write your code here\n',
      sample_input: '100\n49\n-10\n70',
      sample_output: 'Battery Level: 100\nBattery Level: 90\nBattery Level: 80\nBattery Level: 70\nBattery Level: 60\nWarning: Low Battery!\nBattery Level: 50\nWarning: Low Battery!',
      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect user data
- Convert string input to integers using int()
- Combine for loops with if statements
- Use range() with three parameters (start, stop, step)
- Make decisions based on loop variable values
- Print different outputs based on conditions
- Understand nested indentation for if statements inside loops`,

      concepts: `- For Loops with Conditionals: Combining iteration with decision-making
- range() Function: Creating sequences with custom parameters
- Nested Control Structures: Placing if statements inside for loops
- Conditional Execution: Code that runs only when conditions are met
- Indentation Levels: Understanding multiple levels of indentation
- Loop Variable Testing: Using loop counter in conditional checks
- Dynamic Output: Printing different messages based on conditions`,

      metadata: {
        concepts: ['range', 'for-loop', 'loops', 'conditionals', 'if-statements', 'step', 'nested-control'],
        space_theme: true,
        estimated_time_minutes: 15
      },
      // Case-specific content
      case_number: 4,
      case_title: 'Range with Conditional Logic',
      case_overview: `Combine range() with if statements to add decision-making logic inside loops.`,

      case_code: `# Get start, stop, step, and threshold from user
start = int(input())
stop = int(input())
step = int(input())
threshold = int(input())

# Loop through battery levels
for battery in range(start, stop, step):
    print("Battery Level:", battery)
    if battery < threshold:
        print("Warning: Low Battery!")`,

      case_explanation: `- Combine for loops using \`range()\` with if statements
- Each iteration can make decisions based on current value
- Indentation is critical: if statement inside loop needs 8 spaces
- Print statements inside if need 12 spaces (nested twice)
- Use \`input()\` four times for start, stop, step, threshold
- Convert all to integers
- Use \`for battery in range(start, stop, step):\` to iterate
- First print (indented 4 spaces): \`print("Battery Level:", battery)\`
- Check condition (indented 4 spaces): \`if battery < threshold:\`
- Conditional print (indented 8 spaces): \`print("Warning: Low Battery!")\`
- Warning only prints when condition is true`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 49
    const testCases49 = [
      {
        problem_id: 49,
        test_case_id: 1,
        input: '100\n49\n-10\n70',
        expected_output: 'Battery Level: 100\nBattery Level: 90\nBattery Level: 80\nBattery Level: 70\nBattery Level: 60\nWarning: Low Battery!\nBattery Level: 50\nWarning: Low Battery!',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 49,
        test_case_id: 2,
        input: '50\n9\n-5\n30',
        expected_output: 'Battery Level: 50\nBattery Level: 45\nBattery Level: 40\nBattery Level: 35\nBattery Level: 30\nBattery Level: 25\nWarning: Low Battery!\nBattery Level: 20\nWarning: Low Battery!\nBattery Level: 15\nWarning: Low Battery!\nBattery Level: 10\nWarning: Low Battery!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 49,
        test_case_id: 3,
        input: '80\n39\n-8\n50',
        expected_output: 'Battery Level: 80\nBattery Level: 72\nBattery Level: 64\nBattery Level: 56\nBattery Level: 48\nWarning: Low Battery!\nBattery Level: 40\nWarning: Low Battery!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 49,
        test_case_id: 4,
        input: '90\n59\n-15\n75',
        expected_output: 'Battery Level: 90\nBattery Level: 75\nBattery Level: 60\nWarning: Low Battery!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 49
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 49 },
      { $set: problem49 },
      { upsert: true }
    );

    console.log('Problem 49 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 49
    await testCasesCollection.deleteMany({ problem_id: 49 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases49);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 49 (Session 10, Case 4: Range with Conditional Logic) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem49()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
