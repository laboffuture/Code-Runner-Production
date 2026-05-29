import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem80() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 80: Level 2, Session 4, Case 2 - Looping through .items(), .keys(), and .values()
    const problem80 = {
      problem_id: 80,
      session_id: 15, // Level 2, Session 4
      title: 'Looping through .items(), .keys(), and .values()',
      description: 'Learn to iterate through dictionaries using .items(), .keys(), and .values() methods.',
      difficulty: 'Easy',
      question: `Create a dictionary with planet names and moon counts from N inputs. Loop through and print all keys using .keys(). Loop through and print all values using .values(). Loop through and print all pairs using .items() in format "planet: moons".`,      sample_input: '2\nMars\n2\nJupiter\n79',
      sample_output: 'Mars\nJupiter\n2\n79\nMars: 2\nJupiter: 79',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['dictionary iteration', '.items()', '.keys()', '.values()', 'for loops', 'dictionary methods'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 4: Advanced Dictionary Operations and Dictionary Methods',

      // Case-specific content
      case_number: 2,
      case_title: 'Looping through .items(), .keys(), and .values()',
      case_overview: `Learn three ways to loop through dictionaries: .keys() for keys only, .values() for values only, and .items() for key-value pairs together.`,
      case_code: `# Dictionary Loop Methods
crew = {"Alice": 5, "Bob": 3, "Charlie": 7}

# Loop through keys
for name in crew.keys():
    print(name)  # Prints: Alice, Bob, Charlie

# Loop through values
for years in crew.values():
    print(years)  # Prints: 5, 3, 7

# Loop through key-value pairs
for name, years in crew.items():
    print(f"{name}: {years}")  # Prints: Alice: 5, etc.`,
      case_explanation: `Use dict.keys() to iterate keys, dict.values() to iterate values, dict.items() to iterate key-value pairs.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 80 if it exists
    await problemsCollection.deleteOne({ problem_id: 80 });
    await testCasesCollection.deleteMany({ problem_id: 80 });

    // Insert problem 80
    const problemResult = await problemsCollection.insertOne(problem80);
    console.log('Problem 80 inserted');

    // Test cases for Problem 80 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 801,
        problem_id: 80,
        input: '2\nMars\n2\nJupiter\n79',
        expected_output: 'Mars\nJupiter\n2\n79\nMars: 2\nJupiter: 79',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 802,
        problem_id: 80,
        input: '3\nEarth\n1\nVenus\n0\nMercury\n0',
        expected_output: 'Earth\nVenus\nMercury\n1\n0\n0\nEarth: 1\nVenus: 0\nMercury: 0',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 803,
        problem_id: 80,
        input: '1\nSaturn\n82',
        expected_output: 'Saturn\n82\nSaturn: 82',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 804,
        problem_id: 80,
        input: '4\nMars\n2\nJupiter\n79\nSaturn\n82\nUranus\n27',
        expected_output: 'Mars\nJupiter\nSaturn\nUranus\n2\n79\n82\n27\nMars: 2\nJupiter: 79\nSaturn: 82\nUranus: 27',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 805,
        problem_id: 80,
        input: '2\nNeptune\n14\nPluto\n5',
        expected_output: 'Neptune\nPluto\n14\n5\nNeptune: 14\nPluto: 5',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 806,
        problem_id: 80,
        input: '5\nEarth\n1\nMars\n2\nJupiter\n79\nSaturn\n82\nNeptune\n14',
        expected_output: 'Earth\nMars\nJupiter\nSaturn\nNeptune\n1\n2\n79\n82\n14\nEarth: 1\nMars: 2\nJupiter: 79\nSaturn: 82\nNeptune: 14',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 807,
        problem_id: 80,
        input: '3\nTitan\n1\nEuropa\n1\nGanymede\n1',
        expected_output: 'Titan\nEuropa\nGanymede\n1\n1\n1\nTitan: 1\nEuropa: 1\nGanymede: 1',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 80`);

    console.log('\n✅ Problem 80 (Level 2, Session 4, Case 2: Looping through .items(), .keys(), and .values()) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem80()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
