import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem100() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 100: Level 2, Session 7, Case 4 - Functions with Multiple Parameters
    const problem100 = {
      problem_id: 100,
      session_id: 18, // Level 2, Session 7
      title: 'Functions with Multiple Parameters',
      description: 'Learn to create functions that accept multiple parameters in a specific order.',
      difficulty: 'Easy',
      question: `Take two strings fruit and color as input. Define a function favorite_fruit(fruit, color) that prints "My favorite fruit is a <color> <fruit>!". Call the function with the input values.`,      sample_input: 'apple\nred',
      sample_output: 'My favorite fruit is a red apple!',

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 1,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['functions', 'multiple parameters', 'parameter order', 'function arguments', 'string formatting'],
        estimated_time_minutes: 12
      },
      // Session-level content
      session_title: 'Session 7: User-Defined Functions',

      // Case-specific content
      case_number: 4,
      case_title: 'Functions with Multiple Parameters',
      case_overview: `Master multiple parameters - create functions that accept several values and understand parameter order matters.`,
      case_code: `# Function with Multiple Parameters
def calculate_area(length, width, height):
    base_area = length * width
    volume = base_area * height
    print(f'Base area: {base_area}')
    print(f'Volume: {volume}')

# Call with different values
calculate_area(5, 3, 2)
# Prints:
# Base area: 15
# Volume: 30`,
      case_explanation: `Define functions with multiple parameters separated by commas. Arguments must be passed in the same order as parameters when calling the function.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 100 if it exists
    await problemsCollection.deleteOne({ problem_id: 100 });
    await testCasesCollection.deleteMany({ problem_id: 100 });

    // Insert problem 100
    const problemResult = await problemsCollection.insertOne(problem100);
    console.log('Problem 100 inserted');

    // Test cases for Problem 100 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1001,
        problem_id: 100,
        input: 'apple\nred',
        expected_output: 'My favorite fruit is a red apple!',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1002,
        problem_id: 100,
        input: 'banana\nyellow',
        expected_output: 'My favorite fruit is a yellow banana!',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 1003,
        problem_id: 100,
        input: 'orange\norange',
        expected_output: 'My favorite fruit is a orange orange!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1004,
        problem_id: 100,
        input: 'grape\npurple',
        expected_output: 'My favorite fruit is a purple grape!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1005,
        problem_id: 100,
        input: 'strawberry\nred',
        expected_output: 'My favorite fruit is a red strawberry!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1006,
        problem_id: 100,
        input: 'mango\nyellow',
        expected_output: 'My favorite fruit is a yellow mango!',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 1007,
        problem_id: 100,
        input: 'blueberry\nblue',
        expected_output: 'My favorite fruit is a blue blueberry!',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 100`);

    console.log('\n✅ Problem 100 (Level 2, Session 7, Case 4: Functions with Multiple Parameters) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem100()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
