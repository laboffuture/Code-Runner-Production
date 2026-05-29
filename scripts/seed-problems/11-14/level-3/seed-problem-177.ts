import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem177() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 177: Level 3, Session 10, Case 3 - Overloading > operator
    const problem177 = {
      problem_id: 177,
      session_id: 32, // Level 3, Session 10
      title: 'Overloading > – Compare Object Attributes',
      description: 'Discover how to enable comparison operators for custom objects.',
      difficulty: 'Medium',
      question: `Can you create a Student class that allows comparing students based on their marks using the > operator? Take 6 inputs for 3 students (name, marks for each), create objects, use > to find the highest scorer, and print their name.`,      sample_input: 'Alice\n85\nBob\n90\nCarol\n88',
      sample_output: 'Bob',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['polymorphism', 'operator overloading', '__gt__', 'comparison operators', 'magic methods', 'OOP'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 10: Polymorphism',

      // Case-specific content
      case_number: 3,
      case_title: 'Overloading > – Compare Object Attributes',
      case_overview: `Comparison operator overloading enables custom objects to be compared using standard operators like >, <, ==. The __gt__ method defines greater-than behavior based on object attributes.`,
      case_explanation: `Create Student class with name and marks. Define __gt__(other) to compare marks. Create two students (Alice: 85, Bob: 90), use > operator to compare, print winner.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 177 if it exists
    await problemsCollection.deleteOne({ problem_id: 177 });
    await testCasesCollection.deleteMany({ problem_id: 177 });

    // Insert problem 177
    const problemResult = await problemsCollection.insertOne(problem177);
    console.log('Problem 177 inserted');

    // Test cases for Problem 177
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1771,
        problem_id: 177,
        input: 'Alice\n85\nBob\n90\nCarol\n88',
        expected_output: 'Bob',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1772,
        problem_id: 177,
        input: 'John\n95\nSara\n88\nMike\n92',
        expected_output: 'John',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1773,
        problem_id: 177,
        input: 'David\n78\nEmma\n92\nTom\n85',
        expected_output: 'Emma',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1774,
        problem_id: 177,
        input: 'Lisa\n75\nPeter\n100\nMary\n89',
        expected_output: 'Peter',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1775,
        problem_id: 177,
        input: 'Kate\n60\nJack\n85\nRose\n95',
        expected_output: 'Rose',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1776,
        problem_id: 177,
        input: 'Sam\n93\nAlex\n89\nJoe\n91',
        expected_output: 'Sam',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1777,
        problem_id: 177,
        input: 'Nina\n82\nLeo\n96\nAmy\n88',
        expected_output: 'Leo',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 177`);

    console.log('\n✅ Problem 177 (Level 3, Session 10, Case 3: Overloading >) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem177()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
