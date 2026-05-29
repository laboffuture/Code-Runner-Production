import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem96() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 96: Level 2, Session 6, Case 6 - Celestial Signal Filters
    const problem96 = {
      problem_id: 96,
      session_id: 17, // Level 2, Session 6
      title: 'Celestial Signal Filters',
      description: `Two astronauts arrive at NOVA-12 with different skill certifications! Mission Control needs to analyze their combined capabilities, identify overlapping expertise, and verify critical navigation qualifications before assigning crew roles.

Create the Astronaut Skill Analyzer that compares certification sets, adds newly acquired skills, and checks for essential navigation expertise to ensure mission readiness.`,
      difficulty: 'Hard',
      question: `Build a program that reads skills for two astronauts, adds a new skill to Astronaut A, then analyzes their skill sets. Display common skills between both astronauts, skills unique to Astronaut A, skills unique to Astronaut B, all updated skills for Astronaut A, and whether navigation expertise is present.`,      sample_input: '3\nPiloting\nEngineering\nNavigation\n3\nNavigation\nMedicine\nCommunications\nRobotics',
      sample_output: "Common skills: ['Navigation']\nSkills unique to Astronaut A: ['Engineering', 'Piloting', 'Robotics']\nSkills unique to Astronaut B: ['Communications', 'Medicine']\nUpdated Astronaut A skills: ['Engineering', 'Navigation', 'Piloting', 'Robotics']\nNavigation skill found",

      age_group: '11-14',
      level_number: 2,
      difficulty_level: 3,
      max_score: 150,

      metadata: {
        space_theme: true,
        story_linked: true,
        is_final_task: true,
        is_capstone: true,
        concepts: [
          'sets',
          'set creation',
          '.add() method',
          '.intersection()',
          '.difference()',
          'membership testing',
          'sorted()',
          'integration'
        ],
        estimated_time_minutes: 25
      },
      // Session-level content
      session_title: 'Session 6: Set Operations & Data Analysis',

      // Case-specific content
      case_number: 6,
      case_title: 'Celestial Signal Filters',
      case_explanation: `Read two sets of skills, add to set A, calculate intersection() for common, difference() for unique sets. Check membership with 'in' operator. Print sorted lists and navigation status.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 96 if it exists
    await problemsCollection.deleteOne({ problem_id: 96 });
    await testCasesCollection.deleteMany({ problem_id: 96 });

    // Insert problem 96
    const problemResult = await problemsCollection.insertOne(problem96);
    console.log('Problem 96 inserted');

    // Test cases for Problem 96 (7 test cases: 2 visible + 5 hidden)
    const testCases = [
      // Visible test case 1: Has navigation in both, common skills exist
      {
        test_case_id: 961,
        problem_id: 96,
        input: '3\nPiloting\nEngineering\nNavigation\n3\nNavigation\nMedicine\nCommunications\nRobotics',
        expected_output: "Common skills: ['Navigation']\nSkills unique to Astronaut A: ['Engineering', 'Piloting', 'Robotics']\nSkills unique to Astronaut B: ['Communications', 'Medicine']\nUpdated Astronaut A skills: ['Engineering', 'Navigation', 'Piloting', 'Robotics']\nNavigation skill found",
        is_hidden: false,
        weight: 15
      },
      // Visible test case 2: No navigation, no common skills
      {
        test_case_id: 962,
        problem_id: 96,
        input: '2\nCommunications\nRepair\n2\nSystems\nDocking\nEVA',
        expected_output: "Common skills: []\nSkills unique to Astronaut A: ['Communications', 'EVA', 'Repair']\nSkills unique to Astronaut B: ['Docking', 'Systems']\nUpdated Astronaut A skills: ['Communications', 'EVA', 'Repair']\nNavigation skill NOT found",
        is_hidden: false,
        weight: 15
      },
      // Hidden test case 3: Navigation in A only (via new skill)
      {
        test_case_id: 963,
        problem_id: 96,
        input: '2\nPiloting\nMedicine\n2\nEngineering\nCommunications\nNavigation',
        expected_output: "Common skills: []\nSkills unique to Astronaut A: ['Medicine', 'Navigation', 'Piloting']\nSkills unique to Astronaut B: ['Communications', 'Engineering']\nUpdated Astronaut A skills: ['Medicine', 'Navigation', 'Piloting']\nNavigation skill found",
        is_hidden: true,
        weight: 15
      },
      // Hidden test case 4: Navigation in B only
      {
        test_case_id: 964,
        problem_id: 96,
        input: '2\nPiloting\nEngineering\n3\nNavigation\nMedicine\nRepair\nCommunications',
        expected_output: "Common skills: []\nSkills unique to Astronaut A: ['Communications', 'Engineering', 'Piloting']\nSkills unique to Astronaut B: ['Medicine', 'Navigation', 'Repair']\nUpdated Astronaut A skills: ['Communications', 'Engineering', 'Piloting']\nNavigation skill found",
        is_hidden: true,
        weight: 15
      },
      // Hidden test case 5: Multiple common skills, navigation in both
      {
        test_case_id: 965,
        problem_id: 96,
        input: '4\nNavigation\nEngineering\nMedicine\nPiloting\n4\nNavigation\nEngineering\nCommunications\nRepair\nSystems',
        expected_output: "Common skills: ['Engineering', 'Navigation']\nSkills unique to Astronaut A: ['Medicine', 'Piloting', 'Systems']\nSkills unique to Astronaut B: ['Communications', 'Repair']\nUpdated Astronaut A skills: ['Engineering', 'Medicine', 'Navigation', 'Piloting', 'Systems']\nNavigation skill found",
        is_hidden: true,
        weight: 15
      },
      // Hidden test case 6: All skills different, large sets, no navigation
      {
        test_case_id: 966,
        problem_id: 96,
        input: '3\nAlpha\nBeta\nGamma\n3\nDelta\nEpsilon\nZeta\nTheta',
        expected_output: "Common skills: []\nSkills unique to Astronaut A: ['Alpha', 'Beta', 'Gamma', 'Theta']\nSkills unique to Astronaut B: ['Delta', 'Epsilon', 'Zeta']\nUpdated Astronaut A skills: ['Alpha', 'Beta', 'Gamma', 'Theta']\nNavigation skill NOT found",
        is_hidden: true,
        weight: 15
      },
      // Hidden test case 7: Single skill each, one common
      {
        test_case_id: 967,
        problem_id: 96,
        input: '1\nEngineering\n1\nEngineering\nNavigation',
        expected_output: "Common skills: ['Engineering']\nSkills unique to Astronaut A: ['Navigation']\nSkills unique to Astronaut B: []\nUpdated Astronaut A skills: ['Engineering', 'Navigation']\nNavigation skill found",
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 96`);

    console.log('\n✅ Problem 96 (Level 2, Session 6, Case 6: Astronaut Skill Tracker - Final Challenge) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem96()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
