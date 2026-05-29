import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem155() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 155: Level 3, Session 6, Case 5 - Combining Multiple Magic Methods
    const problem155 = {
      problem_id: 155,
      session_id: 28, // Level 3, Session 6
      title: 'Combining Multiple Magic Methods',
      description: 'Combining __init__(), __str__(), __len__(), and __call__() in one class creates powerful, smart objects that are easy to use, readable, and functional.',
      difficulty: 'Hard',
      question: `Can you create a Movie class with title and duration attributes, implementing __init__, __str__, __len__, and __call__()? For __str__, print with prefix based on duration: dur>=120+even='Epic Movie:', dur>=120+odd='Long Film:', dur<120+even='Short Movie:', dur<120+odd='Quick Film:', followed by '[title]'. Then print len(movie). Then call movie(action) to print 'Now [action] the movie: [title]'.`,      sample_input: 'Interstellar\n169\nplaying',
      sample_output: 'Long Film: Interstellar\n169\nNow playing the movie: Interstellar',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'multiple magic methods', '__init__', '__str__', '__len__', '__call__', 'comprehensive OOP', 'conditional logic', 'nested conditionals', 'modulo operator'],
        estimated_time_minutes: 20
      },

      // Session-level content
      session_title: 'Session 6: Magic Methods in Python',

      // Case-specific content
      case_number: 5,
      case_title: 'Combining Multiple Magic Methods',
      case_overview: `Combining multiple magic methods creates powerful objects that are easy to use, readable, and functional.`,
      case_explanation: `Create Movie class with __init__(title, duration), __str__() with conditional prefix (check duration >= 120 or < 120, and even/odd), __len__() returning duration, and __call__(action). Use nested if-else: dur>=120+even='Epic Movie:', dur>=120+odd='Long Film:', dur<120+even='Short Movie:', dur<120+odd='Quick Film:' prefix in __str__, then return '[prefix] [title]'.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 155 - 7 test cases (2 visible + 5 hidden)
    const testCases155 = [
      {
        test_case_id: 1551,
        problem_id: 155,
        input: 'Interstellar\n169\nplaying',
        expected_output: 'Long Film: Interstellar\n169\nNow playing the movie: Interstellar', // dur=169, odd, >=120
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1552,
        problem_id: 155,
        input: 'Gravity\n91\nstreaming',
        expected_output: 'Quick Film: Gravity\n91\nNow streaming the movie: Gravity', // dur=91, odd, <120
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1553,
        problem_id: 155,
        input: 'The Martian\n144\nwatching',
        expected_output: 'Epic Movie: The Martian\n144\nNow watching the movie: The Martian', // dur=144, even, >=120
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1554,
        problem_id: 155,
        input: 'Apollo 13\n140\ndownloading',
        expected_output: 'Epic Movie: Apollo 13\n140\nNow downloading the movie: Apollo 13', // dur=140, even, >=120
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1555,
        problem_id: 155,
        input: 'Star Wars\n121\nrewatching',
        expected_output: 'Long Film: Star Wars\n121\nNow rewatching the movie: Star Wars', // dur=121, odd, >=120
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1556,
        problem_id: 155,
        input: 'Avatar\n162\npausing',
        expected_output: 'Epic Movie: Avatar\n162\nNow pausing the movie: Avatar', // dur=162, even, >=120
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1557,
        problem_id: 155,
        input: 'Inception\n148\nrecording',
        expected_output: 'Epic Movie: Inception\n148\nNow recording the movie: Inception', // dur=148, even, >=120
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 155 });
    await problemsCollection.insertOne(problem155);
    console.log('Problem 155 inserted');

    await testCasesCollection.deleteMany({ problem_id: 155 });
    await testCasesCollection.insertMany(testCases155);
    console.log(`${testCases155.length} test cases inserted for Problem 155`);

    console.log('\n✅ Problem 155 (Level 3, Session 6, Case 5: Combining Magic Methods) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem155()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
