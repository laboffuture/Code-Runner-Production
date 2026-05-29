import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem207() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 207: Level 4, Session 5, Case 2 - Appending Emergency Entries to Mission Logs
    const problem207 = {
      problem_id: 207,
      session_id: 38, // Level 4, Session 5
      title: 'Appending Emergency Entries to Mission Logs',
      description: 'Learn to append critical updates to existing logs without deleting previous entries using append mode.',
      difficulty: 'Medium',
      question: `Read 2 initial log entries from input (one per line). Create "mission_log.txt" and write these entries with newlines. Then read 2 emergency updates from input. Append them to the file with newlines. Finally, read the entire file and print its contents (should show all 4 entries).`,
      sample_input: 'LAUNCH SEQUENCE INITIATED\nENGINES ONLINE\nALERT: OXYGEN DROP at 14:55\nRECOVERY: BACKUP SYSTEM ACTIVATED',
      sample_output: 'LAUNCH SEQUENCE INITIATED\nENGINES ONLINE\nALERT: OXYGEN DROP at 14:55\nRECOVERY: BACKUP SYSTEM ACTIVATED\n',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['append mode', 'preserving data', 'dynamic updates', 'emergency logging', 'data persistence'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 5: File Handling',

      // Case-specific content
      case_number: 2,
      case_title: 'Appending Emergency Entries to Mission Logs',
      case_overview: `Cadets explore how to append critical updates, such as system failures or recovery actions, without deleting previous log entries. Using append mode reinforces the concept of growing mission logs over time—an important part of maintaining accurate records during long-duration or unpredictable space missions.`,
      case_explanation: `Use "a" mode to append content to the end of a file. Previous entries are preserved, making it useful for dynamic updates like real-time error tracking. This ensures no mission data is lost when adding new information.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 207 if it exists
    await problemsCollection.deleteOne({ problem_id: 207 });
    await testCasesCollection.deleteMany({ problem_id: 207 });

    // Insert problem 207
    const problemResult = await problemsCollection.insertOne(problem207);
    console.log('Problem 207 inserted');

    // Test cases for Problem 207
    const testCases = [
      {
        test_case_id: 2071,
        problem_id: 207,
        input: 'LAUNCH SEQUENCE INITIATED\nENGINES ONLINE\nALERT: OXYGEN DROP at 14:55\nRECOVERY: BACKUP SYSTEM ACTIVATED',
        expected_output: 'LAUNCH SEQUENCE INITIATED\nENGINES ONLINE\nALERT: OXYGEN DROP at 14:55\nRECOVERY: BACKUP SYSTEM ACTIVATED\n',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2072,
        problem_id: 207,
        input: 'SYSTEMS CHECK COMPLETE\nNAVIGATION READY\nWARNING: FUEL LOW\nUPDATE: REFUELING INITIATED',
        expected_output: 'SYSTEMS CHECK COMPLETE\nNAVIGATION READY\nWARNING: FUEL LOW\nUPDATE: REFUELING INITIATED\n',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 207`);

    console.log('\n✅ Problem 207 (Level 4, Session 5, Case 2: Appending Emergency Entries) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem207()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
