import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem170() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 170: Level 3, Session 9, Case 2 - Hybrid Inheritance
    const problem170 = {
      problem_id: 170,
      session_id: 31, // Level 3, Session 9
      title: 'Hybrid Inheritance',
      description: 'Learn how to combine different inheritance types to create complex, multi-functional systems.',
      difficulty: 'Medium',
      question: `Can you create a LabAI using hybrid inheritance that combines multilevel and multiple inheritance patterns?`,      sample_input: 'Genesis',
      sample_output: 'MergedSys: Booting AI system...\nMergedSys: Scanning medical data...\nMergedSys: Analyzing research results...',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['hybrid inheritance', 'multiple inheritance', 'multilevel inheritance', 'class hierarchy', 'inheritance paths', 'OOP', 'conditional logic', 'nested conditionals', 'modulo operator'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 9: Mastering Inheritance - Advanced',

      // Case-specific content
      case_number: 2,
      case_title: 'Hybrid Inheritance',
      case_overview: `Hybrid inheritance combines multiple inheritance types in one structure for complex class hierarchies.`,
      case_explanation: `Build LabAI using hybrid inheritance (AIBase → MedicalAI/ResearchAI → LabAI) with conditional prefixes.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 170 if it exists
    await problemsCollection.deleteOne({ problem_id: 170 });
    await testCasesCollection.deleteMany({ problem_id: 170 });

    // Insert problem 170
    const problemResult = await problemsCollection.insertOne(problem170);
    console.log('Problem 170 inserted');

    // Test cases for Problem 170
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1701,
        problem_id: 170,
        input: 'Genesis',
        expected_output: 'MergedSys: Booting AI system...\nMergedSys: Scanning medical data...\nMergedSys: Analyzing research results...', // len=7, odd, >=7
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1702,
        problem_id: 170,
        input: 'MediCore',
        expected_output: 'HybridSys: Booting AI system...\nHybridSys: Scanning medical data...\nHybridSys: Analyzing research results...', // len=8, even, >=7
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1703,
        problem_id: 170,
        input: 'Apollo',
        expected_output: 'LabSys: Booting AI system...\nLabSys: Scanning medical data...\nLabSys: Analyzing research results...', // len=6, even, <7
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1704,
        problem_id: 170,
        input: 'Atlas',
        expected_output: 'MixSys: Booting AI system...\nMixSys: Scanning medical data...\nMixSys: Analyzing research results...', // len=5, odd, <7
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1705,
        problem_id: 170,
        input: 'Helix',
        expected_output: 'MixSys: Booting AI system...\nMixSys: Scanning medical data...\nMixSys: Analyzing research results...', // len=5, odd, <7
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1706,
        problem_id: 170,
        input: 'Research',
        expected_output: 'HybridSys: Booting AI system...\nHybridSys: Scanning medical data...\nHybridSys: Analyzing research results...', // len=8, even, >=7
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1707,
        problem_id: 170,
        input: 'Lab',
        expected_output: 'MixSys: Booting AI system...\nMixSys: Scanning medical data...\nMixSys: Analyzing research results...', // len=3, odd, <7
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 170`);

    console.log('\n✅ Problem 170 (Level 3, Session 9, Case 2: Hybrid Inheritance) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem170()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
