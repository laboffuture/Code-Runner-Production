import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem93() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 93: Level 2, Session 6, Case 3 - Set Union and Intersection
    const problem93 = {
      problem_id: 93,
      session_id: 17, // Level 2, Session 6
      title: 'Set Union and Intersection',
      description: 'Learn to combine sets using .union() to get all unique elements and .intersection() to find common elements.',
      difficulty: 'Medium',
      question: `Create two sets with N1 and N2 strings from input. Find and print their union sorted alphabetically. Find and print their intersection sorted alphabetically (or "No common elements" if empty).`,      sample_input: '3\nHubble\nISS\nVoyager\n3\nISS\nGalileo\nVoyager',
      sample_output: 'Galileo\nHubble\nISS\nVoyager\nISS\nVoyager',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 120,

      metadata: {
        space_theme: true,
        concepts: ['sets', '.union() method', '.intersection() method', 'set operations', 'common elements'],
        estimated_time_minutes: 15
      },
      // Session-level content
      session_title: 'Session 6: Set Operations & Data Analysis',

      // Case-specific content
      case_number: 3,
      case_title: 'Set Union and Intersection',
      case_overview: `Combine and compare sets - use .union() to get all unique elements and .intersection() to find common elements.`,
      case_code: `# Set Difference Operations
team_a = {'Alice', 'Bob', 'Charlie'}
team_b = {'Bob', 'Diana', 'Eve'}

# .difference() finds elements only in first set
only_a = team_a.difference(team_b)
print(only_a)  # Prints: {'Alice', 'Charlie'}

# .symmetric_difference() finds elements in either but not both
unique_to_each = team_a.symmetric_difference(team_b)
print(unique_to_each)  # Prints: {'Alice', 'Charlie', 'Diana', 'Eve'}`,
      case_explanation: `Use set1.union(set2) to get all unique elements from both sets combined. Use set1.intersection(set2) to find only elements that exist in both sets. Both return new sets without modifying originals.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 93 if it exists
    await problemsCollection.deleteOne({ problem_id: 93 });
    await testCasesCollection.deleteMany({ problem_id: 93 });

    // Insert problem 93
    const problemResult = await problemsCollection.insertOne(problem93);
    console.log('Problem 93 inserted');

    // Test cases for Problem 93 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 931,
        problem_id: 93,
        input: '3\nHubble\nISS\nVoyager\n3\nISS\nGalileo\nVoyager',
        expected_output: 'Galileo\nHubble\nISS\nVoyager\nISS\nVoyager',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 932,
        problem_id: 93,
        input: '2\nApollo\nGemini\n2\nArtemis\nOrion',
        expected_output: 'Apollo\nArtemis\nGemini\nOrion\nNo common elements',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 933,
        problem_id: 93,
        input: '4\nAlpha\nBeta\nGamma\nDelta\n3\nBeta\nDelta\nEpsilon',
        expected_output: 'Alpha\nBeta\nDelta\nEpsilon\nGamma\nBeta\nDelta',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 934,
        problem_id: 93,
        input: '3\nMars\nVenus\nEarth\n3\nMars\nVenus\nEarth',
        expected_output: 'Earth\nMars\nVenus\nEarth\nMars\nVenus',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 935,
        problem_id: 93,
        input: '5\nTitan\nEuropa\nGanymede\nCallisto\nIo\n4\nEuropa\nCallisto\nMimas\nEnceladus',
        expected_output: 'Callisto\nEnceladus\nEuropa\nGanymede\nIo\nMimas\nTitan\nCallisto\nEuropa',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 936,
        problem_id: 93,
        input: '2\nA\nB\n3\nC\nD\nE',
        expected_output: 'A\nB\nC\nD\nE\nNo common elements',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 937,
        problem_id: 93,
        input: '4\nSputnik\nExplorer\nVanguard\nPioneer\n5\nExplorer\nPioneer\nLuna\nRanger\nMariner',
        expected_output: 'Explorer\nLuna\nMariner\nPioneer\nRanger\nSputnik\nVanguard\nExplorer\nPioneer',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 93`);

    console.log('\n✅ Problem 93 (Level 2, Session 6, Case 3: Set Union and Intersection) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem93()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
