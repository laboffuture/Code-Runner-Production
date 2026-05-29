import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem65() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 65: Level 2, Session 1, Case 5 - Nested Loops with Conditional Logic & Variable Bounds
    const problem65 = {
      problem_id: 65,
      session_id: 12, // Level 2, Session 1
      title: 'Countdown with Condition',
      description: 'Combine nested loops with countdown (negative steps) and conditional logic.',
      difficulty: 'Medium',
      question: `Create a program that monitors satellite signal strength during countdown. Take five inputs: number of satellites, starting signal, ending signal (exclusive), step value (negative), and threshold. Display satellite number and signal strength for each reading. When signal strength drops to or below threshold, print "  Weak" on the next line (2 spaces before Weak).`,      sample_input: '2\n100\n60\n-20\n80',
      sample_output: `1 100
1 80
  Weak
2 100
2 80
  Weak`,

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: false,
        story_linked: false,
        estimated_time_minutes: 30
      },
      // Session-level content
      session_title: 'Session 1: Nested Loops',

      // Case-specific content
      case_number: 5,
      case_title: 'Countdown with Condition',
      case_overview: `Combine nested loops with countdown (negative steps) and conditional checks to monitor signal strength.`,
      case_explanation: `Use a negative step in range() to count down, and check each value with an if statement to detect weak signals.`,
      case_code: `# Monitor temperature readings with alerts using countdown
sensors = int(input())
max_temp = int(input())
min_temp = int(input())
interval = int(input())
danger_level = int(input())

# Outer loop for sensors
for sensor_id in range(1, sensors + 1):
    print(f"Sensor {sensor_id}:")
    # Inner loop counts down temperatures
    for temp in range(max_temp, min_temp, interval):
        print(f"  Temperature: {temp}°C")
        if temp >= danger_level:
            print(f"    DANGER!")`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 65 if it exists
    await problemsCollection.deleteOne({ problem_id: 65 });
    await testCasesCollection.deleteMany({ problem_id: 65 });

    // Insert problem 65
    const problemResult = await problemsCollection.insertOne(problem65);
    console.log('Problem 65 inserted');

    // Test cases for Problem 65
    const testCases = [
      // Visible test cases
      {
        test_case_id: 651,
        problem_id: 65,
        input: '2\n100\n60\n-20\n80',
        expected_output: '1 100\n1 80\n  Weak\n2 100\n2 80\n  Weak',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 652,
        problem_id: 65,
        input: '1\n90\n50\n-20\n70',
        expected_output: '1 90\n1 70\n  Weak',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 653,
        problem_id: 65,
        input: '3\n80\n40\n-20\n60',
        expected_output: '1 80\n1 60\n  Weak\n2 80\n2 60\n  Weak\n3 80\n3 60\n  Weak',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 654,
        problem_id: 65,
        input: '2\n120\n80\n-20\n100',
        expected_output: '1 120\n1 100\n  Weak\n2 120\n2 100\n  Weak',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 655,
        problem_id: 65,
        input: '4\n100\n60\n-20\n80',
        expected_output: '1 100\n1 80\n  Weak\n2 100\n2 80\n  Weak\n3 100\n3 80\n  Weak\n4 100\n4 80\n  Weak',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 656,
        problem_id: 65,
        input: '1\n110\n70\n-20\n90',
        expected_output: '1 110\n1 90\n  Weak',
        is_hidden: true,
        weight: 10
      },
      {
        test_case_id: 657,
        problem_id: 65,
        input: '3\n90\n50\n-20\n70',
        expected_output: '1 90\n1 70\n  Weak\n2 90\n2 70\n  Weak\n3 90\n3 70\n  Weak',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 65`);

    console.log('\n✅ Problem 65 (Level 2, Session 1, Case 5: Nested Loops with Conditional Logic & Variable Bounds) seeded successfully!');

  } catch (error) {
    console.error('Error seeding problem:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem65()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
