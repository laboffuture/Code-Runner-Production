import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem34() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 34: Session 7, Case 4 - Sorting and Reversing a List
    const problem34 = {
      problem_id: 34,
      session_id: 7,
      title: 'Sorting and Reversing a List',
      description: 'Use .sort() to arrange items in order and .reverse() to flip the list.',
      difficulty: 'Medium',
      question: `Your program should manage temperature readings that:
- Collects four temperature values (as integers) from user input
- Stores them in a list called temperatures
- Displays the temperatures in ascending order with the label "Sorted:"
- Displays the temperatures in descending order with the label "Reversed:"`,
      example_code: '# Write your code here\n',
      sample_input: '25\n18\n30\n22',
      sample_output: 'Sorted: [18, 22, 25, 30]\nReversed: [30, 25, 22, 18]',

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use input() to collect user data
- Convert string input to integers using int()
- Create a list and store multiple integer values
- Use the .sort() method to arrange list items in ascending order
- Use the .reverse() method to flip the list order
- Print formatted output with labels`,

      concepts: `- List Methods: Using built-in methods to organize lists
- .sort() Method: Arranging items in ascending order (smallest to largest)
- .reverse() Method: Flipping the entire list order
- In-Place Modification: Methods that change the original list directly
- Ascending/Descending Order: Understanding sorted data organization
- Formatted Output: Displaying results with descriptive labels`,

      metadata: {
        concepts: ['lists', 'sort', 'reverse', 'list-methods', 'data-structures'],
        space_theme: true,
        estimated_time_minutes: 12
      },
      // Case-specific content
      case_number: 4,
      case_title: 'Sorting and Reversing a List',
      case_overview: `Use .sort() to arrange items in order and .reverse() to flip the list.`,
      case_code: `# Create a list and collect 4 temperature values
temperatures = []
temperatures.append(int(input()))
temperatures.append(int(input()))
temperatures.append(int(input()))
temperatures.append(int(input()))

# Sort the list in ascending order
temperatures.sort()
print("Sorted:", temperatures)

# Reverse the list to descending order
temperatures.reverse()
print("Reversed:", temperatures)`,
      case_explanation: `.sort() arranges items in ascending order (smallest to largest). .reverse() flips the entire list order. Both methods modify the original list in-place. .sort() works on numbers and strings.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 34
    const testCases34 = [
      {
        problem_id: 34,
        test_case_id: 1,
        input: '25\n18\n30\n22',
        expected_output: 'Sorted: [18, 22, 25, 30]\nReversed: [30, 25, 22, 18]',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 34,
        test_case_id: 2,
        input: '50\n10\n30\n20',
        expected_output: 'Sorted: [10, 20, 30, 50]\nReversed: [50, 30, 20, 10]',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        problem_id: 34,
        test_case_id: 3,
        input: '100\n75\n90\n85',
        expected_output: 'Sorted: [75, 85, 90, 100]\nReversed: [100, 90, 85, 75]',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Upsert problem 34
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 34 },
      { $set: problem34 },
      { upsert: true }
    );

    console.log('Problem 34 upserted:', problemResult.upsertedId || 'Updated existing');

    // Delete existing test cases for problem 34
    await testCasesCollection.deleteMany({ problem_id: 34 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases34);
    console.log('Test cases inserted:', testCasesResult.insertedCount);

    console.log('\n✅ Problem 34 (Session 7, Case 4: Sorting and Reversing a List) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem34()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
