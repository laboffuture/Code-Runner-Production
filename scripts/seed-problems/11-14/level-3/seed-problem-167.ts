import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem167() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 167: Level 3, Session 8, Case 5 - Complete Inheritance System
    const problem167 = {
      problem_id: 167,
      session_id: 30, // Level 3, Session 8
      title: 'Building a Space Inheritance System',
      description: 'Combine multilevel inheritance with method overriding to build an intelligent navigation system.',
      difficulty: 'Medium',
      question: `Can you build a complete navigation system using multilevel inheritance with method overriding and conditional prefixes?`,      sample_input: 'NaviCore',
      sample_output: 'NavSys: Precision mode enabled\nNavSys: Calibrating star tracker...',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['multilevel inheritance', 'method overriding', 'class hierarchy', 'polymorphism', 'OOP', 'conditional logic', 'nested conditionals', 'modulo operator'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 8: Mastering Inheritance - Beginner',

      // Case-specific content
      case_number: 5,
      case_title: 'Building a Space Inheritance System',
      case_overview: `Combining multilevel inheritance with method overriding creates powerful, customizable class hierarchies.`,
      case_explanation: `Build three-tier inheritance with overridden methods and conditional prefixes for advanced navigation systems.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 167 if it exists
    await problemsCollection.deleteOne({ problem_id: 167 });
    await testCasesCollection.deleteMany({ problem_id: 167 });

    // Insert problem 167
    const problemResult = await problemsCollection.insertOne(problem167);
    console.log('Problem 167 inserted');

    // Test cases for Problem 167
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1671,
        problem_id: 167,
        input: 'NaviCore',
        expected_output: 'NavSys: Precision mode enabled\nNavSys: Calibrating star tracker...', // len=8, even, >=7
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1672,
        problem_id: 167,
        input: 'Navigator',
        expected_output: 'AutoSys: Precision mode enabled\nAutoSys: Calibrating star tracker...', // len=9, odd, >=7
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1673,
        problem_id: 167,
        input: 'Guidance',
        expected_output: 'NavSys: Precision mode enabled\nNavSys: Calibrating star tracker...', // len=8, even, >=7
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1674,
        problem_id: 167,
        input: 'AutoPilot',
        expected_output: 'AutoSys: Precision mode enabled\nAutoSys: Calibrating star tracker...', // len=9, odd, >=7
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1675,
        problem_id: 167,
        input: 'NavAI',
        expected_output: 'Core: Precision mode enabled\nCore: Calibrating star tracker...', // len=5, odd, <7
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1676,
        problem_id: 167,
        input: 'System',
        expected_output: 'Sys: Precision mode enabled\nSys: Calibrating star tracker...', // len=6, even, <7
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1677,
        problem_id: 167,
        input: 'Star',
        expected_output: 'Sys: Precision mode enabled\nSys: Calibrating star tracker...', // len=4, even, <7
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 167`);

    console.log('\n✅ Problem 167 (Level 3, Session 8, Case 5: Complete Inheritance System) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem167()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
