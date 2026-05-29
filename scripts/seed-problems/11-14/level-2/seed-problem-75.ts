import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem75() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 75: Level 2, Session 3, Case 3 - Removing Entries
    const problem75 = {
      problem_id: 75,
      session_id: 14, // Level 2, Session 3
      title: 'Removing Entries from a Dictionary',
      description: 'Learn to remove key-value pairs from dictionaries using the del keyword.',
      difficulty: 'Easy',
      question: `Create a dictionary called 'station' with keys "name", "capacity", and "altitude" from three inputs. Use the del keyword to remove the key specified by the fourth input. Then print the remaining values (name and the value that wasn't removed).`,      sample_input: 'ISS\n6\n408\ncapacity',
      sample_output: 'ISS\n408',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['dictionaries', 'removing entries', 'del keyword', 'dictionary modification'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 3: Dictionary (Syntax & Basic Operations)',

      // Case-specific content
      case_number: 3,
      case_title: 'Removing Entries from a Dictionary',
      case_overview: `Learn how to remove entries from dictionaries using the del keyword. This allows you to clean up unnecessary data or remove outdated information from your dictionaries.`,
      case_code: `# Removing Entries from Dictionary using del
inventory = {
    "fuel": 1000,
    "oxygen": 500,
    "water": 300
}

# Delete a specific key-value pair
del inventory["water"]

print(inventory["fuel"])    # Prints: 1000
print(inventory["oxygen"])  # Prints: 500
# water key no longer exists

# Use: del dict_name[key_to_remove]`,
      case_explanation: `Create dictionary with 3 pairs. Use del dict[key] to remove specified entry. Print remaining values.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 75 if it exists
    await problemsCollection.deleteOne({ problem_id: 75 });
    await testCasesCollection.deleteMany({ problem_id: 75 });

    // Insert problem 75
    const problemResult = await problemsCollection.insertOne(problem75);
    console.log('Problem 75 inserted');

    // Test cases for Problem 75 (2 visible + 5 hidden = 7 total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 751,
        problem_id: 75,
        input: 'ISS\n6\n408\ncapacity',
        expected_output: 'ISS\n408',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 752,
        problem_id: 75,
        input: 'Skylab\n3\n435\naltitude',
        expected_output: 'Skylab\n3',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 753,
        problem_id: 75,
        input: 'Mir\n4\n350\ncapacity',
        expected_output: 'Mir\n350',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 754,
        problem_id: 75,
        input: 'Tiangong\n3\n400\naltitude',
        expected_output: 'Tiangong\n3',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 755,
        problem_id: 75,
        input: 'Salyut\n2\n260\ncapacity',
        expected_output: 'Salyut\n260',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 756,
        problem_id: 75,
        input: 'Gateway\n4\n430\naltitude',
        expected_output: 'Gateway\n4',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 757,
        problem_id: 75,
        input: 'Orbital\n8\n500\ncapacity',
        expected_output: 'Orbital\n500',
        is_hidden: true,
        weight: 14
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 75`);

    console.log('\n✅ Problem 75 (Level 2, Session 3, Case 3: Removing Entries) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem75()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
