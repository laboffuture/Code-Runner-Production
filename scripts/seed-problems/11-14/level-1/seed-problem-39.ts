import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem39() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 39: Session 8, Case 4 - List Slicing
    const problem39 = {
      problem_id: 39,
      session_id: 8,
      title: 'List Slicing',
      description: 'Use slicing to access parts of a list.',
      difficulty: 'Medium',
      question: `Use input() seven times to get seven numbers (convert to integers).
Create a list called numbers with these seven values.
Print the sliced result using [2:5] (elements from index 2 to 4).`,
      example_code: '# Write your code here\n',
      sample_input: '10\n20\n30\n40\n50\n60\n70',
      sample_output: '[30, 40, 50]',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['lists', 'slicing', 'indexing', 'advanced-operations', 'data-structures'],
        space_theme: true,
        estimated_time_minutes: 12,
        test_protocol: 'Students should use slicing syntax to extract sublists'
      },
      // Case-specific content
      case_number: 4,
      case_title: 'List Slicing',
      case_overview: `Use slicing to access parts of a list.`,
      case_code: `# Sample Example:
letters = ["a", "b", "c", "d", "e"]
print(letters[1:4])  # Output: ['b', 'c', 'd']

# Now you try this for our task`,
      case_explanation: `list[start:end] returns a sublist from start to end-1. The start index is included, the end index is excluded. numbers[2:5] will return items at indices 2, 3, 4. The original list is not modified by slicing. Slicing creates a new list.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 39
    const testCases39 = [
      {
        problem_id: 39,
        test_case_id: 1,
        input: '10\n20\n30\n40\n50\n60\n70',
        expected_output: '[30, 40, 50]',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 39,
        test_case_id: 2,
        input: '5\n10\n15\n20\n25\n30\n35',
        expected_output: '[15, 20, 25]',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 39,
        test_case_id: 3,
        input: '100\n200\n300\n400\n500\n600\n700',
        expected_output: '[300, 400, 500]',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 39
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 39 },
      { $set: problem39 },
      { upsert: true }
    );

    console.log('Problem 39 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 39
    await testCasesCollection.deleteMany({ problem_id: 39 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases39);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 39 (Session 8, Case 4: List Slicing) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem39()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
