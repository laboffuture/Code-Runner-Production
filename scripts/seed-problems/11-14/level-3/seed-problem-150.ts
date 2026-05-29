import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem150() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 150: Level 3, Session 5, Case 6 - AI Crew Command (FINAL TASK)
    const problem150 = {
      problem_id: 150,
      session_id: 27, // Level 3, Session 5
      title: 'AI Crew Command – Building Interstellar Operations',
      description: 'The AI assistants need identity and behavior to work together. As you approach the bridge, soft status lights begin to glow, signaling the crew members are ready to collaborate. Each assistant awaits your command, their energy reserves displayed and tasks queued.',
      difficulty: 'Hard',
      question: `Can you manage N AI crew members on the bridge? For each member, create an AICrewMember object with name, role, and energy. Call show_status(), then perform_task(task) - if energy >= 50, perform task (reduce energy by 30), else show error. Call show_status() again after each task.`,      sample_input: '2\nRobo1\nEngineer\n80\nRepairing engine\nRobo2\nPilot\n40\nFlying spaceship',
      sample_output: 'Name: Robo1 | Role: Engineer | Energy: 80\nRobo1 is performing task: Repairing engine\nName: Robo1 | Role: Engineer | Energy: 50\nName: Robo2 | Role: Pilot | Energy: 40\nRobo2 does not have enough energy to perform Flying spaceship!\nName: Robo2 | Role: Pilot | Energy: 40',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['classes', 'multiple objects', 'loops', 'method coordination', 'AI simulation', 'comprehensive OOP'],
        estimated_time_minutes: 25
      },

      // Session-level content
      session_title: 'Session 5: Classes with Attributes and Methods',

      // Case-specific content
      case_number: 6,
      case_title: 'AI Crew Command – Building Interstellar Operations',
      case_explanation: `Create AICrewMember class with __init__(name, role, energy), show_status() displaying 'Name: [name] | Role: [role] | Energy: [energy]', and perform_task(task). Read N crew members. For each: create object, call show_status(), perform_task(), show_status() again. Task logic: if energy >= 50, print task message and reduce energy by 30, else print error.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Test cases for Problem 150 - 7 test cases (2 visible + 5 hidden)
    const testCases150 = [
      {
        test_case_id: 1501,
        problem_id: 150,
        input: '2\nRobo1\nEngineer\n80\nRepairing engine\nRobo2\nPilot\n40\nFlying spaceship',
        expected_output: 'Name: Robo1 | Role: Engineer | Energy: 80\nRobo1 is performing task: Repairing engine\nName: Robo1 | Role: Engineer | Energy: 50\nName: Robo2 | Role: Pilot | Energy: 40\nRobo2 does not have enough energy to perform Flying spaceship!\nName: Robo2 | Role: Pilot | Energy: 40',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1502,
        problem_id: 150,
        input: '1\nRobo3\nMechanic\n70\nFixing reactor',
        expected_output: 'Name: Robo3 | Role: Mechanic | Energy: 70\nRobo3 is performing task: Fixing reactor\nName: Robo3 | Role: Mechanic | Energy: 40',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 1503,
        problem_id: 150,
        input: '1\nRobo4\nScientist\n35\nAnalyzing data',
        expected_output: 'Name: Robo4 | Role: Scientist | Energy: 35\nRobo4 does not have enough energy to perform Analyzing data!\nName: Robo4 | Role: Scientist | Energy: 35',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1504,
        problem_id: 150,
        input: '3\nRobo5\nGuard\n60\nPatrolling deck\nRobo6\nDoctor\n90\nChecking patients\nRobo7\nCook\n55\nPreparing meals',
        expected_output: 'Name: Robo5 | Role: Guard | Energy: 60\nRobo5 is performing task: Patrolling deck\nName: Robo5 | Role: Guard | Energy: 30\nName: Robo6 | Role: Doctor | Energy: 90\nRobo6 is performing task: Checking patients\nName: Robo6 | Role: Doctor | Energy: 60\nName: Robo7 | Role: Cook | Energy: 55\nRobo7 is performing task: Preparing meals\nName: Robo7 | Role: Cook | Energy: 25',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1505,
        problem_id: 150,
        input: '3\nRobo8\nCleaner\n30\nCleaning halls\nRobo9\nNavigator\n40\nPlotting course\nRobo10\nComms\n45\nSending signals',
        expected_output: 'Name: Robo8 | Role: Cleaner | Energy: 30\nRobo8 does not have enough energy to perform Cleaning halls!\nName: Robo8 | Role: Cleaner | Energy: 30\nName: Robo9 | Role: Navigator | Energy: 40\nRobo9 does not have enough energy to perform Plotting course!\nName: Robo9 | Role: Navigator | Energy: 40\nName: Robo10 | Role: Comms | Energy: 45\nRobo10 does not have enough energy to perform Sending signals!\nName: Robo10 | Role: Comms | Energy: 45',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1506,
        problem_id: 150,
        input: '2\nRobo11\nSecurity\n75\nMonitoring sensors\nRobo12\nResearcher\n85\nRunning experiments',
        expected_output: 'Name: Robo11 | Role: Security | Energy: 75\nRobo11 is performing task: Monitoring sensors\nName: Robo11 | Role: Security | Energy: 45\nName: Robo12 | Role: Researcher | Energy: 85\nRobo12 is performing task: Running experiments\nName: Robo12 | Role: Researcher | Energy: 55',
        is_hidden: true,
        weight: 14
      },
      {
        test_case_id: 1507,
        problem_id: 150,
        input: '4\nRobo13\nEngineer\n50\nMaintaining systems\nRobo14\nPilot\n49\nFlying shuttle\nRobo15\nMedic\n100\nTreating crew\nRobo16\nChef\n20\nCooking dinner',
        expected_output: 'Name: Robo13 | Role: Engineer | Energy: 50\nRobo13 is performing task: Maintaining systems\nName: Robo13 | Role: Engineer | Energy: 20\nName: Robo14 | Role: Pilot | Energy: 49\nRobo14 does not have enough energy to perform Flying shuttle!\nName: Robo14 | Role: Pilot | Energy: 49\nName: Robo15 | Role: Medic | Energy: 100\nRobo15 is performing task: Treating crew\nName: Robo15 | Role: Medic | Energy: 70\nName: Robo16 | Role: Chef | Energy: 20\nRobo16 does not have enough energy to perform Cooking dinner!\nName: Robo16 | Role: Chef | Energy: 20',
        is_hidden: true,
        weight: 14
      }
    ];

    await problemsCollection.deleteOne({ problem_id: 150 });
    await problemsCollection.insertOne(problem150);
    console.log('Problem 150 inserted');

    await testCasesCollection.deleteMany({ problem_id: 150 });
    await testCasesCollection.insertMany(testCases150);
    console.log(`${testCases150.length} test cases inserted for Problem 150`);

    console.log('\n✅ Problem 150 (Level 3, Session 5, Case 6: AI Crew Command) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem150()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
