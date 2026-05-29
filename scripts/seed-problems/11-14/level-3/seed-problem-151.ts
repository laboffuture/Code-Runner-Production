import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem151() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 151: Level 3, Session 6, Case 1 - Using __init__() to Set Up an Object
    const problem151 = {
      problem_id: 151,
      session_id: 28, // Level 3, Session 6
      title: 'Using __init__() to Set Up an Object',
      description: 'The __init__() method is called automatically when creating an object, setting initial values like a profile setup, making code cleaner and reusable.',
      difficulty: 'Easy',
      question: `Can you create a Person class with name and age attributes using __init__()? Print with rank prefix: age>=12+even='Senior:', age>=12+odd='Cadet:', age<12+even='Junior:', age<12+odd='Recruit:', followed by 'Name: [name], Age: [age]'.`,      sample_input: 'Arjun\n12',
      sample_output: 'Senior: Name: Arjun, Age: 12',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', '__init__', 'magic methods', 'object initialization', 'self', 'conditional logic', 'nested conditionals', 'modulo operator'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 6: Magic Methods in Python',

      // Case-specific content
      case_number: 1,
      case_title: 'Using __init__() to Set Up an Object',
      case_overview: `The __init__() method automatically initializes object values when created, like setting up a profile.`,
      case_explanation: `Create Person class with __init__(name, age). Check two conditions: (1) if age >= 12 or < 12, and (2) if age % 2 == 0 (even) or odd. Use nested if-else: age>=12+even='Senior:', age>=12+odd='Cadet:', age<12+even='Junior:', age<12+odd='Recruit:' prefix, then 'Name: [name], Age: [age]'.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 151 - 7 test cases (2 visible + 5 hidden)
    const testCases151 = [
      {
        test_case_id: 1511,
        problem_id: 151,
        input: 'Arjun\n12',
        expected_output: 'Senior: Name: Arjun, Age: 12',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1512,
        problem_id: 151,
        input: 'Maya\n14',
        expected_output: 'Senior: Name: Maya, Age: 14',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1513,
        problem_id: 151,
        input: 'Ravi\n11',
        expected_output: 'Recruit: Name: Ravi, Age: 11',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1514,
        problem_id: 151,
        input: 'Zara\n13',
        expected_output: 'Cadet: Name: Zara, Age: 13',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1515,
        problem_id: 151,
        input: 'Kiran\n10',
        expected_output: 'Junior: Name: Kiran, Age: 10',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1516,
        problem_id: 151,
        input: 'Leena\n15',
        expected_output: 'Cadet: Name: Leena, Age: 15',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1517,
        problem_id: 151,
        input: 'Rohan\n9',
        expected_output: 'Recruit: Name: Rohan, Age: 9',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 151 });
    await problemsCollection.insertOne(problem151);
    console.log('Problem 151 inserted');

    await testCasesCollection.deleteMany({ problem_id: 151 });
    await testCasesCollection.insertMany(testCases151);
    console.log(`${testCases151.length} test cases inserted for Problem 151`);

    console.log('\n✅ Problem 151 (Level 3, Session 6, Case 1: Using __init__) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem151()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
