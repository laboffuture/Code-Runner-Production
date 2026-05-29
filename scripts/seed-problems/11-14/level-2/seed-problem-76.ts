import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem76() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 76: Level 2, Session 3, Case 4 - Iterating over Dictionaries
    const problem76 = {
      problem_id: 76,
      session_id: 14, // Level 2, Session 3
      title: 'Iterating over Dictionaries',
      description: 'Learn to iterate through dictionary keys and values using loops.',
      difficulty: 'Easy',
      question: `Create a dictionary 'planets' where each planet name maps to its moon count. Use a for loop with dict.items() to iterate through all key-value pairs and print "[planet] has [moons] moons" for each entry.`,      sample_input: '3\nMars 2\nJupiter 79\nSaturn 82',
      sample_output: 'Mars has 2 moons\nJupiter has 79 moons\nSaturn has 82 moons',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['dictionaries', 'iteration', 'for loops', 'dictionary methods', 'items()'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 3: Dictionary (Syntax & Basic Operations)',

      // Case-specific content
      case_number: 4,
      case_title: 'Iterating over Dictionaries',
      case_overview: `Learn how to loop through dictionaries to access all keys and values. Use the items() method to iterate through key-value pairs together.`,
      case_code: `# Iterating Through Dictionary with .items()
crew_roles = {
    "captain": "Kirk",
    "engineer": "Scotty",
    "doctor": "McCoy"
}

# Loop through all key-value pairs
for role, name in crew_roles.items():
    print(f"{role}: {name}")

# Output:
# captain: Kirk
# engineer: Scotty
# doctor: McCoy

# Use for key, value in dict.items() to iterate`,
      case_explanation: `Build dictionary from N input pairs. Loop with for key, value in dict.items() to print formatted output.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 76 if it exists
    await problemsCollection.deleteOne({ problem_id: 76 });
    await testCasesCollection.deleteMany({ problem_id: 76 });

    // Insert problem 76
    const problemResult = await problemsCollection.insertOne(problem76);
    console.log('Problem 76 inserted');

    // Test cases for Problem 76 (2 visible + 5 hidden = 7 total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 761,
        problem_id: 76,
        input: '3\nMars 2\nJupiter 79\nSaturn 82',
        expected_output: 'Mars has 2 moons\nJupiter has 79 moons\nSaturn has 82 moons',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 762,
        problem_id: 76,
        input: '2\nEarth 1\nVenus 0',
        expected_output: 'Earth has 1 moons\nVenus has 0 moons',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 763,
        problem_id: 76,
        input: '4\nMercury 0\nMars 2\nNeptune 14\nUranus 27',
        expected_output: 'Mercury has 0 moons\nMars has 2 moons\nNeptune has 14 moons\nUranus has 27 moons',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 764,
        problem_id: 76,
        input: '1\nPluto 5',
        expected_output: 'Pluto has 5 moons',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 765,
        problem_id: 76,
        input: '5\nMercury 0\nVenus 0\nEarth 1\nMars 2\nJupiter 79',
        expected_output: 'Mercury has 0 moons\nVenus has 0 moons\nEarth has 1 moons\nMars has 2 moons\nJupiter has 79 moons',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 766,
        problem_id: 76,
        input: '2\nSaturn 82\nUranus 27',
        expected_output: 'Saturn has 82 moons\nUranus has 27 moons',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 767,
        problem_id: 76,
        input: '3\nEarth 1\nNeptune 14\nPluto 5',
        expected_output: 'Earth has 1 moons\nNeptune has 14 moons\nPluto has 5 moons',
        is_hidden: true,
        weight: 14
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 76`);

    console.log('\n✅ Problem 76 (Level 2, Session 3, Case 4: Iterating over Dictionaries) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem76()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
