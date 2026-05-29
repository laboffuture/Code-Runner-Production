import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem32() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 32: Session 7, Case 2 - Adding Items to a List
    const problem32 = {
      problem_id: 32,
      session_id: 7,
      title: 'Adding Items to a List',
      description: 'Use .append() to add a new item at the end of a list.',
      difficulty: 'Medium',
      question: `Your program should manage a crew roster that:
- Collects three crew member names from user input
- Stores them in a list called crew
- Adds one additional crew member to the roster
- Displays the complete crew list`,
      example_code: '# Write your code here\n',
      sample_input: 'Alice\nBob\nCharlie\nDiana',
      sample_output: "['Alice', 'Bob', 'Charlie', 'Diana']",

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect user data
- Create a list using square brackets []
- Store multiple values in a list variable
- Use the .append() method to add items to a list
- Understand that .append() adds items to the end of the list
- Print the complete list to display all elements`,

      concepts: `- List Methods: Using built-in methods to modify lists
- .append() Method: Adding new elements to the end of a list
- List Modification: Changing list contents after creation
- Dynamic Lists: Lists that grow as items are added
- Method Syntax: Using list_name.append(item) format
- Data Structures: Managing collections that can change in size`,

      metadata: {
        concepts: ['lists', 'append', 'list-methods', 'data-structures'],
        space_theme: true,
        estimated_time_minutes: 10
      },
      // Case-specific content
      case_number: 2,
      case_title: 'Adding Items to a List',
      case_overview: `Use .append() to add a new item at the end of a list.`,
      case_code: `# Create a list and collect 3 crew members
crew = []
crew.append(input())
crew.append(input())
crew.append(input())

# Add one more crew member to the list
crew.append(input())

# Print the complete crew list
print(crew)`,
      case_explanation: `.append(item) adds the item to the end of the list. The method modifies the original list. Syntax: list_name.append(new_item). After appending, the list size increases by 1.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 32
    const testCases32 = [
      {
        problem_id: 32,
        test_case_id: 1,
        input: 'Alice\nBob\nCharlie\nDiana',
        expected_output: "['Alice', 'Bob', 'Charlie', 'Diana']",
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 32,
        test_case_id: 2,
        input: 'John\nJane\nJack\nJill',
        expected_output: "['John', 'Jane', 'Jack', 'Jill']",
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 32,
        test_case_id: 3,
        input: 'Red\nGreen\nBlue\nYellow',
        expected_output: "['Red', 'Green', 'Blue', 'Yellow']",
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 32
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 32 },
      { $set: problem32 },
      { upsert: true }
    );

    console.log('Problem 32 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 32
    await testCasesCollection.deleteMany({ problem_id: 32 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases32);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 32 (Session 7, Case 2: Adding Items to a List) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem32()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
