import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem73() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 73: Level 2, Session 3, Case 1 - Creating and Accessing a Dictionary
    const problem73 = {
      problem_id: 73,
      session_id: 14, // Level 2, Session 3
      title: 'Creating and Accessing a Dictionary',
      description: 'Learn to create dictionaries and access values using keys.',
      difficulty: 'Easy',
      question: `Create a dictionary called 'spacecraft' with keys "name", "speed", and "crew" storing the three input values. Then print each value by accessing it from the dictionary.`,      sample_input: 'Voyager\n17\n0',
      sample_output: 'Voyager\n17\n0',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['dictionaries', 'key-value pairs', 'dictionary creation', 'accessing values'],
        estimated_time_minutes: 10
      },
      // Session-level content
      session_title: 'Session 3: Dictionary (Syntax & Basic Operations)',

      // Case-specific content
      case_number: 1,
      case_title: 'Creating and Accessing a Dictionary',
      case_overview: `Learn the fundamentals of creating dictionaries in Python. Understand how to define key-value pairs and access values using their keys.`,
      case_code: `# Creating a Dictionary - Basic Syntax
# A dictionary stores data in key-value pairs

robot = {
    "model": "R2D2",
    "year": 1977,
    "active": True
}

# Access values using square brackets and key name
print(robot["model"])    # Prints: R2D2
print(robot["year"])     # Prints: 1977
print(robot["active"])   # Prints: True

# Note: Keys must match exactly (case-sensitive)`,
      case_explanation: `Create dictionary with 3 key-value pairs. Access values using dict[key] syntax.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 73 if it exists
    await problemsCollection.deleteOne({ problem_id: 73 });
    await testCasesCollection.deleteMany({ problem_id: 73 });

    // Insert problem 73
    const problemResult = await problemsCollection.insertOne(problem73);
    console.log('Problem 73 inserted');

    // Test cases for Problem 73 (2 visible + 5 hidden = 7 total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 731,
        problem_id: 73,
        input: 'Voyager\n17\n0',
        expected_output: 'Voyager\n17\n0',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 732,
        problem_id: 73,
        input: 'Apollo\n11\n3',
        expected_output: 'Apollo\n11\n3',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 733,
        problem_id: 73,
        input: 'Orion\n25\n6',
        expected_output: 'Orion\n25\n6',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 734,
        problem_id: 73,
        input: 'Discovery\n28\n7',
        expected_output: 'Discovery\n28\n7',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 735,
        problem_id: 73,
        input: 'Endeavour\n25\n8',
        expected_output: 'Endeavour\n25\n8',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 736,
        problem_id: 73,
        input: 'Starship\n30\n100',
        expected_output: 'Starship\n30\n100',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 737,
        problem_id: 73,
        input: 'Falcon\n20\n9',
        expected_output: 'Falcon\n20\n9',
        is_hidden: true,
        weight: 14
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 73`);

    console.log('\n✅ Problem 73 (Level 2, Session 3, Case 1: Creating and Accessing a Dictionary) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem73()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
