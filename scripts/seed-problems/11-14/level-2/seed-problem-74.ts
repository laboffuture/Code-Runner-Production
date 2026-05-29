import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem74() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 74: Level 2, Session 3, Case 2 - Adding and Updating Entries
    const problem74 = {
      problem_id: 74,
      session_id: 14, // Level 2, Session 3
      title: 'Adding and Updating Entries',
      description: 'Learn to add new key-value pairs to dictionaries and update existing values.',
      difficulty: 'Easy',
      question: `Create a dictionary called 'rocket' with keys "name" and "launches" from the first two inputs. Add a new key "status" with the third input value. Then print all three values.`,      sample_input: 'Falcon\n15\nActive',
      sample_output: 'Falcon\n15\nActive',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['dictionaries', 'adding entries', 'updating values', 'dictionary modification'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 3: Dictionary (Syntax & Basic Operations)',

      // Case-specific content
      case_number: 2,
      case_title: 'Adding and Updating Entries',
      case_overview: `Learn how to modify dictionaries by adding new key-value pairs and updating existing values. Dictionaries are mutable, meaning you can change them after creation.`,
      case_code: `# Adding New Key-Value Pairs to Dictionary
mission = {}

# Add entries one by one
mission["destination"] = "Mars"
mission["duration"] = 180
mission["type"] = "Exploration"

print(mission["destination"])  # Prints: Mars
print(mission["duration"])     # Prints: 180
print(mission["type"])         # Prints: Exploration

# Use dict[new_key] = value to add new entries`,
      case_explanation: `Initialize dictionary with 2 pairs, add third pair using dict[key] = value. Print all values.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 74 if it exists
    await problemsCollection.deleteOne({ problem_id: 74 });
    await testCasesCollection.deleteMany({ problem_id: 74 });

    // Insert problem 74
    const problemResult = await problemsCollection.insertOne(problem74);
    console.log('Problem 74 inserted');

    // Test cases for Problem 74 (2 visible + 5 hidden = 7 total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 741,
        problem_id: 74,
        input: 'Falcon\n15\nActive',
        expected_output: 'Falcon\n15\nActive',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 742,
        problem_id: 74,
        input: 'Dragon\n10\nInactive',
        expected_output: 'Dragon\n10\nInactive',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 743,
        problem_id: 74,
        input: 'Starship\n5\nActive',
        expected_output: 'Starship\n5\nActive',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 744,
        problem_id: 74,
        input: 'Atlas\n25\nActive',
        expected_output: 'Atlas\n25\nActive',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 745,
        problem_id: 74,
        input: 'Soyuz\n20\nInactive',
        expected_output: 'Soyuz\n20\nInactive',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 746,
        problem_id: 74,
        input: 'Ariane\n13\nActive',
        expected_output: 'Ariane\n13\nActive',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 747,
        problem_id: 74,
        input: 'Vega\n8\nInactive',
        expected_output: 'Vega\n8\nInactive',
        is_hidden: true,
        weight: 14
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 74`);

    console.log('\n✅ Problem 74 (Level 2, Session 3, Case 2: Adding and Updating Entries) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem74()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
