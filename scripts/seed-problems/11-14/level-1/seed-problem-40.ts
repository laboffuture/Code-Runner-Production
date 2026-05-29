import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem40() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 40: Session 8, Case 5 - List Comprehension & Aggregates
    const problem40 = {
      problem_id: 40,
      session_id: 8,
      title: 'List Comprehension & Aggregates',
      description: 'Create a new list using a single line expression. Use min(), max(), and sum() for numerical data.',
      difficulty: 'Medium',
      question: `Use input() to get a starting number (convert to integer).
Use input() to get an ending number (convert to integer).
Create a list called cubes using list comprehension: [x**3 for x in range(start, end + 1)].
This creates cubes of numbers from start to end (inclusive).
Print the cubes list.
Print "Min: " followed by the minimum value using min().
Print "Max: " followed by the maximum value using max().
Print "Sum: " followed by the sum of all values using sum().`,
      example_code: '# Write your code here\n',
      sample_input: '1\n4',
      sample_output: '[1, 8, 27, 64]\nMin: 1\nMax: 64\nSum: 100',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['lists', 'list-comprehension', 'aggregates', 'min-max-sum', 'final-task', 'range'],
        space_theme: true,
        estimated_time_minutes: 15,
        test_protocol: 'Students should use list comprehension with range() and aggregate functions'
      },
      // Case-specific content
      case_number: 5,
      case_title: 'List Comprehension & Aggregates',
      case_overview: `Create a new list using a single line expression. Use min(), max(), and sum() for numerical data.`,
      case_code: `# Sample Example:
squares = [x**2 for x in range(1, 6)]
print(squares)  # Output: [1, 4, 9, 16, 25]
print("Min:", min(squares))  # Output: Min: 1
print("Max:", max(squares))  # Output: Max: 25
print("Sum:", sum(squares))  # Output: Sum: 55

# Now you try this for our task`,
      case_explanation: `[expression for variable in range()] creates a list in one line. range(start, end + 1) generates numbers from start to end (inclusive). ** is the exponent operator (x**3 means x cubed). min(list) returns the smallest value. max(list) returns the largest value. sum(list) adds all values together.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 40
    const testCases40 = [
      {
        problem_id: 40,
        test_case_id: 1,
        input: '1\n4',
        expected_output: '[1, 8, 27, 64]\nMin: 1\nMax: 64\nSum: 100',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 40,
        test_case_id: 2,
        input: '2\n5',
        expected_output: '[8, 27, 64, 125]\nMin: 8\nMax: 125\nSum: 224',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 40,
        test_case_id: 3,
        input: '1\n3',
        expected_output: '[1, 8, 27]\nMin: 1\nMax: 27\nSum: 36',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 40,
        test_case_id: 4,
        input: '3\n6',
        expected_output: '[27, 64, 125, 216]\nMin: 27\nMax: 216\nSum: 432',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 40
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 40 },
      { $set: problem40 },
      { upsert: true }
    );

    console.log('Problem 40 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 40
    await testCasesCollection.deleteMany({ problem_id: 40 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases40);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 40 (Session 8, Case 5: List Comprehension & Aggregates) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem40()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
