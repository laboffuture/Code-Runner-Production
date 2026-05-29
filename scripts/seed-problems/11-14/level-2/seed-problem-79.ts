import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem79() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 79: Level 2, Session 4, Case 1 - Accessing and Updating Values with .get() and []
    const problem79 = {
      problem_id: 79,
      session_id: 15, // Level 2, Session 4
      title: 'Accessing and Updating Values with .get() and []',
      description: 'Learn to safely access dictionary values using both square bracket notation and the .get() method.',
      difficulty: 'Easy',
      question: `Create a dictionary 'spacecraft' with three keys: "name" (first input), "speed" (2500), and "crew" (5). Read second input as key1, access spacecraft[key1] and print it. Read third input as key2, access spacecraft.get(key2) and print it. Read fourth input as new_speed, convert to integer, update spacecraft["speed"] with it and print spacecraft["speed"].`,      sample_input: 'Phoenix\nname\ncrew\n3000',
      sample_output: 'Phoenix\n5\n3000',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['dictionary access', 'square bracket notation', '.get() method', 'updating values', 'safe access'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 4: Advanced Dictionary Operations and Dictionary Methods',

      // Case-specific content
      case_number: 1,
      case_title: 'Accessing and Updating Values with .get() and []',
      case_overview: `Learn two methods to access dictionary values: square brackets [] for direct access and .get() for safe access. Practice updating dictionary values.`,
      case_code: `# Dictionary Access Methods
robot = {
    "model": "R2D2",
    "year": 1977
}

# Access with []
print(robot["model"])  # Prints: R2D2

# Access with .get()
print(robot.get("year"))  # Prints: 1977

# Update value
robot["year"] = 2024
print(robot["year"])  # Prints: 2024`,
      case_explanation: `Create dictionary with name from input, speed=2500, crew=5. Read two keys and access them using [] and .get(). Read new speed value, update using spacecraft["speed"]=new_value, then print.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 79 if it exists
    await problemsCollection.deleteOne({ problem_id: 79 });
    await testCasesCollection.deleteMany({ problem_id: 79 });

    // Insert problem 79
    const problemResult = await problemsCollection.insertOne(problem79);
    console.log('Problem 79 inserted');

    // Test cases for Problem 79 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 791,
        problem_id: 79,
        input: 'Phoenix\nname\ncrew\n3000',
        expected_output: 'Phoenix\n5\n3000',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 792,
        problem_id: 79,
        input: 'Voyager\nspeed\nname\n2800',
        expected_output: '2500\nVoyager\n2800',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 793,
        problem_id: 79,
        input: 'Enterprise\ncrew\nspeed\n3500',
        expected_output: '5\n2500\n3500',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 794,
        problem_id: 79,
        input: 'Discovery\nname\nname\n4000',
        expected_output: 'Discovery\nDiscovery\n4000',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 795,
        problem_id: 79,
        input: 'Atlantis\nspeed\ncrew\n2200',
        expected_output: '2500\n5\n2200',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 796,
        problem_id: 79,
        input: 'Challenger\ncrew\ncrew\n3200',
        expected_output: '5\n5\n3200',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 797,
        problem_id: 79,
        input: 'Columbia\nname\nspeed\n2600',
        expected_output: 'Columbia\n2500\n2600',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 79`);

    console.log('\n✅ Problem 79 (Level 2, Session 4, Case 1: Accessing and Updating Values with .get() and []) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem79()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
