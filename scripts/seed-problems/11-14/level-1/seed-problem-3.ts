import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem3() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 3: Case 3 - Output with Calculations
    const problem3 = {
      problem_id: 3,
      session_id: 1,
      title: 'Output with Calculations',
      description: 'Learn to perform calculations and display results using the print() function.',
      question: `Print the text "Escape velocity is" followed by the calculation 11.2 * 1000 and then "m/s"`,
      difficulty: 'Intro',
      example_code: '# Write your code here\n',
      sample_input: '',
      sample_output: 'Escape velocity is 11200.0 m/s',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['print() function', 'mathematical operations', 'calculations in print'],
        space_theme: true,
        estimated_time_minutes: 5
      },
      // Case-specific content
      case_number: 3,
      case_title: 'Output with Calculations',
      case_overview: `Learn to let Python perform calculations automatically inside print statements. This makes your programs more dynamic and powerful!`,
      case_code: `# Python calculates before printing:
print("Distance:", 100 * 2.5, "km")

# The above prints: Distance: 250.0 km
`,
      case_explanation: `Calculations in Print:

● Python can perform math operations directly inside print()
● Use * for multiplication, + for addition, - for subtraction, / for division
● Python calculates the result first, then prints it
● Mix calculations with text using commas

Input Format:
You do not need to read any input for this challenge.

Output Format:
Print the exact message with the calculated result as shown in the question.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 3 - Simple for intro level
    const testCases3 = [
      {
        problem_id: 3,
        test_case_id: 1,
        input: '',
        expected_output: 'Escape velocity is 11200.0 m/s',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 3
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 3 },
      { $set: problem3 },
      { upsert: true }
    );

    console.log('Problem 3 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 3
    await testCasesCollection.deleteMany({ problem_id: 3 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases3);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 3 (Case 3: Output with Calculations) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}           

// Run the seed function
seedProblem3()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
