import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem57() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 57: Session 7, Final Task - Astronaut Supply Checklist
    const problem57 = {
      problem_id: 57,
      session_id: 7,
      title: 'Astronaut Supply Checklist',
      description: `The team compiles repair tasks and subsystem checkpoints as they finalize engine and stabilizer calibration for NOVA-12.

Astra: "Create the Astronaut Supply Checklist to track essential mission equipment. Start with core items, add new supplies as needed, remove items no longer required, and organize the final inventory. Every astronaut mission depends on precise supply management."

Build the automated supply tracking system that ensures nothing critical is left behind.`,

      question: `Commander, it's time to build the Astronaut Supply Checklist!
You need to manage a supply inventory that:
- Starts with initial equipment: "oxygen tank", "food pack", "space suit"
- Gets updated with new equipment: "helmet" and "water bottle"
- Has "food pack" removed from inventory
- Shows the final inventory in alphabetical order
- Displays the total count of items
Your program should output the organized supply list and the total number of items.`,

      difficulty: 'Medium',
      example_code: `# Astronaut Supply Checklist
# Your code here
`,

      sample_input: ``,
      sample_output: `['helmet', 'oxygen tank', 'space suit', 'water bottle']
4`,

      age_group: '11-14',
      level_number: 1,

      objectives: `- Create lists with initial values
- Use \`.append()\` to add items to a list
- Use \`.remove()\` to delete specific items from a list
- Use \`.sort()\` to alphabetically organize list items
- Use \`len()\` to count the number of items in a list
- Print lists and their properties
- Understand list mutability (how lists can be modified in place)`,

      concepts: `- List Creation: Initializing lists with starting values using square brackets
- List Methods: Using \`.append()\` to add items to the end of a list
- List Methods: Using \`.remove()\` to delete the first occurrence of a value
- List Methods: Using \`.sort()\` to arrange items in alphabetical/numerical order
- Built-in Functions: Using \`len()\` to get the count of items
- List Mutability: Understanding that list methods modify the list directly
- Inventory Management: Tracking and organizing collections of items
- Real-world Applications: Supply chain management and equipment tracking`,

      metadata: {
        concepts: ['lists', 'list methods', 'append', 'remove', 'sort', 'len', 'inventory management'],
        space_theme: true,
        story_linked: true,
        estimated_time_minutes: 25,
        is_final_task: true
      },



      // Case-specific content (Final Task)
      case_number: 6,
      case_title: 'Astronaut Supply Checklist - Equipment Inventory System',
      // case_overview removed for final tasks (Case 6)

      case_code: `# Create initial supply list
supplies = ["oxygen tank", "food pack", "space suit"]

# Add new items to the list
supplies.append("helmet")
supplies.append("water bottle")

# Remove item no longer needed
supplies.remove("food pack")

# Sort the list alphabetically
supplies.sort()

# Display the final inventory
print(supplies)
print(len(supplies))`,

      case_explanation: `Create a list using square brackets. Use .append() to add items to the end. Use .remove() to delete the first occurrence of an item. Use .sort() to arrange items alphabetically. Use len() to count items. List methods modify the list in place. Print the list to display all items with brackets and quotes.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Upsert problem 57
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 57 },
      { $set: problem57 },
      { upsert: true }
    );

    console.log('Problem 57 upserted:', problemResult.upsertedId || 'Updated existing');

    // Test cases for Problem 57
    const testCases57 = [
      // Visible test case - standard execution
      {
        problem_id: 57,
        test_case_id: 1,
        input: '',
        expected_output: "['helmet', 'oxygen tank', 'space suit', 'water bottle']\n4",
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test case - verify list operations work correctly
      {
        problem_id: 57,
        test_case_id: 2,
        input: '',
        expected_output: "['helmet', 'oxygen tank', 'space suit', 'water bottle']\n4",
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Delete existing test cases for problem 57
    await testCasesCollection.deleteMany({ problem_id: 57 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases57);
    console.log(`${testCasesResult.insertedCount} test cases inserted for Problem 57`);

    console.log('\n✅ Problem 57 (Session 7, Final Task: Astronaut Supply Checklist) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem57()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
