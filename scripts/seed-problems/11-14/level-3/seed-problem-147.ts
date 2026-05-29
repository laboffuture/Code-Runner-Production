import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem147() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 147: Level 3, Session 5, Case 3 - Creating Multiple Objects
    const problem147 = {
      problem_id: 147,
      session_id: 27, // Level 3, Session 5
      title: 'Creating Multiple Objects',
      description: 'A class can create multiple independent objects, each with unique attributes, managed efficiently using lists and loops to model real-world entities.',
      difficulty: 'Medium',
      question: `Your space academy needs to process multiple student enrollments efficiently. Can you design a Student class and use it to manage a collection of students, displaying each one in a standardized format?`,      sample_input: '3\nAnya 7th\nRavi 8th\nLeena 6th',
      sample_output: 'Student: Anya, Grade: 7th\nStudent: Ravi, Grade: 8th\nStudent: Leena, Grade: 6th',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 2,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'multiple objects', 'lists', 'loops', 'object management'],
        estimated_time_minutes: 18
      },

      // Session-level content
      session_title: 'Session 5: Classes with Attributes and Methods',

      // Case-specific content
      case_number: 3,
      case_title: 'Creating Multiple Objects',
      case_overview: `Multiple objects from one class can be managed in lists, each storing unique values while sharing structure.`,
      case_explanation: `Create multiple Student objects and store them in a list. Use loops to process input and display each student in the required format.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 147 - 7 test cases (2 visible + 5 hidden)
    const testCases147 = [
      {
        test_case_id: 1471,
        problem_id: 147,
        input: '3\nAnya 7th\nRavi 8th\nLeena 6th',
        expected_output: 'Student: Anya, Grade: 7th\nStudent: Ravi, Grade: 8th\nStudent: Leena, Grade: 6th',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1472,
        problem_id: 147,
        input: '1\nMaya 9th',
        expected_output: 'Student: Maya, Grade: 9th',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1473,
        problem_id: 147,
        input: '2\nKiran 6th\nZara 10th',
        expected_output: 'Student: Kiran, Grade: 6th\nStudent: Zara, Grade: 10th',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1474,
        problem_id: 147,
        input: '4\nArjun 5th\nPriya 7th\nRohan 8th\nDiya 9th',
        expected_output: 'Student: Arjun, Grade: 5th\nStudent: Priya, Grade: 7th\nStudent: Rohan, Grade: 8th\nStudent: Diya, Grade: 9th',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1475,
        problem_id: 147,
        input: '2\nNeil 11th\nSara 12th',
        expected_output: 'Student: Neil, Grade: 11th\nStudent: Sara, Grade: 12th',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1476,
        problem_id: 147,
        input: '5\nAli 6th\nBen 7th\nCara 8th\nDan 9th\nElla 10th',
        expected_output: 'Student: Ali, Grade: 6th\nStudent: Ben, Grade: 7th\nStudent: Cara, Grade: 8th\nStudent: Dan, Grade: 9th\nStudent: Ella, Grade: 10th',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1477,
        problem_id: 147,
        input: '1\nAlex 5th',
        expected_output: 'Student: Alex, Grade: 5th',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 147 });
    await problemsCollection.insertOne(problem147);
    console.log('Problem 147 inserted');

    await testCasesCollection.deleteMany({ problem_id: 147 });
    await testCasesCollection.insertMany(testCases147);
    console.log(`${testCases147.length} test cases inserted for Problem 147`);

    console.log('\n✅ Problem 147 (Level 3, Session 5, Case 3: Creating Multiple Objects) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem147()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
