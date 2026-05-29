import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem82() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 82: Level 2, Session 4, Case 4 - Removing Items with .pop() and del
    const problem82 = {
      problem_id: 82,
      session_id: 15, // Level 2, Session 4
      title: 'Removing Items with .pop() and del',
      description: 'Learn to remove items from dictionaries using .pop() method and del keyword.',
      difficulty: 'Easy',
      question: `Create a dictionary from N systems. Remove one item using .pop() and print its value. Remove another item using del. Try removing a third item with .pop() and default "Not Found". Print remaining items in format "system: status".`,      sample_input: '4\nShields\n100\nEngines\n80\nWeapons\n60\nSensors\n90\nEngines\nWeapons\nNavigation',
      sample_output: '80\nNot Found\nShields: 100\nSensors: 90',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['.pop() method', 'del keyword', 'removing dictionary items', 'safe removal', 'default values'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 4: Advanced Dictionary Operations and Dictionary Methods',

      // Case-specific content
      case_number: 4,
      case_title: 'Removing Items with .pop() and del',
      case_overview: `Learn two ways to remove dictionary items: .pop() which removes and returns the value, and del which simply removes the key.`,
      case_code: `# Removing Dictionary Items
colors = {"red": "#FF0000", "blue": "#0000FF", "green": "#00FF00"}

# Remove and show
removed = colors.pop("blue")
print(f"Removed: {removed}")

# Safe remove with default
yellow = colors.pop("yellow", "Color not found")
print(yellow)

# Delete without return
del colors["red"]`,
      case_explanation: `Use dict.pop(key) to remove and get value. Use del dict[key] to just remove. Use dict.pop(key, default) for safe removal.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 82 if it exists
    await problemsCollection.deleteOne({ problem_id: 82 });
    await testCasesCollection.deleteMany({ problem_id: 82 });

    // Insert problem 82
    const problemResult = await problemsCollection.insertOne(problem82);
    console.log('Problem 82 inserted');

    // Test cases for Problem 82 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 821,
        problem_id: 82,
        input: '4\nShields\n100\nEngines\n80\nWeapons\n60\nSensors\n90\nEngines\nWeapons\nNavigation',
        expected_output: '80\nNot Found\nShields: 100\nSensors: 90',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 822,
        problem_id: 82,
        input: '3\nPower\n100\nFuel\n200\nOxygen\n300\nFuel\nOxygen\nWater',
        expected_output: '200\nNot Found\nPower: 100',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 823,
        problem_id: 82,
        input: '5\nA\n10\nB\n20\nC\n30\nD\n40\nE\n50\nB\nD\nF',
        expected_output: '20\nNot Found\nA: 10\nC: 30\nE: 50',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 824,
        problem_id: 82,
        input: '2\nCrew\n5\nCargo\n1000\nCrew\nCargo\nDrones',
        expected_output: '5\nNot Found',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 825,
        problem_id: 82,
        input: '3\nRadar\n50\nComms\n75\nScanner\n25\nComms\nScanner\nLaser',
        expected_output: '75\nNot Found\nRadar: 50',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 826,
        problem_id: 82,
        input: '4\nLife\n100\nNav\n80\nThrust\n90\nCooling\n70\nNav\nCooling\nShield',
        expected_output: '80\nNot Found\nLife: 100\nThrust: 90',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 827,
        problem_id: 82,
        input: '2\nMain\n500\nBackup\n250\nMain\nBackup\nEmergency',
        expected_output: '500\nNot Found',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 82`);

    console.log('\n✅ Problem 82 (Level 2, Session 4, Case 4: Removing Items with .pop() and del) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem82()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
