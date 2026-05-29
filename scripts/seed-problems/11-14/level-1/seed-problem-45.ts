import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem45() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 45: Session 9, Case 5 - For Loop with Strings (Final Task)
    const problem45 = {
      problem_id: 45,
      session_id: 9,
      title: 'For Loop with Strings',
      description: 'You can loop through each character of a string.',
      difficulty: 'Medium',
      question: `Use input() to get a word (string).
Use a for loop to iterate through each character in the word.
Inside the loop, print each character on a separate line.`,
      example_code: '# Write your code here\n',
      sample_input: 'Apollo',
      sample_output: 'A\np\no\nl\nl\no',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['loops', 'for-loop', 'strings', 'iteration', 'final-task', 'string-iteration'],
        space_theme: true,
        estimated_time_minutes: 12,
        test_protocol: 'Students should use for loop to iterate through string characters'
      },
      // Case-specific content
      case_number: 5,
      case_title: 'For Loop with Strings',
      case_overview: `You can loop through each character of a string.`,
      case_code: `# Sample Example:
word = "Mars"
for letter in word:
    print(letter)

# Now you try this for our task`,
      case_explanation: `Strings are sequences of characters. You can iterate through them like lists. Each iteration gives you one character. Loop goes left to right through the string.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 45
    const testCases45 = [
      {
        problem_id: 45,
        test_case_id: 1,
        input: 'Apollo',
        expected_output: 'A\np\no\nl\nl\no',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 45,
        test_case_id: 2,
        input: 'Mars',
        expected_output: 'M\na\nr\ns',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 45,
        test_case_id: 3,
        input: 'Jupiter',
        expected_output: 'J\nu\np\ni\nt\ne\nr',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 45
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 45 },
      { $set: problem45 },
      { upsert: true }
    );

    console.log('Problem 45 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 45
    await testCasesCollection.deleteMany({ problem_id: 45 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases45);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 45 (Session 9, Case 5: For Loop with Strings) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem45()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
