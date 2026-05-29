import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem38() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 38: Session 8, Case 3 - Copying a List
    const problem38 = {
      problem_id: 38,
      session_id: 8,
      title: 'Copying a List',
      description: 'Use .copy() to create an independent copy of a list.',
      difficulty: 'Medium',
      question: `Use input() three times to get three coordinate values (convert to integers).
Create a list called original with these three numbers.
Use .copy() to create a copy of original and call it backup.
Use input() to get a new coordinate value (convert to integer).
Use .append() to add this new value to the original list only.
Print "Original: " followed by the original list.
Print "Backup: " followed by the backup list.`,
      example_code: '# Write your code here\n',
      sample_input: '10\n20\n30\n40',
      sample_output: 'Original: [10, 20, 30, 40]\nBackup: [10, 20, 30]',
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['lists', 'copy', 'list-methods', 'references', 'data-structures'],
        space_theme: true,
        estimated_time_minutes: 12,
        test_protocol: 'Students should use .copy() method to create independent copies of lists'
      },
      // Case-specific content
      case_number: 3,
      case_title: 'Copying a List',
      case_overview: `Use .copy() to create an independent copy of a list.`,
      case_code: `# Sample Example:
original = [1, 2, 3]
backup = original.copy()
original.append(4)
print("Original:", original)  # Output: Original: [1, 2, 3, 4]
print("Backup:", backup)  # Output: Backup: [1, 2, 3]

# Now you try this for our task`,
      case_explanation: `.copy() creates an independent copy of the list. Changes to the copy don't affect the original. Changes to the original don't affect the copy. Without .copy(), assignment creates a reference, not a copy.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 38
    const testCases38 = [
      {
        problem_id: 38,
        test_case_id: 1,
        input: '10\n20\n30\n40',
        expected_output: 'Original: [10, 20, 30, 40]\nBackup: [10, 20, 30]',
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 38,
        test_case_id: 2,
        input: '5\n15\n25\n35',
        expected_output: 'Original: [5, 15, 25, 35]\nBackup: [5, 15, 25]',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 38,
        test_case_id: 3,
        input: '100\n200\n300\n400',
        expected_output: 'Original: [100, 200, 300, 400]\nBackup: [100, 200, 300]',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 38
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 38 },
      { $set: problem38 },
      { upsert: true }
    );

    console.log('Problem 38 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 38
    await testCasesCollection.deleteMany({ problem_id: 38 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases38);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 38 (Session 8, Case 3: Copying a List) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem38()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
