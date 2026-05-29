import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem55() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 55: Session 5, Final Task - Launch Authorization Protocol
    const problem55 = {
      problem_id: 55,
      session_id: 5,
      title: 'Launch Authorization Protocol',
      description: `Before NOVA-12 transitions from standby to taxi power, the crew must verify all personnel meet mission requirements.

Astra: "Build the Launch Authorization Protocol to check crew eligibility. Every cadet must meet the minimum age requirement for deep space operations. Space agencies enforce strict age limits—cadets under 18 cannot serve in primary flight positions."

Create the protocol that validates crew member eligibility.`,

      question: `Commander, it's time to build the Launch Authorization Protocol!
Your program should:
1. Ask for the crew member's age
2. Check if the age meets the minimum requirement:
   - If age is 18 or more, print: \`"Cadet approved for mission!"\`
   - If age is less than 18, print: \`"Cadet too young for this mission!"\``,

      difficulty: 'Easy',
      example_code: `# Launch Authorization Protocol
# Your code here
`,

      sample_input: `20`,
      sample_output: `Cadet approved for mission!`,

      age_group: '11-14',
      level_number: 1,

      objectives: `- Use \`input()\` to collect crew member age data
- Apply comparison operators (\`>=\`, \`<\`) to validate age requirements
- Make decisions using \`if/else\` conditional statements
- Output appropriate authorization messages based on eligibility
- Understand real-world applications of decision-making logic
- Implement regulatory compliance checks in automated systems`,

      concepts: `- Comparison Operators: Using \`>=\` and \`<\` to check age thresholds
- Conditional Statements: Making binary decisions with \`if/else\`
- Boolean Logic: Understanding how conditions evaluate to True or False
- Input Validation: Checking user-provided data against requirements
- Automated Decision Systems: How computers make rule-based decisions
- Regulatory Compliance: Understanding how software enforces safety policies`,

      metadata: {
        concepts: ['comparison operators', 'conditionals', 'if-else statements', 'input validation', 'boolean logic'],
        space_theme: true,
        story_linked: true,
        estimated_time_minutes: 20,
        is_final_task: true
      },
      // Case-specific content (Final Task)
      case_number: 6,
      case_title: 'Launch Authorization Protocol - Crew Eligibility Gateway',
      // case_overview removed for final tasks (Case 6)
      case_code: `# Sample Example:
score = int(input())
if score >= 50:
    print("Passed!")
else:
    print("Failed!")

# Now try for our task.`,
      case_explanation: `How to Approach This Problem:

1. Use \`int(input())\` to read the age value

2. Minimum age for mission crew: 18 years

3. Use \`if\` statement to check: \`age >= 18\`

- If True: print "Cadet approved for mission!"

- Use \`else\` to handle the False case

- If False: print "Cadet too young for this mission!"

4. \`>=\` means "greater than or equal to"

- \`age >= 18\` returns True if age is 18, 19, 20, etc.

- \`age >= 18\` returns False if age is 17, 16, 15, etc.

- The \`<\` operator works oppositely (less than)

5. The \`if\` block runs when the condition is True

- The \`else\` block runs when the condition is False

- Only ONE of these blocks will execute

- No need to check \`age < 18\` in else—it's automatic`,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Upsert problem 55
    const problemResult = await problemsCollection.updateOne(
      { problem_id: 55 },
      { $set: problem55 },
      { upsert: true }
    );

    console.log('Problem 55 upserted:', problemResult.upsertedId || 'Updated existing');

    // Test cases for Problem 55
    const testCases55 = [
      // Visible test case - approved (age >= 18)
      {
        problem_id: 55,
        test_case_id: 1,
        input: '20',
        expected_output: 'Cadet approved for mission!',
        is_hidden: false,
        is_sample: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test case - exactly at boundary (approved)
      {
        problem_id: 55,
        test_case_id: 2,
        input: '18',
        expected_output: 'Cadet approved for mission!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test case - denied (age < 18)
      {
        problem_id: 55,
        test_case_id: 3,
        input: '17',
        expected_output: 'Cadet too young for this mission!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test case - young cadet (denied)
      {
        problem_id: 55,
        test_case_id: 4,
        input: '12',
        expected_output: 'Cadet too young for this mission!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      },
      // Hidden test case - approved (older cadet)
      {
        problem_id: 55,
        test_case_id: 5,
        input: '25',
        expected_output: 'Cadet approved for mission!',
        is_hidden: true,
        weight: 1.0,
        created_at: new Date()
      }
    ];

    // Delete existing test cases for problem 55
    await testCasesCollection.deleteMany({ problem_id: 55 });

    // Insert test cases
    const testCasesResult = await testCasesCollection.insertMany(testCases55);
  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
}

// Run the seed function
seedProblem55()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
