import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem149() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 149: Level 3, Session 5, Case 5 - Coordinating Multiple Behaviors in a Class
    const problem149 = {
      problem_id: 149,
      session_id: 27, // Level 3, Session 5
      title: 'Coordinating Multiple Behaviors in a Class',
      description: 'Multiple methods work together in AI systems, with attributes and methods interacting to create intelligent, coordinated behavior based on internal conditions.',
      difficulty: 'Hard',
      question: `Can you create an AICrewMember class with name, role, and energy attributes, a show_status method, and a perform_task method? If energy >= 50, perform task (reduce energy by 30), otherwise print error. Call show_status before and after perform_task.`,      sample_input: 'Robo1\nEngineer\n80\nRepairing engine',
      sample_output: 'Name: Robo1 | Role: Engineer | Energy: 80\nRobo1 is performing task: Repairing engine\nName: Robo1 | Role: Engineer | Energy: 50',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'multiple methods', 'method coordination', 'state management', 'conditional behavior'],
        estimated_time_minutes: 20
      },

      // Session-level content
      session_title: 'Session 5: Classes with Attributes and Methods',

      // Case-specific content
      case_number: 5,
      case_title: 'Coordinating Multiple Behaviors in a Class',
      case_overview: `Multiple methods coordinate within a class, with attributes and logic working together for intelligent decision-making.`,
      case_explanation: `Design an AICrewMember class with coordinated methods: check_energy for validation, perform_task for executing work and managing energy, and show_status for displaying information. Methods should work together to maintain object state.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 149 - 7 test cases (2 visible + 5 hidden)
    const testCases149 = [
      {
        test_case_id: 1491,
        problem_id: 149,
        input: 'Robo1\nEngineer\n80\nRepairing engine',
        expected_output: 'Name: Robo1 | Role: Engineer | Energy: 80\nRobo1 is performing task: Repairing engine\nName: Robo1 | Role: Engineer | Energy: 50',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1492,
        problem_id: 149,
        input: 'Robo2\nPilot\n40\nFlying spaceship',
        expected_output: 'Name: Robo2 | Role: Pilot | Energy: 40\nRobo2 does not have enough energy to perform Flying spaceship!\nName: Robo2 | Role: Pilot | Energy: 40',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1493,
        problem_id: 149,
        input: 'Robo3\nMechanic\n50\nFixing reactor',
        expected_output: 'Name: Robo3 | Role: Mechanic | Energy: 50\nRobo3 is performing task: Fixing reactor\nName: Robo3 | Role: Mechanic | Energy: 20',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1494,
        problem_id: 149,
        input: 'Robo4\nScientist\n60\nAnalyzing data',
        expected_output: 'Name: Robo4 | Role: Scientist | Energy: 60\nRobo4 is performing task: Analyzing data\nName: Robo4 | Role: Scientist | Energy: 30',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1495,
        problem_id: 149,
        input: 'Robo5\nGuard\n30\nPatrolling deck',
        expected_output: 'Name: Robo5 | Role: Guard | Energy: 30\nRobo5 does not have enough energy to perform Patrolling deck!\nName: Robo5 | Role: Guard | Energy: 30',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1496,
        problem_id: 149,
        input: 'Robo6\nDoctor\n90\nChecking patients',
        expected_output: 'Name: Robo6 | Role: Doctor | Energy: 90\nRobo6 is performing task: Checking patients\nName: Robo6 | Role: Doctor | Energy: 60',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1497,
        problem_id: 149,
        input: 'Robo7\nCook\n45\nPreparing meals',
        expected_output: 'Name: Robo7 | Role: Cook | Energy: 45\nRobo7 does not have enough energy to perform Preparing meals!\nName: Robo7 | Role: Cook | Energy: 45',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 149 });
    await problemsCollection.insertOne(problem149);
    console.log('Problem 149 inserted');

    await testCasesCollection.deleteMany({ problem_id: 149 });
    await testCasesCollection.insertMany(testCases149);
    console.log(`${testCases149.length} test cases inserted for Problem 149`);

    console.log('\n✅ Problem 149 (Level 3, Session 5, Case 5: Coordinating Multiple Behaviors) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem149()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
