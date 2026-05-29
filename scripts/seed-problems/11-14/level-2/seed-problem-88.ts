import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem88() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 88: Level 2, Session 5, Case 4 - Concatenating and Repeating Tuples
    const problem88 = {
      problem_id: 88,
      session_id: 16, // Level 2, Session 5
      title: 'Concatenating and Repeating Tuples',
      description: 'Learn to combine tuples using + operator and repeat tuples using * operator.',
      difficulty: 'Easy',
      question: `Create two tuples with N1 and N2 integers from input. Concatenate them using + and print. Repeat the first tuple R times using * and print.`,      sample_input: '2\n1\n2\n2\n3\n4\n3',
      sample_output: '(1, 2, 3, 4)\n(1, 2, 1, 2, 1, 2)',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['tuples', 'concatenation', 'repetition', '+ operator', '* operator', 'tuple operations'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 5: Tuples (Built-in Methods, Functions, and Operations)',

      // Case-specific content
      case_number: 4,
      case_title: 'Concatenating and Repeating Tuples',
      case_overview: `Master tuple operations - use + to join tuples together and * to repeat a tuple multiple times.`,
      case_code: `# Tuple Functions
numbers = (45, 12, 78, 23, 56)

# Find minimum value
print(min(numbers))  # Prints: 12

# Find maximum value
print(max(numbers))  # Prints: 78

# Sum all values
print(sum(numbers))  # Prints: 214`,
      case_explanation: `Use tuple1 + tuple2 to join two tuples together creating a new tuple. Use tuple * N to repeat a tuple N times creating a new tuple with repeated elements.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 88 if it exists
    await problemsCollection.deleteOne({ problem_id: 88 });
    await testCasesCollection.deleteMany({ problem_id: 88 });

    // Insert problem 88
    const problemResult = await problemsCollection.insertOne(problem88);
    console.log('Problem 88 inserted');

    // Test cases for Problem 88 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 881,
        problem_id: 88,
        input: '2\n1\n2\n2\n3\n4\n3',
        expected_output: '(1, 2, 3, 4)\n(1, 2, 1, 2, 1, 2)',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 882,
        problem_id: 88,
        input: '3\n10\n20\n30\n2\n40\n50\n2',
        expected_output: '(10, 20, 30, 40, 50)\n(10, 20, 30, 10, 20, 30)',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 883,
        problem_id: 88,
        input: '1\n5\n1\n10\n4',
        expected_output: '(5, 10)\n(5, 5, 5, 5)',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 884,
        problem_id: 88,
        input: '4\n1\n2\n3\n4\n3\n5\n6\n7\n1',
        expected_output: '(1, 2, 3, 4, 5, 6, 7)\n(1, 2, 3, 4)',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 885,
        problem_id: 88,
        input: '2\n100\n200\n2\n300\n400\n5',
        expected_output: '(100, 200, 300, 400)\n(100, 200, 100, 200, 100, 200, 100, 200, 100, 200)',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 886,
        problem_id: 88,
        input: '3\n7\n8\n9\n3\n1\n2\n3\n2',
        expected_output: '(7, 8, 9, 1, 2, 3)\n(7, 8, 9, 7, 8, 9)',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 887,
        problem_id: 88,
        input: '1\n99\n4\n88\n77\n66\n55\n3',
        expected_output: '(99, 88, 77, 66, 55)\n(99, 99, 99)',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 88`);

    console.log('\n✅ Problem 88 (Level 2, Session 5, Case 4: Concatenating and Repeating Tuples) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem88()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
