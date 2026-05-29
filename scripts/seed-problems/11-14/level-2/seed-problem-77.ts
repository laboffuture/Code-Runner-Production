import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem77() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 77: Level 2, Session 3, Case 5 - Checking Keys and Using get()
    const problem77 = {
      problem_id: 77,
      session_id: 14, // Level 2, Session 3
      title: 'Checking Keys and Using get()',
      description: 'Learn to safely check if keys exist in dictionaries and use the get() method.',
      difficulty: 'Easy',
      question: `Create a dictionary 'asteroid' with keys "name", "size", and "hazardous" from three inputs. Use dict.get(lookup_key, "Key not found") to safely retrieve the value for the fourth input. Print the result.`,      sample_input: 'Bennu\n500\nYes\nname',
      sample_output: 'Bennu',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['dictionaries', 'get() method', 'checking keys', 'safe access', 'default values'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 3: Dictionary (Syntax & Basic Operations)',

      // Case-specific content
      case_number: 5,
      case_title: 'Checking Keys and Using get()',
      case_overview: `Learn to safely access dictionary values using the get() method. This prevents errors when accessing keys that might not exist and allows you to provide default values.`,
      case_code: `# Safe Access with .get() Method
satellite = {
    "id": "SAT-001",
    "orbit": "LEO",
    "status": "Active"
}

# Accessing existing key
print(satellite.get("id"))           # Prints: SAT-001

# Accessing non-existing key with default
print(satellite.get("weight", "N/A"))  # Prints: N/A

# .get(key, default) prevents KeyError
# Returns default if key doesn't exist`,
      case_explanation: `Create dictionary with 3 pairs. Use dict.get(key, "default") to safely retrieve value or return default.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 77 if it exists
    await problemsCollection.deleteOne({ problem_id: 77 });
    await testCasesCollection.deleteMany({ problem_id: 77 });

    // Insert problem 77
    const problemResult = await problemsCollection.insertOne(problem77);
    console.log('Problem 77 inserted');

    // Test cases for Problem 77 (2 visible + 5 hidden = 7 total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 771,
        problem_id: 77,
        input: 'Bennu\n500\nYes\nname',
        expected_output: 'Bennu',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 772,
        problem_id: 77,
        input: 'Eros\n16\nNo\ncolor',
        expected_output: 'Key not found',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 773,
        problem_id: 77,
        input: 'Apophis\n370\nYes\nsize',
        expected_output: '370',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 774,
        problem_id: 77,
        input: 'Ryugu\n900\nNo\nhazardous',
        expected_output: 'No',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 775,
        problem_id: 77,
        input: 'Vesta\n525\nNo\nmass',
        expected_output: 'Key not found',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 776,
        problem_id: 77,
        input: 'Ceres\n939\nNo\nname',
        expected_output: 'Ceres',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 777,
        problem_id: 77,
        input: 'Pallas\n512\nNo\ndensity',
        expected_output: 'Key not found',
        is_hidden: true,
        weight: 14
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 77`);

    console.log('\n✅ Problem 77 (Level 2, Session 3, Case 5: Checking Keys and Using get()) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem77()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
