import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem152() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 152: Level 3, Session 6, Case 2 - Printing Object Info with __str__()
    const problem152 = {
      problem_id: 152,
      session_id: 28, // Level 3, Session 6
      title: 'Printing Object Info with __str__()',
      description: 'The __str__() method controls what message appears when printing an object, making output meaningful instead of showing memory addresses.',
      difficulty: 'Easy',
      question: `Can you create a Book class with title and author attributes, and implement __str__()? Print with prefix based on title length: len>=10+even='Long Title:', len>=10+odd='Extended:', len<10+even='Short Title:', len<10+odd='Brief:', followed by '[title] by [author]'.`,      sample_input: 'Wings of Fire\nA.P.J Abdul Kalam',
      sample_output: 'Extended: Wings of Fire by A.P.J Abdul Kalam',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', '__str__', 'magic methods', 'object representation', 'print formatting', 'conditional logic', 'nested conditionals', 'string length', 'modulo operator'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 6: Magic Methods in Python',

      // Case-specific content
      case_number: 2,
      case_title: 'Printing Object Info with __str__()',
      case_overview: `The __str__() method controls object print output, showing friendly messages instead of memory addresses.`,
      case_explanation: `Create Book class with __init__(title, author) and __str__() method. Check two conditions: (1) if len(title) >= 10 or < 10, and (2) if len(title) % 2 == 0 (even) or odd. Use nested if-else: len>=10+even='Long Title:', len>=10+odd='Extended:', len<10+even='Short Title:', len<10+odd='Brief:' prefix, then return '[title] by [author]'.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 152 - 7 test cases (2 visible + 5 hidden)
    const testCases152 = [
      {
        test_case_id: 1521,
        problem_id: 152,
        input: 'Wings of Fire\nA.P.J Abdul Kalam',
        expected_output: 'Extended: Wings of Fire by A.P.J Abdul Kalam', // len=13, odd, >=10
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1522,
        problem_id: 152,
        input: 'Harry Potter\nJ.K. Rowling',
        expected_output: 'Long Title: Harry Potter by J.K. Rowling', // len=12, even, >=10
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1523,
        problem_id: 152,
        input: 'The Martian\nAndy Weir',
        expected_output: 'Extended: The Martian by Andy Weir', // len=11, odd, >=10
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1524,
        problem_id: 152,
        input: 'Cosmos\nCarl Sagan',
        expected_output: 'Short Title: Cosmos by Carl Sagan', // len=6, even, <10
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1525,
        problem_id: 152,
        input: 'Interstellar Science\nKip Thorne',
        expected_output: 'Long Title: Interstellar Science by Kip Thorne', // len=20, even, >=10
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1526,
        problem_id: 152,
        input: 'A Brief History of Time\nStephen Hawking',
        expected_output: 'Extended: A Brief History of Time by Stephen Hawking', // len=23, odd, >=10
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1527,
        problem_id: 152,
        input: 'Ender Game\nOrson Scott Card',
        expected_output: 'Long Title: Ender Game by Orson Scott Card', // len=10, even, >=10
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 152 });
    await problemsCollection.insertOne(problem152);
    console.log('Problem 152 inserted');

    await testCasesCollection.deleteMany({ problem_id: 152 });
    await testCasesCollection.insertMany(testCases152);
    console.log(`${testCases152.length} test cases inserted for Problem 152`);

    console.log('\n✅ Problem 152 (Level 3, Session 6, Case 2: Printing with __str__) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem152()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
