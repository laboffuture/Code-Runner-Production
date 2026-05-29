import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem115() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 115: Level 2, Session 10, Case 1 - Length & Type
    const problem115 = {
      problem_id: 115,
      session_id: 21, // Level 2, Session 10
      title: 'Length & Type',
      description: 'Learn to use len() to get object length and type() to check data types.',
      difficulty: 'Easy',
      question: `Take a string as input. Create a list with the string as a single element, print its length using len(), then print its type using type().`,      sample_input: 'Apollo',
      sample_output: '1\n<class \'list\'>',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['built-in functions', 'len()', 'type()', 'data inspection', 'object properties'],
        estimated_time_minutes: 10
      },
      // Session-level content
      session_title: 'Session 10: Built-in Functions Mastery',

      // Case-specific content
      case_number: 1,
      case_title: 'Length & Type',
      case_overview: `Master len() and type() - essential functions to inspect objects and understand their size and data type.`,
      case_code: `# Using len() and type() with Dictionary
stats = {'fuel': 100, 'oxygen': 95, 'power': 85}
print(len(stats))    # Prints: 3
print(type(stats))   # Prints: <class 'dict'>`,
      case_explanation: `Use len() to count items in a collection and type() to check what kind of data structure it is.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 115 if it exists
    await problemsCollection.deleteOne({ problem_id: 115 });
    await testCasesCollection.deleteMany({ problem_id: 115 });

    // Insert problem 115
    const problemResult = await problemsCollection.insertOne(problem115);
    console.log('Problem 115 inserted');

    // Test cases for Problem 115 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1151,
        problem_id: 115,
        input: 'Apollo',
        expected_output: '1\n<class \'list\'>',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1152,
        problem_id: 115,
        input: 'Artemis',
        expected_output: '1\n<class \'list\'>',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1153,
        problem_id: 115,
        input: 'Voyager',
        expected_output: '1\n<class \'list\'>',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1154,
        problem_id: 115,
        input: 'Discovery',
        expected_output: '1\n<class \'list\'>',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1155,
        problem_id: 115,
        input: 'Challenger',
        expected_output: '1\n<class \'list\'>',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1156,
        problem_id: 115,
        input: 'Columbia',
        expected_output: '1\n<class \'list\'>',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1157,
        problem_id: 115,
        input: 'Endeavour',
        expected_output: '1\n<class \'list\'>',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 115`);

    console.log('\n✅ Problem 115 (Level 2, Session 10, Case 1: Length & Type) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem115()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
