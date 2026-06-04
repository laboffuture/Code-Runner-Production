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

  // ── Session 1: case 6 challenge ──
  {
    problem_id: 51, level_number: 1, session_id: 1, case_number: 6,
    solution_code: 'name = input()\nprint(f"Welcome, Cadet {name}! Preparing your mission log...")\ndays = 15\nhours = days * 24\nprint(f"Mission Duration: {hours} hours. Good luck, {name}!")',
    walkthrough: [
      { label: 'Greet the cadet by name', code_snippet: 'name = input()\nprint(f"Welcome, Cadet {name}! Preparing your mission log...")',
        explanation: 'Read the name once, then drop it into the welcome line with an f-string.' },
      { label: 'Work out the hours and sign off', code_snippet: 'days = 15\nhours = days * 24\nprint(f"Mission Duration: {hours} hours. Good luck, {name}!")',
        explanation: 'A 15-day mission is 15 * 24 = 360 hours. The same name is reused in the final line.' },
    ],
    student_explanation: "This challenge brings input and f-strings together: ask once for the name, use it in two different sentences, and let Python do the 15 * 24 maths so the hours are always right.",
    worked_example: 'days = 2  then  print(2 * 24)  shows: 48',
    key_concepts: ['input()', 'f-strings', 'reusing a variable'],
    common_mistakes: ['Typing 360 by hand instead of calculating 15 * 24', 'Forgetting the f before a quote, so {name} prints literally'],
  },

  // ── Session 3: Input Function and Type Conversions (cases 1–6) ──
  {
    problem_id: 11, level_number: 1, session_id: 3, case_number: 1,
    solution_code: 'name = input()\nprint("Hello, " + name)',
    walkthrough: [
      { label: 'Read the name', code_snippet: 'name = input()', explanation: 'input() reads one typed line and stores it as text.' },
      { label: 'Greet them', code_snippet: 'print("Hello, " + name)', explanation: 'The + glues "Hello, " onto the name to make one greeting.' },
    ],
    student_explanation: 'input() collects whatever the user types as text. Joining it to other text with + lets you build a personal greeting.',
    worked_example: 'print("Hi " + name)  - if the user types Sam, shows: Hi Sam',
    key_concepts: ['input()', 'joining text with +'],
    common_mistakes: ['Forgetting the space inside "Hello, " so it reads HelloAlice', 'Putting name in quotes, which prints the word instead of the value'],
  },
  {
    problem_id: 12, level_number: 1, session_id: 3, case_number: 2,
    solution_code: 'age = int(input())\nprint("Next year, you will be", age + 1)',
    walkthrough: [
      { label: 'Read and convert the age', code_snippet: 'age = int(input())', explanation: 'input() gives text, so int() turns "15" into the number 15 we can add to.' },
      { label: 'Add one and print', code_snippet: 'print("Next year, you will be", age + 1)', explanation: 'Commas in print() add a space between the text and the result of age + 1.' },
    ],
    student_explanation: "Numbers typed by the user arrive as text, so wrap input() in int() before doing maths. A comma inside print() then joins your message and the number.",
    worked_example: 'age = int(input())  then  print(age + 1)  - typing 15 shows: 16',
    key_concepts: ['int()', 'converting input', 'arithmetic'],
    common_mistakes: ['Forgetting int(), so "15" + 1 causes an error', 'Trying to glue a number onto text with + instead of using a comma'],
  },
  {
    problem_id: 13, level_number: 1, session_id: 3, case_number: 3,
    solution_code: 'distance = float(input())\nmeters = distance * 1000\nprint("Distance in meters is", meters)',
    walkthrough: [
      { label: 'Read a decimal value', code_snippet: 'distance = float(input())', explanation: 'float() turns the typed text into a decimal number, so 5.5 stays 5.5.' },
      { label: 'Convert km to metres', code_snippet: 'meters = distance * 1000\nprint("Distance in meters is", meters)', explanation: 'One kilometre is 1000 metres, so multiply. A decimal times a number stays a decimal (5500.0).' },
    ],
    student_explanation: "Use float() when the value can have a decimal point. Multiplying a decimal keeps the decimal, which is why the answer ends in .0.",
    worked_example: 'x = float(input())  then  print(x * 1000)  - typing 5.5 shows: 5500.0',
    key_concepts: ['float()', 'decimals', 'arithmetic'],
    common_mistakes: ['Using int() and losing the decimal part', 'Expecting 5500 instead of 5500.0 - a decimal stays a decimal'],
  },
  {
    problem_id: 14, level_number: 1, session_id: 3, case_number: 4,
    solution_code: 'days = int(input())\ntotal_hours = days * 24\nprint("Mission Duration:", total_hours, "hours")',
    walkthrough: [
      { label: 'Read the number of days', code_snippet: 'days = int(input())', explanation: 'int() turns the typed text into a whole number.' },
      { label: 'Convert days to hours', code_snippet: 'total_hours = days * 24\nprint("Mission Duration:", total_hours, "hours")', explanation: 'Each day has 24 hours, so multiply. The commas put a space on each side of the number.' },
    ],
    student_explanation: "Convert the input to a number with int(), do the maths, then print the label, the result, and the unit using commas so the spacing is automatic.",
    worked_example: 'days = int(input())  then  print(days * 24)  - typing 7 shows: 168',
    key_concepts: ['int()', 'multiplication', 'print with commas'],
    common_mistakes: ['Forgetting int() before multiplying', 'Leaving out the "hours" label at the end'],
  },
  {
    problem_id: 15, level_number: 1, session_id: 3, case_number: 5,
    solution_code: 'name = input()\ndays = int(input())\nconsumption = float(input())\ntotal = days * consumption\nprint(f"Cadet {name}, your spacecraft will need {total} liters of fuel for {days} days.")',
    walkthrough: [
      { label: 'Collect three inputs with the right types', code_snippet: 'name = input()\ndays = int(input())\nconsumption = float(input())', explanation: 'The name stays text, the days become a whole number, and the fuel rate becomes a decimal.' },
      { label: 'Calculate and report', code_snippet: 'total = days * consumption\nprint(f"Cadet {name}, your spacecraft will need {total} liters of fuel for {days} days.")', explanation: 'Multiply days by the daily rate, then build the sentence with an f-string.' },
    ],
    student_explanation: "Pick the right conversion for each input: text for a name, int() for a whole count, float() for a decimal rate. An f-string then slots them into one sentence.",
    worked_example: 'days = 10, rate = 5.5  then  10 * 5.5  shows: 55.0',
    key_concepts: ['int() and float()', 'multiplication', 'f-strings'],
    common_mistakes: ['Converting the name with int() or float()', 'Mixing up which input is the days and which is the rate'],
  },
  {
    problem_id: 53, level_number: 1, session_id: 3, case_number: 6,
    solution_code: 'name = input()\ndays = int(input())\nconsumption = float(input())\ntotal_fuel = days * consumption\nprint(f"Cadet {name}, your spacecraft will need {total_fuel} liters of fuel for {days} days.")',
    walkthrough: [
      { label: 'Read name, days, and fuel rate', code_snippet: 'name = input()\ndays = int(input())\nconsumption = float(input())', explanation: 'Same pattern as before: text, whole number, decimal.' },
      { label: 'Total the fuel and announce it', code_snippet: 'total_fuel = days * consumption\nprint(f"Cadet {name}, your spacecraft will need {total_fuel} liters of fuel for {days} days.")', explanation: 'Total fuel is days times the daily consumption, printed inside an f-string.' },
    ],
    student_explanation: "The session challenge repeats the fuel calculation with bigger numbers. The skill is choosing int() for days and float() for the rate so the multiplication is exact.",
    worked_example: 'days = 15, rate = 250.5  then  15 * 250.5  shows: 3757.5',
    key_concepts: ['input conversions', 'multiplication', 'f-strings'],
    common_mistakes: ['Swapping int() and float() between days and rate', 'Forgetting the full stop at the end of the sentence'],
  },

  // ── Session 4: Understanding Operators (cases 1–6) ──
  {
    problem_id: 16, level_number: 1, session_id: 4, case_number: 1,
    solution_code: 'fuel_used = 200\nfuel_remaining = 300\ntotal_fuel = fuel_used + fuel_remaining\nprint("Total fuel:", total_fuel)',
    walkthrough: [
      { label: 'Store two numbers', code_snippet: 'fuel_used = 200\nfuel_remaining = 300', explanation: 'Two variables hold the amounts we want to add.' },
      { label: 'Add and print', code_snippet: 'total_fuel = fuel_used + fuel_remaining\nprint("Total fuel:", total_fuel)', explanation: 'The + operator adds the two numbers; the comma prints the label and total with a space.' },
    ],
    student_explanation: "The + operator adds numbers together. Store each value in a variable, add them into a new variable, and print the result with a label.",
    worked_example: 'a = 200, b = 300  then  print(a + b)  shows: 500',
    key_concepts: ['the + operator', 'variables', 'print with commas'],
    common_mistakes: ['Putting quotes around the numbers, which would join them as text', 'Forgetting the "Total fuel:" label'],
  },
  {
    problem_id: 17, level_number: 1, session_id: 4, case_number: 2,
    solution_code: 'mission_days = 5\nadditional_days = 2\nmission_days += additional_days\nprint("Updated mission duration:", mission_days)',
    walkthrough: [
      { label: 'Start with a count and an extra', code_snippet: 'mission_days = 5\nadditional_days = 2', explanation: 'mission_days is the current total; additional_days is what we add on.' },
      { label: 'Add in place with +=', code_snippet: 'mission_days += additional_days\nprint("Updated mission duration:", mission_days)', explanation: 'mission_days += additional_days is short for mission_days = mission_days + additional_days, so it becomes 7.' },
    ],
    student_explanation: "The += operator adds a value onto a variable and stores the result back in the same variable - a quick way to grow a running total.",
    worked_example: 'x = 5  then  x += 2  then  print(x)  shows: 7',
    key_concepts: ['+= operator', 'updating a variable'],
    common_mistakes: ['Writing mission_days =+ additional_days (wrong order of symbols)', 'Forgetting that += changes the variable itself'],
  },
  {
    problem_id: 18, level_number: 1, session_id: 4, case_number: 3,
    solution_code: 'systems_ready = True\nfuel_level = 80\nmission_go = systems_ready and fuel_level > 50\nprint("Mission Ready?", mission_go)',
    walkthrough: [
      { label: 'Set up the facts', code_snippet: 'systems_ready = True\nfuel_level = 80', explanation: 'A boolean for the systems, and a number for the fuel.' },
      { label: 'Combine with and', code_snippet: 'mission_go = systems_ready and fuel_level > 50', explanation: 'and is True only when BOTH sides are true: systems_ready is True and 80 > 50 is True.' },
    ],
    student_explanation: "The and operator checks two things at once and is only True when both are True. Here both the systems and the fuel pass, so the mission is a go.",
    worked_example: 'print(True and 80 > 50)  shows: True',
    key_concepts: ['and operator', 'booleans', 'comparisons'],
    common_mistakes: ['Using & instead of the word and', 'Thinking and is True when only one side is true'],
  },
  {
    problem_id: 19, level_number: 1, session_id: 4, case_number: 4,
    solution_code: 'days_remaining = 10\ndays_passed = 3\ndays_remaining -= days_passed\nfood_packs = 10\nenough_food = food_packs >= days_remaining\nprint("Food sufficient for mission?", enough_food)',
    walkthrough: [
      { label: 'Subtract the days that passed', code_snippet: 'days_remaining = 10\ndays_passed = 3\ndays_remaining -= days_passed', explanation: '-= subtracts in place, so days_remaining becomes 10 - 3 = 7.' },
      { label: 'Check there is enough food', code_snippet: 'food_packs = 10\nenough_food = food_packs >= days_remaining', explanation: '>= asks "is food at least the days left?" 10 >= 7 is True.' },
    ],
    student_explanation: "-= subtracts a value from a variable in place, and >= checks whether one number is greater than or equal to another. Together they decide if supplies will last.",
    worked_example: 'print(10 >= 7)  shows: True',
    key_concepts: ['-= operator', '>= comparison', 'booleans'],
    common_mistakes: ['Mixing up >= with > (10 >= 10 is True, 10 > 10 is False)', 'Forgetting that -= changes days_remaining before the check'],
  },
  {
    problem_id: 20, level_number: 1, session_id: 4, case_number: 5,
    solution_code: 'battery_level = 80\nsystem_ready = True\nmission_status = "Mission Ready" if battery_level >= 60 and system_ready else "Mission Not Ready"\nprint(mission_status)',
    walkthrough: [
      { label: 'Set the inputs', code_snippet: 'battery_level = 80\nsystem_ready = True', explanation: 'A battery number and a True/False system flag.' },
      { label: 'Choose with a ternary', code_snippet: 'mission_status = "Mission Ready" if battery_level >= 60 and system_ready else "Mission Not Ready"', explanation: 'A ternary picks one of two values on a single line: the first if the condition is True, otherwise the value after else.' },
    ],
    student_explanation: "A ternary expression chooses between two values on one line: VALUE_A if CONDITION else VALUE_B. Here the mission is ready only when the battery is high enough AND the system is ready.",
    worked_example: 'status = "Go" if 80 >= 60 else "No"  then  print(status)  shows: Go',
    key_concepts: ['ternary expression', 'and operator', '>= comparison'],
    common_mistakes: ['Writing the parts in the wrong order (value, then if, then else)', 'Forgetting the else part of the ternary'],
  },
  {
    problem_id: 54, level_number: 1, session_id: 4, case_number: 6,
    solution_code: 'fuel_level = int(input())\noxygen_level = int(input())\nengine_ready = True\nfuel_level -= 25\nif fuel_level > 50 and oxygen_level > 60 and engine_ready == True:\n    print("Launch approved")\nelse:\n    print("Launch denied")',
    walkthrough: [
      { label: 'Read levels and burn pre-ignition fuel', code_snippet: 'fuel_level = int(input())\noxygen_level = int(input())\nengine_ready = True\nfuel_level -= 25', explanation: 'Both levels come in as whole numbers. -= 25 simulates fuel used before ignition.' },
      { label: 'Check all three conditions with and', code_snippet: 'if fuel_level > 50 and oxygen_level > 60 and engine_ready == True:\n    print("Launch approved")\nelse:\n    print("Launch denied")', explanation: 'Chaining and means every condition must pass for approval; if any fails, it is denied.' },
    ],
    student_explanation: "The session challenge combines -= and a triple and check. Remember the fuel is reduced by 25 BEFORE the test, so a ship starting at 76 ends at 51 and just passes.",
    worked_example: 'fuel = 76, then -= 25 makes 51, and 51 > 50 is True',
    key_concepts: ['-= operator', 'chaining and', 'if-else'],
    common_mistakes: ['Checking the fuel before subtracting 25', 'Using or instead of and, which would approve an unsafe launch'],
  },

  // ── Session 5: if, if-else and Comparison Operators (cases 1–6) ──
  {
    problem_id: 21, level_number: 1, session_id: 5, case_number: 1,
    solution_code: 'temperature = int(input())\nif temperature > 30:\n    print("It\'s a hot day!")',
    walkthrough: [
      { label: 'Read the temperature', code_snippet: 'temperature = int(input())', explanation: 'int() turns the typed text into a whole number we can compare.' },
      { label: 'Print only when it is hot', code_snippet: 'if temperature > 30:\n    print("It\'s a hot day!")', explanation: 'The indented line runs only when temperature > 30 is True. Otherwise nothing prints.' },
    ],
    student_explanation: "An if statement runs its indented block only when the condition is True. When the temperature is 30 or below, the condition is False and nothing is printed.",
    worked_example: 'if 35 > 30: print("hot")  shows: hot   (but 25 > 30 prints nothing)',
    key_concepts: ['if statement', 'comparison >', 'indentation'],
    common_mistakes: ['Forgetting to indent the line under if', 'Using >= so that exactly 30 also counts as hot'],
  },
  {
    problem_id: 22, level_number: 1, session_id: 5, case_number: 2,
    solution_code: 'speed = int(input())\nif speed > 60:\n    print("You\'re going too fast!")\nelse:\n    print("You\'re within the speed limit.")',
    walkthrough: [
      { label: 'Read the speed', code_snippet: 'speed = int(input())', explanation: 'Convert the typed text to a whole number.' },
      { label: 'Pick one of two messages', code_snippet: 'if speed > 60:\n    print("You\'re going too fast!")\nelse:\n    print("You\'re within the speed limit.")', explanation: 'if runs when the condition is True; else runs every other time. Exactly one message prints.' },
    ],
    student_explanation: "if-else always prints exactly one of two messages: the if block when the condition is True, the else block otherwise. A speed of exactly 60 is not greater than 60, so it is within the limit.",
    worked_example: 'speed 75: 75 > 60 is True  ->  too fast',
    key_concepts: ['if-else', 'comparison >', 'two-way choice'],
    common_mistakes: ['Forgetting that 60 is not greater than 60', 'Mismatched indentation between the if and else blocks'],
  },
  {
    problem_id: 23, level_number: 1, session_id: 5, case_number: 3,
    solution_code: 'system_status = input()\nif system_status != "OK":\n    print("System malfunction detected!")',
    walkthrough: [
      { label: 'Read the status text', code_snippet: 'system_status = input()', explanation: 'The status stays as text - no conversion needed.' },
      { label: 'Check it is not OK', code_snippet: 'if system_status != "OK":\n    print("System malfunction detected!")', explanation: '!= means "not equal to". The warning prints whenever the status is anything other than exactly "OK".' },
    ],
    student_explanation: 'The != operator checks for not equal. Text comparisons are exact and case-sensitive, so "ok" is different from "OK" and would trigger the warning.',
    worked_example: 'print("ERROR" != "OK")  shows: True',
    key_concepts: ['!= operator', 'string comparison', 'case sensitivity'],
    common_mistakes: ['Using = instead of !=', 'Expecting "ok" to match "OK" - comparisons are case-sensitive'],
  },
  {
    problem_id: 24, level_number: 1, session_id: 5, case_number: 4,
    solution_code: 'score = int(input())\nif score >= 90:\n    print("Grade: A")\nelif score >= 80:\n    print("Grade: B")\nelif score >= 70:\n    print("Grade: C")\nelif score >= 60:\n    print("Grade: D")\nelse:\n    print("Grade: F")',
    walkthrough: [
      { label: 'Read the score', code_snippet: 'score = int(input())', explanation: 'Convert the typed text to a whole number.' },
      { label: 'Check bands top to bottom', code_snippet: 'if score >= 90:\n    print("Grade: A")\nelif score >= 80:\n    print("Grade: B")', explanation: 'Python runs the FIRST elif that is True, then skips the rest. Listing bands highest-to-lowest matters.' },
    ],
    student_explanation: "elif lets you check several conditions in order. The first one that is True wins and the rest are skipped, so listing the bands from highest to lowest gives the correct grade.",
    worked_example: 'score 85: 85 >= 90 is False, 85 >= 80 is True  ->  Grade: B',
    key_concepts: ['elif chain', 'order of conditions', '>= comparison'],
    common_mistakes: ['Listing the bands low-to-high, so everyone gets D or F', 'Using separate ifs instead of elif, which can print more than one grade'],
  },
  {
    problem_id: 25, level_number: 1, session_id: 5, case_number: 5,
    solution_code: 'fuel = int(input())\naltitude = int(input())\nif fuel >= 80 and altitude >= 5000:\n    print("Launch approved.")\nelif fuel >= 50 and altitude >= 3000:\n    print("Launch on standby.")\nelif fuel < 50:\n    print("Insufficient fuel.")\nelse:\n    print("Altitude too low.")',
    walkthrough: [
      { label: 'Read fuel and altitude', code_snippet: 'fuel = int(input())\naltitude = int(input())', explanation: 'Two whole numbers to test against the rules.' },
      { label: 'Check the rules in order', code_snippet: 'if fuel >= 80 and altitude >= 5000:\n    print("Launch approved.")\nelif fuel >= 50 and altitude >= 3000:\n    print("Launch on standby.")\nelif fuel < 50:\n    print("Insufficient fuel.")\nelse:\n    print("Altitude too low.")', explanation: 'Each branch is tried top to bottom; the first match runs. The final else catches everything left over.' },
    ],
    student_explanation: "Combine and inside an elif chain to test pairs of conditions in priority order. The else is the catch-all for any case the earlier branches did not handle.",
    worked_example: 'fuel 90, altitude 2000: not approved, not standby, fuel not < 50  ->  Altitude too low.',
    key_concepts: ['elif chain', 'and operator', 'catch-all else'],
    common_mistakes: ['Putting the standby rule before the approved rule', 'Forgetting the else, so some inputs print nothing'],
  },
  {
    problem_id: 55, level_number: 1, session_id: 5, case_number: 6,
    solution_code: 'age = int(input())\nif age >= 18:\n    print("Cadet approved for mission!")\nelse:\n    print("Cadet too young for this mission!")',
    walkthrough: [
      { label: 'Read the age', code_snippet: 'age = int(input())', explanation: 'Convert the typed text to a whole number.' },
      { label: 'Approve or reject', code_snippet: 'if age >= 18:\n    print("Cadet approved for mission!")\nelse:\n    print("Cadet too young for this mission!")', explanation: '>= 18 means 18 itself counts as old enough, so 18 is approved and 17 is not.' },
    ],
    student_explanation: "The session challenge is a clean if-else age gate. The key detail is >= 18, which includes 18 itself as approved.",
    worked_example: 'print(18 >= 18)  shows: True',
    key_concepts: ['if-else', '>= comparison', 'inclusive boundary'],
    common_mistakes: ['Using > 18, which would reject an 18-year-old', 'Swapping the approved and too-young messages'],
  },

  // ── Session 6: Nested Conditional Statements (cases 1–6) ──
  {
    problem_id: 26, level_number: 1, session_id: 6, case_number: 1,
    solution_code: 'fuel_level = int(input())\nif fuel_level > 50:\n    print("Fuel level is sufficient.")\n    if fuel_level > 75:\n        print("Fuel level is excellent.")',
    walkthrough: [
      { label: 'Read the fuel', code_snippet: 'fuel_level = int(input())', explanation: 'Convert the typed text to a whole number.' },
      { label: 'Put one if inside another', code_snippet: 'if fuel_level > 50:\n    print("Fuel level is sufficient.")\n    if fuel_level > 75:\n        print("Fuel level is excellent.")', explanation: 'The inner if is checked only when the outer one is True. Extra indentation shows it lives inside the first block.' },
    ],
    student_explanation: "A nested if is an if inside another if. The inner check only happens when the outer condition has already passed, and the deeper indentation shows that nesting.",
    worked_example: 'fuel 80: 80 > 50 prints sufficient, then 80 > 75 also prints excellent',
    key_concepts: ['nested if', 'indentation levels', 'comparison >'],
    common_mistakes: ['Not indenting the inner if deeply enough', 'Expecting excellent when fuel is 60 (it is not above 75)'],
  },
  {
    problem_id: 27, level_number: 1, session_id: 6, case_number: 2,
    solution_code: 'speed = int(input())\nif speed >= 50:\n    print("Speed is sufficient.")\n    if speed >= 100:\n        print("Speed is excellent.")\n    else:\n        print("Speed is moderate.")\nelse:\n    print("Speed too low.")',
    walkthrough: [
      { label: 'Read the speed', code_snippet: 'speed = int(input())', explanation: 'Convert the typed text to a whole number.' },
      { label: 'Nest an if-else inside an if-else', code_snippet: 'if speed >= 50:\n    print("Speed is sufficient.")\n    if speed >= 100:\n        print("Speed is excellent.")\n    else:\n        print("Speed is moderate.")\nelse:\n    print("Speed too low.")', explanation: 'When speed clears 50 it is sufficient, then a second if-else decides excellent vs moderate. Below 50, only the outer else runs.' },
    ],
    student_explanation: "You can nest a whole if-else inside another. The inner choice only happens after the outer condition passes, giving three possible outcomes from two checks.",
    worked_example: 'speed 85: >= 50 sufficient, then >= 100 is False  ->  moderate',
    key_concepts: ['nested if-else', 'indentation', 'multiple outcomes'],
    common_mistakes: ['Lining up the inner else with the outer if', 'Forgetting the outer else for speeds below 50'],
  },
  {
    problem_id: 28, level_number: 1, session_id: 6, case_number: 3,
    solution_code: 'temperature = int(input())\npressure_stable = input()\nif temperature > 20:\n    print("Temperature acceptable.")\n    if pressure_stable == "True" and temperature > 25:\n        print("All systems go for launch.")\n    else:\n        print("Additional checks needed.")',
    walkthrough: [
      { label: 'Read a number and a text flag', code_snippet: 'temperature = int(input())\npressure_stable = input()', explanation: 'Temperature is a number; pressure_stable stays as the text "True" or "False".' },
      { label: 'Combine conditions inside the nest', code_snippet: 'if temperature > 20:\n    print("Temperature acceptable.")\n    if pressure_stable == "True" and temperature > 25:\n        print("All systems go for launch.")\n    else:\n        print("Additional checks needed.")', explanation: 'The inner if uses and to require both a stable pressure AND a temperature above 25.' },
    ],
    student_explanation: 'Inside a nested if you can still use and to combine conditions. Because pressure arrives as text, compare it to the string "True" rather than the boolean True.',
    worked_example: 'temp 30, pressure "True": acceptable, then both inner parts True  ->  All systems go',
    key_concepts: ['nested if', 'and operator', 'comparing text flags'],
    common_mistakes: ['Comparing pressure_stable to True instead of the text "True"', 'Forgetting temperature must be above 25 (not just 20) for the inner branch'],
  },
  {
    problem_id: 29, level_number: 1, session_id: 6, case_number: 4,
    solution_code: 'speed = int(input())\naltitude = int(input())\nsystems_check = input()\nif speed > 100:\n    if altitude > 4000:\n        if systems_check == "True":\n            print("Flight approved.")\n        else:\n            print("Systems malfunction.")\n    else:\n        print("Altitude too low.")\nelse:\n    print("Speed insufficient.")',
    walkthrough: [
      { label: 'Read three values', code_snippet: 'speed = int(input())\naltitude = int(input())\nsystems_check = input()', explanation: 'Two numbers and a text flag, checked from the outside in.' },
      { label: 'Stack three levels of if-else', code_snippet: 'if speed > 100:\n    if altitude > 4000:\n        if systems_check == "True":\n            print("Flight approved.")\n        else:\n            print("Systems malfunction.")\n    else:\n        print("Altitude too low.")\nelse:\n    print("Speed insufficient.")', explanation: 'Each else belongs to the if at its own indentation. Speed is checked first, then altitude, then the systems flag.' },
    ],
    student_explanation: "Deep nesting checks conditions one layer at a time. Each else pairs with the if directly above it at the same indentation, so the failing layer prints its own message.",
    worked_example: 'speed 120, altitude 3000: passes speed, fails altitude  ->  Altitude too low.',
    key_concepts: ['deeply nested if-else', 'indentation matching', 'order of checks'],
    common_mistakes: ['Misaligning an else with the wrong if', 'Checking altitude or systems before speed has passed'],
  },
  {
    problem_id: 30, level_number: 1, session_id: 6, case_number: 5,
    solution_code: 'power = int(input())\ncooling = int(input())\npressure_ok = input()\nradiation_safe = input()\nreactor_ready = False\nif power > 80:\n    if cooling > 70:\n        if pressure_ok == "True" and radiation_safe == "True":\n            reactor_ready = True\nif reactor_ready:\n    print("Reactor Startup Approved.")\nelse:\n    print("Reactor Startup Denied.")',
    walkthrough: [
      { label: 'Read everything and start with a flag', code_snippet: 'power = int(input())\ncooling = int(input())\npressure_ok = input()\nradiation_safe = input()\nreactor_ready = False', explanation: 'reactor_ready starts False and only becomes True if every safety layer passes.' },
      { label: 'Flip the flag, then report it', code_snippet: 'if power > 80:\n    if cooling > 70:\n        if pressure_ok == "True" and radiation_safe == "True":\n            reactor_ready = True\nif reactor_ready:\n    print("Reactor Startup Approved.")\nelse:\n    print("Reactor Startup Denied.")', explanation: 'The nested checks set the flag; a separate if then prints one clear result based on it.' },
    ],
    student_explanation: "A boolean flag remembers whether every nested check passed. Start it False, set it True only when all layers succeed, then make a single decision from the flag.",
    worked_example: 'power 70 fails the first check, so reactor_ready stays False  ->  Denied',
    key_concepts: ['boolean flag', 'nested conditions', 'and operator'],
    common_mistakes: ['Forgetting to start reactor_ready as False', 'Comparing the text flags to True instead of "True"'],
  },
  {
    problem_id: 56, level_number: 1, session_id: 6, case_number: 6,
    solution_code: 'fuel = int(input())\nif fuel > 60:\n    oxygen = int(input())\n    if oxygen > 70:\n        engine_ready = input()\n        if engine_ready == "True":\n            weather_clear = input()\n            if weather_clear == "True":\n                battery = int(input())\n                if battery > 50:\n                    print("Launch Approved")\n                else:\n                    print("Launch denied: Low battery")\n            else:\n                print("Launch denied: Bad weather")\n        else:\n            print("Launch denied: Engine not ready")\n    else:\n        print("Launch denied: Low oxygen")\nelse:\n    print("Launch denied: Insufficient fuel")',
    walkthrough: [
      { label: 'Ask for the next value only if the last check passed', code_snippet: 'fuel = int(input())\nif fuel > 60:\n    oxygen = int(input())\n    if oxygen > 70:\n        engine_ready = input()', explanation: 'Each input() sits inside the previous if, so a failing check stops the program before it asks for anything else.' },
      { label: 'Give a specific reason at each gate', code_snippet: 'if battery > 50:\n    print("Launch Approved")\nelse:\n    print("Launch denied: Low battery")', explanation: 'Every else prints exactly why that gate failed; only passing all five reaches "Launch Approved".' },
    ],
    student_explanation: "This challenge is a chain of gates. Read each input INSIDE the matching if so a failed check stops early and reports its own reason - which is why some test runs type only one or two values.",
    worked_example: 'fuel 50: 50 > 60 is False  ->  Launch denied: Insufficient fuel (nothing else is asked)',
    key_concepts: ['nested gates', 'reading input lazily', 'specific messages'],
    common_mistakes: ['Reading all inputs up front, which breaks the early-stop test cases', 'Mismatched indentation pairing an else with the wrong gate'],
  },

  // ── Session 7: Introduction to Lists (cases 1–6) ──
  {
    problem_id: 31, level_number: 1, session_id: 7, case_number: 1,
    solution_code: 'planets = [input(), input(), input()]\nprint(planets[0])\nprint(planets[2])',
    walkthrough: [
      { label: 'Build a list from three inputs', code_snippet: 'planets = [input(), input(), input()]', explanation: 'Square brackets make a list. The three typed names fill positions 0, 1, and 2.' },
      { label: 'Read items by index', code_snippet: 'print(planets[0])\nprint(planets[2])', explanation: 'Lists count from 0, so planets[0] is the first planet and planets[2] is the third.' },
    ],
    student_explanation: "A list holds several values in order. You reach any item by its index, and indexes start at 0 - so the first item is [0] and the third is [2].",
    worked_example: 'p = ["a", "b", "c"]  then  print(p[0])  shows: a',
    key_concepts: ['lists', 'indexing from 0', 'input()'],
    common_mistakes: ['Thinking the first item is [1] instead of [0]', 'Asking for planets[3], which does not exist in a 3-item list'],
  },
  {
    problem_id: 32, level_number: 1, session_id: 7, case_number: 2,
    solution_code: 'crew = [input(), input(), input()]\ncrew.append(input())\nprint(crew)',
    walkthrough: [
      { label: 'Start the roster', code_snippet: 'crew = [input(), input(), input()]', explanation: 'Three typed names become the starting crew list.' },
      { label: 'Add one more, then show all', code_snippet: 'crew.append(input())\nprint(crew)', explanation: '.append() adds a new item to the end of the list. Printing the list shows every member.' },
    ],
    student_explanation: ".append() adds one item to the end of a list. Printing a whole list shows it with square brackets and quotes around each text item.",
    worked_example: "c = ['a', 'b']  then  c.append('c')  makes  ['a', 'b', 'c']",
    key_concepts: ['lists', '.append()', 'printing a list'],
    common_mistakes: ['Writing crew.append = ... instead of crew.append(...)', 'Expecting the printed list without its brackets and quotes'],
  },
  {
    problem_id: 33, level_number: 1, session_id: 7, case_number: 3,
    solution_code: 'tools = [input(), input(), input()]\ntools.remove(input())\nprint(tools)',
    walkthrough: [
      { label: 'Build the tool list', code_snippet: 'tools = [input(), input(), input()]', explanation: 'Three typed tool names fill the list.' },
      { label: 'Remove the named tool', code_snippet: 'tools.remove(input())\nprint(tools)', explanation: '.remove(value) deletes the first matching item. The fourth input says which tool to take out.' },
    ],
    student_explanation: ".remove() deletes an item by its value, not its position. It takes out the first item that matches the text you give it.",
    worked_example: "t = ['a', 'b']  then  t.remove('a')  leaves  ['b']",
    key_concepts: ['lists', '.remove()', 'removing by value'],
    common_mistakes: ['Passing an index to .remove() instead of the value', 'Trying to remove a tool that is not in the list, which causes an error'],
  },
  {
    problem_id: 34, level_number: 1, session_id: 7, case_number: 4,
    solution_code: 'temperatures = [int(input()), int(input()), int(input()), int(input())]\nprint("Sorted:", sorted(temperatures))\nprint("Reversed:", sorted(temperatures, reverse=True))',
    walkthrough: [
      { label: 'Collect four numbers', code_snippet: 'temperatures = [int(input()), int(input()), int(input()), int(input())]', explanation: 'int() converts each typed value so the list holds real numbers.' },
      { label: 'Sort up and down', code_snippet: 'print("Sorted:", sorted(temperatures))\nprint("Reversed:", sorted(temperatures, reverse=True))', explanation: 'sorted() returns a new list in ascending order; adding reverse=True gives descending order.' },
    ],
    student_explanation: "sorted() returns a new list arranged from smallest to largest. Adding reverse=True flips it to largest first, without changing the original list.",
    worked_example: 'sorted([3, 1, 2])  gives  [1, 2, 3]',
    key_concepts: ['sorted()', 'reverse=True', 'lists of numbers'],
    common_mistakes: ['Sorting the numbers as text (they would order wrongly)', 'Forgetting reverse=True for the descending line'],
  },
  {
    problem_id: 35, level_number: 1, session_id: 7, case_number: 5,
    solution_code: 'supplies = [input(), input(), input(), input()]\nprint(len(supplies))\nitem1 = input()\nitem2 = input()\nprint(item1 in supplies)\nprint(item2 in supplies)',
    walkthrough: [
      { label: 'Build the list and count it', code_snippet: 'supplies = [input(), input(), input(), input()]\nprint(len(supplies))', explanation: 'len() reports how many items are in the list (4 here).' },
      { label: 'Check membership with in', code_snippet: 'item1 = input()\nitem2 = input()\nprint(item1 in supplies)\nprint(item2 in supplies)', explanation: 'The in operator returns True if the item is found in the list, otherwise False.' },
    ],
    student_explanation: "len() tells you how many items a list has, and the in operator checks whether a value is present, giving back True or False.",
    worked_example: 'print("a" in ["a", "b"])  shows: True',
    key_concepts: ['len()', 'in operator', 'lists'],
    common_mistakes: ['Printing the count after the membership checks instead of before', 'Expecting in to find a near-match - it must be exactly equal'],
  },
  {
    problem_id: 57, level_number: 1, session_id: 7, case_number: 6,
    solution_code: 'supplies = ["oxygen tank", "food pack", "space suit"]\nsupplies.append("helmet")\nsupplies.append("water bottle")\nsupplies.remove("food pack")\nsupplies.sort()\nprint(supplies)\nprint(len(supplies))',
    walkthrough: [
      { label: 'Start, add, and remove', code_snippet: 'supplies = ["oxygen tank", "food pack", "space suit"]\nsupplies.append("helmet")\nsupplies.append("water bottle")\nsupplies.remove("food pack")', explanation: 'Begin with three items, append two more, then remove the food pack.' },
      { label: 'Sort and report', code_snippet: 'supplies.sort()\nprint(supplies)\nprint(len(supplies))', explanation: '.sort() arranges the list alphabetically in place, then we print the list and its length (4).' },
    ],
    student_explanation: "This challenge strings together .append(), .remove(), and .sort(). Note that .sort() changes the list itself (alphabetical order) rather than returning a new one.",
    worked_example: "s = ['c', 'a']  then  s.sort()  makes  ['a', 'c']",
    key_concepts: ['.append() / .remove()', '.sort()', 'len()'],
    common_mistakes: ['Expecting .sort() to return a new list (it sorts in place)', 'Removing an item whose text does not match exactly'],
  },

  // ── Session 8: Advanced List Operations (cases 1–6) ──
  {
    problem_id: 36, level_number: 1, session_id: 8, case_number: 1,
    solution_code: 'supplies = [input(), input(), input()]\nposition = int(input())\nnew_supply = input()\nsupplies.insert(position, new_supply)\nprint(supplies)',
    walkthrough: [
      { label: 'Build the list and read where to insert', code_snippet: 'supplies = [input(), input(), input()]\nposition = int(input())\nnew_supply = input()', explanation: 'position must be a number, so it uses int(); the new supply is text.' },
      { label: 'Insert at the index', code_snippet: 'supplies.insert(position, new_supply)\nprint(supplies)', explanation: '.insert(index, value) slides the new item into that position and pushes the rest along.' },
    ],
    student_explanation: ".insert() adds an item at a chosen index rather than at the end. Everything from that index onward shifts one place to the right.",
    worked_example: "x = ['a', 'b']  then  x.insert(1, 'z')  makes  ['a', 'z', 'b']",
    key_concepts: ['.insert()', 'indexes', 'int() for the position'],
    common_mistakes: ['Forgetting int() on the position', 'Swapping the argument order - it is insert(index, value)'],
  },
  {
    problem_id: 37, level_number: 1, session_id: 8, case_number: 2,
    solution_code: 'tasks = [input(), input(), input(), input()]\nremoved_task = tasks.pop()\nprint("Removed: " + removed_task)\nprint("Remaining tasks:", tasks)',
    walkthrough: [
      { label: 'Build four tasks', code_snippet: 'tasks = [input(), input(), input(), input()]', explanation: 'Four typed names fill the list.' },
      { label: 'Pop the last one', code_snippet: 'removed_task = tasks.pop()\nprint("Removed: " + removed_task)\nprint("Remaining tasks:", tasks)', explanation: '.pop() removes the last item AND hands it back, so we can store it and print it.' },
    ],
    student_explanation: ".pop() does two jobs at once: it removes the last item from the list and returns that item so you can use it. The list is left one shorter.",
    worked_example: "t = ['a', 'b']  then  t.pop()  returns 'b' and leaves ['a']",
    key_concepts: ['.pop()', 'return value', 'lists'],
    common_mistakes: ['Forgetting to store what .pop() returns', 'Joining the list to text with + instead of a comma'],
  },
  {
    problem_id: 38, level_number: 1, session_id: 8, case_number: 3,
    solution_code: 'original = [int(input()), int(input()), int(input())]\nbackup = original.copy()\nnew_value = int(input())\noriginal.append(new_value)\nprint("Original:", original)\nprint("Backup:", backup)',
    walkthrough: [
      { label: 'Make a list and a copy', code_snippet: 'original = [int(input()), int(input()), int(input())]\nbackup = original.copy()', explanation: '.copy() makes a separate list so changes to one do not touch the other.' },
      { label: 'Change only the original', code_snippet: 'new_value = int(input())\noriginal.append(new_value)\nprint("Original:", original)\nprint("Backup:", backup)', explanation: 'Appending to original leaves backup untouched, proving they are independent.' },
    ],
    student_explanation: ".copy() makes a real, separate copy of a list. Adding to the original afterwards does not change the backup, because they are now two different lists.",
    worked_example: 'append to original after copying  ->  backup keeps the old, shorter list',
    key_concepts: ['.copy()', '.append()', 'independent lists'],
    common_mistakes: ['Writing backup = original (that links them instead of copying)', 'Appending to the wrong list'],
  },
  {
    problem_id: 39, level_number: 1, session_id: 8, case_number: 4,
    solution_code: 'numbers = [int(input()), int(input()), int(input()), int(input()),\n           int(input()), int(input()), int(input())]\nprint(numbers[2:5])',
    walkthrough: [
      { label: 'Collect seven numbers', code_snippet: 'numbers = [int(input()), int(input()), int(input()), int(input()),\n           int(input()), int(input()), int(input())]', explanation: 'Seven int() conversions build a list of seven numbers.' },
      { label: 'Take a slice', code_snippet: 'print(numbers[2:5])', explanation: 'A slice [2:5] takes items at index 2, 3, and 4 - it includes the start but stops before the end index.' },
    ],
    student_explanation: "Slicing with [start:stop] grabs part of a list. It includes the start index but stops just BEFORE the stop index, so [2:5] gives three items.",
    worked_example: '[10, 20, 30, 40, 50][1:3]  gives  [20, 30]',
    key_concepts: ['list slicing', 'start:stop range', 'indexing'],
    common_mistakes: ['Expecting [2:5] to include index 5', 'Counting from 1 instead of 0 when picking the slice'],
  },
  {
    problem_id: 40, level_number: 1, session_id: 8, case_number: 5,
    solution_code: 'start = int(input())\nend = int(input())\ncubes = [x**3 for x in range(start, end + 1)]\nprint(cubes)\nprint("Min:", min(cubes))\nprint("Max:", max(cubes))\nprint("Sum:", sum(cubes))',
    walkthrough: [
      { label: 'Build cubes with a comprehension', code_snippet: 'cubes = [x**3 for x in range(start, end + 1)]', explanation: 'A list comprehension builds a list in one line: cube every x from start to end (inclusive).' },
      { label: 'Summarise the list', code_snippet: 'print("Min:", min(cubes))\nprint("Max:", max(cubes))\nprint("Sum:", sum(cubes))', explanation: 'min(), max(), and sum() report the smallest value, the largest value, and the total.' },
    ],
    student_explanation: "A list comprehension creates a whole list in one line. Helper functions min(), max(), and sum() then read useful facts out of that list.",
    worked_example: '[x**2 for x in range(1, 4)]  gives  [1, 4, 9]',
    key_concepts: ['list comprehension', 'min() / max() / sum()', 'range inclusive end'],
    common_mistakes: ['Forgetting + 1 so the end number is left out', 'Using x*3 instead of x**3 (power, not multiply)'],
  },
  {
    problem_id: 58, level_number: 1, session_id: 8, case_number: 6,
    solution_code: 'readings = [230, 245, 260]\nreadings.insert(2, 250)\nreadings.pop()\nbackup = readings.copy()\nbackup.sort()\nprint("Original Readings:", readings)\nprint("Copied & Sorted:", backup)',
    walkthrough: [
      { label: 'Insert then drop the last reading', code_snippet: 'readings = [230, 245, 260]\nreadings.insert(2, 250)\nreadings.pop()', explanation: 'Insert 250 at index 2 to get [230, 245, 250, 260], then .pop() removes the final 260.' },
      { label: 'Copy, sort, and report both', code_snippet: 'backup = readings.copy()\nbackup.sort()\nprint("Original Readings:", readings)\nprint("Copied & Sorted:", backup)', explanation: 'The backup is sorted on its own, leaving the original list as it was.' },
    ],
    student_explanation: "This challenge combines .insert(), .pop(), .copy(), and .sort(). Sorting the copy keeps the original reading order intact for the record.",
    worked_example: 'insert 250 at index 2 of [230, 245, 260]  ->  [230, 245, 250, 260]',
    key_concepts: ['.insert() / .pop()', '.copy()', '.sort()'],
    common_mistakes: ['Sorting the original instead of the copy', 'Popping before inserting and removing the wrong value'],
  },

  // ── Session 9: For Loops and Iteration (cases 1–6) ──
  {
    problem_id: 41, level_number: 1, session_id: 9, case_number: 1,
    solution_code: 'missions = [input(), input(), input()]\nfor mission in missions:\n    print("Mission: " + mission)',
    walkthrough: [
      { label: 'Build the list', code_snippet: 'missions = [input(), input(), input()]', explanation: 'Three typed names fill the list.' },
      { label: 'Loop over each item', code_snippet: 'for mission in missions:\n    print("Mission: " + mission)', explanation: 'A for loop runs the indented line once for every item, with mission holding the current name each time.' },
    ],
    student_explanation: "A for loop repeats a block once per item in a list. The loop variable (mission) takes the value of each item in turn, so you handle them one at a time.",
    worked_example: 'for x in ["a", "b"]: print(x)  shows: a then b',
    key_concepts: ['for loop', 'iterating a list', 'loop variable'],
    common_mistakes: ['Forgetting the colon at the end of the for line', 'Not indenting the body of the loop'],
  },
  {
    problem_id: 42, level_number: 1, session_id: 9, case_number: 2,
    solution_code: 'start = int(input())\nend = int(input())\nfor level in range(start, end + 1):\n    print("Level", level)',
    walkthrough: [
      { label: 'Read the bounds', code_snippet: 'start = int(input())\nend = int(input())', explanation: 'Both ends of the range are whole numbers.' },
      { label: 'Loop with range', code_snippet: 'for level in range(start, end + 1):\n    print("Level", level)', explanation: 'range(start, end + 1) counts from start up to end. The + 1 is needed because range stops one short of its end.' },
    ],
    student_explanation: "range(a, b) produces the numbers a up to b-1. Adding 1 to the end makes the loop INCLUDE the final number the user asked for.",
    worked_example: 'list(range(1, 4))  gives  [1, 2, 3]',
    key_concepts: ['for loop', 'range(start, stop)', 'inclusive end with + 1'],
    common_mistakes: ['Forgetting + 1, so the last level is skipped', 'Using range(start) and ignoring the start value'],
  },
  {
    problem_id: 43, level_number: 1, session_id: 9, case_number: 3,
    solution_code: 'start = int(input())\nend = int(input())\ndivisor = int(input())\nfor number in range(start, end + 1):\n    if number % divisor == 0:\n        print(number, "is divisible by", divisor)\n    else:\n        print(number, "is not divisible by", divisor)',
    walkthrough: [
      { label: 'Read the range and divisor', code_snippet: 'start = int(input())\nend = int(input())\ndivisor = int(input())', explanation: 'Three whole numbers control the loop and the test.' },
      { label: 'Test each number with %', code_snippet: 'for number in range(start, end + 1):\n    if number % divisor == 0:\n        print(number, "is divisible by", divisor)\n    else:\n        print(number, "is not divisible by", divisor)', explanation: 'The % operator gives the remainder. A remainder of 0 means it divides evenly.' },
    ],
    student_explanation: "The % (modulo) operator gives the remainder of a division. When number % divisor is 0, the number divides evenly, so it is divisible.",
    worked_example: 'print(12 % 3)  shows: 0  (so 12 is divisible by 3)',
    key_concepts: ['for loop with range', '% remainder', 'if-else inside a loop'],
    common_mistakes: ['Using / instead of % to test divisibility', 'Comparing the remainder to 1 instead of 0'],
  },
  {
    problem_id: 44, level_number: 1, session_id: 9, case_number: 4,
    solution_code: 'outer_end = int(input())\ninner_end = int(input())\nfor x in range(1, outer_end + 1):\n    for y in range(1, inner_end + 1):\n        print(f"({x}, {y})")',
    walkthrough: [
      { label: 'Read both ranges', code_snippet: 'outer_end = int(input())\ninner_end = int(input())', explanation: 'Two whole numbers set how far each loop counts.' },
      { label: 'Loop inside a loop', code_snippet: 'for x in range(1, outer_end + 1):\n    for y in range(1, inner_end + 1):\n        print(f"({x}, {y})")', explanation: 'For each x, the inner loop runs through every y, printing each (x, y) pair.' },
    ],
    student_explanation: "A nested loop runs the whole inner loop once for every step of the outer loop. That is why you get every combination of x and y as a coordinate pair.",
    worked_example: 'outer 2, inner 2  ->  (1, 1) (1, 2) (2, 1) (2, 2)',
    key_concepts: ['nested for loops', 'range', 'f-strings'],
    common_mistakes: ['Not indenting the inner loop inside the outer one', 'Printing x and y in the wrong order'],
  },
  {
    problem_id: 45, level_number: 1, session_id: 9, case_number: 5,
    solution_code: 'word = input()\nfor character in word:\n    print(character)',
    walkthrough: [
      { label: 'Read a word', code_snippet: 'word = input()', explanation: 'The word is stored as text.' },
      { label: 'Loop over each letter', code_snippet: 'for character in word:\n    print(character)', explanation: 'A for loop over a string visits one character at a time, printing each on its own line.' },
    ],
    student_explanation: "You can loop over a string just like a list - the loop variable becomes each character in turn, in order, from first letter to last.",
    worked_example: 'for c in "Hi": print(c)  shows: H then i',
    key_concepts: ['looping over a string', 'characters', 'for loop'],
    common_mistakes: ['Printing the whole word instead of each character', 'Forgetting that a string can be looped directly'],
  },
  {
    problem_id: 59, level_number: 1, session_id: 9, case_number: 6,
    solution_code: 'for seconds in range(10, 0, -1):\n    print(f"T-minus {seconds} seconds")\nprint("Launch initiated!")',
    walkthrough: [
      { label: 'Count down with a negative step', code_snippet: 'for seconds in range(10, 0, -1):\n    print(f"T-minus {seconds} seconds")', explanation: 'range(10, 0, -1) counts 10 down to 1. The step -1 goes backwards and stops before 0.' },
      { label: 'Announce launch after the loop', code_snippet: 'print("Launch initiated!")', explanation: 'This line is not indented, so it runs once after the countdown finishes.' },
    ],
    student_explanation: "A negative step in range() counts downward. range(10, 0, -1) gives 10 down to 1, and the un-indented line afterwards runs once the loop is done.",
    worked_example: 'list(range(3, 0, -1))  gives  [3, 2, 1]',
    key_concepts: ['range with negative step', 'counting down', 'code after a loop'],
    common_mistakes: ['Writing range(10, 0) without -1 (it would produce nothing)', 'Indenting the launch line so it prints every loop'],
  },

  // ── Session 10: Working with Range (cases 1–6) ──
  {
    problem_id: 46, level_number: 1, session_id: 10, case_number: 1,
    solution_code: 'n = int(input())\nfor step in range(n):\n    print("Step", step)',
    walkthrough: [
      { label: 'Read how many steps', code_snippet: 'n = int(input())', explanation: 'Convert the typed text to a whole number.' },
      { label: 'Loop n times', code_snippet: 'for step in range(n):\n    print("Step", step)', explanation: 'range(n) counts from 0 up to n-1, so for n = 4 you get 0, 1, 2, 3.' },
    ],
    student_explanation: "range(n) with a single number starts at 0 and stops before n. That is why range(4) gives 0, 1, 2, 3 - four numbers, but starting at zero.",
    worked_example: 'list(range(4))  gives  [0, 1, 2, 3]',
    key_concepts: ['range(n)', 'starts at 0', 'for loop'],
    common_mistakes: ['Expecting range(4) to start at 1', 'Expecting range(4) to include 4'],
  },
  {
    problem_id: 47, level_number: 1, session_id: 10, case_number: 2,
    solution_code: 'start = int(input())\nstop = int(input())\nfor level in range(start, stop):\n    print("Deck Clear", level)\nprint("Scan complete")',
    walkthrough: [
      { label: 'Read start and stop', code_snippet: 'start = int(input())\nstop = int(input())', explanation: 'Two whole numbers mark where the count begins and ends.' },
      { label: 'Loop, then finish outside', code_snippet: 'for level in range(start, stop):\n    print("Deck Clear", level)\nprint("Scan complete")', explanation: 'range(start, stop) stops just before stop. "Scan complete" is un-indented, so it runs once at the end.' },
    ],
    student_explanation: "range(start, stop) counts from start up to stop-1. Code that is NOT indented under the loop runs a single time after the loop has finished.",
    worked_example: 'list(range(5, 10))  gives  [5, 6, 7, 8, 9]',
    key_concepts: ['range(start, stop)', 'indentation', 'code after a loop'],
    common_mistakes: ['Expecting stop itself to be included', 'Indenting "Scan complete" so it repeats'],
  },
  {
    problem_id: 48, level_number: 1, session_id: 10, case_number: 3,
    solution_code: 'start = int(input())\nstop = int(input())\nstep = int(input())\nfor temperature in range(start, stop, step):\n    print("Temperature:", temperature)',
    walkthrough: [
      { label: 'Read start, stop, and step', code_snippet: 'start = int(input())\nstop = int(input())\nstep = int(input())', explanation: 'The step controls how big each jump is - and it can be negative.' },
      { label: 'Loop with a step', code_snippet: 'for temperature in range(start, stop, step):\n    print("Temperature:", temperature)', explanation: 'range(start, stop, step) jumps by step each time. A step of -10 counts downward.' },
    ],
    student_explanation: "The third number in range() is the step - how far to jump each time. A negative step counts downward, so range(100, 60, -10) gives 100, 90, 80, 70.",
    worked_example: 'list(range(0, 20, 5))  gives  [0, 5, 10, 15]',
    key_concepts: ['range(start, stop, step)', 'negative steps', 'for loop'],
    common_mistakes: ['Using a positive step when you need to count down', 'Expecting stop to be included in the count'],
  },
  {
    problem_id: 49, level_number: 1, session_id: 10, case_number: 4,
    solution_code: 'start = int(input())\nstop = int(input())\nstep = int(input())\nthreshold = int(input())\nfor level in range(start, stop, step):\n    print("Battery Level:", level)\n    if level < threshold:\n        print("Warning: Low Battery!")',
    walkthrough: [
      { label: 'Read the four numbers', code_snippet: 'start = int(input())\nstop = int(input())\nstep = int(input())\nthreshold = int(input())', explanation: 'Three control the range; the threshold decides when to warn.' },
      { label: 'Print, then check inside the loop', code_snippet: 'for level in range(start, stop, step):\n    print("Battery Level:", level)\n    if level < threshold:\n        print("Warning: Low Battery!")', explanation: 'Each pass prints the level, then an if (still inside the loop) warns when it drops below the threshold.' },
    ],
    student_explanation: "You can put an if inside a for loop so a check runs on every pass. Here each battery level is printed, and a warning is added only when it falls below the threshold.",
    worked_example: 'level 60, threshold 70: 60 < 70 is True  ->  Warning: Low Battery!',
    key_concepts: ['range with step', 'if inside a loop', 'comparison <'],
    common_mistakes: ['Putting the if outside the loop so it only checks once', 'Using <= when the rule is strictly less than'],
  },
  {
    problem_id: 50, level_number: 1, session_id: 10, case_number: 5,
    solution_code: 'stages = int(input())\nsystems = int(input())\nfor stage in range(1, stages + 1):\n    print("Stage", stage)\n    for system in range(1, systems + 1):\n        print(" -> Checking system", system)',
    walkthrough: [
      { label: 'Read the counts', code_snippet: 'stages = int(input())\nsystems = int(input())', explanation: 'How many stages, and how many systems per stage.' },
      { label: 'Nest the system loop in the stage loop', code_snippet: 'for stage in range(1, stages + 1):\n    print("Stage", stage)\n    for system in range(1, systems + 1):\n        print(" -> Checking system", system)', explanation: 'For each stage we print its header, then the inner loop checks every system before moving on.' },
    ],
    student_explanation: "A nested range loop repeats the inner systems for every stage. The outer loop prints a header, then the inner loop runs fully before the outer loop moves on.",
    worked_example: '2 stages, 2 systems  ->  Stage 1, system 1, system 2, Stage 2, system 1, system 2',
    key_concepts: ['nested for loops', 'range(1, n + 1)', 'indentation'],
    common_mistakes: ['Starting the count at 0 instead of 1', 'Mis-indenting the inner loop so it falls outside the outer one'],
  },
  {
    problem_id: 60, level_number: 1, session_id: 10, case_number: 6,
    solution_code: 'print("Starting asteroid drilling sequence...")\nfor depth in range(0, 120, 20):\n    print("Drilling depth:", depth, "meters")\n    if depth == 60:\n        print("Mineral layer detected - slowing rotation speed.")\n    if depth == 100:\n        print("Core reached - collecting samples.")\nprint("Extraction complete - returning to orbit.")',
    walkthrough: [
      { label: 'Drill in steps of 20', code_snippet: 'for depth in range(0, 120, 20):\n    print("Drilling depth:", depth, "meters")', explanation: 'range(0, 120, 20) gives 0, 20, 40, 60, 80, 100 - stopping before 120.' },
      { label: 'React at key depths', code_snippet: 'if depth == 60:\n    print("Mineral layer detected - slowing rotation speed.")\nif depth == 100:\n    print("Core reached - collecting samples.")', explanation: 'Two equality checks add a special message exactly when the depth hits 60 and 100.' },
    ],
    student_explanation: "The session challenge mixes a stepped range with == checks inside the loop. The loop steps by 20, and the special messages fire only on the exact matching depth.",
    worked_example: 'list(range(0, 120, 20))  gives  [0, 20, 40, 60, 80, 100]',
    key_concepts: ['range with step', '== inside a loop', 'code after the loop'],
    common_mistakes: ['Using range(0, 100, 20), which misses 100', 'Using = instead of == in the depth checks'],
  },

  // ── Session 11: Level 1 Capstone — Space Mission Log ──
  {
    problem_id: 999, level_number: 1, session_id: 11, case_number: 6,
    solution_code: 'name = input()\nmission = input()\nenergy = int(input())\nif energy > 60:\n    print("Mission Start Approved")\nelse:\n    print("Hold Launch")\nprint("Launching in...")\nfor i in range(5, 0, -1):\n    print(i)\ntools = ["screwdriver", "wrench", "drill"]\nprint("Second tool: " + tools[1])\ndef launch_message():\n    print("Mission Started Successfully!")\nlaunch_message()',
    walkthrough: [
      { label: 'Inputs and the go / no-go check', code_snippet: 'name = input()\nmission = input()\nenergy = int(input())\nif energy > 60:\n    print("Mission Start Approved")\nelse:\n    print("Hold Launch")', explanation: 'Read the details, convert energy to a number, and approve only when energy is above 60.' },
      { label: 'Countdown, list, and a function', code_snippet: 'print("Launching in...")\nfor i in range(5, 0, -1):\n    print(i)\ntools = ["screwdriver", "wrench", "drill"]\nprint("Second tool: " + tools[1])\ndef launch_message():\n    print("Mission Started Successfully!")\nlaunch_message()', explanation: 'A countdown loop, list indexing (tools[1] is the second tool), and a function that is defined then called.' },
    ],
    student_explanation: "The Level 1 capstone uses everything at once: input, conditionals, a countdown loop, a list, and a function. A function is defined with def and only runs when you call it by name.",
    worked_example: 'tools = ["a", "b", "c"]  then  tools[1]  is  b  (the second item)',
    key_concepts: ['input + int()', 'if-else', 'loops, lists, functions'],
    common_mistakes: ['Reading energy as text and comparing it wrongly', 'Defining launch_message() but forgetting to call it'],
  },

  // ══════════ LEVEL 2 ══════════
  // ── Session 12: Nested Loops (cases 1–6) ──
  {
    problem_id: 61, level_number: 2, session_id: 12, case_number: 1,
    solution_code: 'missions = int(input())\ncheckpoints = int(input())\nfor m in range(1, missions + 1):\n    for c in range(1, checkpoints + 1):\n        print(f"Mission {m} - {c}")',
    walkthrough: [
      { label: 'Read the two counts', code_snippet: 'missions = int(input())\ncheckpoints = int(input())', explanation: 'How many missions, and how many checkpoints inside each one.' },
      { label: 'Loop inside a loop', code_snippet: 'for m in range(1, missions + 1):\n    for c in range(1, checkpoints + 1):\n        print(f"Mission {m} - {c}")', explanation: 'For every mission m, the inner loop runs through every checkpoint c, printing each pair.' },
    ],
    student_explanation: "A nested loop runs the whole inner loop once for each step of the outer loop, so you get every mission-checkpoint combination in order.",
    worked_example: '2 missions, 2 checkpoints  ->  Mission 1 - 1, Mission 1 - 2, Mission 2 - 1, Mission 2 - 2',
    key_concepts: ['nested for loops', 'range(1, n + 1)', 'f-strings'],
    common_mistakes: ['Not indenting the inner loop inside the outer one', 'Counting from 0 instead of 1'],
  },
  {
    problem_id: 62, level_number: 2, session_id: 12, case_number: 2,
    solution_code: 'orbits = int(input())\nsensors = int(input())\nfor o in range(1, orbits + 1):\n    for s in range(1, sensors + 1):\n        print(f"Orbit {o} - {s}")\n        if s == 2:\n            print("  OK")',
    walkthrough: [
      { label: 'Nest the sensor loop in the orbit loop', code_snippet: 'for o in range(1, orbits + 1):\n    for s in range(1, sensors + 1):\n        print(f"Orbit {o} - {s}")', explanation: 'Print every orbit-sensor pair.' },
      { label: 'Add a check after sensor 2', code_snippet: '        if s == 2:\n            print("  OK")', explanation: 'When the sensor number is exactly 2, print "  OK" (two leading spaces) on the next line.' },
    ],
    student_explanation: "You can put an if inside a nested loop. Here a check runs on every inner step, adding a line only when the sensor number equals 2.",
    worked_example: 'sensor reaches 2  ->  an extra "  OK" line is printed',
    key_concepts: ['nested loops', 'if inside a loop', 'exact match =='],
    common_mistakes: ['Forgetting the two spaces before OK', 'Putting the if outside the inner loop'],
  },
  {
    problem_id: 63, level_number: 2, session_id: 12, case_number: 3,
    solution_code: 'engines = int(input())\nmax_thrust = int(input())\nstep = int(input())\nfor e in range(1, engines + 1):\n    for t in range(0, max_thrust + 1, step):\n        print(f"Engine {e} - {t}")',
    walkthrough: [
      { label: 'Read engines, max thrust, and step', code_snippet: 'engines = int(input())\nmax_thrust = int(input())\nstep = int(input())', explanation: 'The step sets how big each thrust jump is.' },
      { label: 'Step the inner loop', code_snippet: 'for e in range(1, engines + 1):\n    for t in range(0, max_thrust + 1, step):\n        print(f"Engine {e} - {t}")', explanation: 'range(0, max_thrust + 1, step) counts 0 up to max in jumps of step. The + 1 includes the max value.' },
    ],
    student_explanation: "The third number in range() is the step. Adding 1 to the stop value makes sure the maximum thrust is included in the count.",
    worked_example: 'range(0, 21, 10)  gives  0, 10, 20',
    key_concepts: ['nested loops', 'range with step', 'inclusive max with + 1'],
    common_mistakes: ['Forgetting + 1 so the max thrust is skipped', 'Starting the inner loop at 1 instead of 0'],
  },
  {
    problem_id: 64, level_number: 2, session_id: 12, case_number: 4,
    solution_code: 'stations = int(input())\nmodules = int(input())\nsensors = int(input())\nfor a in range(1, stations + 1):\n    for b in range(1, modules + 1):\n        for c in range(1, sensors + 1):\n            print(a, b, c)',
    walkthrough: [
      { label: 'Three counts, three loops', code_snippet: 'for a in range(1, stations + 1):\n    for b in range(1, modules + 1):\n        for c in range(1, sensors + 1):\n            print(a, b, c)', explanation: 'Three loops nested three deep produce every station-module-sensor combination.' },
      { label: 'Print with commas', code_snippet: 'print(a, b, c)', explanation: 'Commas in print() put a single space between the three numbers.' },
    ],
    student_explanation: "You can nest loops as deep as you need. Three levels give every combination of the three numbers, and print(a, b, c) separates them with spaces.",
    worked_example: 'print(1, 1, 1)  shows: 1 1 1',
    key_concepts: ['triple nested loops', 'print with commas', 'combinations'],
    common_mistakes: ['Getting the indentation of the three levels wrong', 'Using + between the numbers instead of commas'],
  },
  {
    problem_id: 65, level_number: 2, session_id: 12, case_number: 5,
    solution_code: 'sats = int(input())\nstart = int(input())\nend = int(input())\nstep = int(input())\nthreshold = int(input())\nfor sat in range(1, sats + 1):\n    for signal in range(start, end, step):\n        print(sat, signal)\n        if signal <= threshold:\n            print("  Weak")',
    walkthrough: [
      { label: 'Read all five values', code_snippet: 'sats = int(input())\nstart = int(input())\nend = int(input())\nstep = int(input())\nthreshold = int(input())', explanation: 'The step is negative, so the signal counts downward.' },
      { label: 'Loop and flag weak signals', code_snippet: 'for sat in range(1, sats + 1):\n    for signal in range(start, end, step):\n        print(sat, signal)\n        if signal <= threshold:\n            print("  Weak")', explanation: 'Each reading is printed, and "  Weak" is added when the signal drops to or below the threshold.' },
    ],
    student_explanation: "A nested loop with a negative step counts the signal down for each satellite, and an if inside flags any reading at or below the threshold.",
    worked_example: 'signal 80, threshold 80: 80 <= 80 is True  ->  Weak',
    key_concepts: ['nested loops', 'negative step', 'if inside a loop'],
    common_mistakes: ['Using < instead of <= (the threshold itself counts)', 'Forgetting the negative step so the loop runs forever or not at all'],
  },
  {
    problem_id: 66, level_number: 2, session_id: 12, case_number: 6,
    solution_code: 'missions = int(input())\nstages = int(input())\nfor m in range(1, missions + 1):\n    print(f"Mission {m}")\n    for s in range(1, stages + 1):\n        print(f"  Stage {s}")',
    walkthrough: [
      { label: 'Print a header per mission', code_snippet: 'for m in range(1, missions + 1):\n    print(f"Mission {m}")', explanation: 'The outer loop prints the mission heading.' },
      { label: 'Indent the stages underneath', code_snippet: '    for s in range(1, stages + 1):\n        print(f"  Stage {s}")', explanation: 'The inner loop prints each stage with two leading spaces so it sits under its mission.' },
    ],
    student_explanation: "The session challenge prints a heading from the outer loop, then an indented list from the inner loop - the two leading spaces in the text create the visual nesting.",
    worked_example: 'Mission 1 then "  Stage 1", "  Stage 2" underneath it',
    key_concepts: ['nested loops', 'header + detail pattern', 'indented output'],
    common_mistakes: ['Forgetting the two spaces in "  Stage"', 'Printing all stages before the mission heading'],
  },

  // ── Session 13: While Loops (cases 1–6) ──
  {
    problem_id: 67, level_number: 2, session_id: 13, case_number: 1,
    solution_code: 'n = int(input())\nwhile n >= 1:\n    print(n)\n    n -= 1',
    walkthrough: [
      { label: 'Read the starting number', code_snippet: 'n = int(input())', explanation: 'Convert the typed text to a whole number.' },
      { label: 'Loop while n is at least 1', code_snippet: 'while n >= 1:\n    print(n)\n    n -= 1', explanation: 'A while loop repeats as long as its condition is True. Each pass prints n then subtracts 1, so it stops after printing 1.' },
    ],
    student_explanation: "A while loop keeps going as long as its condition is True. You must change the variable inside the loop (here n -= 1) or it would never stop.",
    worked_example: 'n = 3  ->  3, 2, 1',
    key_concepts: ['while loop', 'loop condition', 'updating the counter'],
    common_mistakes: ['Forgetting n -= 1, which makes the loop run forever', 'Using > 1 so the number 1 is never printed'],
  },
  {
    problem_id: 68, level_number: 2, session_id: 13, case_number: 2,
    solution_code: 'while True:\n    value = input()\n    if value == "0":\n        print("Scan complete!")\n        break\n    print("Reading: " + value)',
    walkthrough: [
      { label: 'Loop until told to stop', code_snippet: 'while True:\n    value = input()', explanation: 'while True loops forever until a break is reached. Each pass reads one value.' },
      { label: 'Stop on 0, otherwise report', code_snippet: '    if value == "0":\n        print("Scan complete!")\n        break\n    print("Reading: " + value)', explanation: 'When the value is "0" we print the finish line and break out; otherwise we print the reading.' },
    ],
    student_explanation: "while True with a break is the pattern for 'keep going until a signal'. The check for the stop value must come BEFORE printing the reading, so 0 is not treated as data.",
    worked_example: 'inputs 50, 0  ->  Reading: 50 then Scan complete!',
    key_concepts: ['while True', 'break', 'sentinel value'],
    common_mistakes: ['Printing the reading before checking for 0', 'Comparing to 0 the number instead of the text "0"'],
  },
  {
    problem_id: 69, level_number: 2, session_id: 13, case_number: 3,
    solution_code: 'while True:\n    x = input()\n    y = input()\n    if int(x) == 0:\n        print("Destination reached!")\n        break\n    print(f"Position: {x} {y}")',
    walkthrough: [
      { label: 'Read a coordinate pair each pass', code_snippet: 'while True:\n    x = input()\n    y = input()', explanation: 'Two inputs per loop give the X and Y of one position.' },
      { label: 'Stop when X is 0', code_snippet: '    if int(x) == 0:\n        print("Destination reached!")\n        break\n    print(f"Position: {x} {y}")', explanation: 'Convert x to a number to test it. When X is 0 we finish; otherwise we report the position.' },
    ],
    student_explanation: "This break loop reads two values each time. Check the stop condition (X is 0) before printing, so the ending pair is not shown as a position.",
    worked_example: 'pairs (5,3) then (0,0)  ->  Position: 5 3 then Destination reached!',
    key_concepts: ['while True', 'break', 'reading pairs of input'],
    common_mistakes: ['Forgetting int() when testing if X is 0', 'Reading only one value per pass instead of two'],
  },
  {
    problem_id: 70, level_number: 2, session_id: 13, case_number: 4,
    solution_code: 'maximum = int(input())\nincrement = int(input())\npower = 0\nprint("Power:", power)\nwhile power + increment <= maximum:\n    power += increment\n    print("Power:", power)\nprint("Full power!")',
    walkthrough: [
      { label: 'Start at zero', code_snippet: 'power = 0\nprint("Power:", power)', explanation: 'Begin at 0 and show it.' },
      { label: 'Add while there is room', code_snippet: 'while power + increment <= maximum:\n    power += increment\n    print("Power:", power)\nprint("Full power!")', explanation: 'Keep adding the increment as long as the next step stays at or below the maximum, then announce full power.' },
    ],
    student_explanation: "Check power + increment <= maximum BEFORE adding, so you never overshoot the maximum. The final message prints once the loop ends.",
    worked_example: 'max 12, step 3  ->  0, 3, 6, 9, 12, Full power!',
    key_concepts: ['while loop', 'running total', 'loop condition'],
    common_mistakes: ['Overshooting the maximum by checking after adding', 'Forgetting the first "Power: 0" line'],
  },
  {
    problem_id: 71, level_number: 2, session_id: 13, case_number: 5,
    solution_code: 'n = int(input())\ni = 1\nwhile i <= n:\n    print(f"Stage {i} active")\n    i += 1\nelse:\n    print("Mission complete!")',
    walkthrough: [
      { label: 'Count up with a while loop', code_snippet: 'i = 1\nwhile i <= n:\n    print(f"Stage {i} active")\n    i += 1', explanation: 'Start at 1 and climb to n, printing each stage.' },
      { label: 'Use the while-else block', code_snippet: 'else:\n    print("Mission complete!")', explanation: 'A while loop can have an else that runs once when the loop finishes normally (no break).' },
    ],
    student_explanation: "A while loop can have an else block. It runs a single time after the loop ends normally - even when the loop body never ran (for n = 0).",
    worked_example: 'n = 0: the while never runs, but the else still prints Mission complete!',
    key_concepts: ['while-else', 'counting up', 'loop variable'],
    common_mistakes: ['Forgetting i += 1, causing an endless loop', 'Thinking the else runs every pass instead of once at the end'],
  },
  {
    problem_id: 72, level_number: 2, session_id: 13, case_number: 6,
    solution_code: 'valid = ["check", "prepare", "ready", "launch", "abort"]\ncount = 0\nwhile True:\n    print("Enter command: ")\n    command = input()\n    count += 1\n    if command not in valid:\n        print("Invalid command!")\n    elif command == "launch":\n        print("Mission complete! Total commands: " + str(count))\n        break\n    elif command == "abort":\n        print("Mission aborted!")\n        break',
    walkthrough: [
      { label: 'Set up the valid list and a counter', code_snippet: 'valid = ["check", "prepare", "ready", "launch", "abort"]\ncount = 0', explanation: 'A list of allowed commands, and a tally of how many were entered.' },
      { label: 'Process each command', code_snippet: 'while True:\n    print("Enter command: ")\n    command = input()\n    count += 1\n    if command not in valid:\n        print("Invalid command!")\n    elif command == "launch":\n        print("Mission complete! Total commands: " + str(count))\n        break\n    elif command == "abort":\n        print("Mission aborted!")\n        break', explanation: 'Every command is counted. Invalid ones print a warning and keep looping; launch and abort end the loop.' },
    ],
    student_explanation: "The session challenge counts every command (valid or not), warns on invalid ones, and only stops on launch or abort. The prompt is printed each pass with print().",
    worked_example: 'check, prepare, launch  ->  Mission complete! Total commands: 3',
    key_concepts: ['while True with break', 'membership with in', 'counting'],
    common_mistakes: ['Not counting invalid commands', 'Stopping the loop on a valid non-final command like check'],
  },

  // ── Session 14: Dictionaries — Syntax & Basic Operations (cases 1–6) ──
  {
    problem_id: 73, level_number: 2, session_id: 14, case_number: 1,
    solution_code: 'spacecraft = {"name": input(), "speed": input(), "crew": input()}\nprint(spacecraft["name"])\nprint(spacecraft["speed"])\nprint(spacecraft["crew"])',
    walkthrough: [
      { label: 'Build a dictionary', code_snippet: 'spacecraft = {"name": input(), "speed": input(), "crew": input()}', explanation: 'Curly braces make a dictionary of key: value pairs. Each key (like "name") stores one input.' },
      { label: 'Access values by key', code_snippet: 'print(spacecraft["name"])\nprint(spacecraft["speed"])\nprint(spacecraft["crew"])', explanation: 'Use dictionary[key] to read the value stored under that key.' },
    ],
    student_explanation: "A dictionary stores values under named keys instead of number positions. You read a value with dictionary[\"key\"].",
    worked_example: 'd = {"a": "1"}  then  print(d["a"])  shows: 1',
    key_concepts: ['dictionaries', 'keys and values', 'access by key'],
    common_mistakes: ['Using ( ) or [ ] instead of { } to make the dictionary', 'Looking up a key that does not exist'],
  },
  {
    problem_id: 74, level_number: 2, session_id: 14, case_number: 2,
    solution_code: 'rocket = {"name": input(), "launches": input()}\nrocket["status"] = input()\nprint(rocket["name"])\nprint(rocket["launches"])\nprint(rocket["status"])',
    walkthrough: [
      { label: 'Start with two keys', code_snippet: 'rocket = {"name": input(), "launches": input()}', explanation: 'The dictionary begins with a name and a launch count.' },
      { label: 'Add a new key', code_snippet: 'rocket["status"] = input()', explanation: 'Assigning to a key that does not exist yet creates it, adding "status" to the dictionary.' },
    ],
    student_explanation: "Assigning dictionary[\"newkey\"] = value adds a brand-new key if it is not there yet, or updates it if it is.",
    worked_example: 'd["status"] = "Active"  adds a status key to the dictionary',
    key_concepts: ['dictionaries', 'adding a key', 'access by key'],
    common_mistakes: ['Expecting a new key to already exist', 'Forgetting the quotes around the key name'],
  },
  {
    problem_id: 75, level_number: 2, session_id: 14, case_number: 3,
    solution_code: 'station = {"name": input(), "capacity": input(), "altitude": input()}\nremove_key = input()\ndel station[remove_key]\nfor value in station.values():\n    print(value)',
    walkthrough: [
      { label: 'Build the dictionary and read which key to drop', code_snippet: 'station = {"name": input(), "capacity": input(), "altitude": input()}\nremove_key = input()', explanation: 'Three details, then the name of the key to remove.' },
      { label: 'Delete, then print what is left', code_snippet: 'del station[remove_key]\nfor value in station.values():\n    print(value)', explanation: 'del removes a key. .values() then gives the remaining values in their original order.' },
    ],
    student_explanation: "The del keyword removes a key from a dictionary. Looping over .values() prints what remains, keeping the order the keys were added.",
    worked_example: 'del d["capacity"]  removes the capacity entry',
    key_concepts: ['del keyword', '.values()', 'dictionary order'],
    common_mistakes: ['Deleting a key that was already removed', 'Forgetting that a dictionary keeps its insertion order'],
  },
  {
    problem_id: 76, level_number: 2, session_id: 14, case_number: 4,
    solution_code: 'n = int(input())\nplanets = {}\nfor _ in range(n):\n    line = input().split()\n    planets[line[0]] = line[1]\nfor planet, moons in planets.items():\n    print(f"{planet} has {moons} moons")',
    walkthrough: [
      { label: 'Build the dictionary from input lines', code_snippet: 'n = int(input())\nplanets = {}\nfor _ in range(n):\n    line = input().split()\n    planets[line[0]] = line[1]', explanation: '.split() breaks "Mars 2" into ["Mars", "2"]; the first part is the key, the second the value.' },
      { label: 'Loop with .items()', code_snippet: 'for planet, moons in planets.items():\n    print(f"{planet} has {moons} moons")', explanation: '.items() gives each key and value together, so you can use both in one line.' },
    ],
    student_explanation: ".items() lets a for loop unpack each key and value at once. .split() is handy for turning one input line into separate pieces.",
    worked_example: 'for k, v in d.items()  ->  k is the key, v is the value each pass',
    key_concepts: ['.items()', '.split()', 'building a dictionary in a loop'],
    common_mistakes: ['Forgetting to split the line into key and value', 'Looping with only one variable when .items() gives two'],
  },
  {
    problem_id: 77, level_number: 2, session_id: 14, case_number: 5,
    solution_code: 'asteroid = {"name": input(), "size": input(), "hazardous": input()}\nlookup = input()\nprint(asteroid.get(lookup, "Key not found"))',
    walkthrough: [
      { label: 'Build the dictionary and read a key to look up', code_snippet: 'asteroid = {"name": input(), "size": input(), "hazardous": input()}\nlookup = input()', explanation: 'The lookup might or might not be a real key.' },
      { label: 'Use .get() with a fallback', code_snippet: 'print(asteroid.get(lookup, "Key not found"))', explanation: '.get(key, default) returns the value if the key exists, or the default text if it does not - no crash.' },
    ],
    student_explanation: ".get(key, default) is the safe way to read a dictionary: it returns your fallback instead of crashing when the key is missing.",
    worked_example: 'd.get("color", "Key not found")  ->  Key not found when there is no color',
    key_concepts: ['.get() with default', 'safe lookup', 'dictionaries'],
    common_mistakes: ['Using d[key], which crashes on a missing key', 'Forgetting to supply the default value'],
  },
  {
    problem_id: 78, level_number: 2, session_id: 14, case_number: 6,
    solution_code: 'distance = int(input())\ncrew_count = int(input())\nfuel = distance * 5\nif crew_count >= 3:\n    print(f"Mission approved! Fuel needed: {fuel} units")\nelse:\n    print("Mission denied! Insufficient crew")',
    walkthrough: [
      { label: 'Read inputs and work out the fuel', code_snippet: 'distance = int(input())\ncrew_count = int(input())\nfuel = distance * 5', explanation: 'Fuel needed is five units per unit of distance.' },
      { label: 'Decide based on the crew', code_snippet: 'if crew_count >= 3:\n    print(f"Mission approved! Fuel needed: {fuel} units")\nelse:\n    print("Mission denied! Insufficient crew")', explanation: 'A crew of at least 3 is approved with its fuel figure; otherwise the mission is denied.' },
    ],
    student_explanation: "The session challenge combines a calculation with an if-else decision: compute the fuel, then approve only when the crew is large enough.",
    worked_example: 'distance 100, crew 4  ->  fuel 500, approved',
    key_concepts: ['arithmetic', 'if-else', 'f-strings'],
    common_mistakes: ['Using > 3 instead of >= 3 (a crew of exactly 3 is allowed)', 'Forgetting to multiply distance by 5'],
  },

  // ── Session 15: Advanced Dictionary Operations & Methods (cases 1–6) ──
  {
    problem_id: 79, level_number: 2, session_id: 15, case_number: 1,
    solution_code: 'spacecraft = {"name": input(), "speed": 2500, "crew": 5}\nkey1 = input()\nprint(spacecraft[key1])\nkey2 = input()\nprint(spacecraft.get(key2))\nnew_speed = int(input())\nspacecraft["speed"] = new_speed\nprint(spacecraft["speed"])',
    walkthrough: [
      { label: 'Build the dictionary', code_snippet: 'spacecraft = {"name": input(), "speed": 2500, "crew": 5}', explanation: 'One value comes from input; the other two are fixed numbers.' },
      { label: 'Read with [] and .get(), then update', code_snippet: 'print(spacecraft[key1])\nprint(spacecraft.get(key2))\nspacecraft["speed"] = new_speed\nprint(spacecraft["speed"])', explanation: 'Both [] and .get() read a value; assigning to spacecraft["speed"] changes it.' },
    ],
    student_explanation: "You can read a dictionary value with either square brackets or .get(), and change a value by assigning to its key.",
    worked_example: 'd["speed"] = 3000  updates the speed entry to 3000',
    key_concepts: ['[] vs .get()', 'updating a value', 'dictionaries'],
    common_mistakes: ['Mixing up which key each line should use', 'Forgetting int() on the new speed'],
  },
  {
    problem_id: 80, level_number: 2, session_id: 15, case_number: 2,
    solution_code: 'n = int(input())\nplanets = {}\nfor _ in range(n):\n    name = input()\n    moons = input()\n    planets[name] = moons\nfor key in planets.keys():\n    print(key)\nfor value in planets.values():\n    print(value)\nfor key, value in planets.items():\n    print(f"{key}: {value}")',
    walkthrough: [
      { label: 'Build the dictionary', code_snippet: 'n = int(input())\nplanets = {}\nfor _ in range(n):\n    name = input()\n    moons = input()\n    planets[name] = moons', explanation: 'Read N name/moons pairs into the dictionary.' },
      { label: 'Loop three ways', code_snippet: 'for key in planets.keys():\n    print(key)\nfor value in planets.values():\n    print(value)\nfor key, value in planets.items():\n    print(f"{key}: {value}")', explanation: '.keys() gives just the keys, .values() just the values, and .items() gives both together.' },
    ],
    student_explanation: "Dictionaries offer three loops: .keys() for the names, .values() for the values, and .items() for both at once.",
    worked_example: '.items()  ->  each pass gives one key and its value',
    key_concepts: ['.keys() / .values() / .items()', 'looping a dictionary'],
    common_mistakes: ['Unpacking two variables from .keys() or .values()', 'Mixing up the three loops'],
  },
  {
    problem_id: 81, level_number: 2, session_id: 15, case_number: 3,
    solution_code: 'n = int(input())\ninventory = {}\nfor _ in range(n):\n    item = input()\n    quantity = int(input())\n    inventory[item] = quantity\nm = int(input())\nfor _ in range(m):\n    item = input()\n    quantity = int(input())\n    inventory.update({item: quantity})\ndefault_item = input()\ninventory.setdefault(default_item, 0)\nfor item, quantity in inventory.items():\n    print(f"{item}: {quantity}")',
    walkthrough: [
      { label: 'Build, then update', code_snippet: 'inventory.update({item: quantity})', explanation: '.update() adds new keys or overwrites existing ones with the given values.' },
      { label: 'Ensure a key exists with setdefault', code_snippet: 'inventory.setdefault(default_item, 0)', explanation: '.setdefault(key, 0) adds the key with value 0 only if it is missing; an existing key is left unchanged.' },
    ],
    student_explanation: ".update() adds or overwrites entries, while .setdefault() only fills in a key if it is not already there - useful for safe defaults.",
    worked_example: 'setdefault("Oxygen", 0)  adds Oxygen: 0 only if Oxygen is missing',
    key_concepts: ['.update()', '.setdefault()', 'dictionaries'],
    common_mistakes: ['Expecting setdefault to overwrite an existing value', 'Forgetting int() on the quantities'],
  },
  {
    problem_id: 82, level_number: 2, session_id: 15, case_number: 4,
    solution_code: 'n = int(input())\nsystems = {}\nfor _ in range(n):\n    name = input()\n    status = int(input())\n    systems[name] = status\npop_key = input()\nprint(systems.pop(pop_key))\ndel_key = input()\ndel systems[del_key]\nthird_key = input()\nprint(systems.pop(third_key, "Not Found"))\nfor name, status in systems.items():\n    print(f"{name}: {status}")',
    walkthrough: [
      { label: 'Remove with .pop() and del', code_snippet: 'print(systems.pop(pop_key))\ndel systems[del_key]', explanation: '.pop(key) removes a key AND returns its value; del just removes it.' },
      { label: 'Safe pop with a default', code_snippet: 'print(systems.pop(third_key, "Not Found"))', explanation: 'Adding a default to .pop() returns it instead of crashing when the key is missing.' },
    ],
    student_explanation: ".pop(key) removes a key and gives back its value; del only removes. Adding a default to .pop() makes it safe for keys that may not exist.",
    worked_example: 'systems.pop("Lasers", "Not Found")  ->  Not Found when Lasers is missing',
    key_concepts: ['.pop()', 'del', '.pop() with default'],
    common_mistakes: ['Using del on a missing key (it crashes)', 'Forgetting that .pop() returns the removed value'],
  },
  {
    problem_id: 83, level_number: 2, session_id: 15, case_number: 5,
    solution_code: 'n = int(input())\nrockets = {}\nfor _ in range(n):\n    name = input()\n    stages = int(input())\n    height = int(input())\n    rockets[name] = {"stages": stages, "height": height}\nquery = input()\nif query in rockets:\n    print(rockets[query]["height"])\nelse:\n    print("Not Found")',
    walkthrough: [
      { label: 'Build a dictionary of dictionaries', code_snippet: 'rockets[name] = {"stages": stages, "height": height}', explanation: 'Each rocket name maps to its own small dictionary of properties.' },
      { label: 'Look up a nested value', code_snippet: 'if query in rockets:\n    print(rockets[query]["height"])\nelse:\n    print("Not Found")', explanation: 'rockets[query]["height"] reaches into the inner dictionary. Check the name exists first.' },
    ],
    student_explanation: "A nested dictionary stores a dictionary inside another. You reach an inner value with two keys: outer[name][\"property\"].",
    worked_example: 'rockets["Falcon 9"]["height"]  ->  the height of Falcon 9',
    key_concepts: ['nested dictionaries', 'two-key access', 'in check'],
    common_mistakes: ['Looking up a missing rocket without checking in first', 'Using one key when two are needed'],
  },
  {
    problem_id: 84, level_number: 2, session_id: 15, case_number: 6,
    solution_code: 'n = int(input())\nphases = {}\nfor _ in range(n):\n    phase_name = input()\n    crew = int(input())\n    system_count = int(input())\n    systems = {}\n    for _ in range(system_count):\n        sys_name = input()\n        power = int(input())\n        systems[sys_name] = power\n    phases[phase_name] = {"crew": crew, "systems": systems}\nquery = input()\nif query in phases:\n    crew = phases[query]["crew"]\n    total_power = sum(phases[query]["systems"].values())\n    print(f"Phase: {query}, Crew: {crew}, Power: {total_power}")\nelse:\n    print("Phase not found")\nmerged = {}\nfor phase in phases.values():\n    for sys_name, power in phase["systems"].items():\n        if sys_name not in merged or power > merged[sys_name]:\n            merged[sys_name] = power\nfor sys_name in sorted(merged):\n    print(f"{sys_name}: {merged[sys_name]}")',
    walkthrough: [
      { label: 'Build nested phase data', code_snippet: 'phases[phase_name] = {"crew": crew, "systems": systems}', explanation: 'Each phase stores its crew and a sub-dictionary of system: power.' },
      { label: 'Query one phase, then merge by max power', code_snippet: 'total_power = sum(phases[query]["systems"].values())\n...\nif sys_name not in merged or power > merged[sys_name]:\n    merged[sys_name] = power', explanation: 'sum(...values()) totals a phase. Merging keeps the highest power seen for each repeated system name.' },
    ],
    student_explanation: "The challenge nests dictionaries two deep. sum(d.values()) totals the powers, and the merge keeps the maximum value whenever a system name repeats across phases.",
    worked_example: 'Shields 80 in one phase, 85 in another  ->  merged keeps 85',
    key_concepts: ['nested dictionaries', 'sum(.values())', 'keeping a maximum'],
    common_mistakes: ['Overwriting with a smaller power instead of keeping the max', 'Forgetting sorted() for the final output'],
  },

  // ── Session 16: Tuples (cases 1–6) ──
  {
    problem_id: 85, level_number: 2, session_id: 16, case_number: 1,
    solution_code: 'n = int(input())\nnames = []\nfor _ in range(n):\n    names.append(input())\nastronauts = tuple(names)\ni1 = int(input())\ni2 = int(input())\nprint(astronauts[i1])\nprint(astronauts[i2])',
    walkthrough: [
      { label: 'Build a tuple', code_snippet: 'astronauts = tuple(names)', explanation: 'tuple() turns a list into a tuple - an ordered, unchangeable sequence.' },
      { label: 'Access by index', code_snippet: 'print(astronauts[i1])\nprint(astronauts[i2])', explanation: 'Tuples are indexed from 0, just like lists.' },
    ],
    student_explanation: "A tuple is like a list but cannot be changed after it is made. You still read items by their index, counting from 0.",
    worked_example: 't = ("a", "b", "c")  then  t[1]  is  b',
    key_concepts: ['tuples', 'tuple()', 'indexing from 0'],
    common_mistakes: ['Trying to change a tuple item (tuples are fixed)', 'Counting indexes from 1'],
  },
  {
    problem_id: 86, level_number: 2, session_id: 16, case_number: 2,
    solution_code: 'n = int(input())\nnumbers = []\nfor _ in range(n):\n    numbers.append(int(input()))\nnumbers = tuple(numbers)\nvalue = int(input())\nprint(len(numbers))\nprint(numbers.count(value))',
    walkthrough: [
      { label: 'Build a tuple of numbers', code_snippet: 'numbers = tuple(numbers)', explanation: 'Collect the inputs into a list, then convert to a tuple.' },
      { label: 'Length and count', code_snippet: 'print(len(numbers))\nprint(numbers.count(value))', explanation: 'len() gives the size; .count(value) gives how many times a value appears.' },
    ],
    student_explanation: "len() reports how many items a tuple holds, and .count(value) tells you how many times one value appears inside it.",
    worked_example: '(2, 4, 2, 2).count(2)  ->  3',
    key_concepts: ['len()', '.count()', 'tuples'],
    common_mistakes: ['Forgetting int() so values are compared as text', 'Confusing .count() (how many) with .index() (where)'],
  },
  {
    problem_id: 87, level_number: 2, session_id: 16, case_number: 3,
    solution_code: 'n = int(input())\nitems = []\nfor _ in range(n):\n    items.append(input())\nitems = tuple(items)\ntarget = input()\nstart = int(input())\nend = int(input())\nprint(items.index(target))\nprint(items[start:end])',
    walkthrough: [
      { label: 'Find a position with .index()', code_snippet: 'print(items.index(target))', explanation: '.index(value) gives the position of the FIRST matching item.' },
      { label: 'Slice the tuple', code_snippet: 'print(items[start:end])', explanation: 'A slice [start:end] returns a smaller tuple from start up to (but not including) end.' },
    ],
    student_explanation: ".index() finds where a value sits, and slicing [start:end] pulls out part of a tuple - including the start but stopping before the end.",
    worked_example: '("a", "b", "c")[1:3]  ->  ("b", "c")',
    key_concepts: ['.index()', 'tuple slicing', 'tuples'],
    common_mistakes: ['Expecting the slice to include the end index', 'Forgetting .index() returns only the first match'],
  },
  {
    problem_id: 88, level_number: 2, session_id: 16, case_number: 4,
    solution_code: 'n1 = int(input())\nfirst = tuple(int(input()) for _ in range(n1))\nn2 = int(input())\nsecond = tuple(int(input()) for _ in range(n2))\nr = int(input())\nprint(first + second)\nprint(first * r)',
    walkthrough: [
      { label: 'Build two tuples', code_snippet: 'first = tuple(int(input()) for _ in range(n1))\nsecond = tuple(int(input()) for _ in range(n2))', explanation: 'Each tuple is filled from its own count of inputs.' },
      { label: 'Join with + and repeat with *', code_snippet: 'print(first + second)\nprint(first * r)', explanation: '+ glues two tuples into one; * repeats a tuple R times.' },
    ],
    student_explanation: "The + operator joins two tuples end to end, and the * operator repeats a tuple a number of times - just like it does with strings.",
    worked_example: '(1, 2) * 3  ->  (1, 2, 1, 2, 1, 2)',
    key_concepts: ['tuple +', 'tuple *', 'tuples'],
    common_mistakes: ['Mixing up + (join) and * (repeat)', 'Forgetting int() on the numbers'],
  },
  {
    problem_id: 89, level_number: 2, session_id: 16, case_number: 5,
    solution_code: 'n = int(input())\nitems = tuple(input() for _ in range(n))\ntarget = input()\nif target in items:\n    print("Found")\nelse:\n    print("Not Found")',
    walkthrough: [
      { label: 'Build the tuple', code_snippet: 'items = tuple(input() for _ in range(n))', explanation: 'Fill a tuple with N typed strings.' },
      { label: 'Check membership', code_snippet: 'if target in items:\n    print("Found")\nelse:\n    print("Not Found")', explanation: 'The in operator returns True when the value is inside the tuple.' },
    ],
    student_explanation: "The in operator checks whether a value is present in a tuple, giving True or False - here turned into Found or Not Found.",
    worked_example: '"Earth" in ("Mercury", "Venus", "Earth")  ->  True',
    key_concepts: ['in operator', 'tuples', 'if-else'],
    common_mistakes: ['Expecting in to match part of a word', 'Case mismatch - "earth" is not "Earth"'],
  },
  {
    problem_id: 90, level_number: 2, session_id: 16, case_number: 6,
    solution_code: 'name = input()\nyear = int(input())\ntarget = input()\ncrew = int(input())\nstatus = input()\nmission = (name, year, target, crew, status)\nprint(mission)\nprint(len(mission))\nprint(mission[-2:])\nquery = input()\nif query in mission:\n    print("Found")\nelse:\n    print("Not Found")\nr = int(input())\nprint(mission * r)',
    walkthrough: [
      { label: 'Build a mixed tuple', code_snippet: 'mission = (name, year, target, crew, status)', explanation: 'A tuple can hold different types together - text and numbers side by side.' },
      { label: 'Length, slice, membership, repeat', code_snippet: 'print(len(mission))\nprint(mission[-2:])\n...\nprint(mission * r)', explanation: 'mission[-2:] takes the last two items; in checks membership; * repeats the whole tuple.' },
    ],
    student_explanation: "The session challenge uses every tuple skill at once: build a mixed tuple, measure it, slice the last two with [-2:], check membership, and repeat it.",
    worked_example: 'mission[-2:]  ->  the last two items of the tuple',
    key_concepts: ['mixed tuples', 'negative-index slicing', 'in / len / *'],
    common_mistakes: ['Converting year or crew to text instead of int', 'Getting the [-2:] slice wrong'],
  },

  // ── Session 17: Set Operations & Data Analysis (cases 1–6) ──
  {
    problem_id: 91, level_number: 2, session_id: 17, case_number: 1,
    solution_code: 'n = int(input())\nsatellites = set()\nfor _ in range(n):\n    satellites.add(input())\nm = int(input())\nfor _ in range(m):\n    satellites.add(input())\nfor item in sorted(satellites):\n    print(item)',
    walkthrough: [
      { label: 'Build a set and add items', code_snippet: 'satellites = set()\n...\nsatellites.add(input())', explanation: 'A set stores only UNIQUE values; .add() puts one in, ignoring duplicates.' },
      { label: 'Print sorted', code_snippet: 'for item in sorted(satellites):\n    print(item)', explanation: 'Sets have no order, so sorted() arranges them alphabetically for printing.' },
    ],
    student_explanation: "A set automatically removes duplicates. Because sets have no fixed order, use sorted() when you need a predictable output.",
    worked_example: 'add ISS twice  ->  the set still contains ISS only once',
    key_concepts: ['sets', '.add()', 'sorted()'],
    common_mistakes: ['Expecting a set to keep duplicates', 'Forgetting sorted() and getting an unpredictable order'],
  },
  {
    problem_id: 92, level_number: 2, session_id: 17, case_number: 2,
    solution_code: 'n = int(input())\nsatellites = set()\nfor _ in range(n):\n    satellites.add(input())\nsatellites.remove(input())\nsatellites.discard(input())\nfor item in sorted(satellites):\n    print(item)',
    walkthrough: [
      { label: 'Remove two items two ways', code_snippet: 'satellites.remove(input())\nsatellites.discard(input())', explanation: '.remove() deletes an item but crashes if it is missing; .discard() deletes it quietly if present.' },
      { label: 'Print what remains, sorted', code_snippet: 'for item in sorted(satellites):\n    print(item)', explanation: 'Show the leftover items in alphabetical order.' },
    ],
    student_explanation: "Both .remove() and .discard() delete from a set, but .discard() is safe when the item might not be there, while .remove() raises an error.",
    worked_example: 's.discard("X")  ->  no error even if X is absent',
    key_concepts: ['.remove() vs .discard()', 'sets', 'sorted()'],
    common_mistakes: ['Using .remove() on a possibly-missing item', 'Forgetting to sort the output'],
  },
  {
    problem_id: 93, level_number: 2, session_id: 17, case_number: 3,
    solution_code: 'n1 = int(input())\nset1 = set()\nfor _ in range(n1):\n    set1.add(input())\nn2 = int(input())\nset2 = set()\nfor _ in range(n2):\n    set2.add(input())\nunion = set1 | set2\nfor item in sorted(union):\n    print(item)\nintersection = set1 & set2\nif intersection:\n    for item in sorted(intersection):\n        print(item)\nelse:\n    print("No common elements")',
    walkthrough: [
      { label: 'Union with |', code_snippet: 'union = set1 | set2', explanation: 'The | operator gives everything in either set, with no duplicates.' },
      { label: 'Intersection with &', code_snippet: 'intersection = set1 & set2\nif intersection:\n    ...\nelse:\n    print("No common elements")', explanation: 'The & operator gives only the items in BOTH sets; print a message if there are none.' },
    ],
    student_explanation: "| builds the union (everything combined) and & builds the intersection (only the shared items). An empty set is falsy, so an if can detect no common elements.",
    worked_example: '{1, 2} & {2, 3}  ->  {2}',
    key_concepts: ['union |', 'intersection &', 'empty set check'],
    common_mistakes: ['Swapping | and &', 'Forgetting the No common elements case'],
  },
  {
    problem_id: 94, level_number: 2, session_id: 17, case_number: 4,
    solution_code: 'n1 = int(input())\nset1 = set()\nfor _ in range(n1):\n    set1.add(input())\nn2 = int(input())\nset2 = set()\nfor _ in range(n2):\n    set2.add(input())\ndifference = set1 - set2\nif difference:\n    for item in sorted(difference):\n        print(item)\nelse:\n    print("No unique elements in first set")\nsymmetric = set1 ^ set2\nif symmetric:\n    for item in sorted(symmetric):\n        print(item)\nelse:\n    print("Sets are identical")',
    walkthrough: [
      { label: 'Difference with -', code_snippet: 'difference = set1 - set2', explanation: 'set1 - set2 keeps items that are in the first set but NOT the second.' },
      { label: 'Symmetric difference with ^', code_snippet: 'symmetric = set1 ^ set2', explanation: 'The ^ operator keeps items in exactly one of the two sets (not the shared ones).' },
    ],
    student_explanation: "- gives what is unique to the first set; ^ gives what is in only one set or the other. Both are empty when the sets fully overlap.",
    worked_example: '{1, 2, 3} ^ {2, 3, 4}  ->  {1, 4}',
    key_concepts: ['difference -', 'symmetric difference ^', 'empty checks'],
    common_mistakes: ['Confusing - (one-sided) with ^ (both-sided)', 'Missing the identical-sets case'],
  },
  {
    problem_id: 95, level_number: 2, session_id: 17, case_number: 5,
    solution_code: 'n = int(input())\nitems = set()\nfor _ in range(n):\n    items.add(input())\nquery = input()\nif query in items:\n    print("Found")\nelse:\n    print("Not Found")\nfor item in sorted(items):\n    print("Item: " + item)',
    walkthrough: [
      { label: 'Check membership', code_snippet: 'if query in items:\n    print("Found")\nelse:\n    print("Not Found")', explanation: 'in works on sets too, returning True when the value is present.' },
      { label: 'Loop sorted with a prefix', code_snippet: 'for item in sorted(items):\n    print("Item: " + item)', explanation: 'Print each element alphabetically, glued to the "Item: " label.' },
    ],
    student_explanation: "The in operator checks a set quickly, and looping over sorted(set) prints the items in a predictable order.",
    worked_example: 'print("Item: " + "ISS")  ->  Item: ISS',
    key_concepts: ['in operator', 'sorted()', 'sets'],
    common_mistakes: ['Forgetting sorted() so the order is random', 'Missing the space in "Item: "'],
  },
  {
    problem_id: 96, level_number: 2, session_id: 17, case_number: 6,
    solution_code: 'n = int(input())\nskills_a = set()\nfor _ in range(n):\n    skills_a.add(input())\nm = int(input())\nskills_b = set()\nfor _ in range(m):\n    skills_b.add(input())\nnew_skill = input()\nskills_a.add(new_skill)\nprint("Common skills:", sorted(skills_a & skills_b))\nprint("Skills unique to Astronaut A:", sorted(skills_a - skills_b))\nprint("Skills unique to Astronaut B:", sorted(skills_b - skills_a))\nprint("Updated Astronaut A skills:", sorted(skills_a))\nif "Navigation" in skills_a or "Navigation" in skills_b:\n    print("Navigation skill found")\nelse:\n    print("Navigation skill NOT found")',
    walkthrough: [
      { label: 'Build both sets and add a skill to A', code_snippet: 'new_skill = input()\nskills_a.add(new_skill)', explanation: 'Add the extra skill to A BEFORE comparing, so it counts in the analysis.' },
      { label: 'Report the set relationships', code_snippet: 'print("Common skills:", sorted(skills_a & skills_b))\nprint("Skills unique to Astronaut A:", sorted(skills_a - skills_b))', explanation: '& gives shared skills, - gives one-sided skills; sorted() turns each set into a tidy list.' },
    ],
    student_explanation: "This challenge uses &, -, and membership together. Printing sorted(a_set) shows it as a clean alphabetical list in the output.",
    worked_example: 'print("Common skills:", sorted({"Navigation"}))  ->  Common skills: [\'Navigation\']',
    key_concepts: ['set & and -', 'sorted() of a set', 'membership'],
    common_mistakes: ['Checking for Navigation in only one astronaut - it counts if EITHER has it', 'Adding the new skill after comparing instead of before'],
  },

  // ── Session 18: User-Defined Functions (cases 1–6) ──
  {
    problem_id: 97, level_number: 2, session_id: 18, case_number: 1,
    solution_code: 'message = input()\ndef greet(message):\n    print(message)\ngreet(message)',
    walkthrough: [
      { label: 'Define a function', code_snippet: 'def greet(message):\n    print(message)', explanation: 'def names a reusable block. The part in brackets (message) is a parameter it receives.' },
      { label: 'Call it', code_snippet: 'greet(message)', explanation: 'A function does nothing until you call it by name and pass a value.' },
    ],
    student_explanation: "A function is a named, reusable block of code. You write it once with def, then run it whenever you call its name with a value in the brackets.",
    worked_example: 'def greet(m): print(m)  then  greet("Hi")  shows: Hi',
    key_concepts: ['def', 'parameters', 'calling a function'],
    common_mistakes: ['Defining a function but never calling it', 'Forgetting to indent the function body'],
  },
  {
    problem_id: 98, level_number: 2, session_id: 18, case_number: 2,
    solution_code: 'name = input()\ndef introduce(person):\n    print(f"Nice to meet you, {person}!")\nintroduce(name)',
    walkthrough: [
      { label: 'Define with a parameter', code_snippet: 'def introduce(person):\n    print(f"Nice to meet you, {person}!")', explanation: 'person is a placeholder that becomes whatever value you pass in.' },
      { label: 'Call with a value', code_snippet: 'introduce(name)', explanation: 'The input name is handed to the function, taking the place of person.' },
    ],
    student_explanation: "A parameter is a placeholder name inside a function. When you call the function, the value you pass takes that placeholder's spot.",
    worked_example: 'introduce("Alice")  ->  Nice to meet you, Alice!',
    key_concepts: ['parameters', 'arguments', 'f-strings'],
    common_mistakes: ['Using a different name inside than the parameter', 'Calling the function without passing a value'],
  },
  {
    problem_id: 99, level_number: 2, session_id: 18, case_number: 3,
    solution_code: 'a = int(input())\nb = int(input())\ndef multiply(a, b):\n    return a * b\nprint(multiply(a, b))',
    walkthrough: [
      { label: 'Return a value', code_snippet: 'def multiply(a, b):\n    return a * b', explanation: 'return hands a result back to whoever called the function, instead of printing it.' },
      { label: 'Use the returned value', code_snippet: 'print(multiply(a, b))', explanation: 'The call multiply(a, b) becomes the result, which print then shows.' },
    ],
    student_explanation: "return sends a value back from a function so the caller can use it. It is different from print, which just shows something on screen.",
    worked_example: 'multiply(3, 4)  returns  12',
    key_concepts: ['return', 'using a returned value', 'parameters'],
    common_mistakes: ['Printing inside the function instead of returning', 'Forgetting to print the returned result'],
  },
  {
    problem_id: 100, level_number: 2, session_id: 18, case_number: 4,
    solution_code: 'fruit = input()\ncolor = input()\ndef favorite_fruit(fruit, color):\n    print(f"My favorite fruit is a {color} {fruit}!")\nfavorite_fruit(fruit, color)',
    walkthrough: [
      { label: 'Define with two parameters', code_snippet: 'def favorite_fruit(fruit, color):\n    print(f"My favorite fruit is a {color} {fruit}!")', explanation: 'A function can take several parameters, separated by commas.' },
      { label: 'Call with two values in order', code_snippet: 'favorite_fruit(fruit, color)', explanation: 'The values fill the parameters left to right: first fruit, then color.' },
    ],
    student_explanation: "Functions can take more than one parameter. When you call, the values line up with the parameters in the same order.",
    worked_example: 'favorite_fruit("apple", "red")  ->  My favorite fruit is a red apple!',
    key_concepts: ['multiple parameters', 'argument order', 'f-strings'],
    common_mistakes: ['Passing the values in the wrong order', 'Mismatching the number of arguments and parameters'],
  },
  {
    problem_id: 101, level_number: 2, session_id: 18, case_number: 5,
    solution_code: 'message = input()\ndef display_message(msg):\n    print(msg)\ndisplay_message(message)',
    walkthrough: [
      { label: 'A function that only prints', code_snippet: 'def display_message(msg):\n    print(msg)', explanation: 'This function has no return - it just performs an action (printing).' },
      { label: 'Call it', code_snippet: 'display_message(message)', explanation: 'Pass the message in to be printed.' },
    ],
    student_explanation: "Not every function returns a value. Some just do a job, like printing. When there is no return, the function gives back None automatically.",
    worked_example: 'display_message("Hi")  ->  Hi',
    key_concepts: ['functions without return', 'parameters', 'side effects'],
    common_mistakes: ['Expecting a value back from a print-only function', 'Forgetting to call the function'],
  },
  {
    problem_id: 102, level_number: 2, session_id: 18, case_number: 6,
    solution_code: 'name = input()\nyear = input()\ncrew = input()\ndef diagnostics(name, year, crew):\n    print(name, year, crew)\ndef status_report(name, year, crew):\n    return f"Mission {name} was launched in {year} with a crew of {crew} astronauts."\ndiagnostics(name, year, crew)\nprint(status_report(name, year, crew))',
    walkthrough: [
      { label: 'One function prints, one returns', code_snippet: 'def diagnostics(name, year, crew):\n    print(name, year, crew)\ndef status_report(name, year, crew):\n    return f"Mission {name} was launched in {year} with a crew of {crew} astronauts."', explanation: 'diagnostics shows the raw values; status_report builds and returns a sentence.' },
      { label: 'Call both', code_snippet: 'diagnostics(name, year, crew)\nprint(status_report(name, year, crew))', explanation: 'The first prints directly; the second returns text that we then print.' },
    ],
    student_explanation: "The session challenge shows the two roles of functions side by side: one that performs an action (print) and one that builds and returns a result.",
    worked_example: 'status_report returns a sentence; print then shows it',
    key_concepts: ['print vs return', 'multiple functions', 'f-strings'],
    common_mistakes: ['Printing inside status_report instead of returning', 'Forgetting to print what status_report returns'],
  },

  // ── Session 19: Functions with Arguments (cases 1–6) ──
  {
    problem_id: 103, level_number: 2, session_id: 19, case_number: 1,
    solution_code: 'date = input()\nlocation = input()\ndef mission_log(date, location):\n    print(date, location)\nmission_log(date, location)',
    walkthrough: [
      { label: 'Two required arguments', code_snippet: 'def mission_log(date, location):\n    print(date, location)', explanation: 'Both parameters must be supplied when the function is called.' },
      { label: 'Call with both', code_snippet: 'mission_log(date, location)', explanation: 'Passing both values in order fills the two required parameters.' },
    ],
    student_explanation: "Required arguments must all be given when you call a function - one value for each parameter, in order.",
    worked_example: 'mission_log("2024-12-01", "Cape Canaveral")  ->  2024-12-01 Cape Canaveral',
    key_concepts: ['required arguments', 'argument order', 'print with commas'],
    common_mistakes: ['Calling with too few arguments', 'Passing them in the wrong order'],
  },
  {
    problem_id: 104, level_number: 2, session_id: 19, case_number: 2,
    solution_code: 'value = input()\ndef fuel_check(level="Full"):\n    print("Fuel level:", level)\nfuel_check()\nfuel_check(value)',
    walkthrough: [
      { label: 'Give a parameter a default', code_snippet: 'def fuel_check(level="Full"):\n    print("Fuel level:", level)', explanation: 'level="Full" means the function uses "Full" if no value is passed.' },
      { label: 'Call both ways', code_snippet: 'fuel_check()\nfuel_check(value)', explanation: 'The first call uses the default; the second supplies its own value.' },
    ],
    student_explanation: "A default argument is used when the caller does not provide one. It makes a parameter optional.",
    worked_example: 'fuel_check()  ->  Fuel level: Full   (the default is used)',
    key_concepts: ['default arguments', 'optional parameters'],
    common_mistakes: ['Thinking the default replaces a passed value', 'Forgetting the quotes around the default text'],
  },
  {
    problem_id: 105, level_number: 2, session_id: 19, case_number: 3,
    solution_code: 'name = input()\norbit = input()\ndef satellite_info(name, orbit):\n    print(f"{name} orbits at {orbit}")\nsatellite_info(orbit=orbit, name=name)',
    walkthrough: [
      { label: 'Define normally', code_snippet: 'def satellite_info(name, orbit):\n    print(f"{name} orbits at {orbit}")', explanation: 'Two ordinary parameters.' },
      { label: 'Call with keyword arguments', code_snippet: 'satellite_info(orbit=orbit, name=name)', explanation: 'Naming each argument (name=..., orbit=...) lets you pass them in any order.' },
    ],
    student_explanation: "Keyword arguments name each value as you pass it, so the order does not matter - name= still goes to name even if written second.",
    worked_example: 'satellite_info(orbit="LEO", name="Hubble")  ->  Hubble orbits at LEO',
    key_concepts: ['keyword arguments', 'order independence'],
    common_mistakes: ['Misspelling a keyword so it does not match a parameter', 'Assuming order still matters with keywords'],
  },
  {
    problem_id: 106, level_number: 2, session_id: 19, case_number: 4,
    solution_code: 'n = int(input())\nfrequencies = []\nfor _ in range(n):\n    frequencies.append(int(input()))\ndef record_signals(*frequencies):\n    for frequency in frequencies:\n        print("Signal:", frequency)\nrecord_signals(*frequencies)',
    walkthrough: [
      { label: 'Accept any number of arguments', code_snippet: 'def record_signals(*frequencies):\n    for frequency in frequencies:\n        print("Signal:", frequency)', explanation: 'The * collects all the passed values into one tuple you can loop over.' },
      { label: 'Unpack a list into the call', code_snippet: 'record_signals(*frequencies)', explanation: 'The * in the call spreads the list out into separate arguments.' },
    ],
    student_explanation: "*args lets a function take any number of arguments, gathered into a tuple. A * in the call unpacks a list back into separate arguments.",
    worked_example: 'record_signals(100, 200)  ->  Signal: 100 then Signal: 200',
    key_concepts: ['*args', 'unpacking with *', 'looping arguments'],
    common_mistakes: ['Forgetting the * in the definition or the call', 'Expecting *frequencies to be a list (it is a tuple)'],
  },
  {
    problem_id: 107, level_number: 2, session_id: 19, case_number: 5,
    solution_code: 'n = int(input())\ninfo = {}\nfor _ in range(n):\n    key = input()\n    value = input()\n    info[key] = value\ndef log_event(**info):\n    for key, value in info.items():\n        print(f"{key}: {value}")\nlog_event(**info)',
    walkthrough: [
      { label: 'Accept any keyword arguments', code_snippet: 'def log_event(**info):\n    for key, value in info.items():\n        print(f"{key}: {value}")', explanation: 'The ** collects all named arguments into a dictionary.' },
      { label: 'Unpack a dictionary into the call', code_snippet: 'log_event(**info)', explanation: 'The ** spreads a dictionary into separate key=value arguments.' },
    ],
    student_explanation: "**kwargs lets a function take any number of named arguments, gathered into a dictionary. ** in the call unpacks a dictionary into those named arguments.",
    worked_example: 'log_event(Event="Launch")  ->  Event: Launch',
    key_concepts: ['**kwargs', 'unpacking with **', 'dictionaries'],
    common_mistakes: ['Using * instead of ** for keyword arguments', 'Forgetting .items() when looping the kwargs'],
  },
  {
    problem_id: 108, level_number: 2, session_id: 19, case_number: 6,
    solution_code: 'name = input()\nduration = int(input())\nmodule_count = int(input())\nmodules = []\nfor _ in range(module_count):\n    modules.append(input())\nkwarg_count = int(input())\nextra = {}\nfor _ in range(kwarg_count):\n    key = input()\n    value = input()\n    extra[key] = value\ndef mission_report(mission_name, duration=5, *modules, **extra_info):\n    print(f"Mission: {mission_name}")\n    print(f"Duration: {duration} days")\n    print("Modules:")\n    for module in modules:\n        print("- " + module)\n    print("Extra Info:")\n    for key, value in extra_info.items():\n        print(f"- {key}: {value}")\nmission_report(name, duration, *modules, **extra)',
    walkthrough: [
      { label: 'Mix every argument type', code_snippet: 'def mission_report(mission_name, duration=5, *modules, **extra_info):', explanation: 'A required name, a default duration, *modules for extra positionals, and **extra_info for extra keywords - in that exact order.' },
      { label: 'Call with unpacking', code_snippet: 'mission_report(name, duration, *modules, **extra)', explanation: 'Pass the name and duration, unpack the modules list with *, and the extra dictionary with **.' },
    ],
    student_explanation: "The challenge combines required, default, *args, and **kwargs in one function. The order in the definition is always: normal, default, *args, **kwargs.",
    worked_example: 'def f(a, b=5, *c, **d)  is the required ordering of parameter types',
    key_concepts: ['combining argument types', '*args / **kwargs', 'parameter order'],
    common_mistakes: ['Putting *args or **kwargs in the wrong position', 'Skipping the "Extra Info:" header when there are no kwargs'],
  },

  // ── Session 20: Nested Functions & Function Scope (cases 1–6) ──
  {
    problem_id: 109, level_number: 2, session_id: 20, case_number: 1,
    solution_code: 'message = input()\ndef spaceship():\n    def launch():\n        print(message)\n    launch()\nspaceship()',
    walkthrough: [
      { label: 'Define a function inside a function', code_snippet: 'def spaceship():\n    def launch():\n        print(message)\n    launch()', explanation: 'launch is defined inside spaceship and called from within it.' },
      { label: 'Call the outer function', code_snippet: 'spaceship()', explanation: 'Calling spaceship() runs its body, which in turn calls launch().' },
    ],
    student_explanation: "A function can be defined inside another. The inner function only exists within the outer one, and the outer function calls it.",
    worked_example: 'spaceship() runs launch() inside it',
    key_concepts: ['nested functions', 'inner function calls', 'scope'],
    common_mistakes: ['Calling the inner function from outside (it is not visible there)', 'Forgetting to call the outer function'],
  },
  {
    problem_id: 110, level_number: 2, session_id: 20, case_number: 2,
    solution_code: 'rank_value = input()\ndef pilot():\n    rank = rank_value\n    print("Rank:", rank)\npilot()',
    walkthrough: [
      { label: 'Create a local variable', code_snippet: 'def pilot():\n    rank = rank_value\n    print("Rank:", rank)', explanation: 'rank exists only inside pilot - it is a local variable.' },
      { label: 'Call the function', code_snippet: 'pilot()', explanation: 'Running pilot() creates rank, prints it, then forgets it.' },
    ],
    student_explanation: "A variable created inside a function is local: it exists only while the function runs and cannot be seen from outside.",
    worked_example: 'rank lives only inside pilot() and disappears when it ends',
    key_concepts: ['local scope', 'local variables', 'functions'],
    common_mistakes: ['Trying to use a local variable outside its function', 'Expecting a local variable to last after the call'],
  },
  {
    problem_id: 111, level_number: 2, session_id: 20, case_number: 3,
    solution_code: 'old_name = input()\nnew_name = input()\ndef satellite():\n    name = old_name\n    def rename():\n        nonlocal name\n        name = new_name\n    rename()\n    print("Satellite:", name)\nsatellite()',
    walkthrough: [
      { label: 'Change an outer variable with nonlocal', code_snippet: 'def rename():\n    nonlocal name\n    name = new_name', explanation: 'nonlocal lets the inner function change the outer function\'s variable instead of making a new local one.' },
      { label: 'Call rename, then show the change', code_snippet: 'rename()\nprint("Satellite:", name)', explanation: 'After rename() runs, the outer name now holds new_name.' },
    ],
    student_explanation: "nonlocal lets an inner function modify a variable belonging to the function around it. Without it, the inner function would just make its own separate copy.",
    worked_example: 'nonlocal name  lets rename() update the outer name',
    key_concepts: ['nonlocal', 'enclosing scope', 'nested functions'],
    common_mistakes: ['Omitting nonlocal, so the outer variable is unchanged', 'Confusing nonlocal with global'],
  },
  {
    problem_id: 112, level_number: 2, session_id: 20, case_number: 4,
    solution_code: 'old_mission = input()\nnew_mission = input()\nmission = old_mission\ndef update():\n    global mission\n    mission = new_mission\nupdate()\nprint("Mission:", mission)',
    walkthrough: [
      { label: 'Change a global with the global keyword', code_snippet: 'def update():\n    global mission\n    mission = new_mission', explanation: 'global tells the function to use the top-level variable mission, not make a new local one.' },
      { label: 'Call, then print', code_snippet: 'update()\nprint("Mission:", mission)', explanation: 'After update() runs, the global mission holds new_mission.' },
    ],
    student_explanation: "The global keyword lets a function change a variable defined at the top level of the program, rather than creating a local copy.",
    worked_example: 'global mission  lets update() change the top-level mission',
    key_concepts: ['global keyword', 'global scope', 'functions'],
    common_mistakes: ['Forgetting global, so the top-level variable is unchanged', 'Using global when nonlocal was needed (or vice versa)'],
  },
  {
    problem_id: 113, level_number: 2, session_id: 20, case_number: 5,
    solution_code: 'message = input()\ndef create_alert():\n    def show():\n        return message\n    return show\nalert = create_alert()\nprint(alert())',
    walkthrough: [
      { label: 'Return a function, not a call', code_snippet: 'def create_alert():\n    def show():\n        return message\n    return show', explanation: 'Returning show (with no brackets) hands back the function itself, ready to be called later.' },
      { label: 'Store it and call it', code_snippet: 'alert = create_alert()\nprint(alert())', explanation: 'alert now IS the show function; alert() calls it to get the message.' },
    ],
    student_explanation: "A function can return another function. Returning it without brackets hands back the function itself, which you can store and call later.",
    worked_example: 'return show  hands back the function; alert() then runs it',
    key_concepts: ['returning a function', 'function objects', 'closures'],
    common_mistakes: ['Writing return show() (which calls it too early)', 'Forgetting the brackets when finally calling alert()'],
  },
  {
    problem_id: 114, level_number: 2, session_id: 20, case_number: 6,
    solution_code: 'name = input()\ndef mission_control(mission_name):\n    status = "Pending"\n    def prepare():\n        print(f"Mission Ready for: {mission_name}")\n    def launch():\n        nonlocal status\n        status = "Launched"\n    prepare()\n    launch()\n    print(f"Status: {status}")\nmission_control(name)',
    walkthrough: [
      { label: 'Inner functions share the outer state', code_snippet: 'def mission_control(mission_name):\n    status = "Pending"\n    def prepare():\n        print(f"Mission Ready for: {mission_name}")\n    def launch():\n        nonlocal status\n        status = "Launched"', explanation: 'prepare reads mission_name; launch uses nonlocal to change the shared status.' },
      { label: 'Orchestrate the helpers', code_snippet: '    prepare()\n    launch()\n    print(f"Status: {status}")', explanation: 'The outer function runs its helpers in order, then reports the updated status.' },
    ],
    student_explanation: "The challenge uses nested helper functions that share the outer function's state. nonlocal lets launch() update status that prepare() and the final print also see.",
    worked_example: 'launch() sets status to "Launched" via nonlocal',
    key_concepts: ['nested functions', 'nonlocal shared state', 'scope'],
    common_mistakes: ['Forgetting nonlocal so status stays "Pending"', 'Calling the inner helpers out of order'],
  },

  // ── Session 21: Built-in Functions Mastery (cases 1–6) ──
  {
    problem_id: 115, level_number: 2, session_id: 21, case_number: 1,
    solution_code: 'text = input()\nitems = [text]\nprint(len(items))\nprint(type(items))',
    walkthrough: [
      { label: 'Wrap the string in a list', code_snippet: 'text = input()\nitems = [text]', explanation: 'Putting the string inside [ ] makes a list with one element.' },
      { label: 'Length and type', code_snippet: 'print(len(items))\nprint(type(items))', explanation: 'len() counts the elements (1); type() reports the kind of object (a list).' },
    ],
    student_explanation: "len() counts how many items are in a collection, and type() tells you what kind of object something is, like <class 'list'>.",
    worked_example: 'print(type([1, 2]))  shows: <class \'list\'>',
    key_concepts: ['len()', 'type()', 'lists'],
    common_mistakes: ['Confusing the length of the list (1) with the length of the word', 'Forgetting the brackets that make it a list'],
  },
  {
    problem_id: 116, level_number: 2, session_id: 21, case_number: 2,
    solution_code: 'number = input()\nprint(int(number) + float(number))',
    walkthrough: [
      { label: 'Convert two ways and add', code_snippet: 'print(int(number) + float(number))', explanation: 'int() makes a whole number, float() makes a decimal; adding a float gives a float result.' },
    ],
    student_explanation: "int() and float() convert text into numbers. Because one side is a float, the answer comes out as a decimal (ends in .0).",
    worked_example: 'int("42") + float("42")  ->  42 + 42.0  =  84.0',
    key_concepts: ['int()', 'float()', 'mixed-type arithmetic'],
    common_mistakes: ['Expecting a whole number instead of a .0 decimal', 'Trying to add the raw text without converting'],
  },
  {
    problem_id: 117, level_number: 2, session_id: 21, case_number: 3,
    solution_code: 'numbers = []\nfor _ in range(5):\n    numbers.append(int(input()))\nprint(max(numbers))\nprint(min(numbers))\nprint(sum(numbers))',
    walkthrough: [
      { label: 'Collect five numbers', code_snippet: 'numbers = []\nfor _ in range(5):\n    numbers.append(int(input()))', explanation: 'Loop five times, converting and storing each input.' },
      { label: 'Use the math built-ins', code_snippet: 'print(max(numbers))\nprint(min(numbers))\nprint(sum(numbers))', explanation: 'max() gives the largest, min() the smallest, sum() the total.' },
    ],
    student_explanation: "max(), min(), and sum() are built-in helpers that read the largest value, smallest value, and total from a list of numbers.",
    worked_example: 'sum([10, 5, 8])  ->  23',
    key_concepts: ['max()', 'min()', 'sum()'],
    common_mistakes: ['Forgetting int() so the numbers are compared as text', 'Mixing up max and min'],
  },
  {
    problem_id: 118, level_number: 2, session_id: 21, case_number: 4,
    solution_code: 'strings = []\nfor _ in range(3):\n    strings.append(input())\nstart = int(input())\nend = int(input())\nprint(sorted(strings))\nprint(list(range(start, end + 1)))',
    walkthrough: [
      { label: 'Sort the words', code_snippet: 'print(sorted(strings))', explanation: 'sorted() returns a new list of the strings in alphabetical order.' },
      { label: 'Turn a range into a list', code_snippet: 'print(list(range(start, end + 1)))', explanation: 'list(range(start, end + 1)) builds a list of numbers from start to end, inclusive.' },
    ],
    student_explanation: "sorted() arranges a list alphabetically, and list(range(...)) turns a counting range into an actual list of numbers.",
    worked_example: 'list(range(1, 4))  ->  [1, 2, 3]',
    key_concepts: ['sorted()', 'list()', 'range inclusive end'],
    common_mistakes: ['Forgetting + 1 so the end number is missing', 'Expecting sorted() to change the original list (it returns a new one)'],
  },
  {
    problem_id: 119, level_number: 2, session_id: 21, case_number: 5,
    solution_code: 'name = input()\nrole = input()\nprint(f"Commander {name}, you are now assigned as the {role}.")',
    walkthrough: [
      { label: 'Read the inputs', code_snippet: 'name = input()\nrole = input()', explanation: 'input() reads the name and the role.' },
      { label: 'Build the assignment line', code_snippet: 'print(f"Commander {name}, you are now assigned as the {role}.")', explanation: 'An f-string drops both values into one formatted sentence.' },
    ],
    student_explanation: "input() and print() are the built-ins for talking with the user. An f-string is the cleanest way to weave values into a message.",
    worked_example: 'name "Alex", role "Pilot"  ->  Commander Alex, you are now assigned as the Pilot.',
    key_concepts: ['input()', 'print()', 'f-strings'],
    common_mistakes: ['Forgetting the f before the quotes', 'Dropping the full stop at the end'],
  },
  {
    problem_id: 120, level_number: 2, session_id: 21, case_number: 6,
    solution_code: 'mission = input()\ncount = int(input())\nmodules = []\nfor _ in range(count):\n    modules.append(input())\nprint("Mission:", mission)\nprint("Total modules:", count)\nprint("Data type:", type(modules))\nprint("Sorted modules:", sorted(modules))\ntotal_letters = 0\nfor module in modules:\n    total_letters += len(module)\nprint("Total letters:", total_letters)',
    walkthrough: [
      { label: 'Collect the modules', code_snippet: 'mission = input()\ncount = int(input())\nmodules = []\nfor _ in range(count):\n    modules.append(input())', explanation: 'Read the mission name and each module into a list.' },
      { label: 'Report using built-ins', code_snippet: 'print("Data type:", type(modules))\nprint("Sorted modules:", sorted(modules))\n...\n    total_letters += len(module)', explanation: 'type() names the collection, sorted() orders it, and len() in a loop totals the characters.' },
    ],
    student_explanation: "The session challenge ties the built-ins together: type() to identify, sorted() to order, and len() summed in a loop to count every letter across the names.",
    worked_example: 'len("Orion") + len("SLS")  ->  5 + 3  =  8',
    key_concepts: ['type()', 'sorted()', 'len() in a loop'],
    common_mistakes: ['Counting modules instead of letters for the total', 'Forgetting int() on the module count'],
  },

  // ── Session 22: Level 2 Capstone — Project ORBITRON ──
  {
    problem_id: 1000, level_number: 2, session_id: 22, case_number: 6,
    solution_code: 'name = input()\nfuel_readings = input().split()\nfuel_levels = [int(x) for x in fuel_readings]\nsignals = input().split()\ndifferent_signals = len(set(signals))\nevents = input().split(", ")\nmax_fuel = max(fuel_levels)\nlast_event = events[-1]\nprint("Mission Name: " + name)\nprint("Maximum Fuel Level: " + str(max_fuel))\nprint("Number of Signals: " + str(different_signals))\nprint("Most Recent Event: " + last_event)\nprint(f"Mission {name} is active with max fuel level {max_fuel} and {different_signals} signals received.")',
    walkthrough: [
      { label: 'Parse the four input lines', code_snippet: 'fuel_levels = [int(x) for x in input().split()]\nsignals = input().split()\nevents = input().split(", ")', explanation: '.split() breaks a line on spaces; .split(", ") splits events on the comma-space so multi-word events stay whole.' },
      { label: 'Analyse and report', code_snippet: 'different_signals = len(set(signals))\nmax_fuel = max(fuel_levels)\nlast_event = events[-1]', explanation: 'set() drops duplicate signal codes so len() counts the DIFFERENT ones; max() finds the top fuel; [-1] grabs the last event.' },
    ],
    student_explanation: "The Level 2 capstone pulls everything together: split text into lists, use a set to count unique signals, max() for the highest fuel, and an f-string for the summary line.",
    worked_example: 'len(set(["A", "B", "A"]))  ->  2 different codes',
    key_concepts: ['.split() / .split(", ")', 'set() for uniqueness', 'max() and [-1]'],
    common_mistakes: ['Counting all signals instead of the unique ones', 'Splitting events on "," and leaving a leading space, or on spaces and breaking multi-word events'],
  },

  // ══════════ LEVEL 3 ══════════
  // ── Session 23: Python Modules (cases 1,2,3,5,6 — case 4 P124 pending) ──
  {
    problem_id: 121, level_number: 3, session_id: 23, case_number: 1,
    solution_code: 'import math\ndistance = int(input())\nangle = int(input())\nprint(round(distance * math.cos(math.radians(angle)), 2))',
    walkthrough: [
      { label: 'Import math and read inputs', code_snippet: 'import math\ndistance = int(input())\nangle = int(input())', explanation: 'The math module gives trig functions like cos.' },
      { label: 'Horizontal distance = distance × cos(angle)', code_snippet: 'print(round(distance * math.cos(math.radians(angle)), 2))', explanation: 'cos works in radians, so convert the angle first with math.radians, then round to 2 decimals.' },
    ],
    student_explanation: "The math module holds ready-made tools. cos() needs the angle in radians, so wrap it in math.radians() first, then round the answer.",
    worked_example: '1000 * cos(45 degrees)  ->  707.11',
    key_concepts: ['import math', 'math.cos / math.radians', 'round()'],
    common_mistakes: ['Passing degrees straight to cos() without radians()', 'Forgetting to round to 2 decimals'],
  },
  {
    problem_id: 122, level_number: 3, session_id: 23, case_number: 2,
    solution_code: 'planets = input().split(",")\ndistances = [int(x) for x in input().split(",")]\nprint(planets[0])\nprint(sum(distances) // len(distances))',
    walkthrough: [
      { label: 'Read the route and distances', code_snippet: 'planets = input().split(",")\ndistances = [int(x) for x in input().split(",")]', explanation: 'Split each comma-separated line into a list; the distances become numbers.' },
      { label: 'Report the destination and average', code_snippet: 'print(planets[0])\nprint(sum(distances) // len(distances))', explanation: 'The grader expects the first planet on the route, then the whole-number average distance (sum // count).' },
    ],
    student_explanation: "Split turns a comma list into items, and // gives a whole-number average. (A live mission could pick the destination with random.choice; here the grader checks the first planet on the route.)",
    worked_example: 'sum([2, 4, 6, 8]) // 4  ->  5',
    key_concepts: ['.split()', 'integer average //', 'list indexing'],
    common_mistakes: ['Using / instead of // for a whole-number average', 'Forgetting to convert the distances to numbers'],
  },
  {
    problem_id: 123, level_number: 3, session_id: 23, case_number: 3,
    solution_code: 'force = int(input())\nmass = int(input())\nprint(f"{force / mass:.2f}")',
    walkthrough: [
      { label: 'Newton\'s second law: a = F / m', code_snippet: 'print(f"{force / mass:.2f}")', explanation: 'Acceleration is force divided by mass. The :.2f format shows exactly two decimals.' },
    ],
    student_explanation: "Acceleration equals force divided by mass. The :.2f inside an f-string always prints two decimal places, so 2.0 shows as 2.00.",
    worked_example: '5000 / 2500  ->  2.00',
    key_concepts: ['division', ':.2f formatting', 'f-strings'],
    common_mistakes: ['Using // which drops the decimals', 'Forgetting the :.2f so 2.5 prints as 2.5 not 2.50'],
  },
  {
    problem_id: 124, level_number: 3, session_id: 23, case_number: 4,
    solution_code: 'import random\ndate = input()\nyear, month, day = date.split("-")\nprint(int(year))\nprint(int(month))\nprint(int(day))\nlow = int(input())\nhigh = int(input())\nrandom.seed(int(year))\nprint(random.randint(low, high))',
    walkthrough: [
      { label: 'Parse the date parts', code_snippet: 'year, month, day = date.split("-")\nprint(int(year))\nprint(int(month))\nprint(int(day))', explanation: 'Split the date on "-" and print each part as a number (int() drops a leading zero, so "03" prints as 3).' },
      { label: 'Simulate a power reading', code_snippet: 'random.seed(int(year))\nprint(random.randint(low, high))', explanation: 'Seeding with the year makes the reading repeatable, then randint picks a value between the two limits.' },
    ],
    student_explanation: "Split the date to read its parts, using int() to drop leading zeros. Seeding random with the year makes the simulated reading identical on every run.",
    worked_example: 'random.seed(2024) then randint(50, 100)  ->  the same value every run',
    key_concepts: ['.split() + int()', 'random.seed', 'random.randint'],
    common_mistakes: ['Printing the month as "03" instead of 3', 'Seeding with the wrong value so the reading does not match'],
  },
  {
    problem_id: 125, level_number: 3, session_id: 23, case_number: 5,
    solution_code: 'import statistics\nbase = int(input())\nexponent = int(input())\nmeasurements = [float(x) for x in input().split(",")]\nprint(f"{base ** exponent:.2f}")\nprint(statistics.median(measurements))',
    walkthrough: [
      { label: 'Power with **', code_snippet: 'print(f"{base ** exponent:.2f}")', explanation: 'base ** exponent raises base to the power; :.2f shows two decimals.' },
      { label: 'Median with statistics', code_snippet: 'print(statistics.median(measurements))', explanation: 'statistics.median finds the middle value (averaging the middle two when the count is even).' },
    ],
    student_explanation: "** raises a number to a power, and statistics.median finds the middle of the sorted values - the average of the middle two when there is an even count.",
    worked_example: 'median([120.0, 135.0, 150.0, 160.0])  ->  142.5',
    key_concepts: ['** power', 'statistics.median', ':.2f formatting'],
    common_mistakes: ['Using * instead of ** for powers', 'Forgetting to convert the measurements to numbers'],
  },
  {
    problem_id: 126, level_number: 3, session_id: 23, case_number: 6,
    solution_code: 'func = input()\nif func == "transmit":\n    message = input()\n    station = input()\n    print(f"{message} [{station}]")\nelif func == "signal_strength":\n    distance = int(input())\n    print(f"{100 / distance:.2f}")\nelif func == "relay_chain":\n    message = input()\n    stations = input().split(",")\n    for i in range(len(stations)):\n        if i == 0:\n            print(f"[ENTRY] {message}")\n        elif i == len(stations) - 1:\n            print(f"{message} [EXIT]")\n        else:\n            print(f"[RELAY] {message}")',
    walkthrough: [
      { label: 'Dispatch on the function name', code_snippet: 'func = input()\nif func == "transmit":\n    ...\nelif func == "signal_strength":\n    ...\nelif func == "relay_chain":', explanation: 'The first input chooses which behaviour to run.' },
      { label: 'Relay markers by position', code_snippet: 'for i in range(len(stations)):\n    if i == 0:\n        print(f"[ENTRY] {message}")\n    elif i == len(stations) - 1:\n        print(f"{message} [EXIT]")\n    else:\n        print(f"[RELAY] {message}")', explanation: 'The first station is the ENTRY, the last is the EXIT, and any in between are RELAY.' },
    ],
    student_explanation: "The session challenge routes to one of three behaviours by name. The relay marks the first station ENTRY, the last EXIT, and every middle one RELAY.",
    worked_example: '3 stations  ->  [ENTRY], [RELAY], [EXIT]',
    key_concepts: ['dispatch by input', 'first/last index logic', 'f-strings'],
    common_mistakes: ['Marking the last station RELAY instead of EXIT', 'Forgetting the 2-station case has no RELAY'],
  },

  // ── Session 24: Built-in Modules (cases 1–6) ──
  {
    problem_id: 127, level_number: 3, session_id: 24, case_number: 1,
    solution_code: 'import math\nn = int(input())\nprint(math.factorial(n))',
    walkthrough: [
      { label: 'Factorial from the math module', code_snippet: 'import math\nn = int(input())\nprint(math.factorial(n))', explanation: 'math.factorial(n) multiplies n × (n-1) × ... × 1 for you.' },
    ],
    student_explanation: "math.factorial(n) gives the number of ways to arrange n items: 5! = 5 × 4 × 3 × 2 × 1 = 120.",
    worked_example: 'math.factorial(5)  ->  120',
    key_concepts: ['math.factorial', 'import math'],
    common_mistakes: ['Writing your own loop with an off-by-one error', 'Forgetting to import math'],
  },
  {
    problem_id: 128, level_number: 3, session_id: 24, case_number: 2,
    solution_code: 'import random\nseed = int(input())\nrandom.seed(seed)\nprint(random.randint(1, 6))',
    walkthrough: [
      { label: 'Seed, then roll', code_snippet: 'random.seed(seed)\nprint(random.randint(1, 6))', explanation: 'Seeding with the same number always produces the same "random" roll, so the result is repeatable.' },
    ],
    student_explanation: "random.randint(1, 6) gives a whole number from 1 to 6, like a dice roll. random.seed makes that roll repeatable for the same seed.",
    worked_example: 'random.randint(1, 6)  ->  a number from 1 to 6',
    key_concepts: ['random.seed', 'random.randint', 'reproducible randomness'],
    common_mistakes: ['Using randrange(1, 6) which never returns 6', 'Forgetting to seed before rolling'],
  },
  {
    problem_id: 129, level_number: 3, session_id: 24, case_number: 3,
    solution_code: 'date = input()\nday, month, year = date.split("-")\nprint(f"{year}-{month}-{day}")',
    walkthrough: [
      { label: 'Split the date apart', code_snippet: 'day, month, year = date.split("-")', explanation: 'Splitting on "-" gives the three pieces, which we unpack into day, month, year.' },
      { label: 'Reassemble in the new order', code_snippet: 'print(f"{year}-{month}-{day}")', explanation: 'Print them back in year-month-day order.' },
    ],
    student_explanation: "Splitting a string on a separator gives its parts as a list, which you can unpack into named variables and rearrange.",
    worked_example: '"15-03-2024" reordered  ->  2024-03-15',
    key_concepts: ['.split()', 'unpacking', 'f-strings'],
    common_mistakes: ['Converting the parts to int and losing leading zeros', 'Reordering the pieces wrongly'],
  },
  {
    problem_id: 130, level_number: 3, session_id: 24, case_number: 4,
    solution_code: 'import os\npath = input()\nprint(os.path.dirname(path))',
    walkthrough: [
      { label: 'Take the directory part', code_snippet: 'import os\nprint(os.path.dirname(path))', explanation: 'os.path.dirname returns everything up to the last slash - the folder the file sits in.' },
    ],
    student_explanation: "os.path.dirname strips the file name off a path, leaving just the directory that contains it.",
    worked_example: 'os.path.dirname("/a/b/c.txt")  ->  /a/b',
    key_concepts: ['os.path.dirname', 'import os', 'file paths'],
    common_mistakes: ['Using os.path.basename (which gives the file name instead)', 'Splitting the path by hand and missing an edge case'],
  },
  {
    problem_id: 131, level_number: 3, session_id: 24, case_number: 5,
    solution_code: 'import statistics\nvalues = [int(x) for x in input().split(",")]\nprint(statistics.median(values))',
    walkthrough: [
      { label: 'Median of the readings', code_snippet: 'import statistics\nvalues = [int(x) for x in input().split(",")]\nprint(statistics.median(values))', explanation: 'statistics.median sorts the values and returns the middle one (or the average of the middle two).' },
    ],
    student_explanation: "statistics.median gives the middle value of a sorted list - handy for a stable reading that ignores extreme highs and lows.",
    worked_example: 'median([10, 20, 30, 40])  ->  25.0',
    key_concepts: ['statistics.median', 'list comprehension', 'split()'],
    common_mistakes: ['Confusing median (middle) with mean (average)', 'Forgetting to convert the split pieces to int'],
  },
  {
    problem_id: 132, level_number: 3, session_id: 24, case_number: 6,
    solution_code: 'import random\nimport math\nimport statistics\nfrom decimal import Decimal, getcontext, ROUND_HALF_UP\nfunc = input()\nif func == "star_distance":\n    random.seed(42)\n    x = random.randint(1, 100)\n    y = random.randint(1, 100)\n    print(f"{math.sqrt(x ** 2 + y ** 2):.2f}")\nelif func == "fuel_calc":\n    getcontext().prec = 10\n    distance = Decimal(input())\n    result = (distance * Decimal("0.437")).quantize(Decimal("0.001"), rounding=ROUND_HALF_UP)\n    print(result)\nelif func == "radiation_mean":\n    values = [int(v) for v in input().split(",")]\n    print(f"{statistics.mean(values):.2f}")',
    walkthrough: [
      { label: 'Dispatch on the function name', code_snippet: 'func = input()\nif func == "star_distance":\n    ...\nelif func == "fuel_calc":\n    ...\nelif func == "radiation_mean":', explanation: 'The first input selects one of three calculations.' },
      { label: 'Three precise calculations', code_snippet: 'math.sqrt(x ** 2 + y ** 2)  # distance\nDecimal(distance) * Decimal("0.437")  # fuel\nstatistics.mean(values)  # radiation', explanation: 'Euclidean distance with math.sqrt, exact money-style maths with Decimal, and an average with statistics.mean.' },
    ],
    student_explanation: "This challenge combines three modules: math for the distance, Decimal for exact rounding to 3 places, and statistics for the mean.",
    worked_example: 'sqrt(x² + y²) is the straight-line distance from the origin',
    key_concepts: ['math.sqrt', 'Decimal precision', 'statistics.mean'],
    common_mistakes: ['Using float for fuel_calc and getting a rounding error', 'Forgetting to seed before the random coordinates'],
  },

  // ── Session 25: Functional Programming & Modular Data (cases 1–6) ──
  {
    problem_id: 133, level_number: 3, session_id: 25, case_number: 1,
    solution_code: 'from itertools import cycle, islice\nfreqs = input().split(",")\nresult = list(islice(cycle(freqs), 20))\nprint(" ".join(result))',
    walkthrough: [
      { label: 'Cycle the values forever', code_snippet: 'from itertools import cycle, islice\nresult = list(islice(cycle(freqs), 20))', explanation: 'cycle repeats a list endlessly; islice takes just the first 20 of that endless stream.' },
      { label: 'Join with spaces', code_snippet: 'print(" ".join(result))', explanation: '" ".join glues the items into one space-separated line.' },
    ],
    student_explanation: "itertools.cycle repeats a list forever, and islice safely takes the first N items from an endless stream so it does not run on forever.",
    worked_example: 'first 6 of cycle([1, 2])  ->  1 2 1 2 1 2',
    key_concepts: ['itertools.cycle', 'itertools.islice', '" ".join'],
    common_mistakes: ['Looping a real cycle without islice (it never ends)', 'Forgetting to join with a space'],
  },
  {
    problem_id: 134, level_number: 3, session_id: 25, case_number: 2,
    solution_code: 'import math\ndistances = [int(x) for x in input().split(",")]\nresults = [f"{math.sqrt(d * 1000 + d ** 2) / 3.5:.2f}" for d in distances]\nprint(" ".join(results))',
    walkthrough: [
      { label: 'Apply the velocity formula to each distance', code_snippet: 'results = [f"{math.sqrt(d * 1000 + d ** 2) / 3.5:.2f}" for d in distances]', explanation: 'A list comprehension runs the formula on every distance and formats each to 2 decimals.' },
      { label: 'Join the results', code_snippet: 'print(" ".join(results))', explanation: 'Combine them into one space-separated line.' },
    ],
    student_explanation: "A list comprehension applies one formula to every value at once. math.sqrt gives the square root, and :.2f keeps two decimals.",
    worked_example: 'sqrt(7000*1000 + 7000**2) / 3.5  ->  2138.09',
    key_concepts: ['list comprehension', 'math.sqrt', ':.2f formatting'],
    common_mistakes: ['Using ^ instead of ** for the square', 'Forgetting to format each result to 2 decimals'],
  },
  {
    problem_id: 135, level_number: 3, session_id: 25, case_number: 3,
    solution_code: 'a = int(input())\nb = int(input())\nprint(a + b)\nprint(a * b)\nprint(a == b)',
    walkthrough: [
      { label: 'Sum, product, and equality', code_snippet: 'print(a + b)\nprint(a * b)\nprint(a == b)', explanation: '+ adds, * multiplies, and == compares - returning True or False.' },
    ],
    student_explanation: "These three operations - add, multiply, and compare with == - are the building blocks the operator module wraps as named functions.",
    worked_example: 'print(5 == 5)  ->  True',
    key_concepts: ['+ and *', '== comparison', 'booleans'],
    common_mistakes: ['Using = instead of == for the comparison', 'Printing the three results on one line'],
  },
  {
    problem_id: 136, level_number: 3, session_id: 25, case_number: 4,
    solution_code: 'values = [int(x) for x in input().split(",")]\nprint(sum(values) * 3)',
    walkthrough: [
      { label: 'Total, then triple', code_snippet: 'print(sum(values) * 3)', explanation: 'sum() adds the whole list; multiplying by 3 scales the total.' },
    ],
    student_explanation: "sum() reduces a whole list to one total - the same idea as functools.reduce with addition. Then multiply that total by 3.",
    worked_example: 'sum([10, 20, 30, 40]) * 3  ->  300',
    key_concepts: ['sum()', 'reduce idea', 'list comprehension'],
    common_mistakes: ['Multiplying each value by 3 before summing (still works here, but watch the order)', 'Forgetting to convert the pieces to int'],
  },
  {
    problem_id: 137, level_number: 3, session_id: 25, case_number: 5,
    solution_code: 'n = int(input())\npackets = []\nfor _ in range(n):\n    parts = input().split(",")\n    packets.append((int(parts[0]), int(parts[1])))\npackets.sort()\nfor p in packets:\n    print(f"{p[0]},{p[1]}")',
    walkthrough: [
      { label: 'Store each packet as a tuple', code_snippet: 'packets.append((int(parts[0]), int(parts[1])))', explanation: 'A (priority, timestamp) tuple lets Python sort by priority first, then timestamp.' },
      { label: 'Sort and print', code_snippet: 'packets.sort()\nfor p in packets:\n    print(f"{p[0]},{p[1]}")', explanation: 'Sorting tuples compares the first item, then the second to break ties.' },
    ],
    student_explanation: "Sorting a list of tuples orders by the first value, and uses the second value only to break ties - exactly the two-key sort needed here.",
    worked_example: 'sort [(5,100),(2,150),(5,90)]  ->  (2,150),(5,90),(5,100)',
    key_concepts: ['tuples', 'tuple sorting', 'two-key order'],
    common_mistakes: ['Sorting the values as text so 10 comes before 2', 'Forgetting int() so priorities sort wrongly'],
  },
  {
    problem_id: 138, level_number: 3, session_id: 25, case_number: 6,
    solution_code: 'import math\nfrom itertools import cycle, islice\nsignal_type = input()\nif signal_type == "pattern":\n    result = list(islice(cycle([1, 2, 3, 4, 5]), 15))\n    print(" ".join(str(x) for x in result))\nelif signal_type == "velocity":\n    distances = [int(x) for x in input().split(",")]\n    results = [f"{math.sqrt(d * 1000 + d ** 2) / 3.5:.2f}" for d in distances]\n    print(" ".join(results))\nelif signal_type == "transform":\n    values = [int(x) for x in input().split(",")]\n    print(sum(values) * 2)',
    walkthrough: [
      { label: 'Dispatch on the signal type', code_snippet: 'signal_type = input()\nif signal_type == "pattern":\n    ...\nelif signal_type == "velocity":\n    ...\nelif signal_type == "transform":', explanation: 'The first input chooses one of three processing modes.' },
      { label: 'Each mode reuses an earlier skill', code_snippet: 'cycle([1,2,3,4,5])  # pattern\nmath.sqrt(...)  # velocity\nsum(...) * 2  # transform', explanation: 'pattern cycles a fixed list, velocity applies the formula, and transform doubles the sum.' },
    ],
    student_explanation: "The challenge combines cycle, a math formula, and sum into one dispatcher chosen by the first input - a tour of the whole session.",
    worked_example: 'pattern  ->  the first 15 of 1 2 3 4 5 repeating',
    key_concepts: ['dispatch by input', 'itertools.cycle', 'math + sum'],
    common_mistakes: ['Taking the wrong count from the cycle (15, not 20)', 'Mixing up which mode reads extra input'],
  },

  // ── Session 26: Using Classes and Objects (cases 1–6) ──
  {
    problem_id: 139, level_number: 3, session_id: 26, case_number: 1,
    solution_code: 'class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        print(f"{self.name} makes a sound.")\nname = input()\nanimal = Animal(name)\nanimal.speak()',
    walkthrough: [
      { label: 'Define a class with an attribute', code_snippet: 'class Animal:\n    def __init__(self, name):\n        self.name = name', explanation: '__init__ runs when an object is made; self.name stores the name on that object.' },
      { label: 'Add a method and use it', code_snippet: '    def speak(self):\n        print(f"{self.name} makes a sound.")\nanimal = Animal(name)\nanimal.speak()', explanation: 'A method is a function inside a class; animal.speak() runs it for that object.' },
    ],
    student_explanation: "A class is a blueprint. __init__ sets up each object's data (self.name), and methods are actions the object can do. Animal(name) builds one.",
    worked_example: 'Animal("Tiger").speak()  ->  Tiger makes a sound.',
    key_concepts: ['class', '__init__ / self', 'methods'],
    common_mistakes: ['Forgetting self in the method definitions', 'Calling speak() without first making an object'],
  },
  {
    problem_id: 140, level_number: 3, session_id: 26, case_number: 2,
    solution_code: 'class Student:\n    def __init__(self, name, grade):\n        self.name = name\n        self.grade = grade\n    def introduce(self):\n        print(f"My name is {self.name} and I am in grade {self.grade}.")\n    def study(self, subject):\n        print(f"{self.name} is studying {subject}.")\nname = input()\ngrade = input()\nsubject = input()\nstudent = Student(name, grade)\nstudent.introduce()\nstudent.study(subject)',
    walkthrough: [
      { label: 'Store two attributes', code_snippet: 'def __init__(self, name, grade):\n    self.name = name\n    self.grade = grade', explanation: 'Each object remembers its own name and grade.' },
      { label: 'Two methods, one takes input', code_snippet: 'def introduce(self):\n    ...\ndef study(self, subject):\n    print(f"{self.name} is studying {subject}.")', explanation: 'study takes an extra parameter (the subject) beyond self.' },
    ],
    student_explanation: "A class can hold several attributes and several methods. A method can take its own parameters in addition to self.",
    worked_example: 'student.study("Math")  ->  Anita is studying Math.',
    key_concepts: ['multiple attributes', 'multiple methods', 'method parameters'],
    common_mistakes: ['Forgetting self when reading self.name inside a method', 'Passing the subject to __init__ instead of study'],
  },
  {
    problem_id: 141, level_number: 3, session_id: 26, case_number: 3,
    solution_code: 'class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n    def show(self):\n        print(f"{self.name} costs ${self.price}.")\nn = int(input())\nfor _ in range(n):\n    parts = input().split()\n    product = Product(parts[0], parts[1])\n    product.show()',
    walkthrough: [
      { label: 'Define the class once', code_snippet: 'class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price', explanation: 'One blueprint is reused for every product.' },
      { label: 'Make many objects in a loop', code_snippet: 'for _ in range(n):\n    parts = input().split()\n    product = Product(parts[0], parts[1])\n    product.show()', explanation: 'Each loop pass builds a fresh Product and shows it.' },
    ],
    student_explanation: "One class can create as many objects as you like. Each call to Product(...) makes a separate object with its own data.",
    worked_example: 'Product("Pen", "1.2").show()  ->  Pen costs $1.2.',
    key_concepts: ['reusing a class', 'many objects', 'objects in a loop'],
    common_mistakes: ['Reusing one object instead of making a new one each pass', 'Splitting the line wrongly so name and price swap'],
  },
  {
    problem_id: 142, level_number: 3, session_id: 26, case_number: 4,
    solution_code: 'class Computer:\n    def __init__(self, brand, status):\n        self.brand = brand\n        self.status = status\n    def update_status(self, new_status):\n        self.status = new_status\n        print(f"{self.brand} computer is now: {self.status}")\nbrand = input()\nstatus = input()\nnew_status = input()\ncomputer = Computer(brand, status)\ncomputer.update_status(new_status)',
    walkthrough: [
      { label: 'A method that changes an attribute', code_snippet: 'def update_status(self, new_status):\n    self.status = new_status\n    print(f"{self.brand} computer is now: {self.status}")', explanation: 'Assigning to self.status updates the object, then we print the new value.' },
    ],
    student_explanation: "A method can change an object's own data by assigning to self.something. The object remembers the new value afterwards.",
    worked_example: 'update_status("Online")  ->  the status attribute becomes Online',
    key_concepts: ['updating self attributes', 'methods', 'objects'],
    common_mistakes: ['Making a new local variable instead of setting self.status', 'Printing the old status before updating it'],
  },
  {
    problem_id: 143, level_number: 3, session_id: 26, case_number: 5,
    solution_code: 'class Rectangle:\n    def __init__(self, length, width):\n        self.length = length\n        self.width = width\n    def area(self):\n        return self.length * self.width\nlength = int(input())\nwidth = int(input())\nrectangle = Rectangle(length, width)\nprint(f"The area of the rectangle is: {rectangle.area()}")',
    walkthrough: [
      { label: 'A method that returns a value', code_snippet: 'def area(self):\n    return self.length * self.width', explanation: 'area() multiplies the stored length and width, then returns the result.' },
      { label: 'Use the returned value', code_snippet: 'print(f"The area of the rectangle is: {rectangle.area()}")', explanation: 'Call area() inside the print to show the number it returns.' },
    ],
    student_explanation: "A method can use the object's stored data to calculate and return a value, which the caller then uses or prints.",
    worked_example: 'Rectangle(8, 4).area()  ->  32',
    key_concepts: ['methods that return', 'using self attributes', 'objects'],
    common_mistakes: ['Printing inside area() instead of returning', 'Forgetting int() so the sides are text and cannot multiply'],
  },
  {
    problem_id: 144, level_number: 3, session_id: 26, case_number: 6,
    solution_code: 'class AIAssistant:\n    def __init__(self, name, purpose):\n        self.name = name\n        self.purpose = purpose\n    def introduce(self):\n        print(f"My name is {self.name} and my purpose is {self.purpose}.")\n    def perform_task(self, task):\n        if self.purpose == "defense":\n            print("Alert: Security protocol activated!")\n        elif self.purpose == "medical":\n            print("Health check: All systems normal.")\n        print(f"{self.name} is performing: {task}")\nname = input()\npurpose = input()\ntask = input()\nassistant = AIAssistant(name, purpose)\nassistant.introduce()\nassistant.perform_task(task)',
    walkthrough: [
      { label: 'Store name and purpose', code_snippet: 'def __init__(self, name, purpose):\n    self.name = name\n    self.purpose = purpose', explanation: 'The purpose decides the extra line later.' },
      { label: 'Conditional logic inside a method', code_snippet: 'def perform_task(self, task):\n    if self.purpose == "defense":\n        print("Alert: Security protocol activated!")\n    elif self.purpose == "medical":\n        print("Health check: All systems normal.")\n    print(f"{self.name} is performing: {task}")', explanation: 'A defense or medical purpose prints a special line BEFORE the task line; other purposes print only the task.' },
    ],
    student_explanation: "Methods can hold if-else logic that reads the object's own attributes - here the purpose decides whether an extra alert line appears before the task.",
    worked_example: 'purpose "defense"  ->  an Alert line is printed first',
    key_concepts: ['conditional logic in methods', 'reading self attributes', 'classes'],
    common_mistakes: ['Printing the special line after the task instead of before', 'Comparing purpose to the wrong text'],
  },

  // ── Session 27: Classes with Attributes and Methods (cases 1–6) ──
  {
    problem_id: 145, level_number: 3, session_id: 27, case_number: 1,
    solution_code: 'class Student:\n    def __init__(self, name, grade):\n        self.name = name\n        self.grade = grade\n    def display(self):\n        number = int(self.grade[:-2])\n        if number % 2 == 0:\n            print(f"Even Grade: {self.name} - {self.grade}")\n        else:\n            print(f"Odd Grade: {self.name} - {self.grade}")\nname = input()\ngrade = input()\nstudent = Student(name, grade)\nstudent.display()',
    walkthrough: [
      { label: 'Pull the number out of the grade', code_snippet: 'number = int(self.grade[:-2])', explanation: 'self.grade[:-2] drops the last two letters ("th"), so "7th" becomes "7", then int() makes it a number.' },
      { label: 'Branch on even or odd', code_snippet: 'if number % 2 == 0:\n    print(f"Even Grade: {self.name} - {self.grade}")\nelse:\n    print(f"Odd Grade: {self.name} - {self.grade}")', explanation: 'number % 2 == 0 tests for even.' },
    ],
    student_explanation: "Slicing with [:-2] removes the last two characters of a string. Here it strips 'th' off a grade so the number can be tested for even or odd.",
    worked_example: 'int("7th"[:-2])  ->  7',
    key_concepts: ['string slicing [:-2]', '% even/odd test', 'methods'],
    common_mistakes: ['Forgetting to strip the "th" before int()', 'Swapping the even and odd messages'],
  },
  {
    problem_id: 146, level_number: 3, session_id: 27, case_number: 2,
    solution_code: 'class Student:\n    def __init__(self, name, grade):\n        self.name = name\n        self.grade = grade\n    def update_grade(self, new_grade):\n        total = int(self.grade[:-2]) + int(new_grade[:-2])\n        if total % 2 == 0:\n            prefix = "Level Up: "\n        else:\n            prefix = "Promotion: "\n        print(f"{prefix}{self.name} is in grade {self.grade}.")\n        print(f"{prefix}{self.name} is now in grade {new_grade}.")\nname = input()\ngrade = input()\nnew_grade = input()\nstudent = Student(name, grade)\nstudent.update_grade(new_grade)',
    walkthrough: [
      { label: 'Add the two grade numbers', code_snippet: 'total = int(self.grade[:-2]) + int(new_grade[:-2])', explanation: 'Strip the "th" off each grade, convert to numbers, and add them.' },
      { label: 'Choose the prefix by parity', code_snippet: 'if total % 2 == 0:\n    prefix = "Level Up: "\nelse:\n    prefix = "Promotion: "', explanation: 'An even total uses "Level Up: ", an odd total uses "Promotion: ".' },
    ],
    student_explanation: "Store the chosen prefix in a variable, then reuse it on both lines. The parity of the SUM of the two grade numbers decides which prefix to use.",
    worked_example: '7 + 8 = 15 (odd)  ->  Promotion:',
    key_concepts: ['string slicing', '% parity', 'reusing a prefix variable'],
    common_mistakes: ['Testing one grade instead of the sum', 'Forgetting the trailing space in the prefix'],
  },
  {
    problem_id: 147, level_number: 3, session_id: 27, case_number: 3,
    solution_code: 'class Student:\n    def __init__(self, name, grade):\n        self.name = name\n        self.grade = grade\n    def display(self):\n        print(f"Student: {self.name}, Grade: {self.grade}")\nn = int(input())\nfor _ in range(n):\n    parts = input().split()\n    student = Student(parts[0], parts[1])\n    student.display()',
    walkthrough: [
      { label: 'One class, many objects', code_snippet: 'for _ in range(n):\n    parts = input().split()\n    student = Student(parts[0], parts[1])\n    student.display()', explanation: 'Each loop pass splits a line, builds a Student, and displays it.' },
    ],
    student_explanation: "Build a fresh object from each input line inside a loop, so one class serves a whole roster of students.",
    worked_example: 'Student("Anya", "7th").display()  ->  Student: Anya, Grade: 7th',
    key_concepts: ['objects in a loop', '.split()', 'methods'],
    common_mistakes: ['Reusing one object instead of making a new one', 'Splitting name and grade incorrectly'],
  },
  {
    problem_id: 148, level_number: 3, session_id: 27, case_number: 4,
    solution_code: 'class Student:\n    def __init__(self, name, score):\n        self.name = name\n        self.score = score\n    def check_pass(self):\n        if self.score % 2 == 0 and self.score >= 50:\n            print(f"Success: {self.name} has passed.")\n        elif self.score % 2 == 1 and self.score >= 50:\n            print(f"Victory: {self.name} has passed.")\n        elif self.score % 2 == 0 and self.score < 50:\n            print(f"Failure: {self.name} has failed.")\n        else:\n            print(f"Defeat: {self.name} has failed.")\nname = input()\nscore = int(input())\nstudent = Student(name, score)\nstudent.check_pass()',
    walkthrough: [
      { label: 'Four cases from two questions', code_snippet: 'if self.score % 2 == 0 and self.score >= 50:\n    ...Success...\nelif self.score % 2 == 1 and self.score >= 50:\n    ...Victory...', explanation: 'Two yes/no questions (even? passed?) give four combinations, each with its own message.' },
    ],
    student_explanation: "Combining a parity check and a threshold check with and gives a 2x2 grid - four outcomes from two simple tests.",
    worked_example: '45 is odd and below 50  ->  Defeat: ... has failed.',
    key_concepts: ['combined and conditions', 'parity + threshold', 'methods'],
    common_mistakes: ['Mixing up which combination gets which word', 'Using > 50 instead of >= 50 (50 should pass)'],
  },
  {
    problem_id: 149, level_number: 3, session_id: 27, case_number: 5,
    solution_code: 'class AICrewMember:\n    def __init__(self, name, role, energy):\n        self.name = name\n        self.role = role\n        self.energy = energy\n    def show_status(self):\n        print(f"Name: {self.name} | Role: {self.role} | Energy: {self.energy}")\n    def perform_task(self, task):\n        if self.energy >= 50:\n            print(f"{self.name} is performing task: {task}")\n            self.energy -= 30\n        else:\n            print(f"{self.name} does not have enough energy to perform {task}!")\nname = input()\nrole = input()\nenergy = int(input())\ntask = input()\nmember = AICrewMember(name, role, energy)\nmember.show_status()\nmember.perform_task(task)\nmember.show_status()',
    walkthrough: [
      { label: 'A method that spends energy', code_snippet: 'def perform_task(self, task):\n    if self.energy >= 50:\n        print(f"{self.name} is performing task: {task}")\n        self.energy -= 30\n    else:\n        print(f"{self.name} does not have enough energy to perform {task}!")', explanation: 'If there is enough energy, do the task and subtract 30; otherwise report the shortage and change nothing.' },
      { label: 'Status before and after', code_snippet: 'member.show_status()\nmember.perform_task(task)\nmember.show_status()', explanation: 'Showing status twice makes the energy change visible.' },
    ],
    student_explanation: "A method can read AND change the object's energy. When the task runs it costs 30; when it cannot run, the energy stays the same.",
    worked_example: 'energy 80, do task  ->  energy becomes 50',
    key_concepts: ['updating self.energy', 'guard with >=', 'methods'],
    common_mistakes: ['Subtracting energy even when the task fails', 'Using > 50 so exactly 50 cannot act'],
  },
  {
    problem_id: 150, level_number: 3, session_id: 27, case_number: 6,
    solution_code: 'class AICrewMember:\n    def __init__(self, name, role, energy):\n        self.name = name\n        self.role = role\n        self.energy = energy\n    def show_status(self):\n        print(f"Name: {self.name} | Role: {self.role} | Energy: {self.energy}")\n    def perform_task(self, task):\n        if self.energy >= 50:\n            print(f"{self.name} is performing task: {task}")\n            self.energy -= 30\n        else:\n            print(f"{self.name} does not have enough energy to perform {task}!")\nn = int(input())\nfor _ in range(n):\n    name = input()\n    role = input()\n    energy = int(input())\n    task = input()\n    member = AICrewMember(name, role, energy)\n    member.show_status()\n    member.perform_task(task)\n    member.show_status()',
    walkthrough: [
      { label: 'Manage a whole crew in a loop', code_snippet: 'for _ in range(n):\n    name = input()\n    role = input()\n    energy = int(input())\n    task = input()\n    member = AICrewMember(name, role, energy)\n    member.show_status()\n    member.perform_task(task)\n    member.show_status()', explanation: 'Each crew member is a separate object, built and run through the same status-task-status sequence.' },
    ],
    student_explanation: "The challenge reuses the AICrewMember class for many objects, each with its own energy that changes independently.",
    worked_example: 'each member  ->  status, task attempt, status again',
    key_concepts: ['many objects', 'per-object state', 'methods'],
    common_mistakes: ['Sharing energy across members by reusing one object', 'Reading the four inputs in the wrong order'],
  },

  // ── Session 28: Magic Methods (cases 1–6) ──
  {
    problem_id: 151, level_number: 3, session_id: 28, case_number: 1,
    solution_code: 'class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\nname = input()\nage = int(input())\nperson = Person(name, age)\nif person.age >= 12 and person.age % 2 == 0:\n    prefix = "Senior:"\nelif person.age >= 12 and person.age % 2 == 1:\n    prefix = "Cadet:"\nelif person.age < 12 and person.age % 2 == 0:\n    prefix = "Junior:"\nelse:\n    prefix = "Recruit:"\nprint(f"{prefix} Name: {person.name}, Age: {person.age}")',
    walkthrough: [
      { label: '__init__ sets up the object', code_snippet: 'class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age', explanation: '__init__ is the magic method that runs automatically when Person(...) is called.' },
      { label: 'Rank from age and parity', code_snippet: 'if person.age >= 12 and person.age % 2 == 0:\n    prefix = "Senior:"\n...', explanation: 'A 2x2 grid of age threshold and even/odd picks the rank word.' },
    ],
    student_explanation: "__init__ is the magic method that builds an object. The rank is chosen from two tests: age 12-or-over versus under, and even versus odd.",
    worked_example: 'age 12 (>=12, even)  ->  Senior:',
    key_concepts: ['__init__', 'threshold + parity grid', 'objects'],
    common_mistakes: ['Forgetting __init__ runs on its own at object creation', 'Mixing up the four rank words'],
  },
  {
    problem_id: 152, level_number: 3, session_id: 28, case_number: 2,
    solution_code: 'class Book:\n    def __init__(self, title, author):\n        self.title = title\n        self.author = author\n    def __str__(self):\n        length = len(self.title)\n        if length >= 10 and length % 2 == 0:\n            prefix = "Long Title:"\n        elif length >= 10 and length % 2 == 1:\n            prefix = "Extended:"\n        elif length < 10 and length % 2 == 0:\n            prefix = "Short Title:"\n        else:\n            prefix = "Brief:"\n        return f"{prefix} {self.title} by {self.author}"\ntitle = input()\nauthor = input()\nbook = Book(title, author)\nprint(book)',
    walkthrough: [
      { label: 'Define __str__', code_snippet: 'def __str__(self):\n    ...\n    return f"{prefix} {self.title} by {self.author}"', explanation: '__str__ decides what print(object) shows. It must RETURN a string, not print one.' },
      { label: 'print triggers it', code_snippet: 'print(book)', explanation: 'print(book) automatically calls __str__ behind the scenes.' },
    ],
    student_explanation: "__str__ is the magic method print() uses to turn an object into text. It returns a string; print does the showing.",
    worked_example: 'print(book)  ->  runs __str__ and shows the returned text',
    key_concepts: ['__str__', 'return vs print', 'len()'],
    common_mistakes: ['Printing inside __str__ instead of returning', 'Measuring the author length instead of the title'],
  },
  {
    problem_id: 153, level_number: 3, session_id: 28, case_number: 3,
    solution_code: 'class Notebook:\n    def __init__(self, pages):\n        self.pages = pages\n    def __len__(self):\n        return self.pages\npages = int(input())\nnotebook = Notebook(pages)\nif len(notebook) >= 100 and len(notebook) % 2 == 0:\n    prefix = "Large Notebook:"\nelif len(notebook) >= 100 and len(notebook) % 2 == 1:\n    prefix = "Extended Notebook:"\nelif len(notebook) < 100 and len(notebook) % 2 == 0:\n    prefix = "Small Notebook:"\nelse:\n    prefix = "Compact Notebook:"\nprint(f"{prefix} {len(notebook)}")',
    walkthrough: [
      { label: 'Define __len__', code_snippet: 'def __len__(self):\n    return self.pages', explanation: '__len__ decides what len(object) returns - here the page count.' },
      { label: 'len() triggers it', code_snippet: 'if len(notebook) >= 100 and len(notebook) % 2 == 0:', explanation: 'Calling len(notebook) runs __len__ and gives back the pages.' },
    ],
    student_explanation: "__len__ is the magic method len() uses. Once defined, len(notebook) returns whatever number you choose - here the pages.",
    worked_example: 'len(Notebook(150))  ->  150',
    key_concepts: ['__len__', 'len() hook', 'threshold + parity'],
    common_mistakes: ['Returning text from __len__ (it must return a number)', 'Forgetting to define __len__ before calling len()'],
  },
  {
    problem_id: 154, level_number: 3, session_id: 28, case_number: 4,
    solution_code: 'class Printer:\n    def __init__(self, name):\n        self.name = name\n    def __call__(self, document):\n        length = len(self.name)\n        if length >= 5 and length % 2 == 0:\n            prefix = "Professional Printer:"\n        elif length >= 5 and length % 2 == 1:\n            prefix = "Advanced Printer:"\n        elif length < 5 and length % 2 == 0:\n            prefix = "Basic Printer:"\n        else:\n            prefix = "Quick Printer:"\n        print(f"{prefix} {self.name} is printing: {document}")\nname = input()\ndocument = input()\nprinter = Printer(name)\nprinter(document)',
    walkthrough: [
      { label: 'Define __call__', code_snippet: 'def __call__(self, document):\n    ...', explanation: '__call__ lets you use the OBJECT like a function: printer(document).' },
      { label: 'Call the object', code_snippet: 'printer(document)', explanation: 'Because __call__ is defined, printer(document) runs it.' },
    ],
    student_explanation: "__call__ is the magic method that makes an object callable. After defining it, printer(document) runs like a function call on the object.",
    worked_example: 'printer("report.pdf")  ->  runs __call__ on the object',
    key_concepts: ['__call__', 'callable objects', 'threshold + parity'],
    common_mistakes: ['Calling a named method instead of the object itself', 'Forgetting __call__ takes self plus its own argument'],
  },
  {
    problem_id: 155, level_number: 3, session_id: 28, case_number: 5,
    solution_code: 'class Movie:\n    def __init__(self, title, duration):\n        self.title = title\n        self.duration = duration\n    def __str__(self):\n        if self.duration >= 120 and self.duration % 2 == 0:\n            prefix = "Epic Movie:"\n        elif self.duration >= 120 and self.duration % 2 == 1:\n            prefix = "Long Film:"\n        elif self.duration < 120 and self.duration % 2 == 0:\n            prefix = "Short Movie:"\n        else:\n            prefix = "Quick Film:"\n        return f"{prefix} {self.title}"\n    def __len__(self):\n        return self.duration\n    def __call__(self, action):\n        print(f"Now {action} the movie: {self.title}")\ntitle = input()\nduration = int(input())\naction = input()\nmovie = Movie(title, duration)\nprint(movie)\nprint(len(movie))\nmovie(action)',
    walkthrough: [
      { label: 'Three magic methods in one class', code_snippet: 'def __str__(self): ...\ndef __len__(self): return self.duration\ndef __call__(self, action): ...', explanation: '__str__ for print, __len__ for len, and __call__ for using the object like a function.' },
      { label: 'Trigger each one', code_snippet: 'print(movie)\nprint(len(movie))\nmovie(action)', explanation: 'Each line fires a different magic method.' },
    ],
    student_explanation: "One class can define several magic methods at once. print uses __str__, len uses __len__, and calling the object uses __call__.",
    worked_example: 'print(movie), len(movie), movie("playing")  ->  three magic methods',
    key_concepts: ['__str__ / __len__ / __call__', 'magic methods', 'classes'],
    common_mistakes: ['Returning from __call__ instead of printing', 'Mixing up which magic method each line triggers'],
  },
  {
    problem_id: 156, level_number: 3, session_id: 28, case_number: 6,
    solution_code: 'class Movie:\n    def __init__(self, title, duration):\n        self.title = title\n        self.duration = duration\n    def __str__(self):\n        return f"Movie: {self.title}"\n    def __len__(self):\n        return self.duration\n    def __call__(self, action):\n        print(f"Now {action} the movie: {self.title}")\nn = int(input())\nfor _ in range(n):\n    title = input()\n    duration = int(input())\n    action = input()\n    movie = Movie(title, duration)\n    print(movie)\n    print(len(movie))\n    movie(action)',
    walkthrough: [
      { label: 'A full magic-method class', code_snippet: 'def __str__(self):\n    return f"Movie: {self.title}"\ndef __len__(self):\n    return self.duration\ndef __call__(self, action):\n    print(f"Now {action} the movie: {self.title}")', explanation: 'A clean media object: printable, measurable, and callable.' },
      { label: 'Run it for every movie', code_snippet: 'for _ in range(n):\n    ...\n    print(movie)\n    print(len(movie))\n    movie(action)', explanation: 'Each movie object uses all three magic methods in turn.' },
    ],
    student_explanation: "The challenge builds a small media library where every movie object is printable (__str__), measurable (__len__), and callable (__call__).",
    worked_example: 'each movie  ->  Movie: title, duration, Now action the movie: title',
    key_concepts: ['magic methods together', 'many objects', 'classes'],
    common_mistakes: ['Adding the conditional prefix (this version uses a plain "Movie:")', 'Reading the three inputs out of order'],
  },

  // ── Session 29: Encapsulation & Access Modifiers (cases 1–6) ──
  {
    problem_id: 157, level_number: 3, session_id: 29, case_number: 1,
    solution_code: 'class CrewMember:\n    def __init__(self, name, email, password):\n        self.name = name\n        self._email = email\n        self.__password = password\nname = input()\nemail = input()\npassword = input()\ncrew = CrewMember(name, email, password)\nlength = len(crew.name)\nif length >= 10 and length % 2 == 0:\n    prefix = "Senior Crew:"\nelif length >= 10 and length % 2 == 1:\n    prefix = "Lead Crew:"\nelif length < 10 and length % 2 == 0:\n    prefix = "Crew:"\nelse:\n    prefix = "New Crew:"\nprint(f"{prefix} {crew.name}")\nprint(crew._email)',
    walkthrough: [
      { label: 'Three access levels', code_snippet: 'self.name = name        # public\nself._email = email      # protected (one underscore)\nself.__password = password  # private (two underscores)', explanation: 'One underscore signals "internal use"; two underscores hide a name from outside the class.' },
      { label: 'Public and protected can still be read here', code_snippet: 'print(f"{prefix} {crew.name}")\nprint(crew._email)', explanation: 'name and _email are reachable; the private __password is not meant to be.' },
    ],
    student_explanation: "Underscores signal intent: public (no underscore), protected (_one), private (__two). They guide how data is meant to be accessed.",
    worked_example: 'self._email is protected; self.__password is private',
    key_concepts: ['public / protected / private', 'naming conventions', 'classes'],
    common_mistakes: ['Reading __password from outside the class', 'Mixing up one underscore and two'],
  },
  {
    problem_id: 158, level_number: 3, session_id: 29, case_number: 2,
    solution_code: 'class FuelTank:\n    def __init__(self, fuel):\n        self.__fuel = fuel\n    def get_fuel(self):\n        return self.__fuel\n    def set_fuel(self, amount):\n        if amount >= 0:\n            self.__fuel = amount\nfuel = int(input())\nnew_fuel = int(input())\ntank = FuelTank(fuel)\nprint(tank.get_fuel())\ntank.set_fuel(new_fuel)\nprint(tank.get_fuel())',
    walkthrough: [
      { label: 'Private data with a guarded setter', code_snippet: 'def set_fuel(self, amount):\n    if amount >= 0:\n        self.__fuel = amount', explanation: 'The setter only stores the new amount when it is valid (non-negative), protecting the private fuel.' },
    ],
    student_explanation: "Encapsulation means hiding data behind methods. A setter can VALIDATE a value before storing it, so the object never holds something invalid.",
    worked_example: 'set_fuel(-50)  ->  rejected, the fuel stays unchanged',
    key_concepts: ['private attribute', 'getter / setter', 'validation'],
    common_mistakes: ['Storing the value before checking it', 'Allowing negative fuel through'],
  },
  {
    problem_id: 159, level_number: 3, session_id: 29, case_number: 3,
    solution_code: 'class SecurityModule:\n    def __init__(self, pin):\n        self.__pin = pin\n    def get_pin(self):\n        return self.__pin\npin = input()\nmodule = SecurityModule(pin)\nprint(module.get_pin())',
    walkthrough: [
      { label: 'Hide the PIN, expose a getter', code_snippet: 'self.__pin = pin\n...\ndef get_pin(self):\n    return self.__pin', explanation: 'The PIN is private; the only way out is through the get_pin method.' },
    ],
    student_explanation: "Keeping data private and offering a getter means the value can only be read through a controlled method, not poked at directly.",
    worked_example: 'module.get_pin()  ->  the stored PIN',
    key_concepts: ['private attribute', 'getter method', 'encapsulation'],
    common_mistakes: ['Reading __pin directly from outside', 'Converting the PIN to int and losing leading zeros'],
  },
  {
    problem_id: 160, level_number: 3, session_id: 29, case_number: 4,
    solution_code: 'class SecureVault:\n    def __init__(self, pin, key):\n        self.__pin = pin\n        self.__key = key\n    def access(self, pin, key):\n        if pin == self.__pin and key == self.__key:\n            return "Access Granted"\n        return "Access Denied"\nstored_pin = input()\nstored_key = input()\nentered_pin = input()\nentered_key = input()\nvault = SecureVault(stored_pin, stored_key)\nprint(vault.access(entered_pin, entered_key))',
    walkthrough: [
      { label: 'Two-factor check', code_snippet: 'def access(self, pin, key):\n    if pin == self.__pin and key == self.__key:\n        return "Access Granted"\n    return "Access Denied"', explanation: 'Both the PIN AND the key must match for access - that is the and.' },
    ],
    student_explanation: "Two-factor security needs BOTH secrets to match. The and operator grants access only when neither check fails.",
    worked_example: 'right PIN but wrong key  ->  Access Denied',
    key_concepts: ['private attributes', 'and condition', 'encapsulation'],
    common_mistakes: ['Using or so one correct factor is enough', 'Comparing to the wrong stored value'],
  },
  {
    problem_id: 161, level_number: 3, session_id: 29, case_number: 5,
    solution_code: 'class AccessControl:\n    def __init__(self, pin):\n        self.__pin = pin\n    def access(self, role, entered_pin):\n        if role == "Commander":\n            if entered_pin == self.__pin:\n                return "Access Granted: Commander"\n            return "Access Denied"\n        elif role == "User":\n            return "Access Granted: User - Limited View"\n        else:\n            return "Access Denied"\nrole = input()\nstored_pin = input()\nentered_pin = input()\ncontrol = AccessControl(stored_pin)\nprint(control.access(role, entered_pin))',
    walkthrough: [
      { label: 'Role decides the access path', code_snippet: 'if role == "Commander":\n    if entered_pin == self.__pin:\n        return "Access Granted: Commander"\n    return "Access Denied"\nelif role == "User":\n    return "Access Granted: User - Limited View"\nelse:\n    return "Access Denied"', explanation: 'A Commander needs the right PIN; a User gets limited access; anyone else is denied.' },
    ],
    student_explanation: "Role-based access gives each role a different rule. Only the Commander path checks the PIN; Users get a limited view; Guests are turned away.",
    worked_example: 'role User  ->  Access Granted: User - Limited View (no PIN needed)',
    key_concepts: ['role-based access', 'nested conditions', 'encapsulation'],
    common_mistakes: ['Checking the PIN for a User too', 'Forgetting the else that denies a Guest'],
  },
  {
    problem_id: 162, level_number: 3, session_id: 29, case_number: 6,
    solution_code: 'class Vault:\n    def __init__(self, pin_code, access_level, vault_id):\n        self.__pin_code = pin_code\n        self._access_level = access_level\n        self.vault_id = vault_id\n    def get_pin(self):\n        return self.__pin_code\n    def set_pin(self, new_pin):\n        if len(new_pin) == 4 and new_pin.isdigit():\n            self.__pin_code = new_pin\n            print("PIN updated successfully.")\n        else:\n            print("Invalid PIN! Must be 4 digits.")\n    def unlock_vault(self, entered_pin):\n        if entered_pin == self.__pin_code:\n            return "Access Granted"\n        return "Access Denied"\npin_code = input()\naccess_level = input()\nvault_id = input()\nnew_pin = input()\nunlock_pin = input()\nvault1 = Vault(pin_code, access_level, vault_id)\nvault2 = vault1\nvault2.set_pin(new_pin)\nprint(f"Vault1 PIN: {vault1.get_pin()}")\nprint(f"Vault2 PIN: {vault2.get_pin()}")\nprint(vault1.unlock_vault(unlock_pin))',
    walkthrough: [
      { label: 'Validate the new PIN', code_snippet: 'def set_pin(self, new_pin):\n    if len(new_pin) == 4 and new_pin.isdigit():\n        self.__pin_code = new_pin\n        print("PIN updated successfully.")\n    else:\n        print("Invalid PIN! Must be 4 digits.")', explanation: 'Only a 4-character, all-digit PIN is accepted.' },
      { label: 'Two names, one object', code_snippet: 'vault2 = vault1\nvault2.set_pin(new_pin)', explanation: 'vault2 = vault1 does NOT copy; both names point to the SAME vault, so a change through one shows in the other.' },
    ],
    student_explanation: "The challenge combines a validated setter with a key idea: assigning an object (vault2 = vault1) shares it, so both names see the same updated PIN.",
    worked_example: 'set_pin("999")  ->  Invalid PIN! Must be 4 digits.',
    key_concepts: ['validated setter', 'shared object reference', 'encapsulation'],
    common_mistakes: ['Thinking vault2 = vault1 makes a copy', 'Skipping the 4-digit validation'],
  },

  // ── Session 30: Inheritance (Beginner) (cases 1–6) ──
  {
    problem_id: 163, level_number: 3, session_id: 30, case_number: 1,
    solution_code: 'class Spacecraft:\n    def __init__(self, name):\n        self.name = name\n        length = len(name)\n        if length >= 7 and length % 2 == 0:\n            self.prefix = "Advanced"\n        elif length >= 7 and length % 2 == 1:\n            self.prefix = "Elite"\n        elif length < 7 and length % 2 == 0:\n            self.prefix = "Basic"\n        else:\n            self.prefix = "Swift"\n    def launch(self):\n        print(f"{self.prefix}: {self.name} Launching into space!")\nclass Satellite(Spacecraft):\n    def transmit(self):\n        print(f"{self.prefix}: {self.name} Transmitting data to Earth.")\nname = input()\nsat = Satellite(name)\nsat.launch()\nsat.transmit()',
    walkthrough: [
      { label: 'Child inherits the parent', code_snippet: 'class Satellite(Spacecraft):\n    def transmit(self):\n        ...', explanation: 'Satellite(Spacecraft) means Satellite gets all of Spacecraft - including launch() and the prefix set in __init__.' },
      { label: 'Use both inherited and new methods', code_snippet: 'sat.launch()    # inherited\nsat.transmit()  # new', explanation: 'The object uses the parent method and its own method, both sharing the same prefix.' },
    ],
    student_explanation: "Inheritance lets a child class reuse everything from its parent. Satellite gets launch() and the prefix for free, then adds transmit().",
    worked_example: 'a name of length 6 (even, < 7)  ->  prefix Basic',
    key_concepts: ['inheritance', 'child(Parent)', 'shared attributes'],
    common_mistakes: ['Re-writing launch() in the child instead of inheriting', 'Getting the length threshold wrong'],
  },
  {
    problem_id: 164, level_number: 3, session_id: 30, case_number: 2,
    solution_code: 'class Vehicle:\n    def __init__(self, name):\n        self.name = name\n        length = len(name)\n        if length >= 8 and length % 2 == 0:\n            self.prefix = "Heavy"\n        elif length >= 8 and length % 2 == 1:\n            self.prefix = "Super"\n        elif length < 8 and length % 2 == 0:\n            self.prefix = "Fast"\n        else:\n            self.prefix = "Quick"\n    def move(self):\n        print(f"{self.prefix}: {self.name} Moving...")\nclass Rocket(Vehicle):\n    def fire(self):\n        print(f"{self.prefix}: {self.name} Rocket engines firing!")\nclass CargoRocket(Rocket):\n    def deliver(self):\n        print(f"{self.prefix}: {self.name} Delivering satellite payload.")\nname = input()\ncargo = CargoRocket(name)\ncargo.move()\ncargo.fire()\ncargo.deliver()',
    walkthrough: [
      { label: 'A three-level chain', code_snippet: 'class Vehicle: ...\nclass Rocket(Vehicle): ...\nclass CargoRocket(Rocket): ...', explanation: 'CargoRocket inherits from Rocket, which inherits from Vehicle - so CargoRocket has all three methods.' },
      { label: 'Use methods from every level', code_snippet: 'cargo.move()     # Vehicle\ncargo.fire()     # Rocket\ncargo.deliver()  # CargoRocket', explanation: 'The grandchild object can call methods defined anywhere up the chain.' },
    ],
    student_explanation: "Multilevel inheritance passes features down a chain. CargoRocket gets move() from Vehicle, fire() from Rocket, and adds deliver() itself.",
    worked_example: 'a name of length 8 (even, >= 8)  ->  prefix Heavy',
    key_concepts: ['multilevel inheritance', 'inheritance chain', 'shared prefix'],
    common_mistakes: ['Breaking the chain by inheriting from the wrong class', 'Getting the length threshold wrong'],
  },
  {
    problem_id: 165, level_number: 3, session_id: 30, case_number: 3,
    solution_code: 'class Sensor:\n    def __init__(self, name):\n        self.name = name\n        length = len(name)\n        if length >= 6 and length % 2 == 0:\n            self.prefix = "Alpha"\n        elif length >= 6 and length % 2 == 1:\n            self.prefix = "Beta"\n        elif length < 6 and length % 2 == 0:\n            self.prefix = "Gamma"\n        else:\n            self.prefix = "Delta"\n    def record(self, duration=None):\n        if duration is None:\n            print(f"{self.prefix}: {self.name} Recording data indefinitely.")\n        else:\n            print(f"{self.prefix}: {self.name} Recording data for {duration} seconds.")\nname = input()\nsensor = Sensor(name)\nsensor.record()\nsensor.record(10)',
    walkthrough: [
      { label: 'One flexible method', code_snippet: 'def record(self, duration=None):\n    if duration is None:\n        ...indefinitely...\n    else:\n        ...for {duration} seconds...', explanation: 'A default of None lets the same method work with OR without a duration.' },
      { label: 'Call it both ways', code_snippet: 'sensor.record()\nsensor.record(10)', explanation: 'No argument uses the None branch; an argument uses the other.' },
    ],
    student_explanation: "Python fakes method overloading with a default argument. record() and record(10) call the same method, which checks whether the duration was given.",
    worked_example: 'record()  ->  indefinitely;  record(10)  ->  for 10 seconds',
    key_concepts: ['default argument', 'is None check', 'flexible methods'],
    common_mistakes: ['Defining record twice (the second hides the first)', 'Getting the length threshold wrong'],
  },
  {
    problem_id: 166, level_number: 3, session_id: 30, case_number: 4,
    solution_code: 'class Rover:\n    def __init__(self, name):\n        self.name = name\n        length = len(name)\n        if length % 2 == 1:\n            self.prefix = "Elite Rover"\n        elif length >= 6:\n            self.prefix = "Advanced Rover"\n        else:\n            self.prefix = "Base Rover"\n    def identify(self):\n        print(f"{self.prefix}: Generic Rover")\nclass MarsRover(Rover):\n    def identify(self):\n        super().identify()\n        print(f"{self.prefix}: Mars Exploration Rover")\nname = input()\nrover = MarsRover(name)\nrover.identify()',
    walkthrough: [
      { label: 'Override and extend with super()', code_snippet: 'class MarsRover(Rover):\n    def identify(self):\n        super().identify()\n        print(f"{self.prefix}: Mars Exploration Rover")', explanation: 'The child redefines identify(), but super().identify() still runs the parent version first.' },
    ],
    student_explanation: "Overriding replaces a parent method in the child. Calling super().identify() lets the child run the parent's version AND add its own line.",
    worked_example: 'identify()  ->  the Generic line, then the Mars line',
    key_concepts: ['method overriding', 'super()', 'inheritance'],
    common_mistakes: ['Forgetting super() so the Generic line is lost', 'Getting the prefix rule wrong'],
  },
  {
    problem_id: 167, level_number: 3, session_id: 30, case_number: 5,
    solution_code: 'class NavBase:\n    def __init__(self, name):\n        self.name = name\n        length = len(name)\n        if length >= 8 and length % 2 == 0:\n            self.prefix = "NavSys"\n        elif length >= 8 and length % 2 == 1:\n            self.prefix = "AutoSys"\n        elif length < 8 and length % 2 == 0:\n            self.prefix = "Sys"\n        else:\n            self.prefix = "Core"\n    def enable(self):\n        print(f"{self.prefix}: Precision mode enabled")\nclass NavSystem(NavBase):\n    def calibrate(self):\n        print(f"{self.prefix}: Calibrating star tracker...")\nname = input()\nnav = NavSystem(name)\nnav.enable()\nnav.calibrate()',
    walkthrough: [
      { label: 'Base sets the prefix and one method', code_snippet: 'class NavBase:\n    def __init__(self, name):\n        ...sets self.prefix...\n    def enable(self):\n        print(f"{self.prefix}: Precision mode enabled")', explanation: 'The base computes the prefix once and offers enable().' },
      { label: 'Child adds another method', code_snippet: 'class NavSystem(NavBase):\n    def calibrate(self):\n        print(f"{self.prefix}: Calibrating star tracker...")', explanation: 'The child reuses the inherited prefix in its own method.' },
    ],
    student_explanation: "A base class can compute a shared value (the prefix) that every child method reuses, keeping the rule in one place.",
    worked_example: 'a name of length 8 (even, >= 8)  ->  prefix NavSys',
    key_concepts: ['inheritance', 'shared base logic', 'reused attributes'],
    common_mistakes: ['Recomputing the prefix in the child', 'Getting the length threshold wrong'],
  },
  {
    problem_id: 168, level_number: 3, session_id: 30, case_number: 6,
    solution_code: 'class AIAssistant:\n    def __init__(self, name):\n        self.name = name\n    def diagnostics(self):\n        print("Running technical diagnostics...")\nclass MissionAI(AIAssistant):\n    def decide(self):\n        print("Making mission-level decision...")\nclass ExplorerAI(MissionAI):\n    def scan(self, planet):\n        print(f"ExplorerAI is scanning {planet} for life signs...")\n    def execute(self, task):\n        if task == "Collect Sample":\n            print("Sample collection initiated.")\n        else:\n            print(f"Executing task: {task}")\nname = input()\nmission = input()\nplanet = input()\ntask = input()\nai = ExplorerAI(name)\nai.diagnostics()\nai.decide()\nai.scan(planet)\nai.execute(task)',
    walkthrough: [
      { label: 'Evolve a class down three levels', code_snippet: 'class AIAssistant: ... diagnostics()\nclass MissionAI(AIAssistant): ... decide()\nclass ExplorerAI(MissionAI): ... scan(), execute()', explanation: 'ExplorerAI inherits diagnostics and decide, then adds scanning and task execution.' },
      { label: 'Branch on the task', code_snippet: 'def execute(self, task):\n    if task == "Collect Sample":\n        print("Sample collection initiated.")\n    else:\n        print(f"Executing task: {task}")', explanation: 'A "Collect Sample" task gets a special line; any other task is just executed.' },
    ],
    student_explanation: "The challenge builds a three-level AI: each level adds a behaviour, and the final class also branches on the task it is given.",
    worked_example: 'task "Collect Sample"  ->  Sample collection initiated.',
    key_concepts: ['multilevel inheritance', 'added behaviour per level', 'conditional method'],
    common_mistakes: ['Calling a method the object did not inherit', 'Forgetting the special Collect Sample case'],
  },

  // ── Session 31: Inheritance (Advanced) (cases 1–6) ──
  {
    problem_id: 169, level_number: 3, session_id: 31, case_number: 1,
    solution_code: 'class Navigator:\n    def navigate(self):\n        print(f"{self.prefix}: Navigating space.")\nclass Communicator:\n    def signal(self):\n        print(f"{self.prefix}: Sending signal.")\nclass MissionAI(Navigator, Communicator):\n    def __init__(self, name):\n        self.name = name\n        length = len(name)\n        if length >= 6 and length % 2 == 0:\n            self.prefix = "MultiAI"\n        elif length >= 6 and length % 2 == 1:\n            self.prefix = "ComboAI"\n        elif length < 6 and length % 2 == 0:\n            self.prefix = "DualAI"\n        else:\n            self.prefix = "MixAI"\nname = input()\nai = MissionAI(name)\nai.navigate()\nai.signal()',
    walkthrough: [
      { label: 'Inherit from two parents', code_snippet: 'class MissionAI(Navigator, Communicator):', explanation: 'Listing two classes in the brackets means MissionAI gets methods from BOTH.' },
      { label: 'Use a method from each parent', code_snippet: 'ai.navigate()  # from Navigator\nai.signal()    # from Communicator', explanation: 'The single object can call methods from either parent.' },
    ],
    student_explanation: "Multiple inheritance lists more than one parent. The child gains the methods of all of them - here navigate from one and signal from the other.",
    worked_example: 'class C(A, B)  ->  C has methods from both A and B',
    key_concepts: ['multiple inheritance', 'child(A, B)', 'combined methods'],
    common_mistakes: ['Listing only one parent', 'Getting the length threshold wrong'],
  },
  {
    problem_id: 170, level_number: 3, session_id: 31, case_number: 2,
    solution_code: 'class BaseAI:\n    def boot(self):\n        print(f"{self.prefix}: Booting AI system...")\nclass MedicalAI(BaseAI):\n    def scan_medical(self):\n        print(f"{self.prefix}: Scanning medical data...")\nclass ResearchAI(BaseAI):\n    def analyze(self):\n        print(f"{self.prefix}: Analyzing research results...")\nclass LabAI(MedicalAI, ResearchAI):\n    def __init__(self, name):\n        self.name = name\n        length = len(name)\n        if length >= 7 and length % 2 == 0:\n            self.prefix = "HybridSys"\n        elif length >= 7 and length % 2 == 1:\n            self.prefix = "MergedSys"\n        elif length < 7 and length % 2 == 0:\n            self.prefix = "LabSys"\n        else:\n            self.prefix = "MixSys"\nname = input()\nai = LabAI(name)\nai.boot()\nai.scan_medical()\nai.analyze()',
    walkthrough: [
      { label: 'Combine multilevel and multiple', code_snippet: 'class MedicalAI(BaseAI): ...\nclass ResearchAI(BaseAI): ...\nclass LabAI(MedicalAI, ResearchAI): ...', explanation: 'LabAI inherits from two classes that each inherit from BaseAI - a hybrid hierarchy.' },
    ],
    student_explanation: "Hybrid inheritance mixes multilevel and multiple inheritance. LabAI reaches boot (from BaseAI), scan_medical, and analyze through its two parents.",
    worked_example: 'a name of length 7 (odd, >= 7)  ->  prefix MergedSys',
    key_concepts: ['hybrid inheritance', 'diamond shape', 'shared base'],
    common_mistakes: ['Wiring the parents up wrongly', 'Getting the length threshold wrong'],
  },
  {
    problem_id: 171, level_number: 3, session_id: 31, case_number: 3,
    solution_code: 'class Sensor:\n    def __init__(self, name):\n        self.name = name\n        length = len(name)\n        if length >= 7:\n            self.prefix = "TempSensor"\n        elif length == 6:\n            self.prefix = "HeatSensor"\n        else:\n            self.prefix = "Thermal"\n    def status(self):\n        print(f"{self.prefix}: Sensor active.")\nclass ThermalSensor(Sensor):\n    def status(self):\n        print(f"{self.prefix}: Thermal sensor activated.")\nname = input()\nsensor = ThermalSensor(name)\nsensor.status()',
    walkthrough: [
      { label: 'Override the parent method', code_snippet: 'class ThermalSensor(Sensor):\n    def status(self):\n        print(f"{self.prefix}: Thermal sensor activated.")', explanation: 'The child defines status() again, so its version replaces the parent one when called on a ThermalSensor.' },
    ],
    student_explanation: "When a child defines a method with the same name as the parent, the child's version wins. This is method overriding.",
    worked_example: 'ThermalSensor.status()  ->  the child version runs, not the parent',
    key_concepts: ['method overriding', 'inheritance', 'length bands'],
    common_mistakes: ['Giving the child method a different name (then it does not override)', 'Getting the length bands wrong'],
  },
  {
    problem_id: 172, level_number: 3, session_id: 31, case_number: 4,
    solution_code: 'class SystemCheck:\n    def __init__(self, name):\n        self.name = name\n        length = len(name)\n        if length >= 8 and length % 2 == 0:\n            self.prefix = "SuperCheck"\n        elif length >= 8 and length % 2 == 1:\n            self.prefix = "ExtendCheck"\n        elif length < 8 and length % 2 == 0:\n            self.prefix = "Check"\n        else:\n            self.prefix = "Scan"\n    def run(self):\n        print(f"{self.prefix}: Running system diagnostics.")\nclass AdvancedCheck(SystemCheck):\n    def run(self):\n        super().run()\n        print(f"{self.prefix}: All systems functional.")\nname = input()\ncheck = AdvancedCheck(name)\ncheck.run()',
    walkthrough: [
      { label: 'Extend, do not replace', code_snippet: 'def run(self):\n    super().run()\n    print(f"{self.prefix}: All systems functional.")', explanation: 'super().run() runs the parent version first, then the child adds its own line.' },
    ],
    student_explanation: "super() lets a child build ON TOP of a parent method instead of throwing it away - run the parent first, then add more.",
    worked_example: 'run()  ->  the parent diagnostics line, then the child line',
    key_concepts: ['super()', 'extending a method', 'inheritance'],
    common_mistakes: ['Forgetting super() so the parent line disappears', 'Getting the length threshold wrong'],
  },
  {
    problem_id: 173, level_number: 3, session_id: 31, case_number: 5,
    solution_code: 'class ScannerAI:\n    def report(self):\n        print("Scanner reporting: All clear.")\nclass LoggerAI:\n    def report(self):\n        print("Logger reporting: Saved.")\nclass CommanderAI(ScannerAI, LoggerAI):\n    pass\nname = input()\ncommander = CommanderAI()\ncommander.report()\nprint(CommanderAI.__mro__)',
    walkthrough: [
      { label: 'Two parents with the same method', code_snippet: 'class CommanderAI(ScannerAI, LoggerAI):\n    pass', explanation: 'Both parents have report(). Python must decide which one wins.' },
      { label: 'MRO decides the winner', code_snippet: 'commander.report()\nprint(CommanderAI.__mro__)', explanation: 'The Method Resolution Order checks ScannerAI before LoggerAI (left to right), so Scanner wins. __mro__ shows the full search order.' },
    ],
    student_explanation: "When two parents share a method name, Python follows the Method Resolution Order (MRO) - left to right - to choose which one runs. __mro__ prints that order.",
    worked_example: 'class C(A, B)  ->  A is searched before B',
    key_concepts: ['MRO', '__mro__', 'multiple inheritance'],
    common_mistakes: ['Expecting the second parent to win', 'Forgetting the search goes left to right'],
  },
  {
    problem_id: 174, level_number: 3, session_id: 31, case_number: 6,
    solution_code: 'class NavAI:\n    def navigate(self):\n        print(f"Navigating through space: {self.name}")\nclass DataAI:\n    def analyze(self):\n        print(f"Analyzing data streams: {self.name}")\nclass BaseAI:\n    def boot(self):\n        print("Booting base AI system...")\nclass PilotAI(NavAI, BaseAI):\n    def pilot(self, zone):\n        print(f"Pilot mode: Flying through {zone}")\nclass ScienceAI(DataAI, BaseAI):\n    def research(self, subject):\n        print(f"Science mode: Researching {subject}")\nclass HybridAI(PilotAI, ScienceAI):\n    def __init__(self, name):\n        self.name = name\n    def report(self):\n        print("HybridAI Report: Multi-stream analysis complete.")\n    def initialize(self):\n        print("Initializing systems...")\n        print("Advanced protocols loaded.")\nname = input()\nzone = input()\nsubject = input()\nai = HybridAI(name)\nai.navigate()\nai.analyze()\nai.boot()\nai.pilot(zone)\nai.research(subject)\nai.report()\nai.initialize()',
    walkthrough: [
      { label: 'A composite hierarchy', code_snippet: 'class PilotAI(NavAI, BaseAI): ...\nclass ScienceAI(DataAI, BaseAI): ...\nclass HybridAI(PilotAI, ScienceAI): ...', explanation: 'HybridAI pulls together navigation, data, piloting, and science through several parents.' },
      { label: 'Run the whole pipeline', code_snippet: 'ai.navigate()\nai.analyze()\nai.boot()\nai.pilot(zone)\nai.research(subject)\nai.report()\nai.initialize()', explanation: 'Each call reaches a method somewhere in the inheritance web.' },
    ],
    student_explanation: "The challenge stitches several inheritance styles into one capable class, then calls a method from each layer in sequence.",
    worked_example: 'HybridAI gathers methods from NavAI, DataAI, BaseAI, PilotAI, ScienceAI',
    key_concepts: ['composite inheritance', 'multiple + multilevel', 'method pipeline'],
    common_mistakes: ['Calling a method not reachable in the hierarchy', 'Printing the lines in the wrong order'],
  },

  // ── Session 32: Polymorphism (cases 1–6) ──
  {
    problem_id: 175, level_number: 3, session_id: 32, case_number: 1,
    solution_code: 'class Animal:\n    def speak(self):\n        print("Some sound.")\nclass Dog(Animal):\n    def speak(self):\n        print("The dog barks.")\nclass Cat(Animal):\n    def speak(self):\n        print("The cat meows.")\nfor _ in range(2):\n    kind = input()\n    if kind == "Dog":\n        animal = Dog()\n    else:\n        animal = Cat()\n    animal.speak()',
    walkthrough: [
      { label: 'Each child overrides speak()', code_snippet: 'class Dog(Animal):\n    def speak(self):\n        print("The dog barks.")\nclass Cat(Animal):\n    def speak(self):\n        print("The cat meows.")', explanation: 'Dog and Cat give their own version of the shared speak() method.' },
      { label: 'Same call, different result', code_snippet: 'animal.speak()', explanation: 'The same line animal.speak() does a different thing depending on the object type - that is polymorphism.' },
    ],
    student_explanation: "Polymorphism means one method name behaves differently per class. animal.speak() barks for a Dog and meows for a Cat.",
    worked_example: 'Dog().speak() vs Cat().speak()  ->  barks vs meows',
    key_concepts: ['polymorphism', 'method overriding', 'inheritance'],
    common_mistakes: ['Forgetting to override speak() in a child', 'Building the wrong object for the input'],
  },
  {
    problem_id: 176, level_number: 3, session_id: 32, case_number: 2,
    solution_code: 'class Book:\n    def __init__(self, title, pages):\n        self.title = title\n        self.pages = pages\n    def __add__(self, other):\n        return Book(self.title + "-" + other.title, self.pages + other.pages)\n    def __str__(self):\n        return f"{self.title} Book with {self.pages} pages"\ntitle1 = input()\npages1 = int(input())\ntitle2 = input()\npages2 = int(input())\nbook1 = Book(title1, pages1)\nbook2 = Book(title2, pages2)\ncombined = book1 + book2\nprint(combined)',
    walkthrough: [
      { label: 'Redefine + for objects', code_snippet: 'def __add__(self, other):\n    return Book(self.title + "-" + other.title, self.pages + other.pages)', explanation: '__add__ controls what book1 + book2 does - here join the titles and add the pages.' },
      { label: 'Use the + operator', code_snippet: 'combined = book1 + book2\nprint(combined)', explanation: 'book1 + book2 calls __add__ and returns a new Book.' },
    ],
    student_explanation: "Operator overloading lets you give + a meaning for your own objects. __add__ defines what happens when two Books are added.",
    worked_example: 'Book("A",150) + Book("B",100)  ->  A-B Book with 250 pages',
    key_concepts: ['__add__', 'operator overloading', '__str__'],
    common_mistakes: ['Returning text from __add__ instead of a new Book', 'Forgetting __str__ so the result prints oddly'],
  },
  {
    problem_id: 177, level_number: 3, session_id: 32, case_number: 3,
    solution_code: 'class Student:\n    def __init__(self, name, marks):\n        self.name = name\n        self.marks = marks\n    def __gt__(self, other):\n        return self.marks > other.marks\nstudents = []\nfor _ in range(3):\n    name = input()\n    marks = int(input())\n    students.append(Student(name, marks))\nhighest = students[0]\nfor student in students[1:]:\n    if student > highest:\n        highest = student\nprint(highest.name)',
    walkthrough: [
      { label: 'Redefine > with __gt__', code_snippet: 'def __gt__(self, other):\n    return self.marks > other.marks', explanation: '__gt__ decides what student_a > student_b means - here compare their marks.' },
      { label: 'Find the highest', code_snippet: 'highest = students[0]\nfor student in students[1:]:\n    if student > highest:\n        highest = student', explanation: 'Because > is defined, you can compare Student objects directly.' },
    ],
    student_explanation: "Overloading > with __gt__ lets you compare your own objects with a plain >. Here it compares marks to find the top scorer.",
    worked_example: 'student_a > student_b  ->  compares their marks',
    key_concepts: ['__gt__', 'operator overloading', 'finding a maximum'],
    common_mistakes: ['Comparing the objects without defining __gt__', 'Comparing names instead of marks'],
  },
  {
    problem_id: 178, level_number: 3, session_id: 32, case_number: 4,
    solution_code: 'class SystemCheck:\n    def __init__(self, name):\n        self.name = name\n    def run(self):\n        print(f"{self.name}: Running diagnostics.")\nclass AdvancedCheck(SystemCheck):\n    def run(self):\n        super().run()\n        print(f"{self.name}: Advanced check complete.")\nname = input()\ncheck = AdvancedCheck(name)\ncheck.run()',
    walkthrough: [
      { label: 'Extend with super()', code_snippet: 'class AdvancedCheck(SystemCheck):\n    def run(self):\n        super().run()\n        print(f"{self.name}: Advanced check complete.")', explanation: 'super().run() runs the parent line, then the child adds its own.' },
    ],
    student_explanation: "super() calls the parent version of an overridden method, so the child can add to it rather than replace it entirely.",
    worked_example: 'run()  ->  the diagnostics line, then the advanced line',
    key_concepts: ['super()', 'overriding', 'polymorphism'],
    common_mistakes: ['Forgetting super() so the first line is lost', 'Printing in the wrong order'],
  },
  {
    problem_id: 179, level_number: 3, session_id: 32, case_number: 5,
    solution_code: 'class Fan:\n    def start(self):\n        print("Fan is spinning.")\nclass Car:\n    def start(self):\n        print("Car engine started.")\nclass Computer:\n    def start(self):\n        print("Computer booting up.")\nfor _ in range(3):\n    kind = input()\n    if kind == "Fan":\n        obj = Fan()\n    elif kind == "Car":\n        obj = Car()\n    else:\n        obj = Computer()\n    obj.start()',
    walkthrough: [
      { label: 'Unrelated classes, same method name', code_snippet: 'class Fan:\n    def start(self): ...\nclass Car:\n    def start(self): ...\nclass Computer:\n    def start(self): ...', explanation: 'Three classes that share NO parent each define start() differently.' },
      { label: 'Call start() on whichever object', code_snippet: 'obj.start()', explanation: 'The same call works on any of them, each doing its own thing.' },
    ],
    student_explanation: "Polymorphism does not need inheritance. Any objects that share a method name can be used the same way - obj.start() works on a Fan, Car, or Computer.",
    worked_example: 'Fan().start() vs Car().start()  ->  spinning vs engine started',
    key_concepts: ['duck typing', 'shared method name', 'polymorphism'],
    common_mistakes: ['Thinking polymorphism requires a common parent', 'Building the wrong object for the input'],
  },
  {
    problem_id: 180, level_number: 3, session_id: 32, case_number: 6,
    solution_code: 'class AI:\n    def __init__(self, name, power):\n        self.name = name\n        self.power = power\n    def __add__(self, other):\n        return f"{self.name}-{other.name} with power {self.power + other.power}"\nclass Scout(AI):\n    def respond(self):\n        print("Scout responding: Scanning area.")\nclass Engineer(AI):\n    def respond(self):\n        print("Engineer responding: Building structures.")\nclass Commander(AI):\n    def respond(self):\n        print("Commander responding: Leading the team.")\ndef make(kind, power):\n    if kind == "Scout":\n        return Scout(kind, power)\n    elif kind == "Engineer":\n        return Engineer(kind, power)\n    else:\n        return Commander(kind, power)\ntype1 = input()\npower1 = int(input())\ntype2 = input()\npower2 = int(input())\nai1 = make(type1, power1)\nai2 = make(type2, power2)\nai1.respond()\nai2.respond()\nprint(ai1 + ai2)',
    walkthrough: [
      { label: 'Override respond(), inherit __add__', code_snippet: 'class Scout(AI):\n    def respond(self):\n        print("Scout responding: Scanning area.")', explanation: 'Each AI type overrides respond(), but they all share the __add__ from the AI base.' },
      { label: 'Combine two AIs with +', code_snippet: 'print(ai1 + ai2)', explanation: '+ uses the inherited __add__ to join names and add power levels.' },
    ],
    student_explanation: "The challenge mixes polymorphism (each respond() differs) with operator overloading (+ combines two AIs through the shared __add__).",
    worked_example: 'Scout(50) + Engineer(70)  ->  Scout-Engineer with power 120',
    key_concepts: ['polymorphism', '__add__ inherited', 'overriding'],
    common_mistakes: ['Defining __add__ in each child instead of the base', 'Reading type and power in the wrong order'],
  },

  // ── Session 33: Level 3 Capstone — Project COSMIC LINK ──
  {
    problem_id: 181, level_number: 3, session_id: 33, case_number: 1,
    solution_code: 'friendly = 0\nunknown = 0\nfor _ in range(3):\n    source = input()\n    strength = int(input())\n    message = input()\n    if strength > 70:\n        friendly += 1\n    else:\n        unknown += 1\nprint(f"Total Signals Detected: {friendly + unknown}")\nprint(f"Friendly Signals: {friendly}")\nprint(f"Unknown Signals: {unknown}")\nprint("COSMIC LINK LIVE - STREAMS CLASSIFIED")',
    walkthrough: [
      { label: 'Read and classify each signal', code_snippet: 'for _ in range(3):\n    source = input()\n    strength = int(input())\n    message = input()\n    if strength > 70:\n        friendly += 1\n    else:\n        unknown += 1', explanation: 'Each signal is three lines; a strength above 70 is Friendly, 70 or below is Unknown.' },
      { label: 'Report the totals', code_snippet: 'print(f"Total Signals Detected: {friendly + unknown}")\nprint(f"Friendly Signals: {friendly}")\nprint(f"Unknown Signals: {unknown}")', explanation: 'Count each category and print the summary lines.' },
    ],
    student_explanation: "The Level 3 capstone reads three 3-line signals, classifies each by a strength threshold (above 70 is Friendly), and tallies the results - a clean use of counters and a loop.",
    worked_example: 'strength 71  ->  Friendly;  strength 70  ->  Unknown',
    key_concepts: ['counting in a loop', 'threshold classification', 'reading grouped input'],
    common_mistakes: ['Counting strength 70 as Friendly (it is 70-or-less = Unknown)', 'Reading the three lines per signal in the wrong order'],
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
