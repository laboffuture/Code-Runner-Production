import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem211() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 211: Level 4, Session 5, Case 6 - Galactic Data Archives
    const problem211 = {
      problem_id: 211,
      session_id: 38, // Level 4, Session 5
      title: 'Galactic Data Archives – Building the Space Mission Log Core',
      description: 'Build a comprehensive logging system using all file handling modes to store and retrieve mission data.',
      difficulty: 'Hard',
      question: `Build a comprehensive Galactic Data Archives system with 5 steps:

Step 1: Read 2 lines from input (header and initial status). Create "galactic_archive.txt" and write both lines with newlines. Print "Archive initialized"

Step 2: Read 3 mission events from input. Append them to the file with newlines. Print "Mission events logged"

Step 3: Read 2 more inputs: word to find and word to replace. Use r+ mode to modify the file content. Print "Log entry modified"

Step 4: Read a binary message from input. Encode and write it to "sensor_archive.bin" using binary write mode. Print "Binary telemetry archived"

Step 5: Read both files and print their complete contents (text file first, then decoded binary file)`,
      sample_input: '=== MISSION START ===\nInitial system check: PASSED\nENGINES IGNITED\nNAVIGATION STABLE\nSHIELDS ACTIVE\nSTABLE\nFAILED\nSENSOR_RAW: TEMP=22 RAD=0.5',
      sample_output: 'Archive initialized\nMission events logged\nLog entry modified\nBinary telemetry archived\n=== MISSION START ===\nInitial system check: PASSED\nENGINES IGNITED\nNAVIGATION FAILED\nSHIELDS ACTIVE\nSENSOR_RAW: TEMP=22 RAD=0.5\n',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['comprehensive file handling', 'write mode', 'append mode', 'r+ mode', 'binary modes', 'timestamps', 'datetime module', 'dual-format logging'],
        estimated_time_minutes: 35
      },

      // Session-level content
      session_title: 'Session 5: File Handling',

      // Case-specific content
      case_number: 6,
      case_title: 'Galactic Data Archives – Building the Space Mission Log Core',
      case_overview: `Cadets become data engineers aboard an interstellar fleet, designing the Galactic Data Archives—a secure system that logs, updates, and retrieves mission data using both text and binary files. From launch sequences to sensor telemetry, this archive ensures no critical information is lost during space operations.`,
      case_explanation: `Implement 5 interconnected steps combining all file handling concepts: Initialize logs with write mode, append mission events dynamically, add timestamps using datetime module, modify entries with r+ mode, and store binary sensor data. This comprehensive system demonstrates mastery of text and binary file operations for mission-critical data management.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 211 if it exists
    await problemsCollection.deleteOne({ problem_id: 211 });
    await testCasesCollection.deleteMany({ problem_id: 211 });

    // Insert problem 211
    const problemResult = await problemsCollection.insertOne(problem211);
    console.log('Problem 211 inserted');

    // Test cases for Problem 211
    const testCases = [
      {
        test_case_id: 2111,
        problem_id: 211,
        input: '=== MISSION START ===\nInitial system check: PASSED\nENGINES IGNITED\nNAVIGATION STABLE\nSHIELDS ACTIVE\nSTABLE\nFAILED\nSENSOR_RAW: TEMP=22 RAD=0.5',
        expected_output: 'Archive initialized\nMission events logged\nLog entry modified\nBinary telemetry archived\n=== MISSION START ===\nInitial system check: PASSED\nENGINES IGNITED\nNAVIGATION FAILED\nSHIELDS ACTIVE\nSENSOR_RAW: TEMP=22 RAD=0.5\n',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2112,
        problem_id: 211,
        input: '=== FLIGHT LOG ===\nPreflight check: COMPLETE\nFUEL LOADED\nCREW READY\nLAUNCH PENDING\nREADY\nGO\nDATA: ALTITUDE=350KM SPEED=28000',
        expected_output: 'Archive initialized\nMission events logged\nLog entry modified\nBinary telemetry archived\n=== FLIGHT LOG ===\nPreflight check: COMPLETE\nFUEL LOADED\nCREW GO\nLAUNCH PENDING\nDATA: ALTITUDE=350KM SPEED=28000\n',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 211`);

    console.log('\n✅ Problem 211 (Level 4, Session 5, Case 6: Galactic Data Archives) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem211()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
