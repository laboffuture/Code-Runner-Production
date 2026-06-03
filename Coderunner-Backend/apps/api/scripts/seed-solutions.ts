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

  // ── Session 2: Understanding Variables & Data Types (cases 1–6) ──
  {
    problem_id: 6, level_number: 1, session_id: 2, case_number: 1,
    solution_code: 'planet_name = "Mars"\ntemperature = -63\nprint(planet_name)\nprint(temperature)',
    walkthrough: [
      { label: 'Make two variables', code_snippet: 'planet_name = "Mars"\ntemperature = -63',
        explanation: 'A variable is a labelled box that stores a value: the name on the left of =, the value on the right. Text needs quotes; numbers (even negative ones) do not.' },
      { label: 'Print each on its own line', code_snippet: 'print(planet_name)\nprint(temperature)',
        explanation: 'Each print() puts its value on a new line, so Mars shows first and -63 below it.' },
    ],
    student_explanation: "A variable remembers a value for you. Here we store the planet's name as text and the temperature as a number, then print them one after another. Two separate print() calls make two separate lines.",
    worked_example: 'city = "Paris"  then  print(city)  shows: Paris',
    key_concepts: ['variables', 'assignment', 'strings vs numbers'],
    common_mistakes: ['Putting quotes around -63, which turns the number into text', 'Printing both on one line instead of using two separate print() calls'],
  },
  {
    problem_id: 7, level_number: 1, session_id: 2, case_number: 2,
    solution_code: 'mission_days = 30\noxygen_level = 98.6\nrover_name = "Explorer-1"\nmission_active = True\nprint(mission_days)\nprint(oxygen_level)\nprint(rover_name)\nprint(mission_active)',
    walkthrough: [
      { label: 'Four values, four data types', code_snippet: 'mission_days = 30\noxygen_level = 98.6\nrover_name = "Explorer-1"\nmission_active = True',
        explanation: 'Python stores data in different types: a whole number (int) 30, a decimal (float) 98.6, text (str) "Explorer-1", and a True/False value (bool) True.' },
      { label: 'Print all four', code_snippet: 'print(mission_days)\nprint(oxygen_level)\nprint(rover_name)\nprint(mission_active)',
        explanation: 'Each value prints on its own line. Notice True has a capital T and no quotes - it is a boolean, not text.' },
    ],
    student_explanation: 'Python keeps different kinds of information in different types: whole numbers, decimals, text, and True/False values. You write each a little differently - text gets quotes, while True and False are capitalised and never get quotes.',
    worked_example: 'is_ready = True  then  print(is_ready)  shows: True',
    key_concepts: ['data types', 'int / float / str / bool', 'booleans'],
    common_mistakes: ['Writing true instead of True (Python needs the capital T)', 'Putting quotes around 98.6 or True, which turns them into text'],
  },
  {
    problem_id: 8, level_number: 1, session_id: 2, case_number: 3,
    solution_code: 'gravity = 9.8\nprint(type(gravity))',
    walkthrough: [
      { label: 'Store a decimal value', code_snippet: 'gravity = 9.8',
        explanation: '9.8 has a decimal point, so Python treats it as a float (a decimal number).' },
      { label: 'Ask Python what type it is', code_snippet: 'print(type(gravity))',
        explanation: "type() reports the kind of data a value is. Printing it shows <class 'float'>." },
    ],
    student_explanation: "If you are unsure what kind of data a value is, type() tells you. A number with a decimal point is a float, so Python reports <class 'float'>.",
    worked_example: "x = 5  then  print(type(x))  shows: <class 'int'>",
    key_concepts: ['type()', 'float', 'checking data types'],
    common_mistakes: ['Writing gravity = "9.8" with quotes, which would report str instead of float', 'Forgetting to put type() inside print() so the result actually shows'],
  },
  {
    problem_id: 9, level_number: 1, session_id: 2, case_number: 4,
    solution_code: 'sample = "rock"\nprint(sample)\nsample = 42\nprint(sample)',
    walkthrough: [
      { label: 'Start with text', code_snippet: 'sample = "rock"\nprint(sample)',
        explanation: 'sample holds the word rock, and we print it.' },
      { label: 'Reassign to a number', code_snippet: 'sample = 42\nprint(sample)',
        explanation: 'Assigning a new value after = replaces the old one. Now sample holds 42, so the second print shows 42.' },
    ],
    student_explanation: 'A variable can change at any time - just give it a new value and the old one is forgotten. In Python the new value can even be a different type, like text first and then a number.',
    worked_example: 'score = 10  then  score = 20  then  print(score)  shows: 20',
    key_concepts: ['reassignment', 'variables can change', 'dynamic typing'],
    common_mistakes: ['Thinking you need a new name for the new value - reusing sample is the whole point', 'Expecting rock and 42 on the same line instead of two lines'],
  },
  {
    problem_id: 10, level_number: 1, session_id: 2, case_number: 5,
    solution_code: 'astronaut_name = input()\nmission_time = input()\nprint("Welcome, Commander " + astronaut_name)\nprint("Mission duration is " + mission_time + " days")',
    walkthrough: [
      { label: 'Read two inputs', code_snippet: 'astronaut_name = input()\nmission_time = input()',
        explanation: 'input() pauses and reads one typed line. The first line becomes the name, the second becomes the mission time. Both arrive as text.' },
      { label: 'Build the two messages', code_snippet: 'print("Welcome, Commander " + astronaut_name)\nprint("Mission duration is " + mission_time + " days")',
        explanation: 'Joining text with + glues the pieces together, wrapping the name in a welcome line and the time between two pieces of text.' },
    ],
    student_explanation: 'input() lets the program ask the user for information. Whatever they type comes back as text, which you can join to other text with the + sign to build a friendly message.',
    worked_example: 'name = input()  then  print("Hi " + name)  - if the user types Sam, shows: Hi Sam',
    key_concepts: ['input()', 'joining text with +', 'order of inputs'],
    common_mistakes: ['Reading the two inputs in the wrong order', 'Trying to + a number onto text - keep mission_time as text so the + works', 'Forgetting the spaces inside "Welcome, Commander " and " days"'],
  },
  {
    problem_id: 52, level_number: 1, session_id: 2, case_number: 6,
    solution_code: 'spaceship = input()\ndistance = input()\nastronauts = input()\nsystems_online = input()\nprint(spaceship)\nprint(distance)\nprint(astronauts)\nprint(systems_online)',
    walkthrough: [
      { label: 'Collect four inputs in order', code_snippet: 'spaceship = input()\ndistance = input()\nastronauts = input()\nsystems_online = input()',
        explanation: 'Four input() calls read four lines in the order the question lists: ship name, distance, crew count, and the systems status.' },
      { label: 'Echo them back in the same order', code_snippet: 'print(spaceship)\nprint(distance)\nprint(astronauts)\nprint(systems_online)',
        explanation: 'Print each value on its own line, in the same order they were read, so the output mirrors the input exactly.' },
    ],
    student_explanation: 'This is the session challenge: read several pieces of information one after another, then print them back in the same order. Keeping every value as text means each one prints exactly as the user typed it.',
    worked_example: 'Read two values, then print them back - if the user types Mars then 5, it shows Mars on one line and 5 on the next.',
    key_concepts: ['multiple inputs', 'input order', 'echoing values'],
    common_mistakes: ['Reading the four inputs in a different order than the question lists', 'Converting distance to a number - keep it as text so 384.4 prints unchanged', 'Printing all values on one line instead of four separate lines'],
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
