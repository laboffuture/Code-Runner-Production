import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem205() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 205: Level 4, Session 4, Case 6 - Cosmic Data Vault – Archiving Mission Logs
    const problem205 = {
      problem_id: 205,
      session_id: 37, // Level 4, Session 4
      title: 'Cosmic Data Vault – Archiving Mission Logs for Deep-Space Exploration',
      description: 'Build a comprehensive fault-free logging system using all file handling basics to archive mission logs permanently.',
      difficulty: 'Hard',
      question: `Build a mission logging system with 4 steps:

Step 1: Create mission_log.txt and write "Mission started successfully.\\n" Print "Mission log created"

Step 2: Append "Oxygen levels stable\\n" and "Engines checked\\n" to the file. Print "System updates appended"

Step 3: Read the entire file and print its contents (3 lines)

Step 4: Read a message from input, append it with \\n to the file, then print "Log saved!"`,
      sample_input: 'Solar panels deployed',
      sample_output: 'Mission log created\nSystem updates appended\nMission started successfully.\nOxygen levels stable\nEngines checked\nLog saved!\n',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['comprehensive file handling', 'write mode', 'append mode', 'read mode', 'with statement', 'user input', 'time-stamped logs', 'data persistence'],
        estimated_time_minutes: 35
      },

      // Session-level content
      session_title: 'Session 4: Python File Handling Basics',

      // Case-specific content
      case_number: 6,
      case_title: 'Cosmic Data Vault – Archiving Mission Logs for Deep-Space Exploration',
      case_overview: `Build a logging system that writes, appends, and reads mission data. Combine write mode, append mode, and read operations to create permanent mission records.`,
      case_explanation: `Create mission_log.txt with write mode. Append system updates. Read and display all logs. Accept user input and append to file. Print "Log saved!" when done.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 205 if it exists
    await problemsCollection.deleteOne({ problem_id: 205 });
    await testCasesCollection.deleteMany({ problem_id: 205 });

    // Insert problem 205
    const problemResult = await problemsCollection.insertOne(problem205);
    console.log('Problem 205 inserted');

    // Test cases for Problem 205
    const testCases = [
      {
        test_case_id: 2051,
        problem_id: 205,
        input: 'Solar panels deployed',
        expected_output: 'Mission log created\nSystem updates appended\nMission started successfully.\nOxygen levels stable\nEngines checked\nLog saved!\n',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2052,
        problem_id: 205,
        input: 'Navigation systems online',
        expected_output: 'Mission log created\nSystem updates appended\nMission started successfully.\nOxygen levels stable\nEngines checked\nLog saved!\n',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 205`);

    console.log('\n✅ Problem 205 (Level 4, Session 4, Case 6: Cosmic Data Vault) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem205()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
