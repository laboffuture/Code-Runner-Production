import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem217() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 217: Level 4, Session 6, Case 6 - Galactic Log Keeper
    const problem217 = {
      problem_id: 217,
      session_id: 39, // Level 4, Session 6
      title: 'Galactic Log Keeper – Building Your Mission Logging System',
      description: 'Build a comprehensive mission logging system using all file handling functions to record and retrieve space mission data.',
      difficulty: 'Hard',
      question: `Build the Galactic Log Keeper system - a comprehensive mission logging system where spikes intensify and clean segmentation of logs becomes critical for quick recovery. The team reviews earlier trials and creates a Log Keeper utility with helper functions to append block entries and read them back by section for fast triage.

Complete 6 steps:

Step 1: Create and Write Log Header - Create "galactic_log.txt" in write mode and add the header "--- Galactic Mission Log ---" (with newline). Print "Log initialized"

Step 2: Add Mission Entries - Prepare a list of 3 mission entries: "Navigation system initialized\\n", "Resource scan complete\\n", "Signal received from satellite\\n". Use writelines() to write them all at once. Print "Mission entries added"

Step 3: Read Full Log - Use read() to get the complete content and print it exactly as stored

Step 4: Read Logs Line by Line - Use readline() twice to skip the header and read the second line. Print "Second entry: [content]" where [content] is stripped

Step 5: Display All Lines with Numbering - Use readlines() to get all lines. Print each with format "Log 1: [content]", "Log 2: [content]", etc. (strip each line)

Step 6: Add a User Log Entry - Append the text "Emergency alert activated" to the file (with newline). Print "New log saved successfully"`,      sample_input: '',
      sample_output: 'Log initialized\nMission entries added\n--- Galactic Mission Log ---\nNavigation system initialized\nResource scan complete\nSignal received from satellite\nSecond entry: Navigation system initialized\nLog 1: --- Galactic Mission Log ---\nLog 2: Navigation system initialized\nLog 3: Resource scan complete\nLog 4: Signal received from satellite\nNew log saved successfully',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['comprehensive file handling', 'write()', 'writelines()', 'read()', 'readline()', 'readlines()', 'append mode', 'mission logging', 'multi-step operations'],
        estimated_time_minutes: 35
      },

      // Session-level content
      session_title: 'Session 6: File Handling Functions',

      // Case-specific content
      case_number: 6,
      case_title: 'Galactic Log Keeper – Building Your Mission Logging System',
      case_overview: `Cadets become the official record-keepers of the Galactic Explorer Crew. Build the Galactic Log Keeper, a system that securely records and retrieves mission data throughout the journey. This log helps mission control track progress, decisions, and alerts in real-time. Using all file handling skills, build a system that writes entries, reads specific logs, and displays the full log history.`,
      case_explanation: `Implement 6 comprehensive steps combining all file handling functions: Create log header with write(), add multiple entries with writelines(), read complete logs with read(), process line-by-line with readline(), display numbered lists with readlines(), and append new entries dynamically. This system demonstrates mastery of all Python file handling functions for mission-critical data management.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 217 if it exists
    await problemsCollection.deleteOne({ problem_id: 217 });
    await testCasesCollection.deleteMany({ problem_id: 217 });

    // Insert problem 217
    const problemResult = await problemsCollection.insertOne(problem217);
    console.log('Problem 217 inserted');

    // Test cases for Problem 217
    const testCases = [
      {
        test_case_id: 2171,
        problem_id: 217,
        input: '',
        expected_output: 'Log initialized\nMission entries added\n--- Galactic Mission Log ---\nNavigation system initialized\nResource scan complete\nSignal received from satellite\nSecond entry: Navigation system initialized\nLog 1: --- Galactic Mission Log ---\nLog 2: Navigation system initialized\nLog 3: Resource scan complete\nLog 4: Signal received from satellite\nNew log saved successfully',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2172,
        problem_id: 217,
        input: '',
        expected_output: 'Log initialized\nMission entries added\n--- Galactic Mission Log ---\nNavigation system initialized\nResource scan complete\nSignal received from satellite\nSecond entry: Navigation system initialized\nLog 1: --- Galactic Mission Log ---\nLog 2: Navigation system initialized\nLog 3: Resource scan complete\nLog 4: Signal received from satellite\nNew log saved successfully',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 217`);

    console.log('\n✅ Problem 217 (Level 4, Session 6, Case 6: Galactic Log Keeper) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem217()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
