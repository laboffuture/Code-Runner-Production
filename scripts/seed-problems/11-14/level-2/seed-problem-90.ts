import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem90() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 90: Level 2, Session 5, Case 6 - Cosmic Data Archives
    const problem90 = {
      problem_id: 90,
      session_id: 16, // Level 2, Session 5
      title: 'Cosmic Data Archives',
      description: `Electromagnetic interference from Erevos-7 causes random memory overwrites aboard NOVA-12! The crew must create sealed snapshots of critical mission parameters that cannot be accidentally modified during system spikes.

Create the Cosmic Data Archives system that stores mission-critical data in immutable tuple snapshots with integrity verification and redundancy.`,
      difficulty: 'Hard',
      question: `Read 5 inputs: name (string), year (convert to int), target (string), crew (convert to int), status (string). Create a tuple with these values and print it. Print the length of tuple. Print last 2 elements using slicing. Read query and check if it's in the tuple - print "Found" if yes, "Not Found" if no. Read R (int) and print the tuple repeated R times using * operator.`,      sample_input: 'Apollo11\n1969\nMoon\n3\nCompleted\nMoon\n2',
      sample_output: '(\'Apollo11\', 1969, \'Moon\', 3, \'Completed\')\n5\n(3, \'Completed\')\nFound\n(\'Apollo11\', 1969, \'Moon\', 3, \'Completed\', \'Apollo11\', 1969, \'Moon\', 3, \'Completed\')',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 3,
      max_score: 150,

      metadata: {
        space_theme: true,
        story_linked: true,
        is_final_task: true,
        is_capstone: true,
        concepts: [
          'tuples',
          'tuple creation',
          'len()',
          'slicing',
          'membership testing',
          'in operator',
          'repetition',
          'mixed data types',
          'integration'
        ],
        estimated_time_minutes: 25
      },
      // Session-level content
      session_title: 'Session 5: Tuples (Built-in Methods, Functions, and Operations)',

      // Case-specific content
      case_number: 6,
      case_title: 'Cosmic Data Archives',
      case_explanation: `Read inputs: name (str), year (int), target (str), crew (int), status (str). Create tuple = (name, year, target, crew, status). Print tuple, len(tuple), tuple[-2:]. Read query, use 'query in tuple' to check, print result. Read R, print tuple * R.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 90 if it exists
    await problemsCollection.deleteOne({ problem_id: 90 });
    await testCasesCollection.deleteMany({ problem_id: 90 });

    // Insert problem 90
    const problemResult = await problemsCollection.insertOne(problem90);
    console.log('Problem 90 inserted');

    // Test cases for Problem 90 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 901,
        problem_id: 90,
        input: 'Apollo11\n1969\nMoon\n3\nCompleted\nMoon\n2',
        expected_output: '(\'Apollo11\', 1969, \'Moon\', 3, \'Completed\')\n5\n(3, \'Completed\')\nFound\n(\'Apollo11\', 1969, \'Moon\', 3, \'Completed\', \'Apollo11\', 1969, \'Moon\', 3, \'Completed\')',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 902,
        problem_id: 90,
        input: 'Voyager1\n1977\nInterstellar\n0\nActive\nActive\n1',
        expected_output: '(\'Voyager1\', 1977, \'Interstellar\', 0, \'Active\')\n5\n(0, \'Active\')\nFound\n(\'Voyager1\', 1977, \'Interstellar\', 0, \'Active\')',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 903,
        problem_id: 90,
        input: 'Artemis1\n2024\nMoon\n4\nActive\nMars\n3',
        expected_output: '(\'Artemis1\', 2024, \'Moon\', 4, \'Active\')\n5\n(4, \'Active\')\nNot Found\n(\'Artemis1\', 2024, \'Moon\', 4, \'Active\', \'Artemis1\', 2024, \'Moon\', 4, \'Active\', \'Artemis1\', 2024, \'Moon\', 4, \'Active\')',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 904,
        problem_id: 90,
        input: 'Perseverance\n2020\nMars\n0\nCompleted\nCompleted\n2',
        expected_output: '(\'Perseverance\', 2020, \'Mars\', 0, \'Completed\')\n5\n(0, \'Completed\')\nFound\n(\'Perseverance\', 2020, \'Mars\', 0, \'Completed\', \'Perseverance\', 2020, \'Mars\', 0, \'Completed\')',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 905,
        problem_id: 90,
        input: 'Hubble\n1990\nOrbit\n5\nActive\nOrbit\n4',
        expected_output: '(\'Hubble\', 1990, \'Orbit\', 5, \'Active\')\n5\n(5, \'Active\')\nFound\n(\'Hubble\', 1990, \'Orbit\', 5, \'Active\', \'Hubble\', 1990, \'Orbit\', 5, \'Active\', \'Hubble\', 1990, \'Orbit\', 5, \'Active\', \'Hubble\', 1990, \'Orbit\', 5, \'Active\')',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 906,
        problem_id: 90,
        input: 'Pioneer10\n1972\nJupiter\n0\nCompleted\nSaturn\n1',
        expected_output: '(\'Pioneer10\', 1972, \'Jupiter\', 0, \'Completed\')\n5\n(0, \'Completed\')\nNot Found\n(\'Pioneer10\', 1972, \'Jupiter\', 0, \'Completed\')',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 907,
        problem_id: 90,
        input: 'Cassini\n1997\nSaturn\n7\nCompleted\nSaturn\n2',
        expected_output: '(\'Cassini\', 1997, \'Saturn\', 7, \'Completed\')\n5\n(7, \'Completed\')\nFound\n(\'Cassini\', 1997, \'Saturn\', 7, \'Completed\', \'Cassini\', 1997, \'Saturn\', 7, \'Completed\')',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 90`);

    console.log('\n✅ Problem 90 (Level 2, Session 5, Case 6: Mission Tuple Data - Final Challenge) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem90()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
