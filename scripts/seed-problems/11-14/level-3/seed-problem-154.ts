import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem154() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 154: Level 3, Session 6, Case 4 - Making Objects Callable with __call__()
    const problem154 = {
      problem_id: 154,
      session_id: 28, // Level 3, Session 6
      title: 'Making Objects Callable with __call__()',
      description: 'The __call__() method allows objects to behave like functions, making them directly executable with parentheses for interactive and concise code.',
      difficulty: 'Medium',
      question: `Can you create a Printer class with name attribute and implement __call__()? Print with prefix based on name length: len>=5+even='Professional Printer:', len>=5+odd='Advanced Printer:', len<5+even='Basic Printer:', len<5+odd='Quick Printer:', followed by '[name] is printing: [document]'.`,      sample_input: 'HP\nScience_Project.pdf',
      sample_output: 'Basic Printer: HP is printing: Science_Project.pdf',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', '__call__', 'magic methods', 'callable objects', 'object as function', 'conditional logic', 'nested conditionals', 'string length', 'modulo operator'],
        estimated_time_minutes: 15
      },

      // Session-level content
      session_title: 'Session 6: Magic Methods in Python',

      // Case-specific content
      case_number: 4,
      case_title: 'Making Objects Callable with __call__()',
      case_overview: `The __call__() method makes objects behave like functions, enabling direct execution with parentheses.`,
      case_explanation: `Create Printer class with __init__(name) and __call__(document) method. Check two conditions: (1) if len(name) >= 5 or < 5, and (2) if len(name) % 2 == 0 (even) or odd. Use nested if-else: len>=5+even='Professional Printer:', len>=5+odd='Advanced Printer:', len<5+even='Basic Printer:', len<5+odd='Quick Printer:' prefix, then print '[prefix] [name] is printing: [document]'.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 154 - 7 test cases (2 visible + 5 hidden)
    const testCases154 = [
      {
        test_case_id: 1541,
        problem_id: 154,
        input: 'HP\nScience_Project.pdf',
        expected_output: 'Basic Printer: HP is printing: Science_Project.pdf', // len=2, even, <5
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1542,
        problem_id: 154,
        input: 'Lenovo\nReport.docx',
        expected_output: 'Professional Printer: Lenovo is printing: Report.docx', // len=6, even, >=5
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1543,
        problem_id: 154,
        input: 'Epson\nMission_Brief.pdf',
        expected_output: 'Advanced Printer: Epson is printing: Mission_Brief.pdf', // len=5, odd, >=5
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1544,
        problem_id: 154,
        input: 'Brother\nFlightLog.xlsx',
        expected_output: 'Advanced Printer: Brother is printing: FlightLog.xlsx', // len=7, odd, >=5
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1545,
        problem_id: 154,
        input: 'Samsung\nCrewManifest.txt',
        expected_output: 'Advanced Printer: Samsung is printing: CrewManifest.txt', // len=7, odd, >=5
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1546,
        problem_id: 154,
        input: 'LGX\nInventory.csv',
        expected_output: 'Quick Printer: LGX is printing: Inventory.csv', // len=3, odd, <5
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1547,
        problem_id: 154,
        input: 'Dell\nNavigation_Chart.png',
        expected_output: 'Basic Printer: Dell is printing: Navigation_Chart.png', // len=4, even, <5
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 154 });
    await problemsCollection.insertOne(problem154);
    console.log('Problem 154 inserted');

    await testCasesCollection.deleteMany({ problem_id: 154 });
    await testCasesCollection.insertMany(testCases154);
    console.log(`${testCases154.length} test cases inserted for Problem 154`);

    console.log('\n✅ Problem 154 (Level 3, Session 6, Case 4: Callable with __call__) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem154()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
