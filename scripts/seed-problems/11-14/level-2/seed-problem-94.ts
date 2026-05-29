import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem94() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 94: Level 2, Session 6, Case 4 - Set Difference and Symmetric Difference
    const problem94 = {
      problem_id: 94,
      session_id: 17, // Level 2, Session 6
      title: 'Set Difference and Symmetric Difference',
      description: 'Learn to find unique elements using .difference() and .symmetric_difference() to compare sets.',
      difficulty: 'Medium',
      question: `Read N1, then read N1 strings to create set1. Read N2, then read N2 strings to create set2. Calculate difference (set1 - set2). If empty print "No unique elements in first set", else print elements sorted alphabetically (one per line). Calculate symmetric difference. If empty print "Sets are identical", else print elements sorted alphabetically (one per line).`,      sample_input: '4\nHubble\nISS\nVoyager\nKepler\n3\nISS\nGalileo\nVoyager',
      sample_output: 'Hubble\nKepler\nGalileo\nHubble\nKepler',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 2,
      max_score: 120,

      metadata: {
        space_theme: true,
        concepts: ['sets', '.difference() method', '.symmetric_difference() method', 'set comparison', 'unique elements'],
        estimated_time_minutes: 18
      },
      // Session-level content
      session_title: 'Session 6: Set Operations & Data Analysis',

      // Case-specific content
      case_number: 4,
      case_title: 'Set Difference and Symmetric Difference',
      case_overview: `Find unique elements - use .difference() for elements in one set only and .symmetric_difference() for elements not shared.`,
      case_code: `# Set Comparison Methods
team_a = {'Alice', 'Bob'}
team_b = {'Alice', 'Bob', 'Charlie'}

# Check if one set is subset of another
print(team_a.issubset(team_b))  # Prints: True
print(team_b.issuperset(team_a))  # Prints: True

# Check if sets are disjoint (no common elements)
team_c = {'Diana', 'Eve'}
print(team_a.isdisjoint(team_c))  # Prints: True`,
      case_explanation: `Create two sets from inputs. Use set1.difference(set2) or (set1 - set2) for elements only in set1. Use set1.symmetric_difference(set2) or (set1 ^ set2) for elements in either but not both. Sort results using sorted() and print each element on new line, or print special messages for empty results.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 94 if it exists
    await problemsCollection.deleteOne({ problem_id: 94 });
    await testCasesCollection.deleteMany({ problem_id: 94 });

    // Insert problem 94
    const problemResult = await problemsCollection.insertOne(problem94);
    console.log('Problem 94 inserted');

    // Test cases for Problem 94 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 941,
        problem_id: 94,
        input: '4\nHubble\nISS\nVoyager\nKepler\n3\nISS\nGalileo\nVoyager',
        expected_output: 'Hubble\nKepler\nGalileo\nHubble\nKepler',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 942,
        problem_id: 94,
        input: '3\nApollo\nGemini\nArtemis\n3\nApollo\nGemini\nArtemis',
        expected_output: 'No unique elements in first set\nSets are identical',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 943,
        problem_id: 94,
        input: '5\nAlpha\nBeta\nGamma\nDelta\nEpsilon\n3\nBeta\nDelta\nZeta',
        expected_output: 'Alpha\nEpsilon\nGamma\nAlpha\nEpsilon\nGamma\nZeta',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 944,
        problem_id: 94,
        input: '2\nMars\nVenus\n4\nMars\nVenus\nEarth\nJupiter',
        expected_output: 'No unique elements in first set\nEarth\nJupiter',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 945,
        problem_id: 94,
        input: '4\nTitan\nEuropa\nGanymede\nCallisto\n2\nMimas\nEnceladus',
        expected_output: 'Callisto\nEuropa\nGanymede\nTitan\nCallisto\nEnceladus\nEuropa\nGanymede\nMimas\nTitan',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 946,
        problem_id: 94,
        input: '3\nA\nB\nC\n3\nA\nB\nC',
        expected_output: 'No unique elements in first set\nSets are identical',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 947,
        problem_id: 94,
        input: '5\nSputnik\nExplorer\nVanguard\nPioneer\nLuna\n3\nExplorer\nPioneer\nRanger',
        expected_output: 'Luna\nSputnik\nVanguard\nLuna\nRanger\nSputnik\nVanguard',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 94`);

    console.log('\n✅ Problem 94 (Level 2, Session 6, Case 4: Set Difference and Symmetric Difference) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem94()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
