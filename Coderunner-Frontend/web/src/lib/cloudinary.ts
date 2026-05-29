// Auto-generated Cloudinary URL helper
// Generated at: 2026-02-16T06:34:18.334Z

export const CLOUDINARY_BASE = 'https://res.cloudinary.com/dwqzqxeuk';

// Image optimization params
export const IMG_OPTS = 'f_auto,q_auto';

// Get optimized image URL
export function getCloudinaryImage(path: string, options?: { width?: number; height?: number }) {
  const basePath = path.startsWith('/') ? path.slice(1) : path;
  let transform = IMG_OPTS;

  if (options?.width) transform += `,w_${options.width}`;
  if (options?.height) transform += `,h_${options.height}`;

  return `${CLOUDINARY_BASE}/image/upload/${transform}/code-runner/${basePath}`;
}

// Get audio/video URL
export function getCloudinaryAudio(path: string) {
  const basePath = path.startsWith('/') ? path.slice(1) : path;
  return `${CLOUDINARY_BASE}/video/upload/code-runner/${basePath}`;
}

// URL mappings
export const CLOUDINARY_URLS = {
  "/assets/characters/Astro.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206105/code-runner/characters/Astro.png",
    "publicId": "code-runner/characters/Astro",
    "resourceType": "image"
  },
  "/assets/characters/Leo.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206108/code-runner/characters/Leo.png",
    "publicId": "code-runner/characters/Leo",
    "resourceType": "image"
  },
  "/assets/characters/Kenji_2.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206111/code-runner/characters/Kenji_2.png",
    "publicId": "code-runner/characters/Kenji_2",
    "resourceType": "image"
  },
  "/assets/characters/nila (2).png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206112/code-runner/characters/nila%20%282%29.png",
    "publicId": "code-runner/characters/nila (2)",
    "resourceType": "image"
  },
  "//astra-home-bg.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1771223449/code-runner/backgrounds/astra-home-bg.png",
    "publicId": "code-runner/backgrounds/astra-home-bg",
    "resourceType": "image"
  },
  "//nila-home-bg.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1771223451/code-runner/backgrounds/nila-home-bg.png",
    "publicId": "code-runner/backgrounds/nila-home-bg",
    "resourceType": "image"
  },
  "//leo-home-bg.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1771223452/code-runner/backgrounds/leo-home-bg.png",
    "publicId": "code-runner/backgrounds/leo-home-bg",
    "resourceType": "image"
  },
  "/assets/ui/ENV-2.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206121/code-runner/ui/ENV-2.png",
    "publicId": "code-runner/ui/ENV-2",
    "resourceType": "image"
  },
  "/assets/ui/transperent.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206123/code-runner/ui/transperent.png",
    "publicId": "code-runner/ui/transperent",
    "resourceType": "image"
  },
  "/assets/ui/LOF_SVG.svg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206124/code-runner/ui/LOF_SVG.svg",
    "publicId": "code-runner/ui/LOF_SVG",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Frame/full-frame/top-frame-2.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206131/code-runner/cheatsheets/Frame/full-frame/top-frame-2.png",
    "publicId": "code-runner/cheatsheets/Frame/full-frame/top-frame-2",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Frame/full-frame/bottom frame.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206132/code-runner/cheatsheets/Frame/full-frame/bottom%20frame.png",
    "publicId": "code-runner/cheatsheets/Frame/full-frame/bottom frame",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Frame/full-frame/Frame_rod.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206133/code-runner/cheatsheets/Frame/full-frame/Frame_rod.png",
    "publicId": "code-runner/cheatsheets/Frame/full-frame/Frame_rod",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Frame/full-frame/Frame_rod_right.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206134/code-runner/cheatsheets/Frame/full-frame/Frame_rod_right.png",
    "publicId": "code-runner/cheatsheets/Frame/full-frame/Frame_rod_right",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Frame/full-frame/full frame.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206136/code-runner/cheatsheets/Frame/full-frame/full%20frame.png",
    "publicId": "code-runner/cheatsheets/Frame/full-frame/full frame",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Frame/full-frame/top frame.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206137/code-runner/cheatsheets/Frame/full-frame/top%20frame.png",
    "publicId": "code-runner/cheatsheets/Frame/full-frame/top frame",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Frame/small-frame/Number Label.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206138/code-runner/cheatsheets/Frame/small-frame/Number%20Label.png",
    "publicId": "code-runner/cheatsheets/Frame/small-frame/Number Label",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Astra/top-frame.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206139/code-runner/cheatsheets/Assets_Astra/top-frame.png",
    "publicId": "code-runner/cheatsheets/Assets_Astra/top-frame",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Astra/bottom frame.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206140/code-runner/cheatsheets/Assets_Astra/bottom%20frame.png",
    "publicId": "code-runner/cheatsheets/Assets_Astra/bottom frame",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Astra/frame_rod.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206141/code-runner/cheatsheets/Assets_Astra/frame_rod.png",
    "publicId": "code-runner/cheatsheets/Assets_Astra/frame_rod",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Astra/full_frame.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206142/code-runner/cheatsheets/Assets_Astra/full_frame.png",
    "publicId": "code-runner/cheatsheets/Assets_Astra/full_frame",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Astra/Number-Label.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206143/code-runner/cheatsheets/Assets_Astra/Number-Label.png",
    "publicId": "code-runner/cheatsheets/Assets_Astra/Number-Label",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Kenji/top-frame.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206144/code-runner/cheatsheets/Assets_Kenji/top-frame.png",
    "publicId": "code-runner/cheatsheets/Assets_Kenji/top-frame",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Kenji/bottom frame.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206145/code-runner/cheatsheets/Assets_Kenji/bottom%20frame.png",
    "publicId": "code-runner/cheatsheets/Assets_Kenji/bottom frame",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Kenji/frame_rod.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206146/code-runner/cheatsheets/Assets_Kenji/frame_rod.png",
    "publicId": "code-runner/cheatsheets/Assets_Kenji/frame_rod",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Kenji/full_frame.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206148/code-runner/cheatsheets/Assets_Kenji/full_frame.png",
    "publicId": "code-runner/cheatsheets/Assets_Kenji/full_frame",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Kenji/Number-Label.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206149/code-runner/cheatsheets/Assets_Kenji/Number-Label.png",
    "publicId": "code-runner/cheatsheets/Assets_Kenji/Number-Label",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Leo/top-frame.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206150/code-runner/cheatsheets/Assets_Leo/top-frame.png",
    "publicId": "code-runner/cheatsheets/Assets_Leo/top-frame",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Leo/bottom frame.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206151/code-runner/cheatsheets/Assets_Leo/bottom%20frame.png",
    "publicId": "code-runner/cheatsheets/Assets_Leo/bottom frame",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Leo/frame_rod.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206152/code-runner/cheatsheets/Assets_Leo/frame_rod.png",
    "publicId": "code-runner/cheatsheets/Assets_Leo/frame_rod",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Leo/full_frame.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206153/code-runner/cheatsheets/Assets_Leo/full_frame.png",
    "publicId": "code-runner/cheatsheets/Assets_Leo/full_frame",
    "resourceType": "image"
  },
  "/assets/cheatsheets/Assets_Leo/Number-Label.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206154/code-runner/cheatsheets/Assets_Leo/Number-Label.png",
    "publicId": "code-runner/cheatsheets/Assets_Leo/Number-Label",
    "resourceType": "image"
  },
  "/assets/cheatsheets/artboard-1.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206155/code-runner/cheatsheets/artboard-1.png",
    "publicId": "code-runner/cheatsheets/artboard-1",
    "resourceType": "image"
  },
  "/assets/cheatsheets/galaxy-bg.jpg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206156/code-runner/cheatsheets/galaxy-bg.jpg",
    "publicId": "code-runner/cheatsheets/galaxy-bg",
    "resourceType": "image"
  },
  "/assets/cheatsheets/hint.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206157/code-runner/cheatsheets/hint.png",
    "publicId": "code-runner/cheatsheets/hint",
    "resourceType": "image"
  },
  "/assets/flowcharts/11-14/level-1/sessions/session-1/flow 1.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206163/code-runner/flowcharts/11-14/level-1/sessions/session-1/flow%201.png",
    "publicId": "code-runner/flowcharts/11-14/level-1/sessions/session-1/flow 1",
    "resourceType": "image"
  },
  "/images/comparison operator.jpg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206164/code-runner/images/comparison%20operator.jpg",
    "publicId": "code-runner/images/comparison operator",
    "resourceType": "image"
  },
  "/images/elif.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206166/code-runner/images/elif.png",
    "publicId": "code-runner/images/elif",
    "resourceType": "image"
  },
  "/images/if statement.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206167/code-runner/images/if%20statement.png",
    "publicId": "code-runner/images/if statement",
    "resourceType": "image"
  },
  "/images/if-else statement.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206167/code-runner/images/if-else%20statement.png",
    "publicId": "code-runner/images/if-else statement",
    "resourceType": "image"
  },
  "/images/nested elif.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206168/code-runner/images/nested%20elif.png",
    "publicId": "code-runner/images/nested elif",
    "resourceType": "image"
  },
  "/images/11-14/level-1/sessions/session-1/cheat-sheet/cheet sheet 3.png": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/image/upload/v1770206169/code-runner/images/11-14/level-1/sessions/session-1/cheat-sheet/cheet%20sheet%203.png",
    "publicId": "code-runner/images/11-14/level-1/sessions/session-1/cheat-sheet/cheet sheet 3",
    "resourceType": "image"
  },
  "/audio/music-highq.ogg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206171/code-runner/audio/music-highq.ogg",
    "publicId": "code-runner/audio/music-highq",
    "resourceType": "video"
  },
  "/audio/scott-buckley-passage-of-time.mp3": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206172/code-runner/audio/scott-buckley-passage-of-time.mp3",
    "publicId": "code-runner/audio/scott-buckley-passage-of-time",
    "resourceType": "video"
  },
  "/audio/lesion-x-a-journey-through-the-universe-1.mp3": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206173/code-runner/audio/lesion-x-a-journey-through-the-universe-1.mp3",
    "publicId": "code-runner/audio/lesion-x-a-journey-through-the-universe-1",
    "resourceType": "video"
  },
  "/audio/Deploy_Click.ogg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206175/code-runner/audio/Deploy_Click.ogg",
    "publicId": "code-runner/audio/Deploy_Click",
    "resourceType": "video"
  },
  "/audio/card_sound.ogg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206176/code-runner/audio/card_sound.ogg",
    "publicId": "code-runner/audio/card_sound",
    "resourceType": "video"
  },
  "/audio/beeps.ogg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206177/code-runner/audio/beeps.ogg",
    "publicId": "code-runner/audio/beeps",
    "resourceType": "video"
  },
  "/audio/beeps2.ogg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206178/code-runner/audio/beeps2.ogg",
    "publicId": "code-runner/audio/beeps2",
    "resourceType": "video"
  },
  "/audio/beeps3.ogg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206179/code-runner/audio/beeps3.ogg",
    "publicId": "code-runner/audio/beeps3",
    "resourceType": "video"
  },
  "/audio/project-text.ogg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206180/code-runner/audio/project-text.ogg",
    "publicId": "code-runner/audio/project-text",
    "resourceType": "video"
  },
  "/audio/enter-project.ogg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206181/code-runner/audio/enter-project.ogg",
    "publicId": "code-runner/audio/enter-project",
    "resourceType": "video"
  },
  "/audio/leave-project.ogg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206182/code-runner/audio/leave-project.ogg",
    "publicId": "code-runner/audio/leave-project",
    "resourceType": "video"
  },
  "/audio/ui-short.ogg": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206183/code-runner/audio/ui-short.ogg",
    "publicId": "code-runner/audio/ui-short",
    "resourceType": "video"
  },
  "/audio/stdout.wav": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206184/code-runner/audio/stdout.wav",
    "publicId": "code-runner/audio/stdout",
    "resourceType": "video"
  },
  "/audio/granted.wav": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206185/code-runner/audio/granted.wav",
    "publicId": "code-runner/audio/granted",
    "resourceType": "video"
  },
  "/audio/theme.wav": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206186/code-runner/audio/theme.wav",
    "publicId": "code-runner/audio/theme",
    "resourceType": "video"
  },
  "/audio/storyline-video.mp3": {
    "url": "https://res.cloudinary.com/dwqzqxeuk/video/upload/v1770206187/code-runner/audio/storyline-video.mp3",
    "publicId": "code-runner/audio/storyline-video",
    "resourceType": "video"
  }
};

// ---------------------------------------------------------------------------
// Flowchart helpers
// ---------------------------------------------------------------------------

/**
 * Builds the Cloudinary URL for a session flowchart image.
 *
 * Path pattern: code-runner/flowcharts/{ageGroup}/level-{L}/session-{sessionNumber}/flow-{F}
 * where sessionNumber is the position within the level (1-10), NOT the database session_id.
 *
 * Example: code-runner/flowcharts/11-14/level-1/session-1/flow-1.png
 */
export function getFlowchartUrl(
  ageGroup: string,
  levelNumber: number,
  sessionNumber: number,
  flowIndex: number = 1
): string {
  return `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/flowcharts/${ageGroup}/level-${levelNumber}/session-${sessionNumber}/flow-${flowIndex}`;
}

export interface FlowConfig {
  /** Short title for this specific flowchart */
  title: string;
  /** Plain-language explanation shown to the student */
  explanation: string;
  /** Optional quick tip shown at the bottom of the card */
  tip?: string;
}

export interface FlowchartSessionConfig {
  /** Number of flowchart images for this session (flow-1, flow-2 …) */
  count: number;
  /** Learning objectives shown in the left panel */
  objectives: string[];
  /** Per-flow title and explanation — one entry per flowchart */
  flows: FlowConfig[];
}

/**
 * Flowchart config keyed by [levelNumber][sessionNumber].
 * sessionNumber is 1-10 within each level (matches the Cloudinary folder naming).
 * All sessions have 5 flowcharts uploaded.
 */
export const SESSION_FLOWCHART_CONFIG: Record<number, Record<number, FlowchartSessionConfig>> = {
  // ── Level 1 (11-14) — sessions 1-10 ──────────────────────────────────────
  1: {
    1: {
      count: 5,
      objectives: [
        'Understand the print() function',
        'Learn how code produces visible output',
        'Practice writing your first Python program',
      ],
      flows: [
        {
          title: 'Simple Output Message',
          explanation: 'The print() function sends text to the screen. Whatever you put inside the brackets — in quotes — appears as output when the program runs.',
          tip: 'Try it: print("Hello, World!") is always the first step!',
        },
        {
          title: 'Combining Text and Numbers',
          explanation: 'You can mix text and numbers in one print statement. Use a comma between them and Python automatically adds a space, or join them into one string using +.',
          tip: 'print("Speed:", 400) will output: Speed: 400',
        },
        {
          title: 'Printing Calculations',
          explanation: 'Python can do math directly inside print(). Instead of storing the result first, just put the expression in the brackets and Python will calculate and display the answer.',
          tip: 'print(8 + 4) outputs 12 — no variable needed!',
        },
        {
          title: 'Using Variables in Output',
          explanation: 'Store a value in a variable, then print the variable name. Python swaps the name for its stored value automatically. This works for numbers, text, and decimals.',
          tip: 'You can print any type: int, float, or string — all with the same print().',
        },
        {
          title: 'F-Strings for Smart Output',
          explanation: 'An f-string starts with f before the opening quote. Inside curly braces {}, you write variable names and Python fills them in when the line runs — great for building neat sentences.',
          tip: 'f"{name} has {count} moons." — the f prefix unlocks the magic!',
        },
      ],
    },
    2: {
      count: 5,
      objectives: [
        'Declare variables and assign values',
        'Understand string, integer, float, and boolean types',
        'Know when to use each data type',
      ],
      flows: [
        {
          title: 'Creating and Assigning Variables',
          explanation: 'A variable is a named box that holds a value. Write the name, then =, then the value. Python creates the box and stores your value inside, ready to use later.',
          tip: 'Choose clear names: "score" is better than "s".',
        },
        {
          title: 'The Four Basic Data Types',
          explanation: 'Python has four main types: int (whole numbers like 7), float (decimals like 3.14), str (text like "Hello"), and bool (True or False). Each type is used for different kinds of information.',
          tip: 'Quotes make it a string — without quotes, Python treats it as a number or name.',
        },
        {
          title: 'Checking a Variable\'s Type',
          explanation: 'The type() function tells you what kind of data is stored in a variable. Wrap it in print() to see the result. This is very useful when debugging your programs.',
          tip: 'type(42) → <class \'int\'> and type("Hi") → <class \'str\'>',
        },
        {
          title: 'Changing Variable Values',
          explanation: 'A variable can be updated at any time — just assign a new value to the same name. The old value is gone and the new one takes its place immediately.',
          tip: 'You can even change types: a = 42 then a = "Hello" is allowed!',
        },
        {
          title: 'Getting Input from the User',
          explanation: 'The input() function pauses the program and waits for the user to type something. The text they enter is stored as a string in your variable, ready to use.',
          tip: 'input() always returns a string — use int() to convert it to a number.',
        },
      ],
    },
    3: {
      count: 5,
      objectives: [
        'Use the input() function to receive user data',
        'Convert between int(), float(), and str()',
        'Build programs that react to user input',
      ],
      flows: [
        {
          title: 'Getting Simple Input',
          explanation: 'input() pauses your program and shows a prompt to the user. Whatever they type gets saved as a string in your variable. You decide what message to show as the prompt.',
          tip: 'The prompt is optional — input() without a message still works.',
        },
        {
          title: 'Converting Input to an Integer',
          explanation: 'input() always gives you a string, even when the user types a number. Wrap it with int() to convert it so you can do maths with it. Without conversion, "8" + 1 would cause an error.',
          tip: 'int("8") → 8. Then 8 + 1 = 9. Always convert before calculating!',
        },
        {
          title: 'Using Multiple Inputs',
          explanation: 'Call input() several times to collect different pieces of information. Each call waits for the user to type and press Enter before the program moves to the next line.',
          tip: 'You can name each variable clearly: name = input("Name: "), age = input("Age: ")',
        },
        {
          title: 'Adding Two User Inputs Together',
          explanation: 'Collect two number inputs as strings, then convert both with int() before adding. Without converting, Python would join the strings instead of doing the maths.',
          tip: 'int("8") + int("12") = 20. But "8" + "12" = "812" — very different!',
        },
        {
          title: 'Calculations with Multiple Inputs',
          explanation: 'Collect several inputs, convert them to numbers, and use them in a formula. Python calculates the result and you can display a personalised message using the user\'s own data.',
          tip: 'Combine int() and float() conversion when mixing whole numbers and decimals.',
        },
      ],
    },
    4: {
      count: 5,
      objectives: [
        'Use arithmetic operators (+, -, *, /)',
        'Understand comparison and logical operators',
        'Apply update operators like -= and +=',
      ],
      flows: [
        {
          title: 'Performing Calculations',
          explanation: 'Python uses +, -, *, and / for basic arithmetic. Place numbers or variables on either side of an operator. Python evaluates the expression and gives back the result.',
          tip: 'Use // for whole-number (integer) division and % for the remainder.',
        },
        {
          title: 'Updating Values with -=',
          explanation: 'The -= operator subtracts a value and immediately saves the result back into the same variable. It is shorthand: battery -= 15 means battery = battery - 15.',
          tip: 'Similarly, += adds, *= multiplies, and /= divides in one step.',
        },
        {
          title: 'AND and OR Logic',
          explanation: 'and requires every condition in the group to be true. or only needs one condition to be true. These let you combine multiple checks into a single if statement.',
          tip: 'Think of "and" as both gates must open, "or" as either gate can open.',
        },
        {
          title: 'Combining Operations',
          explanation: 'You can update a variable and check its value together. Python evaluates the update first, then runs the comparison, letting you track a changing value in real time.',
          tip: 'Check order matters: Python evaluates from left to right within the same priority.',
        },
        {
          title: 'Condition Operators in One Line',
          explanation: 'Checking multiple conditions at once on one line — like battery >= 50 and system_ready == True — keeps the code clean and makes the logic easy to read at a glance.',
          tip: 'True and True → True. True and False → False. True or False → True.',
        },
      ],
    },
    5: {
      count: 5,
      objectives: [
        'Write if and if-else conditions',
        'Use comparison operators in conditions',
        'Control program flow with boolean logic',
      ],
      flows: [
        {
          title: 'Simple If Statement',
          explanation: 'An if statement runs a block of code only when its condition is true. If the condition is false, Python skips the indented block and moves straight to the next line.',
          tip: 'Indentation (4 spaces) is how Python knows which lines belong inside the if.',
        },
        {
          title: 'If-Else Statement',
          explanation: 'else gives Python a second path when the if condition is false. Either the if block runs, or the else block runs — never both. One of them always executes.',
          tip: 'if speed > 60: print("Too fast!") else: print("Safe speed")',
        },
        {
          title: 'Comparing Values',
          explanation: 'Comparison operators return True or False: == checks equality, != checks inequality, < and > check size. Your if statement tests this True/False result to decide what to run.',
          tip: '= assigns a value. == compares. Don\'t mix them up!',
        },
        {
          title: 'If-Elif-Else Chain',
          explanation: 'When there are more than two options, elif lets you add extra branches. Python checks each condition from top to bottom and runs only the first one that is true. The rest are skipped.',
          tip: 'You can have as many elif branches as you need between if and else.',
        },
        {
          title: 'Decision Chain with Score',
          explanation: 'A score or value can be compared against multiple ranges using elif. Python stops at the very first matching condition, so order matters — put the strictest condition first.',
          tip: 'Put the highest range first (>= 90) so larger scores match before smaller ranges.',
        },
      ],
    },
    6: {
      count: 5,
      objectives: [
        'Nest conditions inside other conditions',
        'Trace nested if-else logic step by step',
        'Build multi-level decision checks',
      ],
      flows: [
        {
          title: 'Simple Nested If',
          explanation: 'A nested if places one condition inside another. Python checks the outer condition first. Only if it passes does Python look at the inner condition — creating a two-step gate.',
          tip: 'Both conditions must pass for the innermost code to run.',
        },
        {
          title: 'Nested If-Else',
          explanation: 'Adding else inside a nested if handles both pass and fail at the inner level. The outer check still controls entry to the whole block, and the inner check handles the detail.',
          tip: 'Draw a flowchart in your head: outer check → inner check → action.',
        },
        {
          title: 'Multiple Conditions in Inner If',
          explanation: 'The inner if can test a completely different variable from the outer one. This lets you guard two separate things — for example, checking both a name and an age independently.',
          tip: 'Each level of nesting checks something new and more specific.',
        },
        {
          title: 'Deeply Nested If-Else Chain',
          explanation: 'Three or more conditions can be stacked. Python only moves deeper if every outer check passes. It\'s like a checklist — each item must be ticked before moving to the next.',
          tip: 'Watch your indentation carefully — each level adds another 4 spaces.',
        },
        {
          title: 'All Conditions Must Pass',
          explanation: 'When every check in a chain must succeed before taking action — like a launch sequence — nested ifs create a rigorous multi-step approval process that won\'t proceed unless everything is ready.',
          tip: 'Consider and instead of nesting when all conditions are equal in importance.',
        },
      ],
    },
    7: {
      count: 5,
      objectives: [
        'Create lists and access items by index',
        'Add, remove, and count list items',
        'Sort lists and check their length',
      ],
      flows: [
        {
          title: 'Creating and Accessing a List',
          explanation: 'A list holds multiple items in order inside square brackets. Each item has an index starting at 0. Use the index in square brackets to read any item from the list.',
          tip: 'my_list[0] is the first item. my_list[-1] is the last item.',
        },
        {
          title: 'Adding Items with append()',
          explanation: 'append() adds a new item to the very end of the list. The list grows by one each time. This is the most common way to build up a list item by item.',
          tip: 'my_list.append(4) adds 4 at the end. The original items stay in place.',
        },
        {
          title: 'Removing Items from a List',
          explanation: 'remove(value) finds the first occurrence of that value and deletes it. del my_list[index] removes an item at a specific position. The list automatically closes the gap.',
          tip: 'Use remove() when you know the value, del when you know the index.',
        },
        {
          title: 'Sorting and Reversing',
          explanation: 'sort() arranges items in ascending order (smallest first for numbers, A-Z for text). reverse() flips the current order. Chain both to get descending order.',
          tip: 'sort() changes the list in place. Use sorted() if you want a new sorted copy.',
        },
        {
          title: 'Checking List Length with len()',
          explanation: 'len() counts how many items are in the list and returns the number. Use this to check if a list is empty, to loop a set number of times, or to stay within bounds.',
          tip: 'if len(my_list) == 0: — great way to check for an empty list.',
        },
      ],
    },
    8: {
      count: 5,
      objectives: [
        'Insert items at specific positions',
        'Copy lists and slice portions',
        'Use pop(), list comprehensions, and aggregates',
      ],
      flows: [
        {
          title: 'Inserting at a Specific Position',
          explanation: 'insert(index, value) adds an item at exactly the position you choose, pushing existing items to the right. Unlike append(), you control precisely where the new item lands.',
          tip: 'my_list.insert(1, "new") places "new" at index 1.',
        },
        {
          title: 'Copying a List Safely',
          explanation: 'Using .copy() creates an independent duplicate. Any changes to the copy — like adding with append() — do not affect the original list at all. They are separate objects.',
          tip: 'Avoid copy = original — that shares the same list, not a new one!',
        },
        {
          title: 'Popping Items from a List',
          explanation: 'pop() removes the last item from the list and returns it so you can use or store its value. Pass an index to pop a specific item instead of the last one.',
          tip: 'removed = my_list.pop() — the removed item is saved in "removed".',
        },
        {
          title: 'Slicing a List',
          explanation: 'Slicing with [start:stop] extracts a portion of the list as a new list, leaving the original unchanged. The start index is included, but the stop index is not.',
          tip: 'my_list[1:4] gives items at index 1, 2, and 3 — not 4.',
        },
        {
          title: 'List Comprehension and Aggregates',
          explanation: 'A list comprehension builds a new list by transforming every item in one line. After building the new list, min(), max(), and sum() let you instantly find key statistics.',
          tip: '[x * 2 for x in numbers] doubles every item in one clean line.',
        },
      ],
    },
    9: {
      count: 5,
      objectives: [
        'Use for loops to iterate over lists and tuples',
        'Combine loops with conditions',
        'Loop through strings and nested sequences',
      ],
      flows: [
        {
          title: 'Looping Through a List',
          explanation: 'A for loop visits each item in a list one at a time. The loop variable takes the value of each item in turn, and your code block runs once for every item.',
          tip: 'for planet in planets: — "planet" is a new variable created by the loop.',
        },
        {
          title: 'For Loop Over a Tuple',
          explanation: 'Tuples work the same as lists in a for loop. Python steps through each element in order and runs the loop body once per element, from first to last.',
          tip: 'for day in ("Mon", "Tue", "Wed"): works just like a list loop.',
        },
        {
          title: 'Loop with a Condition Inside',
          explanation: 'Place an if statement inside a for loop to check each item as you go. Only items that pass the condition trigger the action — the rest are quietly skipped.',
          tip: 'if planet == "Jupiter": runs only once, when the loop reaches Jupiter.',
        },
        {
          title: 'Nested For Loops',
          explanation: 'A for loop inside another for loop processes every combination of two sequences. The inner loop runs completely for each single step of the outer loop.',
          tip: 'Two loops of length 3 and 2 produce 3 × 2 = 6 total iterations.',
        },
        {
          title: 'Looping Through a String',
          explanation: 'Strings are sequences of characters. A for loop visits each character one at a time from left to right. This lets you process or check every single letter individually.',
          tip: 'for char in "MARS": will print M, then A, then R, then S.',
        },
      ],
    },
    10: {
      count: 5,
      objectives: [
        'Use range() to generate number sequences',
        'Control start, stop, and step in range()',
        'Combine range() with conditions and nested loops',
      ],
      flows: [
        {
          title: 'Range with Start and Stop',
          explanation: 'range(start, stop) generates numbers from start up to — but not including — stop. Use it in a for loop to repeat code a precise number of times with a specific beginning.',
          tip: 'range(1, 6) gives 1, 2, 3, 4, 5 — remember, stop is excluded!',
        },
        {
          title: 'Counting Down with a Step',
          explanation: 'Adding a third argument to range() sets the step size. A negative step makes Python count backwards. range(100, 60, -10) counts 100, 90, 80, 70 and then stops.',
          tip: 'The step can be any positive or negative number — not just 1 or -1.',
        },
        {
          title: 'Loop Variable with a Condition',
          explanation: 'A condition inside a range loop checks the loop variable at each step. This lets you trigger a special action only when the variable reaches a particular value.',
          tip: 'if s == 1: inside a range(2) loop runs only on the second iteration.',
        },
        {
          title: 'Basic Range Loop from Zero',
          explanation: 'range(n) starts at 0 and counts up to n-1 — giving exactly n iterations. This is the simplest form and the most commonly used pattern for repeating code a set number of times.',
          tip: 'range(3) → 0, 1, 2. Three iterations, starting from zero.',
        },
        {
          title: 'Nested Loops with Range',
          explanation: 'Two range() calls in nested loops create a grid of number combinations. Every value from the inner range pairs with every value from the outer range, producing rows and columns of output.',
          tip: 'Think of it as a multiplication table — outer × inner combinations.',
        },
      ],
    },
  },

  // ── Level 2 (11-14) — sessions 1-10 ──────────────────────────────────────
  2: {
    1: {
      count: 5,
      objectives: [
        'Use range() with start, stop, and step',
        'Write nested loops with conditional logic',
        'Trace three-level nesting patterns',
      ],
      flows: [
        {
          title: 'Reverse Range Countdown',
          explanation: 'range(start, stop, step) with a negative step counts backwards. range(3, 0, -1) gives 3, 2, 1 — it starts at 3 and stops before reaching 0, just like a rocket countdown.',
          tip: 'The step decides jump size. -1 counts by ones, -2 skips every other number.',
        },
        {
          title: 'Nested Loop with Sensor Check',
          explanation: 'An outer loop runs through orbits while an inner loop scans sensors. An if condition inside the inner loop triggers a "Match Found" message only when the sensor number equals 2.',
          tip: 'The outer loop repeats the full inner loop — every orbit scans every sensor.',
        },
        {
          title: 'Nested Loops with Variable Steps',
          explanation: 'The inner loop uses a custom negative step so it counts down in larger jumps each time the outer loop fires — like reducing engine thrust from 6 to 4 to 2 in stages.',
          tip: 'range(6, 0, -2) gives 6, 4, 2 — counting down by 2 each time.',
        },
        {
          title: 'Three Levels of Nesting',
          explanation: 'Three nested loops model a three-level hierarchy: station → module → sensor. The deepest loop completes entirely before the middle loop advances by one step.',
          tip: 'Output shows all sensors per module per station — a complete drill-down.',
        },
        {
          title: 'Nested Loop with Countdown Warning',
          explanation: 'An inner countdown loop uses a decreasing range. A condition inside triggers a warning only when the counter hits its lowest value — combining nested iteration with conditional logic.',
          tip: 'Warnings only appear at level 1 — all higher levels pass silently.',
        },
      ],
    },
    2: {
      count: 5,
      objectives: [
        'Write while loops with boolean conditions',
        'Use break and continue to control loops',
        'Combine while loops with user input',
      ],
      flows: [
        {
          title: 'Basic While Loop',
          explanation: 'A while loop keeps repeating its code block for as long as its condition is true. When the condition becomes false — here, when fuel reaches 0 — the loop stops automatically.',
          tip: 'Always make sure the loop variable changes inside the loop, or it runs forever!',
        },
        {
          title: 'While Loop with User Input',
          explanation: 'Combine while True with input() to keep asking for something until the correct answer is entered. Only a matching condition (password correct) causes the program to break out of the loop.',
          tip: 'while True creates an infinite loop on purpose — break is the planned exit.',
        },
        {
          title: 'Using Break to Exit Early',
          explanation: 'The break keyword instantly exits the loop the moment a condition is met, even if the loop condition is still true. Here, typing "Exit" shuts the system down immediately.',
          tip: 'break is like an emergency stop — use it when a normal exit is not possible.',
        },
        {
          title: 'While Loop with a Counter',
          explanation: 'A counter variable starts at a value and changes inside the loop body. The while condition checks the counter each time around — when it hits the limit, the loop ends cleanly.',
          tip: 'Increment with counter += 1 or decrement with counter -= 1 each iteration.',
        },
        {
          title: 'Using Continue to Skip Steps',
          explanation: 'The continue keyword skips the rest of the current loop iteration and jumps back to the condition check. Use it to skip over values you don\'t want to process.',
          tip: 'continue skips one step. break ends the whole loop. Know the difference!',
        },
      ],
    },
    3: {
      count: 5,
      objectives: [
        'Create dictionaries with key-value pairs',
        'Access, add, update, and remove entries',
        'Loop through dictionary keys and values',
      ],
      flows: [
        {
          title: 'Creating and Accessing a Dictionary',
          explanation: 'A dictionary stores data as key-value pairs inside curly braces. You look up a value by its key in square brackets — like using a name to find someone\'s job title.',
          tip: 'crew["Bob"] → "Pilot". The key is the lookup, the value is the result.',
        },
        {
          title: 'Adding and Updating Entries',
          explanation: 'Assign to a new key to add an entry: planet["Mars"] = "Red". Assign to an existing key to change its value. Dictionaries are mutable — their contents can change anytime.',
          tip: 'If the key exists, the value is overwritten. If not, a new entry is created.',
        },
        {
          title: 'Removing Entries',
          explanation: 'del dictionary[key] removes a key-value pair entirely. pop(key) does the same but also returns the removed value so you can use it before it\'s gone.',
          tip: 'Use pop() when you need the value one last time before deleting it.',
        },
        {
          title: 'Looping Through a Dictionary',
          explanation: 'A for loop over a dictionary iterates through its keys. Use .values() to loop over values, or .items() to get both key and value together as a pair in each iteration.',
          tip: 'for key, value in crew.items(): gives you both at once.',
        },
        {
          title: 'Checking If a Key Exists',
          explanation: 'The in keyword tests whether a key is present before you try to access it. This prevents a KeyError crash when you\'re not sure if the key has been added yet.',
          tip: 'if "Mars" in planet: — always check first when the key might be missing.',
        },
      ],
    },
    4: {
      count: 5,
      objectives: [
        'Use setdefault(), get(), and update()',
        'Merge and safely access dictionary data',
        'Build dictionaries with comprehensions',
      ],
      flows: [
        {
          title: 'Using setdefault()',
          explanation: 'setdefault(key, value) adds a key with a default value — but only if that key is not already present. If the key exists, nothing changes. It is a safe way to add without overwriting.',
          tip: 'planet.setdefault("Earth", "Blue") — Earth already exists, so nothing changes.',
        },
        {
          title: 'Merging with update()',
          explanation: 'update() copies all key-value pairs from one dictionary into another. New keys are added; existing keys are overwritten with the incoming values.',
          tip: 'base_info.update(extra_info) — extra_info entries flow into base_info.',
        },
        {
          title: 'Safe Access with get()',
          explanation: 'get(key) returns the value if the key exists, or None if it doesn\'t — no crash. Pass a second argument as a fallback: get("Mars", "Unknown") returns "Unknown" if Mars is missing.',
          tip: 'Use get() any time the key might not exist — it\'s the safe default choice.',
        },
        {
          title: 'keys(), values(), and items()',
          explanation: 'These three methods give you views into the dictionary. keys() lists all keys, values() lists all values, and items() gives both as pairs. Wrap in list() to print them.',
          tip: 'list(crew.keys()) → ["Bob", "Eve"] — a plain list of all the keys.',
        },
        {
          title: 'Dictionary Comprehension',
          explanation: 'Like a list comprehension, a dictionary comprehension builds a new dict in one line: {key_expr: value_expr for item in iterable}. Great for transforming data quickly.',
          tip: '{k: v * 2 for k, v in scores.items()} doubles every score in one line.',
        },
      ],
    },
    5: {
      count: 5,
      objectives: [
        'Create tuples and access items by index',
        'Understand immutability and unpacking',
        'Loop through tuples and use them in functions',
      ],
      flows: [
        {
          title: 'Creating and Accessing a Tuple',
          explanation: 'A tuple stores ordered items in parentheses. Access items by index just like a list. Tuples support both positive indexing (from the start) and negative indexing (from the end).',
          tip: 'days[-2] on ("Mon","Tue","Wed") → "Tue". Negative index counts from the right.',
        },
        {
          title: 'Tuples Are Immutable',
          explanation: 'Unlike lists, a tuple\'s contents cannot be changed after creation. Trying to assign a new value to an index raises a TypeError. Use a tuple when the data must stay fixed.',
          tip: 'Immutability makes tuples safer for data that should never change.',
        },
        {
          title: 'Tuple Unpacking',
          explanation: 'Assign each item in a tuple to its own variable in a single line. Python matches items left-to-right automatically. This is called unpacking and keeps your code clean and readable.',
          tip: 'x, y, z = (10, 20, 30) — x gets 10, y gets 20, z gets 30.',
        },
        {
          title: 'Looping Through a Tuple',
          explanation: 'A for loop iterates over a tuple exactly like a list. Each element is visited in order. Add enumerate() if you also need the index number alongside each value.',
          tip: 'for i, day in enumerate(days): gives both the index i and the day name.',
        },
        {
          title: 'Tuples Returned from Functions',
          explanation: 'A function can return multiple values by packaging them as a tuple. The caller can unpack the result into separate variables in one clean assignment line.',
          tip: 'def get_pos(): return (x, y) — then x, y = get_pos() unpacks it instantly.',
        },
      ],
    },
    6: {
      count: 5,
      objectives: [
        'Create sets and manage unique items',
        'Use set operations: union, intersection, difference',
        'Check membership with the in keyword',
      ],
      flows: [
        {
          title: 'Creating Sets and Adding Items',
          explanation: 'A set stores unique items with no duplicates, inside curly braces. add() inserts a new item. If that item already exists in the set, nothing changes — duplicates are silently ignored.',
          tip: 'animals = {"Lion", "Tiger"} then animals.add("Elephant") → three items.',
        },
        {
          title: 'Removing Items from a Set',
          explanation: 'remove(value) deletes an item and raises a KeyError if it\'s missing. discard(value) does the same but silently does nothing when the item isn\'t found — much safer.',
          tip: 'Use discard() when you\'re not sure if the item exists.',
        },
        {
          title: 'Union and Intersection',
          explanation: 'union() combines two sets, keeping all unique items from both. intersection() returns only items that appear in both sets. Neither operation changes the original sets.',
          tip: '{1,2,3}.union({3,4,5}) → {1,2,3,4,5}. {1,2,3}.intersection({2,3,4}) → {2,3}',
        },
        {
          title: 'Checking Membership',
          explanation: 'The in keyword tests whether a value exists in the set. Set membership checks are extremely fast because sets use hashing — much faster than scanning through a list.',
          tip: '"Elephant" in animals → True or False, checked in an instant.',
        },
        {
          title: 'Set Difference',
          explanation: 'difference() returns items that are in the first set but not in the second. It\'s useful for finding what one group has that another doesn\'t — like items that haven\'t been processed yet.',
          tip: '{1,2,3}.difference({2,3}) → {1}. Only what\'s unique to the first set.',
        },
      ],
    },
    7: {
      count: 5,
      objectives: [
        'Define and call functions with def',
        'Use parameters, return values, and defaults',
        'Reuse functions with different inputs',
      ],
      flows: [
        {
          title: 'Defining and Calling a Function',
          explanation: 'A function is defined with def followed by a name and parentheses. The code inside only runs when you call the function by name. Define once, call as many times as you need.',
          tip: 'def open_door(): ... then open_door() to run it. The parentheses are required.',
        },
        {
          title: 'Functions with Parameters',
          explanation: 'Parameters are variables listed inside the function\'s parentheses. When you call the function, you pass values called arguments that fill those parameters for that run.',
          tip: 'def greet(name): — name gets its value each time you call greet().',
        },
        {
          title: 'Returning a Value',
          explanation: 'The return keyword sends a result back to wherever the function was called. The function stops at return. You can store the result in a variable to use it later.',
          tip: 'result = add(3, 4) — result stores 7 after the function returns.',
        },
        {
          title: 'Default Parameter Values',
          explanation: 'A parameter can have a default value used when the caller doesn\'t provide one. This makes the argument optional. If the caller does provide it, the default is ignored.',
          tip: 'def launch(count=3): — calling launch() uses 3, calling launch(5) uses 5.',
        },
        {
          title: 'Reusing a Function',
          explanation: 'Call the same function multiple times with different inputs to get different results. This is the core benefit of functions — write the logic once and reuse it wherever needed.',
          tip: 'greet("Ava"), greet("Leo") — same function, different names, different output.',
        },
      ],
    },
    8: {
      count: 5,
      objectives: [
        'Pass required and keyword arguments',
        'Use *args and **kwargs for flexible functions',
        'Mix positional and keyword arguments',
      ],
      flows: [
        {
          title: 'Required Arguments',
          explanation: 'When a function defines parameters without defaults, every argument must be provided at call time. Forgetting an argument or passing the wrong number causes a TypeError.',
          tip: 'suit_check("Ava", 95) — both name and oxygen must be given, no exceptions.',
        },
        {
          title: 'Keyword Arguments',
          explanation: 'Pass arguments by name instead of position: suit_check(oxygen=95, name="Ava"). The order no longer matters and the call is easier to read when there are many parameters.',
          tip: 'Keyword arguments make function calls self-documenting.',
        },
        {
          title: 'Mixing Positional and Keyword',
          explanation: 'You can mix positional (by order) and keyword (by name) arguments in one call. Positional arguments must always come first — putting keyword arguments before positional ones is an error.',
          tip: 'func(10, b=20) — 10 is positional, b=20 is keyword. This order is required.',
        },
        {
          title: 'Variable Arguments with *args',
          explanation: 'A parameter prefixed with * collects any number of positional arguments into a tuple. The function can then loop through them, handle one, two, or twenty inputs with the same definition.',
          tip: 'def total(*nums): return sum(nums) — works for any amount of numbers.',
        },
        {
          title: 'Keyword Variable Arguments with **kwargs',
          explanation: 'A parameter prefixed with ** collects any number of keyword arguments into a dictionary. This gives your function maximum flexibility to accept named settings it didn\'t predict.',
          tip: 'def config(**settings): — call with config(speed=10, fuel=50) and more.',
        },
      ],
    },
    9: {
      count: 5,
      objectives: [
        'Define functions inside other functions',
        'Understand closures and scope',
        'Return inner functions as values',
      ],
      flows: [
        {
          title: 'Defining a Function Inside Another',
          explanation: 'An inner function lives inside the outer function and is only accessible from there. The outer function must be called first; only then can the inner function run.',
          tip: 'def mission(): def launch(): ... — launch() only exists while mission() runs.',
        },
        {
          title: 'Inner Function Uses Outer Variables',
          explanation: 'An inner function can read variables from the outer function\'s scope — this is called a closure. The inner function "remembers" those variables even after the outer function finishes.',
          tip: 'This is how Python creates functions that carry their own private data.',
        },
        {
          title: 'Returning an Inner Function',
          explanation: 'An outer function can return the inner function itself (without calling it). The returned function still remembers the outer variables — the closure stays alive.',
          tip: 'action = get_greeter("Ava") then action() uses "Ava" from the closure.',
        },
        {
          title: 'Closures as Counters',
          explanation: 'A closure that keeps a counter variable in its enclosing scope lets you create independent counters. Each closure has its own copy of the count variable.',
          tip: 'counter_a and counter_b can tick independently — they don\'t share state.',
        },
        {
          title: 'Nested Functions for Organisation',
          explanation: 'Breaking a complex function into smaller inner helpers keeps each part focused on one task. The helpers stay private, preventing accidental use from outside the outer function.',
          tip: 'Inner helpers are a clean way to break up logic without polluting global scope.',
        },
      ],
    },
    10: {
      count: 5,
      objectives: [
        'Use len(), type(), min(), max(), and sum()',
        'Apply sorted(), zip(), and enumerate()',
        'Convert values with int(), abs(), and round()',
      ],
      flows: [
        {
          title: 'len() and type()',
          explanation: 'len() counts items in any sequence — list, string, tuple, or dictionary. type() reveals what kind of object a variable holds. Both are available without importing anything.',
          tip: 'len([1,2,3]) → 3. type([1,2,3]) → <class \'list\'>.',
        },
        {
          title: 'min(), max(), and sum()',
          explanation: 'These three functions work on any iterable of numbers. min() finds the smallest value, max() finds the largest, and sum() adds everything together in one step.',
          tip: 'min([3,1,4]) → 1. max([3,1,4]) → 4. sum([3,1,4]) → 8.',
        },
        {
          title: 'sorted() and reversed()',
          explanation: 'sorted() returns a brand new sorted list without changing the original. reversed() returns an iterator that goes through items in reverse order — wrap in list() to print it.',
          tip: 'sorted(my_list) is safe. my_list.sort() changes the original. Know the difference!',
        },
        {
          title: 'zip() and enumerate()',
          explanation: 'zip() pairs items from two sequences together, like zipping up a jacket. enumerate() adds an automatic counter to any iterable, giving you the index and value together.',
          tip: 'for i, name in enumerate(crew): gives i=0,"Ava", i=1,"Leo", etc.',
        },
        {
          title: 'abs(), round(), and int()',
          explanation: 'abs() returns the absolute (always positive) value of a number. round(x, n) rounds to n decimal places. int() converts a float or string to a whole number by truncating decimals.',
          tip: 'abs(-7) → 7. round(3.14159, 2) → 3.14. int(9.9) → 9 (not 10!).',
        },
      ],
    },
  },
};
