import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem83() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 83: Level 2, Session 4, Case 5 - Nesting Dictionaries
    const problem83 = {
      problem_id: 83,
      session_id: 15, // Level 2, Session 4
      title: 'Nesting Dictionaries',
      description: 'Learn to create nested dictionaries where values are dictionaries themselves, perfect for storing complex hierarchical data.',
      difficulty: 'Easy',
      question: `Create a nested dictionary with N rockets. Each rocket has "stages" and "height" properties. Query one rocket name and print its height. If rocket not found, print "Not Found".`,      sample_input: '2\nFalcon 9\n2\n70\nAriane 5\n2\n53\nFalcon 9',
      sample_output: '70',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['nested dictionaries', 'dictionaries as values', 'hierarchical data', 'nested access'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 4: Advanced Dictionary Operations and Dictionary Methods',

      // Case-specific content
      case_number: 5,
      case_title: 'Nesting Dictionaries',
      case_overview: `Learn nested dictionaries - dictionaries containing other dictionaries as values. Perfect for organizing complex data with multiple properties.`,
      case_code: `# Nested Dictionaries
library = {
    "Book1": {"author": "Smith", "year": 2020},
    "Book2": {"author": "Jones", "year": 2019}
}

# Access nested data
print(library["Book1"]["author"])

# Check and access
if "Book3" in library:
    print(library["Book3"]["year"])
else:
    print("Book not found")`,
      case_explanation: `Create nested dict where each key has a dictionary as value. Access with dict[outer_key][inner_key].`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 83 if it exists
    await problemsCollection.deleteOne({ problem_id: 83 });
    await testCasesCollection.deleteMany({ problem_id: 83 });

    // Insert problem 83
    const problemResult = await problemsCollection.insertOne(problem83);
    console.log('Problem 83 inserted');

    // Test cases for Problem 83 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 831,
        problem_id: 83,
        input: '2\nFalcon 9\n2\n70\nAriane 5\n2\n53\nFalcon 9',
        expected_output: '70',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 832,
        problem_id: 83,
        input: '3\nAtlas V\n2\n58\nDelta IV\n2\n72\nSoyuz\n3\n46\nDelta IV',
        expected_output: '72',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 833,
        problem_id: 83,
        input: '2\nSaturn V\n3\n110\nN1\n5\n105\nSaturn V',
        expected_output: '110',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 834,
        problem_id: 83,
        input: '1\nStarship\n2\n120\nStarship',
        expected_output: '120',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 835,
        problem_id: 83,
        input: '4\nFalcon Heavy\n2\n70\nVega\n4\n30\nProton\n4\n58\nLong March\n3\n60\nVega',
        expected_output: '30',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 836,
        problem_id: 83,
        input: '2\nAngara\n2\n64\nH-IIB\n2\n56\nH-IIB',
        expected_output: '56',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 837,
        problem_id: 83,
        input: '3\nElectron\n2\n18\nLauncherOne\n2\n20\nFirefly\n2\n29\nUnknown',
        expected_output: 'Not Found',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 83`);

    console.log('\n✅ Problem 83 (Level 2, Session 4, Case 5: Nesting Dictionaries) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem83()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
