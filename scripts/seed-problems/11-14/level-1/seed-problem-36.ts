import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem36() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 36: Session 8, Case 1 - Inserting Items at Specific Position
    const problem36 = {
      problem_id: 36,
      session_id: 8,
      title: 'Inserting Items at Specific Position',
      description: 'Use .insert() to add an item at a specific index in the list.',
      difficulty: 'Medium',
      question: `Use input() three times to get three supply names.
Create a list called supplies with these three items.
Use input() to get a position/index (convert to integer).
Use input() to get a new supply name to insert.
Use .insert() to add the new supply at the given position.
Print the supplies list.`,
      example_code: '# Write your code here\n',
      sample_input: 'oxygen\nwater\nfood\n1\nfuel',
      sample_output: "['oxygen', 'fuel', 'water', 'food']",
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['lists', 'insert', 'list-methods', 'indexing', 'data-structures'],
        space_theme: true,
        estimated_time_minutes: 12,
        test_protocol: 'Students should use .insert() method to add items at specific positions'
      },
      // Case-specific content
      case_number: 1,
      case_title: 'Inserting Items at Specific Position',
      case_overview: `Use .insert() to add an item at a specific index in the list.`,
      case_code: `# Sample Example:
colors = ["red", "green", "blue"]
colors.insert(1, "yellow")
print(colors)  # Output: ["red", "yellow", "green", "blue"]

# Now you try this for our task`,
      case_explanation: `.insert(index, item) adds item at the specified index. Items after that position shift to the right. The method modifies the original list. Index 0 inserts at the beginning, index 1 inserts after first item.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 36
    const testCases36 = [
      {
        problem_id: 36,
        test_case_id: 1,
        input: 'oxygen\nwater\nfood\n1\nfuel',
        expected_output: "['oxygen', 'fuel', 'water', 'food']",
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 36,
        test_case_id: 2,
        input: 'apple\nbanana\ncherry\n0\ngrape',
        expected_output: "['grape', 'apple', 'banana', 'cherry']",
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 36,
        test_case_id: 3,
        input: 'red\ngreen\nblue\n2\nyellow',
        expected_output: "['red', 'green', 'yellow', 'blue']",
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 36
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 36 },
      { $set: problem36 },
      { upsert: true }
    );

    console.log('Problem 36 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 36
    await testCasesCollection.deleteMany({ problem_id: 36 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases36);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 36 (Session 8, Case 1: Inserting Items at a Specific Position) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem36()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
