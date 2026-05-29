import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem153() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 153: Level 3, Session 6, Case 3 - Returning Values with __len__()
    const problem153 = {
      problem_id: 153,
      session_id: 28, // Level 3, Session 6
      title: 'Returning Values with __len__()',
      description: 'The __len__() method allows len() to work on custom objects, returning a meaningful count like pages in a book or items in a collection.',
      difficulty: 'Easy',
      question: `Can you create a Notebook class with pages attribute and implement __len__()? Print with prefix based on page count: pages>=100+even='Large Notebook:', pages>=100+odd='Extended Notebook:', pages<100+even='Small Notebook:', pages<100+odd='Compact Notebook:', followed by the number of pages.`,      sample_input: '150',
      sample_output: 'Large Notebook: 150',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', '__len__', 'magic methods', 'return values', 'len() function', 'conditional logic', 'nested conditionals', 'modulo operator'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 6: Magic Methods in Python',

      // Case-specific content
      case_number: 3,
      case_title: 'Returning Values with __len__()',
      case_overview: `The __len__() method enables len() to work on custom objects, returning meaningful counts.`,
      case_explanation: `Create Notebook class with __init__(pages) and __len__() method. Use len(notebook) to get page count. Check two conditions: (1) if pages >= 100 or < 100, and (2) if pages % 2 == 0 (even) or odd. Use nested if-else: pages>=100+even='Large Notebook:', pages>=100+odd='Extended Notebook:', pages<100+even='Small Notebook:', pages<100+odd='Compact Notebook:' prefix, then print '[prefix] [pages]'.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 153 - 7 test cases (2 visible + 5 hidden)
    const testCases153 = [
      {
        test_case_id: 1531,
        problem_id: 153,
        input: '150',
        expected_output: 'Large Notebook: 150', // pages=150, even, >=100
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1532,
        problem_id: 153,
        input: '200',
        expected_output: 'Large Notebook: 200', // pages=200, even, >=100
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1533,
        problem_id: 153,
        input: '101',
        expected_output: 'Extended Notebook: 101', // pages=101, odd, >=100
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1534,
        problem_id: 153,
        input: '75',
        expected_output: 'Compact Notebook: 75', // pages=75, odd, <100
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1535,
        problem_id: 153,
        input: '300',
        expected_output: 'Large Notebook: 300', // pages=300, even, >=100
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1536,
        problem_id: 153,
        input: '50',
        expected_output: 'Small Notebook: 50', // pages=50, even, <100
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1537,
        problem_id: 153,
        input: '251',
        expected_output: 'Extended Notebook: 251', // pages=251, odd, >=100
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 153 });
    await problemsCollection.insertOne(problem153);
    console.log('Problem 153 inserted');

    await testCasesCollection.deleteMany({ problem_id: 153 });
    await testCasesCollection.insertMany(testCases153);
    console.log(`${testCases153.length} test cases inserted for Problem 153`);

    console.log('\n✅ Problem 153 (Level 3, Session 6, Case 3: Returning with __len__) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem153()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
