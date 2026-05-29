import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem227() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 227: Level 4, Session 8, Case 4 - Deleting a File Using os.remove()
    const problem227 = {
      problem_id: 227,
      session_id: 41, // Level 4, Session 8
      title: 'Deleting a File Using os.remove()',
      description: 'Learn to delete files safely using os.remove() with exception handling for missing files.',
      difficulty: 'Medium',
      question: `Read a filename and content from input (2 lines). Create the file and write the content to it. Then delete it using os.remove(). Use try-except to handle FileNotFoundError. Print "[filename] deleted successfully." if deletion succeeds. Print "File not found, cannot delete." if the file doesn't exist.`,
      sample_input: 'delete_me.txt\nTemporary data',
      sample_output: 'delete_me.txt deleted successfully.',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['os.remove()', 'FileNotFoundError', 'safe file deletion', 'exception handling', 'OS module'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 8: OS Module and File Handling with Exception Handling',

      // Case-specific content
      case_number: 4,
      case_title: 'Deleting a File Using os.remove()',
      case_overview: `Python can delete files using os.remove(). But what if the file is already gone? You don't want your program to break. By adding exception handling, Python will simply say "File not found" instead of panicking, making file deletion operations safe and reliable.`,
      case_explanation: `os.remove() deletes a file. FileNotFoundError is raised if the file is missing. try-except lets you delete files safely without crashing, handling cases where files may have already been deleted or never existed.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 227 if it exists
    await problemsCollection.deleteOne({ problem_id: 227 });
    await testCasesCollection.deleteMany({ problem_id: 227 });

    // Insert problem 227
    const problemResult = await problemsCollection.insertOne(problem227);
    console.log('Problem 227 inserted');

    // Test cases for Problem 227
    const testCases = [
      {
        test_case_id: 2271,
        problem_id: 227,
        input: 'delete_me.txt\nTemporary data',
        expected_output: 'delete_me.txt deleted successfully.',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2272,
        problem_id: 227,
        input: 'temp.txt\nCache information',
        expected_output: 'temp.txt deleted successfully.',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 227`);

    console.log('\n✅ Problem 227 (Level 4, Session 8, Case 4: Deleting Files) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem227()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
