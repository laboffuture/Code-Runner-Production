import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem31() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 31: Session 7, Case 1 - Creating and Accessing List Elements
    const problem31 = {
      problem_id: 31,
      session_id: 7,
      title: 'Creating and Accessing List Elements',
      description: 'Learn how to create a list and access its items using index numbers.',
      difficulty: 'Medium',
      question: `Your program should manage a planetary catalog that:
- Collects three planet names from user input
- Stores them in a list called planets
- Displays the first planet in the catalog
- Displays the third planet in the catalog`,
      example_code: '# Write your code here\n',
      sample_input: 'Mercury\nVenus\nEarth',
      sample_output: 'Mercury\nEarth',

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect user data
- Create a list using square brackets []
- Store multiple values in a list variable
- Access list elements using index numbers
- Understand zero-based indexing (first element is index 0)
- Print specific elements from a list`,

      concepts: `- Lists: Ordered collections that store multiple values
- List Creation: Using square brackets [] to create lists
- Zero-Based Indexing: First element is at index 0, second at index 1, etc.
- List Access: Using list_name[index] to get specific elements
- Index Numbers: Positions start at 0, not 1
- Data Structures: Organizing related data together`,

      metadata: {
        concepts: ['lists', 'indexing', 'data-structures', 'list-access'],
        space_theme: true,
        estimated_time_minutes: 10
      },
      // Case-specific content
      case_number: 1,
      case_title: 'Creating and Accessing List Elements',
      case_overview: `Learn how to create a list and access its items using index numbers.`,
      case_code: `# Create a list and collect 3 planet names
planets = []
planets.append(input())
planets.append(input())
planets.append(input())

# Access and print first planet (index 0)
print(planets[0])

# Access and print third planet (index 2)
print(planets[2])`,
      case_explanation: `Lists use square brackets []. Index starts from 0, so planets[0] is the first item. planets[2] gives the third item. Negative indexing works too: planets[-1] is the last item.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 31
    const testCases31 = [
      {
        problem_id: 31,
        test_case_id: 1,
        input: 'Mercury\nVenus\nEarth',
        expected_output: 'Mercury\nEarth',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 31,
        test_case_id: 2,
        input: 'Mars\nJupiter\nSaturn',
        expected_output: 'Mars\nSaturn',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 31,
        test_case_id: 3,
        input: 'Alpha\nBeta\nGamma',
        expected_output: 'Alpha\nGamma',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 31
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 31 },
      { $set: problem31 },
      { upsert: true }
    );

    console.log('Problem 31 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 31
    await testCasesCollection.deleteMany({ problem_id: 31 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases31);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 31 (Session 7, Case 1: Creating and Accessing List Elements) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem31()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
