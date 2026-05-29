import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem228() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 228: Level 4, Session 8, Case 5 - Making a Folder and Saving a File Inside
    const problem228 = {
      problem_id: 228,
      session_id: 41, // Level 4, Session 8
      title: 'Making a Folder and Saving a File Inside',
      description: 'Learn to create folders and save files inside them using os.mkdir() and os.path.join().',
      difficulty: 'Medium',
      question: `Read folder name, filename, and content from input (3 lines). Create the folder using os.mkdir() if it doesn't exist (check with os.path.exists()). Use os.path.join() to create the full file path and save the content to the file. Print "File saved in new folder." when done.`,
      sample_input: 'projects\nscience.txt\nMy science project',
      sample_output: 'File saved in new folder.',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['os.mkdir()', 'os.path.join()', 'os.path.exists()', 'folder creation', 'file organization'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 8: OS Module and File Handling with Exception Handling',

      // Case-specific content
      case_number: 5,
      case_title: 'Making a Folder and Saving a File Inside',
      case_overview: `Python helps you create folders and save files inside them, keeping your files organized—like putting your science notes into a "Science" folder. This is useful when your program saves homework, projects, or pictures in different places, just like sorting files on your computer.`,
      case_explanation: `os.mkdir() creates a folder. os.path.join() combines folder and file names into one path. Use os.path.exists() to check if a folder exists before creating it. This allows organized file storage with proper directory structure.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 228 if it exists
    await problemsCollection.deleteOne({ problem_id: 228 });
    await testCasesCollection.deleteMany({ problem_id: 228 });

    // Insert problem 228
    const problemResult = await problemsCollection.insertOne(problem228);
    console.log('Problem 228 inserted');

    // Test cases for Problem 228
    const testCases = [
      {
        test_case_id: 2281,
        problem_id: 228,
        input: 'projects\nscience.txt\nMy science project',
        expected_output: 'File saved in new folder.',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2282,
        problem_id: 228,
        input: 'documents\nreport.txt\nQuarterly Report',
        expected_output: 'File saved in new folder.',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 228`);

    console.log('\n✅ Problem 228 (Level 4, Session 8, Case 5: Making Folders) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem228()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
