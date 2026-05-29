import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem51() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 51: Session 1, Final Task - Space Log Report Generator
    const problem51 = {
      problem_id: 51,
      session_id: 1,
      title: 'Space Log Report Generator',
      description: `The sealed doors open, revealing NOVA-12—dormant for decades. The ship's panels flicker to life.

Astra: "NOVA-12 needs to recognize you as authorized cadets. Generate your mission log to establish your identity in the ship's database."

Create the Mission Control boot screen that confirms your terminal is linked.`,

      question: `Write a Python program that generates a Space Log Report for a cadet's mission:
Your program should:
1. Ask the user for their name using \`input()\`
2. Display a welcome message: \`"Welcome, Cadet [Name]! Preparing your mission log..."\`
3. Calculate the total hours of a 15-day mission (15 days × 24 hours = 360 hours)
4. Print the final line: \`"Mission Duration: 360 hours. Good luck, [Name]!"\``,

      difficulty: 'Intro',
      example_code: `# Space Log Report Generator
# Your code here
`,

      sample_input: 'Leo',
      sample_output: `Welcome, Cadet Leo! Preparing your mission log...
Mission Duration: 360 hours. Good luck, Leo!`,

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use \`input()\` to get the cadet's name
- Use \`print()\` to display formatted messages
- Perform basic arithmetic calculation (15 × 24)
- Substitute variables into strings for personalized output`,

      concepts: `- Input/Output: Reading user input and displaying messages
- Variables: Storing the cadet's name
- String Formatting: Creating personalized messages
- Basic Arithmetic: Calculating mission duration`,

      metadata: {
        concepts: ['input', 'print', 'variables', 'string concatenation', 'arithmetic'],
        space_theme: true,
        story_linked: true,
        estimated_time_minutes: 15,
        is_final_task: true
      },

      // Case-specific content (Final Task)
      case_number: 6,
      case_title: 'Space Log Report Generator - Final Mission Task',
      // case_overview removed for final tasks (Case 6)
      case_code: `# Get user input
name = input()

# Calculate mission duration
duration = 15 * 24

# Display welcome message
print(f"Welcome, Cadet {name}! Preparing your mission log...")

# Display mission duration
print(f"Mission Duration: {duration} hours. Good luck, {name}!")`,
      case_explanation: `Use \`input()\` to get the cadet's name, print a welcome message with their name, calculate mission duration (15 days × 24 hours = 360 hours), and display the final message with the duration and name.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Upsert problem 51
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 51 },
      { $set: problem51 },
      { upsert: true }
    );

    console.log('Problem 51 upserted:', problemResult.upsertedId || 'Updated existing');

    // Test cases for Problem 51
    const testCases51 = [
      // Visible test case
      {
        problem_id: 51,
        test_case_id: 1,
        input: 'Leo',
        expected_output: 'Welcome, Cadet Leo! Preparing your mission log...\nMission Duration: 360 hours. Good luck, Leo!',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test cases
      {
        problem_id: 51,
        test_case_id: 2,
        input: 'Nila',
        expected_output: 'Welcome, Cadet Nila! Preparing your mission log...\nMission Duration: 360 hours. Good luck, Nila!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 51,
        test_case_id: 3,
        input: 'Kenji',
        expected_output: 'Welcome, Cadet Kenji! Preparing your mission log...\nMission Duration: 360 hours. Good luck, Kenji!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 51,
        test_case_id: 4,
        input: 'Astra',
        expected_output: 'Welcome, Cadet Astra! Preparing your mission log...\nMission Duration: 360 hours. Good luck, Astra!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 51,
        test_case_id: 5,
        input: 'Commander Nova',
        expected_output: 'Welcome, Cadet Commander Nova! Preparing your mission log...\nMission Duration: 360 hours. Good luck, Commander Nova!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Delete existing test cases for problem 51
    await testCasesCollection.deleteMany({ problem_id: 51 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases51);
    console.log(`${testCasesResult.insertedCount} test cases inserted for Problem 51`);

    console.log('\n✅ Problem 51 (Session 1, Final Task: Space Log Report Generator) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem51()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
