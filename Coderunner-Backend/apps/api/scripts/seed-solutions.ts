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
