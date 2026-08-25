import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem6() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 6: Session 2, Case 1 - Creating and Assigning Variables
    const problem6 = {
      problem_id: 6,
      session_id: 2,
      title: 'Creating and Assigning Variables',
      description: 'Learn how to create variables and assign different types of values to them in Python.',
      question: `Create two variables:
- planet_name = "Mars"
- temperature = -63
Print both variables, each on a new line.`,
      difficulty: 'Intro',
      example_code: '# Write your code here\n',
      sample_input: '',
      sample_output: 'Mars\n-63',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['variables', 'assignment', 'data types', 'strings', 'integers'],
        space_theme: true,
        estimated_time_minutes: 8
      },
      // Case-specific content
      case_number: 1,
      case_title: 'Creating and Assigning Variables',
      case_overview: `Learn to create variables and store different types of values. Variables are the foundation of programming!`,
      case_code: `# Examples of creating variables:
rocket_name = "Apollo"    
launch_year = 1969                 

# Print variables:
print(rocket_name)
print(launch_year)

# This prints:
# Apollo
# 1969`,
      case_explanation: `● Use the = sign to assign a value: variable_name = value
● Text (strings) need quotes: "Mars"
● Numbers don't need quotes: -63 or 85.5
● Variable names should be descriptive (use lowercase with underscores)
● Python automatically detects the data type`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 6 - Simple for intro level
    const testCases6 = [
      {
        problem_id: 6,
        test_case_id: 1,
        input: '',
        expected_output: 'Mars\n-63',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 6
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 6 },
      { $set: problem6 },
      { upsert: true }
    );

    console.log('Problem 6 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 6
    await testCasesCollection.deleteMany({ problem_id: 6 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases6);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 6 (Session 2, Case 1: Creating and Assigning Variables) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem6()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
