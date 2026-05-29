import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem33() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 33: Session 7, Case 3 - Removing Items from a List
    const problem33 = {
      problem_id: 33,
      session_id: 7,
      title: 'Removing Items from a List',
      description: 'Use .remove() to delete a specific item by value.',
      difficulty: 'Medium',
      question: `Your program should manage a tool inventory that:
- Collects three tool names from user input
- Stores them in a list called tools
- Removes a specific tool from the inventory based on user input
- Displays the updated tool list`,
      example_code: '# Write your code here\n',
      sample_input: 'hammer\nwrench\nscrewdriver\nwrench',
      sample_output: "['hammer', 'screwdriver']",

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect user data
- Create a list using square brackets []
- Store multiple values in a list variable
- Use the .remove() method to delete items from a list
- Understand that .remove() deletes by value (not by index)
- Print the updated list after removal`,

      concepts: `- List Methods: Using built-in methods to modify lists
- .remove() Method: Deleting specific elements by value
- List Modification: Changing list contents by removing items
- Value-Based Removal: Removing items by their value, not position
- Method Syntax: Using list_name.remove(item) format
- Dynamic Lists: Lists that shrink as items are removed`,

      metadata: {
        concepts: ['lists', 'remove', 'list-methods', 'data-structures'],
        space_theme: true,
        estimated_time_minutes: 10
      },
      // Case-specific content
      case_number: 3,
      case_title: 'Removing Items from a List',
      case_overview: `Use .remove() to delete a specific item by value.`,
      case_code: `# Create a list and collect 3 tool names
tools = []
tools.append(input())
tools.append(input())
tools.append(input())

# Get the tool name to remove
tool_to_remove = input()

# Remove the specified tool from the list
tools.remove(tool_to_remove)

# Print the updated list
print(tools)`,
      case_explanation: `.remove("item") deletes the first occurrence of the item. The method modifies the original list. If item doesn't exist, it causes an error. Syntax: list_name.remove(item_to_delete).`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 33
    const testCases33 = [
      {
        problem_id: 33,
        test_case_id: 1,
        input: 'hammer\nwrench\nscrewdriver\nwrench',
        expected_output: "['hammer', 'screwdriver']",
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 33,
        test_case_id: 2,
        input: 'apple\nbanana\ncherry\nbanana',
        expected_output: "['apple', 'cherry']",
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 33,
        test_case_id: 3,
        input: 'red\ngreen\nblue\ngreen',
        expected_output: "['red', 'blue']",
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 33
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 33 },
      { $set: problem33 },
      { upsert: true }
    );

    console.log('Problem 33 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 33
    await testCasesCollection.deleteMany({ problem_id: 33 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases33);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 33 (Session 7, Case 3: Removing Items from a List) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem33()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
