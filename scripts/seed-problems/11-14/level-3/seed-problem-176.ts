import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem176() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 176: Level 3, Session 10, Case 2 - Operator Overloading (+)
    const problem176 = {
      problem_id: 176,
      session_id: 32, // Level 3, Session 10
      title: 'Operator Overloading – Redefining + for Custom Objects',
      description: 'Learn how to redefine operators like + to work with custom objects.',
      difficulty: 'Medium',
      question: `Can you create a Book class with title and pages attributes? When adding books with +, combine titles with '-' and add pages. Take 2 inputs (title, pages) for each of 2 books, add them, and print the result.`,      sample_input: 'Fiction\n150\nScience\n100',
      sample_output: 'Fiction-Science Book with 250 pages',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['polymorphism', 'operator overloading', '__add__', '__str__', 'magic methods', 'OOP'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 10: Polymorphism',

      // Case-specific content
      case_number: 2,
      case_title: 'Operator Overloading – Redefining + for Custom Objects',
      case_overview: `Operator overloading allows custom objects to use standard operators like +, -, * by defining special methods that specify the operator's behavior for that class.`,
      case_explanation: `Create Book class with __init__(pages). Define __add__(other) to return new Book with combined pages. Define __str__() to return formatted string. Create two books, add them, print result.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 176 if it exists
    await problemsCollection.deleteOne({ problem_id: 176 });
    await testCasesCollection.deleteMany({ problem_id: 176 });

    // Insert problem 176
    const problemResult = await problemsCollection.insertOne(problem176);
    console.log('Problem 176 inserted');

    // Test cases for Problem 176
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1761,
        problem_id: 176,
        input: 'Fiction\n150\nScience\n100',
        expected_output: 'Fiction-Science Book with 250 pages',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1762,
        problem_id: 176,
        input: 'Math\n120\nHistory\n230',
        expected_output: 'Math-History Book with 350 pages',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1763,
        problem_id: 176,
        input: 'Art\n75\nMusic\n125',
        expected_output: 'Art-Music Book with 200 pages',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1764,
        problem_id: 176,
        input: 'Physics\n50\nChemistry\n75',
        expected_output: 'Physics-Chemistry Book with 125 pages',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1765,
        problem_id: 176,
        input: 'Biology\n300\nGeography\n250',
        expected_output: 'Biology-Geography Book with 550 pages',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1766,
        problem_id: 176,
        input: 'English\n80\nLiterature\n120',
        expected_output: 'English-Literature Book with 200 pages',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1767,
        problem_id: 176,
        input: 'Drama\n175\nPoetry\n225',
        expected_output: 'Drama-Poetry Book with 400 pages',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 176`);

    console.log('\n✅ Problem 176 (Level 3, Session 10, Case 2: Operator Overloading) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem176()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
