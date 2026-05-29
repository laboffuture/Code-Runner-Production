import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem229() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 229: Level 4, Session 8, Case 6 - Galactic Data Command Center
    const problem229 = {
      problem_id: 229,
      session_id: 41, // Level 4, Session 8
      title: 'Galactic Data Command Center – Navigating the Cosmic Archives',
      description: 'Build a comprehensive file management system using OS module and exception handling for mission-critical operations.',
      difficulty: 'Hard',
      question: `Read folder name, filename, and 3 updates from input (5 lines). Build file management system:

1. Create folder with os.mkdir() if it doesn't exist (check os.path.exists()). Print "Command Center created." or "Folder already exists."

2. Inside folder, create file using writelines() with the 3 updates (add \\n to each). Print "Mission entries added."

3. Read and print file content with try-except. If FileNotFoundError, print "File not found."

4. Rename file to add "_archive" before .txt using os.rename(). Print "File renamed successfully."

5. Append "Emergency alert activated\\n" to renamed file. Print "Update saved!"

6. Try deleting "[folder]/temp_log.txt" with os.remove() and try-except. Print "Temp log deleted." or "Temp log not found."`,
      sample_input: 'Command_Center\ndiagnostics.txt\nEngine check complete\nFuel levels optimal\nNavigation system aligned',
      sample_output: 'Command Center created.\nMission entries added.\nEngine check complete\nFuel levels optimal\nNavigation system aligned\nFile renamed successfully.\nUpdate saved!\nTemp log not found.',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['OS module', 'file operations', 'exception handling', 'os.mkdir()', 'os.rename()', 'os.remove()', 'comprehensive system', 'FileNotFoundError', 'FileExistsError'],
        estimated_time_minutes: 35
      },

      // Session-level content
      session_title: 'Session 8: OS Module and File Handling with Exception Handling',

      // Case-specific content
      case_number: 6,
      case_title: 'Galactic Data Command Center – Navigating the Cosmic Archives',
      case_overview: `Cadets become Mission Data Managers, designing the Galactic Data Command Center—a secure system to manage mission files, diagnostics, and data logs. The task is to perform comprehensive file and folder operations using the OS module while protecting the mission with robust exception handling.`,
      case_explanation: `Implement a complete file management system combining all OS module operations: folder creation with os.mkdir(), file writing with writelines(), safe reading with try-except, file renaming with os.rename(), appending updates, and safe deletion with os.remove(). This demonstrates mastery of OS module integration with exception handling for production-ready file management.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 229 if it exists
    await problemsCollection.deleteOne({ problem_id: 229 });
    await testCasesCollection.deleteMany({ problem_id: 229 });

    // Insert problem 229
    const problemResult = await problemsCollection.insertOne(problem229);
    console.log('Problem 229 inserted');

    // Test cases for Problem 229
    const testCases = [
      {
        test_case_id: 2291,
        problem_id: 229,
        input: 'Command_Center\ndiagnostics.txt\nEngine check complete\nFuel levels optimal\nNavigation system aligned',
        expected_output: 'Command Center created.\nMission entries added.\nEngine check complete\nFuel levels optimal\nNavigation system aligned\nFile renamed successfully.\nUpdate saved!\nTemp log not found.',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2292,
        problem_id: 229,
        input: 'Mission_Hub\nstatus.txt\nShields activated\nCrew ready\nLaunch sequence initiated',
        expected_output: 'Command Center created.\nMission entries added.\nShields activated\nCrew ready\nLaunch sequence initiated\nFile renamed successfully.\nUpdate saved!\nTemp log not found.',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 229`);

    console.log('\n✅ Problem 229 (Level 4, Session 8, Case 6: Galactic Data Command Center) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem229()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
