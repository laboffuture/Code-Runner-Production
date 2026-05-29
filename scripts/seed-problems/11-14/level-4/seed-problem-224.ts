import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem224() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 224: Level 4, Session 8, Case 1 - Listing All Files in a Folder
    const problem224 = {
      problem_id: 224,
      session_id: 41, // Level 4, Session 8
      title: 'Listing All Files in a Folder',
      description: 'Learn to list directory contents using os.listdir() and check folder existence with os.path.exists().',
      difficulty: 'Easy',
      question: `Read 2 filenames from input. Create a folder named "mydata", then create the 2 files inside it (can be blank files). Check if the folder exists using os.path.exists(), then list all files inside "mydata" using os.listdir(). Print "Files in folder: [sorted list]".`,
      sample_input: 'file1.txt\nfile2.txt',
      sample_output: 'Files in folder: [\'file1.txt\', \'file2.txt\']',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['os.listdir()', 'os.path.exists()', 'directory listing', 'OS module', 'folder operations'],
        estimated_time_minutes: 10
      },

      // Session-level content
      session_title: 'Session 8: OS Module and File Handling with Exception Handling',

      // Case-specific content
      case_number: 1,
      case_title: 'Listing All Files in a Folder',
      case_overview: `Python can list files in a folder using the OS module. Instead of manually clicking to see what's inside, you'll write code to check folder contents. This is helpful when building programs that need to work with many files, like loading game levels, checking saved notes, or reviewing past assignments.`,
      case_explanation: `os.path.exists() checks if the folder exists. os.listdir() lists everything inside the folder. This combination allows you to safely explore directory contents before performing operations on files.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 224 if it exists
    await problemsCollection.deleteOne({ problem_id: 224 });
    await testCasesCollection.deleteMany({ problem_id: 224 });

    // Insert problem 224
    const problemResult = await problemsCollection.insertOne(problem224);
    console.log('Problem 224 inserted');

    // Test cases for Problem 224
    const testCases = [
      {
        test_case_id: 2241,
        problem_id: 224,
        input: 'file1.txt\nfile2.txt',
        expected_output: 'Files in folder: [\'file1.txt\', \'file2.txt\']',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2242,
        problem_id: 224,
        input: 'data.txt\nlog.txt',
        expected_output: 'Files in folder: [\'data.txt\', \'log.txt\']',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 224`);

    console.log('\n✅ Problem 224 (Level 4, Session 8, Case 1: Listing Files) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem224()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
