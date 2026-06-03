/**
 * Source-of-truth Teaching Guides (answer keys), seeded into the `solutions` collection.
 * Idempotent upsert by problem_id. Run: npx tsx apps/api/scripts/seed-solutions.ts
 * (from Coderunner-Backend, with .env.local present).
 */
import './_load-env';
import { connectToDatabase, Models } from '@code-runner/shared';

const GUIDES = [
  {
    problem_id: 1, level_number: 1, session_id: 1, case_number: 1,
    solution_code: 'print("Welcome to the Python Space Program!")',
    walkthrough: [
      { label: 'Print the message', code_snippet: 'print("Welcome to the Python Space Program!")',
        explanation: 'print() shows text on the screen. The text goes inside the brackets, wrapped in quotes.' },
    ],
    student_explanation: "print() is how a program 'talks'. Whatever you put inside the brackets in quotes shows up on screen exactly as written.",
    worked_example: 'print("Hello") shows: Hello',
    key_concepts: ['print()', 'strings', 'quotes'],
    common_mistakes: ['Forgetting the quotes around the text', 'Writing Print with a capital P - Python needs lowercase print'],
  },
  {
    problem_id: 2, level_number: 1, session_id: 1, case_number: 2,
    solution_code: 'print("Rocket speed is", 27500, "km/h")',
    walkthrough: [
      { label: 'Print text and a number together', code_snippet: 'print("Rocket speed is", 27500, "km/h")',
        explanation: 'Separate the pieces with commas. Python prints them in order with a space between each.' },
    ],
    student_explanation: "You can print words and numbers in the same line. Put a comma between each piece - Python adds a space automatically. Numbers don't need quotes; words do.",
    worked_example: 'print("Speed:", 400) shows: Speed: 400',
    key_concepts: ['print()', 'commas in print', 'numbers vs strings'],
    common_mistakes: ['Putting quotes around the number (then it is text, not a number)', 'Forgetting the comma between items'],
  },
  {
    problem_id: 3, level_number: 1, session_id: 1, case_number: 3,
    solution_code: 'print("Escape velocity is", 11.2 * 1000, "m/s")',
    walkthrough: [
      { label: 'Let Python do the maths inside print', code_snippet: 'print("Escape velocity is", 11.2 * 1000, "m/s")',
        explanation: 'Python works out 11.2 * 1000 first (= 11200.0), then prints the result.' },
    ],
    student_explanation: 'Python can do maths right inside print(). It calculates first, then shows the answer. A decimal in the maths makes the answer a decimal (11200.0).',
    worked_example: 'print(8 + 4) shows: 12',
    key_concepts: ['print()', 'arithmetic', 'float result'],
    common_mistakes: ['Expecting 11200 instead of 11200.0 - a decimal makes the answer a decimal', 'Putting the calculation in quotes (then it prints the text, not the result)'],
  },
  {
    problem_id: 4, level_number: 1, session_id: 1, case_number: 4,
    solution_code: 'astronaut = "Commander Ray"\nmission = "Lunar Orbiter 1"\nprint(astronaut, "is leading the", mission)',
    walkthrough: [
      { label: 'Store values in variables', code_snippet: 'astronaut = "Commander Ray"\nmission = "Lunar Orbiter 1"',
        explanation: 'A variable is a labelled box. Name on the left of =, value on the right.' },
      { label: 'Use the variables in print', code_snippet: 'print(astronaut, "is leading the", mission)',
        explanation: 'Python swaps each variable name for its stored value when it prints.' },
    ],
    student_explanation: 'A variable remembers a value so you can use it later. Make one with name = value. When you print the name, Python shows what is stored inside, not the word itself.',
    worked_example: 'name = "Sam"  then  print(name)  shows: Sam',
    key_concepts: ['variables', 'assignment', 'print() with variables'],
    common_mistakes: ['Printing the name in quotes - print("astronaut") shows the word, not Commander Ray', 'Forgetting quotes when storing the text'],
  },
  {
    problem_id: 5, level_number: 1, session_id: 1, case_number: 5,
    solution_code: 'planet = "Jupiter"\nmoons = 79\nprint(f"{planet} has {moons} known moons.")',
    walkthrough: [
      { label: 'Store the values', code_snippet: 'planet = "Jupiter"\nmoons = 79',
        explanation: 'Two variables: the planet name (text) and the moon count (number).' },
      { label: 'Build a sentence with an f-string', code_snippet: 'print(f"{planet} has {moons} known moons.")',
        explanation: 'Put f before the quotes, then {planet} and {moons} are replaced by their values.' },
    ],
    student_explanation: 'An f-string is a neat way to drop variables into a sentence. Start the quotes with the letter f, then write {variable} wherever you want its value to appear.',
    worked_example: 'name = "Sam"  then  print(f"Hi {name}!")  shows: Hi Sam!',
    key_concepts: ['f-strings', 'variables', 'string formatting'],
    common_mistakes: ['Forgetting the f before the quotes - then it prints {planet} literally', 'Using the wrong brackets - f-strings use curly braces {}'],
  },
];

async function seed() {
  await connectToDatabase();
  console.log('Connected. Seeding', GUIDES.length, 'teaching guides...');
  for (const g of GUIDES) {
    // reset verified on every (re)seed; the verifier re-establishes it so a changed
    // solution_code can never keep a stale VERIFIED badge.
    await Models.Solution.updateOne({ problem_id: g.problem_id }, { $set: { ...g, verified: false } }, { upsert: true });
    console.log('  - guide for problem', g.problem_id, '(L' + g.level_number + ' S' + g.session_id + ' case' + g.case_number + ')');
  }
  const count = await Models.Solution.countDocuments({});
  console.log('Done.', count, 'solution(s) in the collection.');
  process.exit(0);
}

seed().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
