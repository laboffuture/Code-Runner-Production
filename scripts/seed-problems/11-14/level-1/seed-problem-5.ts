import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem5() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 5: Case 5 - Fancy Output using f-strings
    const problem5 = {
      problem_id: 5,
      session_id: 1,
      title: 'Fancy Output using f-strings',
      description: 'Learn to use f-strings to create neat and readable output with variables.',
      question: `Create two variables:
- planet = "Jupiter"
- moons = 79
Then use an f-string to print: Jupiter has 79 known moons.`,
      difficulty: 'Intro',
      example_code: '# Write your code here\n',
      sample_input: '',
      sample_output: 'Jupiter has 79 known moons.',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['f-strings', 'string formatting', 'variables', 'print() function'],
        space_theme: true,
        estimated_time_minutes: 7
      },
      // Case-specific content
      case_number: 5,
      case_title: 'Fancy Output using f-strings',
      case_overview: `Learn to use f-strings for professional, clean output formatting. This is the modern Python way!`,
      case_code: `# F-string format: print(f"text {variable} more text")
# Put 'f' before the quotes and use {} for variables

city = "Paris"
print(f"Welcome to {city}!")`,
      case_explanation: `● F-strings are the modern way to format text with variables
● Syntax: print(f"text {variable} text")
● Put 'f' before the opening quote
● Insert variables inside curly braces {}
● Much cleaner than using commas!`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 5 - Simple for intro level
    const testCases5 = [
      {
        problem_id: 5,
        test_case_id: 1,
        input: '',
        expected_output: 'Jupiter has 79 known moons.',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 5
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 5 },
      { $set: problem5 },
      { upsert: true }
    );

    console.log('Problem 5 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 5
    await testCasesCollection.deleteMany({ problem_id: 5 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases5);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 5 (Case 5: Fancy Output using f-strings) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem5()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
