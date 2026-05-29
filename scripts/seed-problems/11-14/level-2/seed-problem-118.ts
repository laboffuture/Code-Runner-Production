import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem118() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 118: Level 2, Session 10, Case 4 - Sorting & Ranging
    const problem118 = {
      problem_id: 118,
      session_id: 21, // Level 2, Session 10
      title: 'Sorting & Ranging',
      description: 'Learn to use sorted() to organize data and range() to create number sequences.',
      difficulty: 'Easy',
      question: `Read 3 strings (one per line), then read two integers start and end. Store the 3 strings in a list. Print sorted(list_of_strings). Then print list(range(start, end+1)).`,      sample_input: 'Fuel\nOxygen\nBattery\n1\n3',
      sample_output: '[\'Battery\', \'Fuel\', \'Oxygen\']\n[1, 2, 3]',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['built-in functions', 'sorted()', 'range()', 'sorting', 'sequences', 'list operations'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 10: Built-in Functions Mastery',

      // Case-specific content
      case_number: 4,
      case_title: 'Sorting & Ranging',
      case_overview: `Master sorting and sequences - use sorted() to organize data and range() to create number sequences.`,
      case_code: `# Using sorted() and range()
items = ['Rocket', 'Fuel', 'Oxygen']
sorted_items = sorted(items)
print(sorted_items)  # Prints: ['Fuel', 'Oxygen', 'Rocket']

numbers = list(range(1, 5))
print(numbers)  # Prints: [1, 2, 3, 4]`,
      case_explanation: `Read 3 strings into a list. Use sorted() to sort them alphabetically and print. Use list(range(start, end+1)) to create list from start to end (inclusive) and print.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 118 if it exists
    await problemsCollection.deleteOne({ problem_id: 118 });
    await testCasesCollection.deleteMany({ problem_id: 118 });

    // Insert problem 118
    const problemResult = await problemsCollection.insertOne(problem118);
    console.log('Problem 118 inserted');

    // Test cases for Problem 118 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1181,
        problem_id: 118,
        input: 'Fuel\nOxygen\nBattery\n1\n3',
        expected_output: '[\'Battery\', \'Fuel\', \'Oxygen\']\n[1, 2, 3]',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1182,
        problem_id: 118,
        input: 'Mars\nEarth\nVenus\n5\n7',
        expected_output: '[\'Earth\', \'Mars\', \'Venus\']\n[5, 6, 7]',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1183,
        problem_id: 118,
        input: 'Alpha\nBeta\nGamma\n10\n12',
        expected_output: '[\'Alpha\', \'Beta\', \'Gamma\']\n[10, 11, 12]',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1184,
        problem_id: 118,
        input: 'Rocket\nShuttle\nProbe\n0\n2',
        expected_output: '[\'Probe\', \'Rocket\', \'Shuttle\']\n[0, 1, 2]',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1185,
        problem_id: 118,
        input: 'Jupiter\nSaturn\nNeptune\n20\n22',
        expected_output: '[\'Jupiter\', \'Neptune\', \'Saturn\']\n[20, 21, 22]',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1186,
        problem_id: 118,
        input: 'Apollo\nGemini\nMercury\n100\n102',
        expected_output: '[\'Apollo\', \'Gemini\', \'Mercury\']\n[100, 101, 102]',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1187,
        problem_id: 118,
        input: 'Orbit\nLaunch\nDocking\n15\n17',
        expected_output: '[\'Docking\', \'Launch\', \'Orbit\']\n[15, 16, 17]',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 118`);

    console.log('\n✅ Problem 118 (Level 2, Session 10, Case 4: Sorting & Ranging) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem118()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
