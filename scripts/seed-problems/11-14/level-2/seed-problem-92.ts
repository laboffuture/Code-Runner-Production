import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem92() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 92: Level 2, Session 6, Case 2 - Removing Items from a Set
    const problem92 = {
      problem_id: 92,
      session_id: 17, // Level 2, Session 6
      title: 'Removing Items from a Set',
      description: 'Learn to remove items from sets using .remove() and .discard() methods and understand their differences.',
      difficulty: 'Easy',
      question: `Create a set with N satellite names from input. Remove one satellite using .remove() and another using .discard(). Print remaining satellites sorted alphabetically, one per line.`,      sample_input: '5\nHubble\nISS\nVoyager\nGalileo\nKepler\nISS\nKepler',
      sample_output: 'Galileo\nHubble\nVoyager',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['sets', '.remove() method', '.discard() method', 'removing elements', 'error handling'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 6: Set Operations & Data Analysis',

      // Case-specific content
      case_number: 2,
      case_title: 'Removing Items from a Set',
      case_overview: `Learn to remove items using .remove() and .discard() - understand when to use each method.`,
      case_code: `# Set Operations
numbers = {10, 20, 30, 40, 50}

# Remove and return random element
removed = numbers.pop()
print(f"Removed: {removed}")
print(numbers)

# Check length
print(len(numbers))  # Number of items remaining

# Clear all items
numbers.clear()
print(numbers)  # Prints: set()`,
      case_explanation: `Use set.remove(item) to delete an item (raises error if not found). Use set.discard(item) for safe removal (no error if not found). Both modify the set in place.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 92 if it exists
    await problemsCollection.deleteOne({ problem_id: 92 });
    await testCasesCollection.deleteMany({ problem_id: 92 });

    // Insert problem 92
    const problemResult = await problemsCollection.insertOne(problem92);
    console.log('Problem 92 inserted');

    // Test cases for Problem 92 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 921,
        problem_id: 92,
        input: '5\nHubble\nISS\nVoyager\nGalileo\nKepler\nISS\nKepler',
        expected_output: 'Galileo\nHubble\nVoyager',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 922,
        problem_id: 92,
        input: '4\nApollo\nGemini\nArtemis\nOrion\nApollo\nGemini',
        expected_output: 'Artemis\nOrion',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 923,
        problem_id: 92,
        input: '6\nAlpha\nBeta\nGamma\nDelta\nEpsilon\nZeta\nBeta\nDelta',
        expected_output: 'Alpha\nEpsilon\nGamma\nZeta',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 924,
        problem_id: 92,
        input: '3\nMars\nVenus\nEarth\nMars\nVenus',
        expected_output: 'Earth',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 925,
        problem_id: 92,
        input: '5\nTitan\nEuropa\nGanymede\nCallisto\nIo\nTitan\nIo',
        expected_output: 'Callisto\nEuropa\nGanymede',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 926,
        problem_id: 92,
        input: '4\nA\nB\nC\nD\nA\nD',
        expected_output: 'B\nC',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 927,
        problem_id: 92,
        input: '7\nSputnik\nExplorer\nVanguard\nPioneer\nLuna\nRanger\nMariner\nSputnik\nMariner',
        expected_output: 'Explorer\nLuna\nPioneer\nRanger\nVanguard',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 92`);

    console.log('\n✅ Problem 92 (Level 2, Session 6, Case 2: Removing Items from a Set) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem92()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
