import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem35() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 35: Session 7, Case 5 - Finding Length and Checking Membership
    const problem35 = {
      problem_id: 35,
      session_id: 7,
      title: 'Finding Length and Checking Membership',
      description: 'Use len() to count items and in to check if an item exists in the list.',
      difficulty: 'Medium',
      question: `Your program should manage a supply inventory that:
- Collects four supply item names from user input
- Stores them in a list called supplies
- Displays the total count of items in the inventory
- Checks if the first requested item exists in the inventory
- Checks if the second requested item exists in the inventory`,
      example_code: '# Write your code here\n',
      sample_input: 'fuel\noxygen\nwater\nfood\noxygen\nbattery',
      sample_output: '4\nTrue\nFalse',

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect user data
- Create a list and store multiple values
- Use len() function to count the number of items in a list
- Use the 'in' operator to check if an item exists in a list
- Understand that 'in' returns True or False (boolean values)
- Print multiple results including count and membership checks`,

      concepts: `- len() Function: Built-in function that returns the count of items in a list
- Membership Testing: Using 'in' operator to check if a value exists in a list
- Boolean Values: Understanding True and False as return values
- List Properties: Checking list characteristics (length, contents)
- in Operator: Syntax is "item in list" which returns True/False
- Case Sensitivity: 'in' operator checks for exact matches`,

      metadata: {
        concepts: ['lists', 'len', 'membership', 'in-operator', 'final-task'],
        space_theme: true,
        estimated_time_minutes: 12
      },
      // Case-specific content
      case_number: 5,
      case_title: 'Finding Length and Checking Membership',
      case_overview: `Use len() to count items and in to check if an item exists in the list.`,
      case_code: `# Create a list and collect 4 supply items
supplies = []
supplies.append(input())
supplies.append(input())
supplies.append(input())
supplies.append(input())

# Display the total count of items
print(len(supplies))

# Check if first item exists in the list
item1 = input()
print(item1 in supplies)

# Check if second item exists in the list
item2 = input()
print(item2 in supplies)`,
      case_explanation: `len(list) returns the number of items in the list. "item" in list returns True if item exists, False otherwise. len() is a built-in function, not a method. The 'in' operator is case-sensitive.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 35
    const testCases35 = [
      {
        problem_id: 35,
        test_case_id: 1,
        input: 'fuel\noxygen\nwater\nfood\noxygen\nbattery',
        expected_output: '4\nTrue\nFalse',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 35,
        test_case_id: 2,
        input: 'apple\nbanana\ncherry\ndate\nbanana\ngrape',
        expected_output: '4\nTrue\nFalse',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 35,
        test_case_id: 3,
        input: 'red\ngreen\nblue\nyellow\nyellow\npurple',
        expected_output: '4\nTrue\nFalse',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 35
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 35 },
      { $set: problem35 },
      { upsert: true }
    );

    console.log('Problem 35 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 35
    await testCasesCollection.deleteMany({ problem_id: 35 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases35);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 35 (Session 7, Case 5: Finding Length and Checking Membership) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem35()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
