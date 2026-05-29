import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem196() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 196: Level 4, Session 3, Case 3 - Creating Custom Exception Classes
    const problem196 = {
      problem_id: 196,
      session_id: 36, // Level 4, Session 3
      title: 'Creating Custom Exception Classes',
      description: 'Learn to create custom exception classes to simulate specific space anomalies with class-based exception structures.',
      difficulty: 'Medium',
      question: `Define a custom exception class called TransmissionCorrupted that inherits from Exception. Check if a data packet status is "corrupted". If it is, raise the TransmissionCorrupted exception with the message "Data transmission corrupted!". If status is "clear", print "Transmission successful."`,      sample_input: 'corrupted',
      sample_output: 'Data transmission corrupted!',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['custom exceptions', 'class-based exceptions', 'Exception inheritance', 'raise with custom class'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 3: Finally Block and User-Defined Exceptions',

      // Case-specific content
      case_number: 3,
      case_title: 'Creating Custom Exception Classes',
      case_overview: `Build your own exceptions to simulate space anomalies like sensor malfunctions or corrupted transmissions using Python class-based exception structures.`,
      case_explanation: `Define class TransmissionCorrupted(Exception): pass. Check input status. If "corrupted", raise TransmissionCorrupted("Data transmission corrupted!"). If "clear", print success message.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 196 if it exists
    await problemsCollection.deleteOne({ problem_id: 196 });
    await testCasesCollection.deleteMany({ problem_id: 196 });

    // Insert problem 196
    const problemResult = await problemsCollection.insertOne(problem196);
    console.log('Problem 196 inserted');

    // Test cases for Problem 196
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1961,
        problem_id: 196,
        input: 'corrupted',
        expected_output: 'Data transmission corrupted!',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1962,
        problem_id: 196,
        input: 'clear',
        expected_output: 'Transmission successful.',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1963,
        problem_id: 196,
        input: 'corrupted',
        expected_output: 'Data transmission corrupted!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1964,
        problem_id: 196,
        input: 'clear',
        expected_output: 'Transmission successful.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1965,
        problem_id: 196,
        input: 'corrupted',
        expected_output: 'Data transmission corrupted!',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1966,
        problem_id: 196,
        input: 'clear',
        expected_output: 'Transmission successful.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1967,
        problem_id: 196,
        input: 'corrupted',
        expected_output: 'Data transmission corrupted!',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 196`);

    console.log('\n✅ Problem 196 (Level 4, Session 3, Case 3: Custom Exceptions) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem196()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
