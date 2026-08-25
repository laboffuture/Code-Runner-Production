import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem9() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 9: Session 2, Case 4 - Changing Values and Types
    const problem9 = {
      problem_id: 9,
      session_id: 2,
      title: 'Changing Values and Types',
      description: 'Learn how variables can change their values and even their data types during program execution.',
      question: `Create a variable called sample and assign it the string "rock"
Print the sample variable
Then reassign sample to the number 42
Print the sample variable again`,
      difficulty: 'Intro',
      example_code: '# Write your code here\n',
      sample_input: '',
      sample_output: 'rock\n42',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['variable reassignment', 'dynamic typing', 'mutable variables', 'type flexibility'],
        space_theme: true,
        estimated_time_minutes: 8
      },
      // Case-specific content
      case_number: 4,
      case_title: 'Changing Values and Types',
      case_overview: `Variables can change value during the program. Python also lets you reassign a variable to a different type — but be careful with this flexibility!`,
      case_code: `# Variables can be reassigned to new values
# Example : Changing values (same type)
countdown = 10
print(countdown)`,
      case_explanation: `● Use the same syntax as creating a variable: variable_name = new_value
● The old value is replaced with the new value
● Python allows changing data types (dynamic typing)
● This is powerful but requires careful tracking`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 9
    const testCases9 = [
      {
        problem_id: 9,
        test_case_id: 1,
        input: '',
        expected_output: 'rock\n42',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 9
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 9 },
      { $set: problem9 },
      { upsert: true }
    );

    console.log('Problem 9 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 9
    await testCasesCollection.deleteMany({ problem_id: 9 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases9);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 9 (Session 2, Case 4: Changing Values and Types) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem9()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
