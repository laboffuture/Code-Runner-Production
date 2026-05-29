import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem95() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 95: Level 2, Session 6, Case 5 - Set Membership and Looping
    const problem95 = {
      problem_id: 95,
      session_id: 17, // Level 2, Session 6
      title: 'Set Membership and Looping',
      description: 'Learn to check membership using in operator and loop through sets to process elements.',
      difficulty: 'Easy',
      question: `Create a set with N strings from input. Check if string Q exists using in operator and print "Found" or "Not Found". Loop through and print all elements prefixed with "Item: " sorted alphabetically.`,      sample_input: '4\nHubble\nISS\nVoyager\nGalileo\nISS',
      sample_output: 'Found\nItem: Galileo\nItem: Hubble\nItem: ISS\nItem: Voyager',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['sets', 'membership testing', 'in operator', 'for loops', 'iteration'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 6: Set Operations & Data Analysis',

      // Case-specific content
      case_number: 5,
      case_title: 'Set Membership and Looping',
      case_overview: `Test membership and iterate through sets - use in to check existence and for loops to process each element.`,
      case_code: `# Set Update and Copy
original = {'apple', 'banana'}

# Add multiple items at once with .update()
original.update(['cherry', 'date', 'elderberry'])
print(original)

# Create a copy
backup = original.copy()
backup.add('fig')

print(f"Original: {len(original)}")  # Prints: Original: 5
print(f"Backup: {len(backup)}")  # Prints: Backup: 6`,
      case_explanation: `Use value in set to check if an element exists (fast O(1) operation). Use for item in set to iterate through all elements. Combine with sorted() for ordered iteration.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 95 if it exists
    await problemsCollection.deleteOne({ problem_id: 95 });
    await testCasesCollection.deleteMany({ problem_id: 95 });

    // Insert problem 95
    const problemResult = await problemsCollection.insertOne(problem95);
    console.log('Problem 95 inserted');

    // Test cases for Problem 95 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 951,
        problem_id: 95,
        input: '4\nHubble\nISS\nVoyager\nGalileo\nISS',
        expected_output: 'Found\nItem: Galileo\nItem: Hubble\nItem: ISS\nItem: Voyager',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 952,
        problem_id: 95,
        input: '3\nApollo\nGemini\nArtemis\nOrion',
        expected_output: 'Not Found\nItem: Apollo\nItem: Artemis\nItem: Gemini',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 953,
        problem_id: 95,
        input: '5\nAlpha\nBeta\nGamma\nDelta\nEpsilon\nGamma',
        expected_output: 'Found\nItem: Alpha\nItem: Beta\nItem: Delta\nItem: Epsilon\nItem: Gamma',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 954,
        problem_id: 95,
        input: '2\nMars\nVenus\nEarth',
        expected_output: 'Not Found\nItem: Mars\nItem: Venus',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 955,
        problem_id: 95,
        input: '6\nTitan\nEuropa\nGanymede\nCallisto\nIo\nMimas\nTitan',
        expected_output: 'Found\nItem: Callisto\nItem: Europa\nItem: Ganymede\nItem: Io\nItem: Mimas\nItem: Titan',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 956,
        problem_id: 95,
        input: '4\nA\nB\nC\nD\nE',
        expected_output: 'Not Found\nItem: A\nItem: B\nItem: C\nItem: D',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 957,
        problem_id: 95,
        input: '7\nSputnik\nExplorer\nVanguard\nPioneer\nLuna\nRanger\nMariner\nExplorer',
        expected_output: 'Found\nItem: Explorer\nItem: Luna\nItem: Mariner\nItem: Pioneer\nItem: Ranger\nItem: Sputnik\nItem: Vanguard',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 95`);

    console.log('\n✅ Problem 95 (Level 2, Session 6, Case 5: Set Membership and Looping) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem95()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
