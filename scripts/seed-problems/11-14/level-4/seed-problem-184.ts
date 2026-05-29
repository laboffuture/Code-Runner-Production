import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem184() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 184: Level 4, Session 1, Case 3 - Handling Multiple Exceptions
    const problem184 = {
      problem_id: 184,
      session_id: 34, // Level 4, Session 1
      title: 'Handling Multiple Exceptions',
      description: 'Learn to catch multiple exception types in a single program using separate except blocks.',
      difficulty: 'Medium',
      question: `Can you access sensor data safely? Take 3 inputs for sensor readings to create a list, then take an index input. Try to access and print the sensor reading at that index. Handle IndexError by printing "Error: Sensor index out of range!" and ValueError by printing "Error: Please enter a valid number for index!" If successful, print "Sensor Reading:" followed by the value.`,      sample_input: '10\n20\n30\n5',
      sample_output: 'Error: Sensor index out of range!',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['exception handling', 'IndexError', 'ValueError', 'multiple exceptions', 'list access'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 1: Error Detection and Exception Resolution',

      // Case-specific content
      case_number: 3,
      case_title: 'Handling Multiple Exceptions',
      case_overview: `Multiple exception handling allows catching different error types independently using separate except blocks. This keeps code organized and enables specific responses for each error type.`,
      case_explanation: `Create list from 3 inputs. Take index input and use try-except to access list element. Catch IndexError for invalid indices and ValueError for non-numeric inputs with specific error messages.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 184 if it exists
    await problemsCollection.deleteOne({ problem_id: 184 });
    await testCasesCollection.deleteMany({ problem_id: 184 });

    // Insert problem 184
    const problemResult = await problemsCollection.insertOne(problem184);
    console.log('Problem 184 inserted');

    // Test cases for Problem 184
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1841,
        problem_id: 184,
        input: '10\n20\n30\n5',
        expected_output: 'Error: Sensor index out of range!',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1842,
        problem_id: 184,
        input: '10\n20\n30\nabc',
        expected_output: 'Error: Please enter a valid number for index!',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1843,
        problem_id: 184,
        input: '10\n20\n30\n1',
        expected_output: 'Sensor Reading: 20',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1844,
        problem_id: 184,
        input: '50\n60\n70\n10',
        expected_output: 'Error: Sensor index out of range!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1845,
        problem_id: 184,
        input: '15\n25\n35\nxyz',
        expected_output: 'Error: Please enter a valid number for index!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1846,
        problem_id: 184,
        input: '100\n200\n300\n0',
        expected_output: 'Sensor Reading: 100',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1847,
        problem_id: 184,
        input: '40\n50\n60\n2',
        expected_output: 'Sensor Reading: 60',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 184`);

    console.log('\n✅ Problem 184 (Level 4, Session 1, Case 3: Multiple Exceptions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem184()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
