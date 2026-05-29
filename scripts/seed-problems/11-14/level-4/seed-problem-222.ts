import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem222() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 222: Level 4, Session 7, Case 5 - Accessing File Metadata
    const problem222 = {
      problem_id: 222,
      session_id: 40, 
      title: 'Accessing File Metadata',
      description: 'Learn to retrieve file properties using file.name and file.encoding attributes for compatibility verification.',
      difficulty: 'Medium',
      question: `Read 2 log entries from input (one per line). Write them to "galactic_log.txt". Then open the file in read mode with UTF-8 encoding and print the file's name and encoding format. Finally, append "LOG READY FOR TRANSMISSION" to the file and print "Transmission ready".

Format:
File Name: [filename]
Encoding: [encoding]
Transmission ready`,
      sample_input: 'ENGINE IGNITED\nNAV ONLINE',
      sample_output: 'File Name: galactic_log.txt\nEncoding: utf-8\nTransmission ready',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['file.name', 'file.encoding', 'file attributes', 'metadata retrieval', 'append mode'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 7: File Position and Operations',
      // Case-specific content
      case_number: 5,
      case_title: 'Accessing File Metadata (name, encoding)',
      case_overview: `Before sending logs to mission control or another system, cadets must verify file details. In this case, they'll retrieve the log's name and encoding format using built-in file object attributes. This ensures that the log meets communication standards for compatibility across various spacecraft systems.`,
      case_explanation: `file.name gives the file's name and file.encoding returns the text format. This ensures proper log formatting and is important for data compatibility across different systems and spacecraft modules.`,

      created_at: new Date(),
      updated_at: new Date()
    };
    // Delete existing problem 222 if it exists
    await problemsCollection.deleteOne({ problem_id: 222 });
    await testCasesCollection.deleteMany({ problem_id: 222 });
    // Insert problem 222
    const problemResult = await problemsCollection.insertOne(problem222);
    // Test cases for Problem 222
    const testCases = [
      {
        test_case_id: 2221,
        problem_id: 222,
        input: 'ENGINE IGNITED\nNAV ONLINE',
        expected_output: 'File Name: galactic_log.txt\nEncoding: utf-8\nTransmission ready',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2222,
        problem_id: 222,
        input: 'SYSTEMS CHECK\nFUEL LOADED',
        expected_output: 'File Name: galactic_log.txt\nEncoding: utf-8\nTransmission ready',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);

  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
}

// Run the seed function
seedProblem222()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
