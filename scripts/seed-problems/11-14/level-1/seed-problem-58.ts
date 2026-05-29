import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem58() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 58: Session 8 Final Task - Satellite Data Logger
    const problem58 = {
      problem_id: 58,
      session_id: 8,
      title: 'Satellite Data Logger',
      description: `NOVA-12's stellar archives have been successfully restored, but the recovered sensor data logs are scattered and disorganized. The ship's maintenance system needs a reliable way to manage historical sensor readings from various satellite arrays.

Astra: Commander, we need to establish proper data logging procedures. These stellar radiation readings must be organized with precision—the archive system needs to handle insertions, removals, and maintain both original and sorted records for analysis.

Your mission is to demonstrate proper data management for the ship's sensor archive system.`,

      question: `Commander, time to set up the Satellite Data Logger!
Your program should manage satellite sensor data that:
- Starts with three initial sensor readings: 230, 245, 260
- Inserts a new reading (250) at index 2
- Removes the last reading from the archive
- Creates a backup copy of the current readings and sorts them
- Displays both the original reading sequence and the sorted backup`,

      difficulty: 'Medium',
      example_code: `# Satellite Data Logger
# Your code here
`,
      sample_input: '',
      sample_output: `Original Readings: [230, 245, 250]
Copied & Sorted: [230, 245, 250]`,
      age_group: '11-14',
      level_number: 1,

      objectives: `- Use \`.insert()\` to add items at specific positions in a list
- Use \`.pop()\` to remove and return the last item from a list
- Use \`.copy()\` to create an independent duplicate of a list
- Use \`.sort()\` to organize list items in ascending order
- Understand the difference between modifying original lists and working with copies
- Print multiple list versions for comparison`,

      concepts: `- List Methods: Using \`.insert(index, value)\` to add items at specific positions
- List Methods: Using \`.pop()\` to remove the last item from a list
- List Methods: Using \`.copy()\` to create an independent duplicate
- List Methods: Using \`.sort()\` to arrange items in numerical order
- List Independence: Understanding that copied lists can be modified separately
- Data Management: Maintaining original data while creating organized views
- Archive Systems: Keeping both chronological and sorted records`,

      metadata: {
        concepts: ['lists', 'insert', 'pop', 'copy', 'sort', 'data management'],
        space_theme: true,
        story_linked: true,
        estimated_time_minutes: 25,
        is_final_task: true
      },



      // Case-specific content (Final Task)
      case_number: 6,
      case_title: 'Satellite Data Logger - Sensor Archive System',
      // case_overview removed for final tasks (Case 6)

      case_code: `# Create initial sensor readings
readings = [230, 245, 260]

# Insert new reading at index 2
readings.insert(2, 250)

# Remove the last element
readings.pop()

# Create a backup copy and sort it
sorted_readings = readings.copy()
sorted_readings.sort()

# Display both versions
print("Original Readings:", readings)
print("Copied & Sorted:", sorted_readings)`,

      case_explanation: `Use .insert(2, 250) to add an item at index 2. Use .pop() to remove the last element. Use .copy() to create an independent copy of the list. Use .sort() on the copied list only. Print the original list first, then print the sorted copy. The original list should remain in insertion order while the copy is sorted.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    await problemsCollection.deleteOne({ problem_id: 58 });
    await problemsCollection.insertOne(problem58);
    console.log('Problem 58 (Session 8 Final Task) inserted');

    // Test cases for Problem 58
    const testCases58 = [
      {
        test_case_id: 'tc_58_1',
        problem_id: 58,
        input: '',
        expected_output: `Original Readings: [230, 245, 250]
Copied & Sorted: [230, 245, 250]`,
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      {
        test_case_id: 'tc_58_2',
        problem_id: 58,
        input: '',
        expected_output: `Original Readings: [230, 245, 250]
Copied & Sorted: [230, 245, 250]`,
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    await testCasesCollection.deleteMany({ problem_id: 58 });
    await testCasesCollection.insertMany(testCases58);
    console.log(`${testCases58.length} test cases inserted for Problem 58`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.close();
  }
}

seedProblem58();
