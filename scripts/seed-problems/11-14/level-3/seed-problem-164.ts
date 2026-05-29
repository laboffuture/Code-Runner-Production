import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem164() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 164: Level 3, Session 8, Case 2 - Multilevel Inheritance
    const problem164 = {
      problem_id: 164,
      session_id: 30, // Level 3, Session 8
      title: 'Multilevel Inheritance – Passing Down the Chain',
      description: 'Explore how inheritance can pass skills down through multiple levels, like a family tree of spacecraft.',
      difficulty: 'Medium',
      question: `Can you create a three-level inheritance chain (Vehicle → Rocket → CargoRocket) with conditional prefixes for each method?`,      sample_input: 'Falcon9',
      sample_output: 'Super: Falcon9 Moving...\nSuper: Falcon9 Rocket engines firing!\nSuper: Falcon9 Delivering satellite payload.',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['inheritance', 'multilevel inheritance', 'class hierarchy', 'method chaining', 'OOP', 'conditional logic', 'nested conditionals', 'modulo operator'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 8: Mastering Inheritance - Beginner',

      // Case-specific content
      case_number: 2,
      case_title: 'Multilevel Inheritance – Passing Down the Chain',
      case_overview: `Multilevel inheritance creates hierarchies where each class inherits from another, building upon previous levels.`,
      case_explanation: `Build three-tier inheritance with conditional prefixes based on vehicle name length and parity.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 164 if it exists
    await problemsCollection.deleteOne({ problem_id: 164 });
    await testCasesCollection.deleteMany({ problem_id: 164 });

    // Insert problem 164
    const problemResult = await problemsCollection.insertOne(problem164);
    console.log('Problem 164 inserted');

    // Test cases for Problem 164
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1641,
        problem_id: 164,
        input: 'Starship',
        expected_output: 'Heavy: Starship Moving...\nHeavy: Starship Rocket engines firing!\nHeavy: Starship Delivering satellite payload.', // len=8, even, >=8
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1642,
        problem_id: 164,
        input: 'Discovery',
        expected_output: 'Super: Discovery Moving...\nSuper: Discovery Rocket engines firing!\nSuper: Discovery Delivering satellite payload.', // len=9, odd, >=8
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1643,
        problem_id: 164,
        input: 'Soyuz',
        expected_output: 'Quick: Soyuz Moving...\nQuick: Soyuz Rocket engines firing!\nQuick: Soyuz Delivering satellite payload.', // len=5, odd, <8
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1644,
        problem_id: 164,
        input: 'Falcon',
        expected_output: 'Fast: Falcon Moving...\nFast: Falcon Rocket engines firing!\nFast: Falcon Delivering satellite payload.', // len=6, even, <8
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1645,
        problem_id: 164,
        input: 'SaturnV',
        expected_output: 'Quick: SaturnV Moving...\nQuick: SaturnV Rocket engines firing!\nQuick: SaturnV Delivering satellite payload.', // len=7, odd, <8
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1646,
        problem_id: 164,
        input: 'Ariane',
        expected_output: 'Fast: Ariane Moving...\nFast: Ariane Rocket engines firing!\nFast: Ariane Delivering satellite payload.', // len=6, even, <8
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1647,
        problem_id: 164,
        input: 'Atlas',
        expected_output: 'Quick: Atlas Moving...\nQuick: Atlas Rocket engines firing!\nQuick: Atlas Delivering satellite payload.', // len=5, odd, <8
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 164`);

    console.log('\n✅ Problem 164 (Level 3, Session 8, Case 2: Multilevel Inheritance) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem164()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
