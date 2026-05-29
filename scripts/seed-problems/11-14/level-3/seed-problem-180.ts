import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem180() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 180: Level 3, Session 10, Case 6 - Comprehensive Polymorphism
    const problem180 = {
      problem_id: 180,
      session_id: 32, // Level 3, Session 10
      title: 'Building an Adaptive AI System – Comprehensive Polymorphism',
      description: 'Combine multiple polymorphism concepts into one comprehensive system.',
      difficulty: 'Hard',
      question: `Can you create an AI system that demonstrates polymorphism? Build three AI classes (Scout, Engineer, Commander) with a respond() method that prints different messages. Then add operator overloading (+) to combine their power levels and names. Take inputs for AI types and power levels, create objects, call their methods, and demonstrate adding two AI units together.`,      sample_input: 'Scout\n50\nEngineer\n70',
      sample_output: 'Scout responding: Scanning area.\nEngineer responding: Building structures.\nScout-Engineer with power 120',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['polymorphism', 'method overriding', 'operator overloading', '__add__', '__str__', 'comprehensive OOP'],
        estimated_time_minutes: 20
      },

      // Session-level content
      session_title: 'Session 10: Polymorphism',
      session_introduction: `A storm spike distorts messages mid-flight across the Nova Network. AI assistants must adapt their responses based on mission context while maintaining a unified interface. Your objective is to demonstrate polymorphism through a common interface with different implementations, utilizing operator and method overloading patterns where appropriate. The deliverable is a system of mixed AI objects handled through one common function, where each AI type responds differently but through the same call signature, showcasing the power of polymorphic design in deep space operations.`,

      // Case-specific content
      case_number: 6,
      case_title: 'Building an Adaptive AI System – Comprehensive Polymorphism',
      case_overview: `This comprehensive problem combines method overriding, operator overloading, and polymorphic behavior. Students must create multiple classes with shared method names, implement custom operators, and demonstrate unified handling of diverse types.`,
      case_explanation: `Create base AI class structure. Implement Scout, Engineer, Commander classes with unique respond() methods. Add __add__ operator to combine AI units (join names with '-' and add power levels). Implement __str__ to display combined AI. Create objects from input and demonstrate all features.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 180 if it exists
    await problemsCollection.deleteOne({ problem_id: 180 });
    await testCasesCollection.deleteMany({ problem_id: 180 });

    // Insert problem 180
    const problemResult = await problemsCollection.insertOne(problem180);
    console.log('Problem 180 inserted');

    // Test cases for Problem 180
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1801,
        problem_id: 180,
        input: 'Scout\n50\nEngineer\n70',
        expected_output: 'Scout responding: Scanning area.\nEngineer responding: Building structures.\nScout-Engineer with power 120',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1802,
        problem_id: 180,
        input: 'Commander\n100\nScout\n30',
        expected_output: 'Commander responding: Leading the team.\nScout responding: Scanning area.\nCommander-Scout with power 130',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1803,
        problem_id: 180,
        input: 'Engineer\n60\nCommander\n90',
        expected_output: 'Engineer responding: Building structures.\nCommander responding: Leading the team.\nEngineer-Commander with power 150',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1804,
        problem_id: 180,
        input: 'Scout\n40\nScout\n60',
        expected_output: 'Scout responding: Scanning area.\nScout responding: Scanning area.\nScout-Scout with power 100',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1805,
        problem_id: 180,
        input: 'Engineer\n80\nEngineer\n75',
        expected_output: 'Engineer responding: Building structures.\nEngineer responding: Building structures.\nEngineer-Engineer with power 155',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1806,
        problem_id: 180,
        input: 'Commander\n95\nEngineer\n55',
        expected_output: 'Commander responding: Leading the team.\nEngineer responding: Building structures.\nCommander-Engineer with power 150',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1807,
        problem_id: 180,
        input: 'Scout\n25\nCommander\n85',
        expected_output: 'Scout responding: Scanning area.\nCommander responding: Leading the team.\nScout-Commander with power 110',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 180`);

    console.log('\n✅ Problem 180 (Level 3, Session 10, Case 6: Comprehensive Polymorphism) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem180()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
