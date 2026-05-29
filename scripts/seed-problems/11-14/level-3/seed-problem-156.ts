import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem156() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 156: Level 3, Session 6, Case 6 - Spacecraft Media System (FINAL TASK)
    const problem156 = {
      problem_id: 156,
      session_id: 28, // Level 3, Session 6
      title: 'Spacecraft Media System – Complete Magic Methods Integration',
      description: 'Build a comprehensive media management system using all magic methods to create smart, fully-functional objects for spacecraft entertainment.',
      difficulty: 'Hard',
      question: `Your spacecraft media library manages multiple movies with full functionality. Can you build a complete media management system that handles multiple movies, each with all four magic methods, creating a powerful and intuitive interface for the crew?`,      sample_input: '2\nInterstellar\n169\nplaying\nGravity\n91\nstreaming',
      sample_output: 'Movie: Interstellar\n169\nNow playing the movie: Interstellar\nMovie: Gravity\n91\nNow streaming the movie: Gravity',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'magic methods', '__init__', '__str__', '__len__', '__call__', 'multiple objects', 'loops'],
        estimated_time_minutes: 25
      },

      // Session-level content
      session_title: 'Session 6: Magic Methods in Python',

      // Case-specific content
      case_number: 6,
      case_title: 'Spacecraft Media System – Complete Magic Methods Integration',
      case_explanation: `Extend the Movie class from Case 5 to handle multiple movies. Process each movie with all four magic methods, demonstrating comprehensive mastery of Python's special methods.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 156 - 7 test cases (2 visible + 5 hidden)
    const testCases156 = [
      {
        test_case_id: 1561,
        problem_id: 156,
        input: '2\nInterstellar\n169\nplaying\nGravity\n91\nstreaming',
        expected_output: 'Movie: Interstellar\n169\nNow playing the movie: Interstellar\nMovie: Gravity\n91\nNow streaming the movie: Gravity',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1562,
        problem_id: 156,
        input: '1\nThe Martian\n144\nwatching',
        expected_output: 'Movie: The Martian\n144\nNow watching the movie: The Martian',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1563,
        problem_id: 156,
        input: '3\nApollo 13\n140\nplaying\nStar Wars\n121\nstreaming\nAvatar\n162\npausing',
        expected_output: 'Movie: Apollo 13\n140\nNow playing the movie: Apollo 13\nMovie: Star Wars\n121\nNow streaming the movie: Star Wars\nMovie: Avatar\n162\nNow pausing the movie: Avatar',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1564,
        problem_id: 156,
        input: '1\nInception\n148\nrecording',
        expected_output: 'Movie: Inception\n148\nNow recording the movie: Inception',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1565,
        problem_id: 156,
        input: '2\nContact\n150\nwatching\nArrival\n116\nplaying',
        expected_output: 'Movie: Contact\n150\nNow watching the movie: Contact\nMovie: Arrival\n116\nNow playing the movie: Arrival',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1566,
        problem_id: 156,
        input: '4\nBlade Runner\n117\nstreaming\nAlien\n117\npausing\nPrometheus\n124\ndownloading\nElysium\n109\nrewatching',
        expected_output: 'Movie: Blade Runner\n117\nNow streaming the movie: Blade Runner\nMovie: Alien\n117\nNow pausing the movie: Alien\nMovie: Prometheus\n124\nNow downloading the movie: Prometheus\nMovie: Elysium\n109\nNow rewatching the movie: Elysium',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1567,
        problem_id: 156,
        input: '2\n2001 Space Odyssey\n149\nplaying\nWall-E\n98\nstreaming',
        expected_output: 'Movie: 2001 Space Odyssey\n149\nNow playing the movie: 2001 Space Odyssey\nMovie: Wall-E\n98\nNow streaming the movie: Wall-E',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 156 });
    await problemsCollection.insertOne(problem156);
    console.log('Problem 156 inserted');

    await testCasesCollection.deleteMany({ problem_id: 156 });
    await testCasesCollection.insertMany(testCases156);
    console.log(`${testCases156.length} test cases inserted for Problem 156`);

    console.log('\n✅ Problem 156 (Level 3, Session 6, Case 6: Spacecraft Media System) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem156()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
