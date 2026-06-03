import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem60() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 60: Session 10 Final Task - Asteroid Mining Drill Simulation
    const problem60 = {
      problem_id: 60,
      session_id: 10,
      title: 'Asteroid Mining Drill Simulation',
      description: `The signal from Erevos-7 strengthens. Coordinates are computed and plotted as safe warp jumps across interstellar space. But before the journey begins, NOVA-12 must extract critical minerals from a nearby asteroid to fuel the long voyage.

Astra: *"Commander, we've located a mineral-rich asteroid in our path. We need to deploy the mining drill to extract fuel cores from varying depths. The drill must operate in precise 20-meter intervals, monitoring for mineral layers at 60 meters and reaching the core at 100 meters. Use range() to control the drilling sequence."*

Your mission is to simulate the asteroid mining drill operation for NOVA-12's resource extraction.`,

      question: `Commander, initiate the Asteroid Mining Drill Simulation!

Your program should execute the drilling sequence:
- Print "Starting asteroid drilling sequence..."
- Create a for loop using range(0, 120, 20) to drill from 0 to 100 meters in steps of 20
- Inside the loop, print "Drilling depth: [depth] meters" for each depth
- Add conditional checks:
  - When depth equals 60: print "Mineral layer detected - slowing rotation speed."
  - When depth equals 100: print "Core reached - collecting samples."
- After the loop completes, print "Extraction complete - returning to orbit."

This demonstrates range() with start, stop, and step parameters combined with conditionals.`,

      difficulty: 'Medium',
      example_code: `# Asteroid Mining Drill Simulation
# Your code here
`,
      sample_input: '',
      sample_output: `Starting asteroid drilling sequence...
Drilling depth: 0 meters
Drilling depth: 20 meters
Drilling depth: 40 meters
Drilling depth: 60 meters
Mineral layer detected - slowing rotation speed.
Drilling depth: 80 meters
Drilling depth: 100 meters
Core reached - collecting samples.
Extraction complete - returning to orbit.`,
      age_group: '11-14',
      level_number: 1,

      metadata: {
        concepts: ['range', 'step parameter', 'conditionals', 'loops', 'intervals'],
        space_theme: true,
        story_linked: true,
        estimated_time_minutes: 25,
        is_final_task: true
      },
      // Case-specific content (Final Task)
      case_number: 6,
      case_title: 'Asteroid Mining Drill Simulation - Interval Extraction System',
      case_explanation: `Use range(0, 120, 20) to create drilling intervals from 0 to 100 in steps of 20. The third parameter (20) is the step size, which controls how much to increment each iteration. range(0, 120, 20) generates: 0, 20, 40, 60, 80, 100 (stops before 120). Print "Starting asteroid drilling sequence..." before the loop. Inside the loop: for depth in range(0, 120, 20):. Print "Drilling depth:", depth, "meters" for each iteration. Use if depth == 60: to check for mineral layer, then print "Mineral layer detected - slowing rotation speed." Use if depth == 100: to check for core, then print "Core reached - collecting samples." After the loop completes, print "Extraction complete - returning to orbit." This combines range() step control with conditional logic for event detection at specific depths.`
    };

    await problemsCollection.deleteOne({ problem_id: 60 });
    await problemsCollection.insertOne(problem60);
    console.log('Problem 60 (Session 10 Final Task) inserted');

    // Test cases for Problem 60
    const testCases60 = [
      {
        test_case_id: 'tc_60_1',
        problem_id: 60,
        input: '',
        expected_output: `Starting asteroid drilling sequence...
Drilling depth: 0 meters
Drilling depth: 20 meters
Drilling depth: 40 meters
Drilling depth: 60 meters
Mineral layer detected - slowing rotation speed.
Drilling depth: 80 meters
Drilling depth: 100 meters
Core reached - collecting samples.
Extraction complete - returning to orbit.`,
        is_hidden: false,
        weight: 1.0
      },
      {
        test_case_id: 'tc_60_2',
        problem_id: 60,
        input: '',
        expected_output: `Starting asteroid drilling sequence...
Drilling depth: 0 meters
Drilling depth: 20 meters
Drilling depth: 40 meters
Drilling depth: 60 meters
Mineral layer detected - slowing rotation speed.
Drilling depth: 80 meters
Drilling depth: 100 meters
Core reached - collecting samples.
Extraction complete - returning to orbit.`,
        is_hidden: true,
        weight: 1.0
      }
    ];

    await testCasesCollection.deleteMany({ problem_id: 60 });
    await testCasesCollection.insertMany(testCases60);
    console.log(`${testCases60.length} test cases inserted for Problem 60`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.close();
  }
}

seedProblem60();
