import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem91() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 91: Level 2, Session 6, Case 1 - Creating Sets and Adding Items
    const problem91 = {
      problem_id: 91,
      session_id: 17, // Level 2, Session 6
      title: 'Creating Sets and Adding Items',
      description: 'Learn to create sets and use .add() to insert new unique elements into a set.',
      difficulty: 'Easy',
      question: `Create a set with N satellite names from input. Add M more satellite names using .add(). Print all satellites sorted alphabetically, one per line.`,      sample_input: '3\nHubble\nISS\nVoyager\n2\nGalileo\nISS',
      sample_output: 'Galileo\nHubble\nISS\nVoyager',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['sets', 'set creation', '.add() method', 'unique elements', 'no duplicates'],
        estimated_time_minutes: 10
      },
      // Session-level content
      session_title: 'Session 6: Set Operations & Data Analysis',

      // Case-specific content
      case_number: 1,
      case_title: 'Creating Sets and Adding Items',
      case_overview: `Master the basics of sets - initialize sets and use .add() to insert new unique elements.`,
      case_code: `# Set Methods
colors = {'red', 'blue', 'green', 'yellow'}

# Remove specific item
colors.discard('blue')  # Safe removal, no error if not found
print(colors)

# Check if item exists
if 'red' in colors:
    colors.remove('red')  # Remove (raises error if not found)

print(sorted(colors))  # Print in alphabetical order`,
      case_explanation: `Create sets with curly braces {}. Sets store only unique values and automatically remove duplicates. Use set.add(item) to insert new elements.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 91 if it exists
    await problemsCollection.deleteOne({ problem_id: 91 });
    await testCasesCollection.deleteMany({ problem_id: 91 });

    // Insert problem 91
    const problemResult = await problemsCollection.insertOne(problem91);
    console.log('Problem 91 inserted');

    // Test cases for Problem 91 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 911,
        problem_id: 91,
        input: '3\nHubble\nISS\nVoyager\n2\nGalileo\nISS',
        expected_output: 'Galileo\nHubble\nISS\nVoyager',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 912,
        problem_id: 91,
        input: '2\nApollo\nGemini\n3\nArtemis\nApollo\nOrion',
        expected_output: 'Apollo\nArtemis\nGemini\nOrion',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 913,
        problem_id: 91,
        input: '4\nAlpha\nBeta\nGamma\nDelta\n2\nEpsilon\nAlpha',
        expected_output: 'Alpha\nBeta\nDelta\nEpsilon\nGamma',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 914,
        problem_id: 91,
        input: '1\nTitan\n4\nEuropa\nGanymede\nTitan\nCallisto',
        expected_output: 'Callisto\nEuropa\nGanymede\nTitan',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 915,
        problem_id: 91,
        input: '5\nMars\nVenus\nEarth\nJupiter\nSaturn\n1\nMars',
        expected_output: 'Earth\nJupiter\nMars\nSaturn\nVenus',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 916,
        problem_id: 91,
        input: '3\nA\nB\nC\n3\nD\nE\nF',
        expected_output: 'A\nB\nC\nD\nE\nF',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 917,
        problem_id: 91,
        input: '2\nSputnik\nExplorer\n2\nSputnik\nExplorer',
        expected_output: 'Explorer\nSputnik',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 91`);

    console.log('\n✅ Problem 91 (Level 2, Session 6, Case 1: Creating Sets and Adding Items) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem91()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
