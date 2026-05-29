import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem37() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 37: Session 8, Case 2 - Popping Items from List
    const problem37 = {
      problem_id: 37,
      session_id: 8,
      title: 'Popping Items from List',
      description: 'Use .pop() to remove and return the last item, or an item at a specific index.',
      difficulty: 'Medium',
      question: `Use input() four times to get four task names.
Create a list called tasks with these four items.
Use .pop() without arguments to remove the last item and store it in a variable called removed_task.
Print "Removed: " followed by removed_task.
Print "Remaining tasks: " followed by the tasks list.`,
      example_code: '# Write your code here\n',
      sample_input: 'task1\ntask2\ntask3\ntask4',
      sample_output: "Removed: task4\nRemaining tasks: ['task1', 'task2', 'task3']",
      age_group: '11-14',
      level_number: 1,
      metadata: {
        concepts: ['lists', 'pop', 'list-methods', 'return-values', 'data-structures'],
        space_theme: true,
        estimated_time_minutes: 12,
        test_protocol: 'Students should use .pop() method to remove and retrieve items from list'
      },
      // Case-specific content
      case_number: 2,
      case_title: 'Popping Items from List',
      case_overview: `Use .pop() to remove and return the last item, or an item at a specific index.`,
      case_code: `# Sample Example:
numbers = [10, 20, 30, 40]
removed = numbers.pop()
print("Removed:", removed)  # Output: Removed: 40
print("Remaining:", numbers)  # Output: Remaining: [10, 20, 30]

# Now you try this for our task`,
      case_explanation: `.pop() removes and returns the last item from the list. .pop(index) removes and returns the item at the specified index. The method modifies the original list. The returned value can be stored in a variable.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 37
    const testCases37 = [
      {
        problem_id: 37,
        test_case_id: 1,
        input: 'task1\ntask2\ntask3\ntask4',
        expected_output: "Removed: task4\nRemaining tasks: ['task1', 'task2', 'task3']",
        is_hidden: false,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 37,
        test_case_id: 2,
        input: 'alpha\nbeta\ngamma\ndelta',
        expected_output: "Removed: delta\nRemaining tasks: ['alpha', 'beta', 'gamma']",
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 37,
        test_case_id: 3,
        input: 'red\ngreen\nblue\nyellow',
        expected_output: "Removed: yellow\nRemaining tasks: ['red', 'green', 'blue']",
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 37
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 37 },
      { $set: problem37 },
      { upsert: true }
    );

    console.log('Problem 37 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 37
    await testCasesCollection.deleteMany({ problem_id: 37 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases37);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 37 (Session 8, Case 2: Popping Items from a List) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProblem37()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
