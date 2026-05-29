import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem86() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 86: Level 2, Session 5, Case 2 - Tuple Length and Count
    const problem86 = {
      problem_id: 86,
      session_id: 16, // Level 2, Session 5
      title: 'Tuple Length and Count',
      description: 'Learn to use len() to get tuple size and count() to find occurrences of a value.',
      difficulty: 'Easy',
      question: `Create a tuple with N integers from input. Print the tuple's length using len(). Print how many times value V appears using count().`,      sample_input: '5\n2\n4\n2\n8\n2\n2',
      sample_output: '5\n3',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['tuples', 'len() function', 'count() method', 'tuple methods', 'occurrences'],
        estimated_time_minutes: 10
      },
      // Session-level content
      session_title: 'Session 5: Tuples (Built-in Methods, Functions, and Operations)',

      // Case-specific content
      case_number: 2,
      case_title: 'Tuple Length and Count',
      case_overview: `Master tuple methods - use len() to find how many elements a tuple contains and count() to see how often a value appears.`,
      case_code: `# Tuple Methods
fruits = ("apple", "banana", "cherry", "banana")

# Find position of first occurrence
position = fruits.index("banana")
print(position)  # Prints: 1

# Check if element exists before finding index
if "mango" in fruits:
    print(fruits.index("mango"))
else:
    print("Not found")`,
      case_explanation: `Use len(tuple) to get the total number of elements. Use tuple.count(value) to find how many times a value appears in the tuple.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 86 if it exists
    await problemsCollection.deleteOne({ problem_id: 86 });
    await testCasesCollection.deleteMany({ problem_id: 86 });

    // Insert problem 86
    const problemResult = await problemsCollection.insertOne(problem86);
    console.log('Problem 86 inserted');

    // Test cases for Problem 86 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 861,
        problem_id: 86,
        input: '5\n2\n4\n2\n8\n2\n2',
        expected_output: '5\n3',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 862,
        problem_id: 86,
        input: '4\n10\n20\n10\n30\n10',
        expected_output: '4\n2',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 863,
        problem_id: 86,
        input: '6\n5\n5\n5\n5\n5\n5\n5',
        expected_output: '6\n6',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 864,
        problem_id: 86,
        input: '3\n1\n2\n3\n4',
        expected_output: '3\n0',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 865,
        problem_id: 86,
        input: '7\n7\n8\n7\n9\n7\n10\n7\n7',
        expected_output: '7\n4',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 866,
        problem_id: 86,
        input: '2\n100\n200\n100',
        expected_output: '2\n1',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 867,
        problem_id: 86,
        input: '8\n1\n1\n2\n2\n3\n3\n4\n4\n2',
        expected_output: '8\n2',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 86`);

    console.log('\n✅ Problem 86 (Level 2, Session 5, Case 2: Tuple Length and Count) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem86()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
