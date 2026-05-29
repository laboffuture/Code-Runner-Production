import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem84() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 84: Level 2, Session 4, Case 6 - Galactic Intelligence Core
    const problem84 = {
      problem_id: 84,
      session_id: 15, // Level 2, Session 4
      title: 'Galactic Intelligence Core',
      description: `Dr. Astra unlocks a legacy "Intelligence Core" within NOVA-12's systems! The archive contains crucial mission data corrupted by electromagnetic interference.

Create the repair routine that restores the Galactic Intelligence Core using nested dictionaries and advanced operations.`,
      difficulty: 'Hard',
      question: `Read N (number of phases). For each phase: read name, crew count, system count, then for each system read name and power. Store in nested dictionaries. Read query_phase name. If it exists print "Phase: {name}, Crew: {crew}, Power: {total_power}" where total_power is sum of all systems in that phase. If not found print "Phase not found". Then merge all systems from all phases keeping maximum power for duplicates, print sorted alphabetically as "{system}: {power}".`,      sample_input: '2\nAtmospheric_Entry\n5\n2\nHeat_Shields\n80\nNavigation\n100\nCanyon_Descent\n3\n1\nThrusters\n90\nAtmospheric_Entry',
      sample_output: 'Phase: Atmospheric_Entry, Crew: 5, Power: 180\nHeat_Shields: 80\nNavigation: 100\nThrusters: 90',

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
          'nested dictionaries',
          'dictionary comprehension',
          'merging dictionaries',
          'dictionary methods',
          '.get()',
          '.update()',
          'complex data structures',
          'aggregation',
          'integration'
        ],
        estimated_time_minutes: 30
      },
      // Session-level content
      session_title: 'Session 4: Advanced Dictionary Operations and Dictionary Methods',

      // Case-specific content
      case_number: 6,
      case_title: 'Galactic Intelligence Core',
      case_explanation: `Store phases as dict with phase_name as key, value is dict with "crew" and "systems" (dict of system:power). For query use .get() to check if phase exists, calculate total_power by summing systems.values(). Merge all systems across phases using max() for duplicates, then sort keys alphabetically.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 84 if it exists
    await problemsCollection.deleteOne({ problem_id: 84 });
    await testCasesCollection.deleteMany({ problem_id: 84 });

    // Insert problem 84
    const problemResult = await problemsCollection.insertOne(problem84);
    console.log('Problem 84 inserted');

    // Test cases for Problem 84 (7 test cases total)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 841,
        problem_id: 84,
        input: '2\nAtmospheric_Entry\n5\n2\nHeat_Shields\n80\nNavigation\n100\nCanyon_Descent\n3\n1\nThrusters\n90\nAtmospheric_Entry',
        expected_output: 'Phase: Atmospheric_Entry, Crew: 5, Power: 180\nHeat_Shields: 80\nNavigation: 100\nThrusters: 90',
        is_hidden: false,
        weight: 15
      },
      {
        test_case_id: 842,
        problem_id: 84,
        input: '1\nVORAX9_Landing\n10\n3\nStabilizers\n95\nComms\n90\nScanners\n85\nVORAX9_Landing',
        expected_output: 'Phase: VORAX9_Landing, Crew: 10, Power: 270\nComms: 90\nScanners: 85\nStabilizers: 95',
        is_hidden: false,
        weight: 15
      },
      // Hidden test cases
      {
        test_case_id: 843,
        problem_id: 84,
        input: '2\nOrbit_Break\n4\n1\nRetro_Rockets\n70\nSurface_Approach\n6\n2\nRetro_Rockets\n90\nLanding_Gear\n80\nOrbit_Break',
        expected_output: 'Phase: Orbit_Break, Crew: 4, Power: 70\nLanding_Gear: 80\nRetro_Rockets: 90',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 844,
        problem_id: 84,
        input: '1\nFinal_Descent\n8\n2\nEmergency_Systems\n100\nLife_Support\n60\nAbort_Sequence',
        expected_output: 'Phase not found\nEmergency_Systems: 100\nLife_Support: 60',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 845,
        problem_id: 84,
        input: '3\nPhase_Alpha\n5\n2\nShields\n80\nPower_Grid\n70\nPhase_Beta\n7\n2\nEngines\n90\nShields\n85\nPhase_Gamma\n3\n1\nPower_Grid\n95\nPhase_Beta',
        expected_output: 'Phase: Phase_Beta, Crew: 7, Power: 175\nEngines: 90\nPower_Grid: 95\nShields: 85',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 846,
        problem_id: 84,
        input: '2\nErevos7_Entry\n6\n3\nHeat_Shields\n100\nComms\n95\nThrusters\n90\nCanyon_Nav\n4\n1\nRadar\n50\nErevos7_Entry',
        expected_output: 'Phase: Erevos7_Entry, Crew: 6, Power: 285\nComms: 95\nHeat_Shields: 100\nRadar: 50\nThrusters: 90',
        is_hidden: true,
        weight: 15
      },
      {
        test_case_id: 847,
        problem_id: 84,
        input: '2\nRescue_Prep\n5\n2\nMedical_Bay\n80\nCargo_Bay\n80\nVORAX9_Contact\n5\n2\nComms_Array\n80\nBeacon\n80\nUnknown_Phase',
        expected_output: 'Phase not found\nBeacon: 80\nCargo_Bay: 80\nComms_Array: 80\nMedical_Bay: 80',
        is_hidden: true,
        weight: 10
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 84`);

    console.log('\n✅ Problem 84 (Level 2, Session 4, Case 6: Descent Protocol to VORAX-9 - Final Challenge) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem84()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
