import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem215() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 215: Level 4, Session 6, Case 4 - Reading One Line at a Time with readline()
    const problem215 = {
      problem_id: 215,
      session_id: 39, // Level 4, Session 6
      title: 'Reading One Line at a Time with readline()',
      description: 'Learn to read files line-by-line using readline() for sequential processing.',
      difficulty: 'Medium',
      question: `Open "goals.txt" which contains multiple goal entries:
My Goals:
1. Read a book
2. Complete homework
3. Practice coding

Print only the second line (the first actual goal entry, not the header) using two readline() calls. The first call skips the header "My Goals:", and the second call reads "1. Read a book". Print in format: "Second line: [content]" where [content] is stripped of extra whitespace.`,      sample_input: '',
      sample_output: 'Second line: 1. Read a book',

      age_group: '11-14',
      level_number: 4,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['readline()', 'sequential reading', 'line-by-line processing', 'strip()'],
        estimated_time_minutes: 12
      },

      // Session-level content
      session_title: 'Session 6: File Handling Functions',

      // Case-specific content
      case_number: 4,
      case_title: 'Reading One Line at a Time with readline() – First Glimpse',
      case_overview: `readline() in Python helps you read a file line by line, slowly understanding each part. It reads only the first line, and if you call it again, it gives you the next line. This is useful when your program needs to work through a file step by step—like showing one instruction at a time or checking for something important on each line.`,
      case_explanation: `readline() reads one line at a time from top to bottom. Can be used multiple times to read line by line. Each call moves to the next line automatically, making it perfect for sequential file processing.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 215 if it exists
    await problemsCollection.deleteOne({ problem_id: 215 });
    await testCasesCollection.deleteMany({ problem_id: 215 });

    // Insert problem 215
    const problemResult = await problemsCollection.insertOne(problem215);
    console.log('Problem 215 inserted');

    // Test cases for Problem 215
    const testCases = [
      {
        test_case_id: 2151,
        problem_id: 215,
        input: '',
        expected_output: 'Second line: 1. Read a book',
        is_hidden: false,
        weight: 50
      },
      {
        test_case_id: 2152,
        problem_id: 215,
        input: '',
        expected_output: 'Second line: 1. Read a book',
        is_hidden: false,
        weight: 50
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 215`);

    console.log('\n✅ Problem 215 (Level 4, Session 6, Case 4: Reading with readline()) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem215()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
