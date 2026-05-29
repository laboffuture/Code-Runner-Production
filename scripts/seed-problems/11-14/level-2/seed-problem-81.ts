import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem81() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 81: Level 2, Session 4, Case 3 - Using .update() and .setdefault()
    const problem81 = {
      problem_id: 81,
      session_id: 15, // Level 2, Session 4
      title: 'Using .update() and .setdefault()',
      description: 'Learn to use .update() to merge dictionaries and .setdefault() to safely add keys with default values.',
      difficulty: 'Easy',
      question: `Create a dictionary from N items. Use .update() to add/update M more items. Use .setdefault() to ensure one more item exists with default value 0. Print all items in format "item: quantity".`,      sample_input: '2\nFuel\n1000\nFood\n500\n2\nWater\n300\nFuel\n1500\nOxygen',
      sample_output: 'Fuel: 1500\nFood: 500\nWater: 300\nOxygen: 0',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['.update() method', '.setdefault() method', 'dictionary modification', 'default values', 'merging dictionaries'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 4: Advanced Dictionary Operations and Dictionary Methods',

      // Case-specific content
      case_number: 3,
      case_title: 'Using .update() and .setdefault()',
      case_overview: `Learn .update() to merge dictionaries and add/update multiple items, and .setdefault() to safely add keys with default values.`,
      case_code: `# Dictionary Update Methods
game_scores = {"Level1": 50}

# Add multiple scores at once
new_scores = {"Level2": 75, "Level3": 90}
game_scores.update(new_scores)

# Setdefault for bonus level
game_scores.setdefault("Bonus", 100)

# Print all
for level, score in game_scores.items():
    print(f"{level}: {score}")`,
      case_explanation: `Use dict.update(other_dict) to merge or add items. Use dict.setdefault(key, default) to add key with default if missing.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 81 if it exists
    await problemsCollection.deleteOne({ problem_id: 81 });
    await testCasesCollection.deleteMany({ problem_id: 81 });

    // Insert problem 81
    const problemResult = await problemsCollection.insertOne(problem81);
    console.log('Problem 81 inserted');

    // Test cases for Problem 81 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 811,
        problem_id: 81,
        input: '2\nFuel\n1000\nFood\n500\n2\nWater\n300\nFuel\n1500\nOxygen',
        expected_output: 'Fuel: 1500\nFood: 500\nWater: 300\nOxygen: 0',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 812,
        problem_id: 81,
        input: '1\nShields\n100\n2\nWeapons\n75\nShields\n150\nEngines',
        expected_output: 'Shields: 150\nWeapons: 75\nEngines: 0',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 813,
        problem_id: 81,
        input: '3\nMetal\n500\nCrystals\n200\nGas\n300\n1\nMetal\n800\nOre',
        expected_output: 'Metal: 800\nCrystals: 200\nGas: 300\nOre: 0',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 814,
        problem_id: 81,
        input: '2\nCrew\n5\nOxygen\n1000\n3\nFood\n500\nWater\n300\nCrew\n7\nFuel',
        expected_output: 'Crew: 7\nOxygen: 1000\nFood: 500\nWater: 300\nFuel: 0',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 815,
        problem_id: 81,
        input: '1\nPower\n2000\n1\nPower\n2500\nBackup',
        expected_output: 'Power: 2500\nBackup: 0',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 816,
        problem_id: 81,
        input: '4\nA\n10\nB\n20\nC\n30\nD\n40\n2\nE\n50\nA\n15\nF',
        expected_output: 'A: 15\nB: 20\nC: 30\nD: 40\nE: 50\nF: 0',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 817,
        problem_id: 81,
        input: '2\nScans\n100\nSamples\n50\n1\nData\n200\nScans',
        expected_output: 'Scans: 100\nSamples: 50\nData: 200',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 81`);

    console.log('\n✅ Problem 81 (Level 2, Session 4, Case 3: Using .update() and .setdefault()) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem81()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
