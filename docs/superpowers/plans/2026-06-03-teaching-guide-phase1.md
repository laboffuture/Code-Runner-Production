# Teaching Guide — Phase 1 (System + L1 Session 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline, panel-gated).
> Steps use checkbox (`- [ ]`) syntax.

**Goal:** Stand up the teacher "Answer Guide" end-to-end — a role-gated `solutions` collection, a
`/curriculum` API, a `/teacher/curriculum` browser (Level → Session → Case → 5-part guide), a
seeder, and a verifier — proven with 5 real, verified Level-1 Session-1 guides.

**Architecture:** Answer keys live in a NEW `solutions` collection (separate from `problems`/
`test_cases`, so a student query can never include them), behind a `staff` gate (teacher OR
developer). Guides are authored in a version-controlled seed file (source of truth) that also
drives a verifier (each `solution_code` must pass that problem's test cases). The teacher browses
by session → case and reads question + answer + logic breakdown + simple explanation + example.

**Tech Stack:** Mongoose (shared→dist), Express (api), Next.js 14 / React (web), Python 3.12 (verifier).

**Spec:** `docs/superpowers/specs/2026-06-03-teaching-guide-design.md`

---

## File Structure
- Create `packages/shared/src/database/models/Solution.model.ts` — the Solution model.
- Modify `packages/shared/src/database/models/index.ts` — export Solution.
- Modify `apps/api/src/middleware/auth.middleware.ts` — add `staffMiddleware`.
- Create `apps/api/src/routes/curriculum.routes.ts` — `/curriculum/tree` + `/curriculum/problems/:id/guide`.
- Modify `apps/api/src/index.ts` — import + mount `app.use('/curriculum', curriculumRoutes)`.
- Create `apps/api/scripts/seed-solutions.ts` — author + seed the L1-S1 guides (source of truth).
- Create `apps/api/scripts/verify-solutions.ts` — run each solution vs its test cases, set `verified`.
- Modify `Coderunner-Frontend/web/src/lib/api-client.ts` — add `api.curriculum` group.
- Create `Coderunner-Frontend/web/src/app/teacher/curriculum/page.tsx` — the browser + guide panel.
- Modify `Coderunner-Frontend/web/src/components/teacher/TeacherShell.tsx` — "Answer Guide" nav link.

---

## Task 1: Solution model

**Files:** Create `Coderunner-Backend/packages/shared/src/database/models/Solution.model.ts`

- [ ] **Step 1: Create the model**

```ts
import mongoose, { Schema, Document } from 'mongoose';

/**
 * Teacher-facing "Teaching Guide" (explained answer key) for ONE problem (= one case).
 * Lives in its OWN collection, served only behind the staff gate — NEVER included in any
 * student-facing query. The `question` is NOT stored here; it is joined from the Problem
 * doc at read time (single source of truth).
 */
export interface IWalkStep {
  label: string;        // "Read the input"
  code_snippet: string; // "n = int(input())"
  explanation: string;  // "We read the first line and turn it into a number with int()."
}

export interface ISolution extends Document {
  problem_id: number;
  level_number: number;
  session_id: number;
  case_number: number;
  solution_code: string;          // the answer
  walkthrough: IWalkStep[];       // logic breakdown
  student_explanation: string;    // easy, kid-friendly words to relay
  worked_example: string;         // a concrete example to show
  key_concepts: string[];
  common_mistakes: string[];
  verified: boolean;              // set by the verifier when solution_code passes its test cases
  created_at: Date;
  updated_at: Date;
}

const WalkStepSchema = new Schema<IWalkStep>(
  {
    label: { type: String, required: true },
    code_snippet: { type: String, default: '' },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const SolutionSchema = new Schema<ISolution>(
  {
    problem_id: { type: Number, required: true, unique: true, index: true },
    level_number: { type: Number, required: true },
    session_id: { type: Number, required: true },
    case_number: { type: Number, required: true },
    solution_code: { type: String, required: true },
    walkthrough: { type: [WalkStepSchema], default: [] },
    student_explanation: { type: String, default: '' },
    worked_example: { type: String, default: '' },
    key_concepts: { type: [String], default: [] },
    common_mistakes: { type: [String], default: [] },
    verified: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'solutions' }
);

SolutionSchema.index({ level_number: 1, session_id: 1, case_number: 1 });

export const Solution =
  mongoose.models.Solution || mongoose.model<ISolution>('Solution', SolutionSchema);
```

- [ ] **Step 2: Export from the barrel** — append to
`Coderunner-Backend/packages/shared/src/database/models/index.ts`:

```ts
export { Solution } from './Solution.model';
```

- [ ] **Step 3: Rebuild shared dist (DO_NOT_DISTURB #5)**

Run: `cd Coderunner-Backend/packages/shared && npm run build`
Expected: exit 0. Confirm: `ls dist/database/models/Solution.model.js` exists.

- [ ] **Step 4: Commit**

```bash
git add Coderunner-Backend/packages/shared/src/database/models
git commit -m "feat(teaching-guide): Solution model (separate solutions collection)"
```

## Task 2: staffMiddleware (teacher OR developer)

**Files:** Modify `Coderunner-Backend/apps/api/src/middleware/auth.middleware.ts`

- [ ] **Step 1: Add the middleware** after `teacherMiddleware`:

```ts
// Staff-only middleware (must be used after authMiddleware).
// Gates curriculum/answer-key endpoints to teacher OR developer — never students.
export function staffMiddleware(req: Request, res: Response, next: NextFunction) {
  const role = req.user?.role;
  if (role !== 'teacher' && role !== 'developer') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Staff access required',
    });
  }
  next();
}
```

- [ ] **Step 2: Verify** — `cd Coderunner-Backend/apps/api && npm run typecheck` → exit 0.

## Task 3: curriculum routes (tree + guide)

**Files:**
- Create `Coderunner-Backend/apps/api/src/routes/curriculum.routes.ts`
- Modify `Coderunner-Backend/apps/api/src/index.ts`

- [ ] **Step 1: Create the route file**

```ts
import { Router, Request, Response } from 'express';
import { Models, getLogger } from '@code-runner/shared';
import { authMiddleware, staffMiddleware } from '../middleware/auth.middleware';

const router = Router();
const logger = getLogger('curriculum-routes');

// Staff only (teacher or developer) — answer keys must never reach a student.
router.use(authMiddleware);
router.use(staffMiddleware);

// GET /curriculum/tree?ageGroup=11-14 — levels -> sessions -> cases (NO solution content).
// hasGuide = a solutions doc exists for that problem.
router.get('/tree', async (req: Request, res: Response) => {
  try {
    const ageGroup = String(req.query?.ageGroup || '11-14');
    const problems = await Models.Problem
      .find({ age_group: ageGroup })
      .select('problem_id title difficulty level_number session_id case_number')
      .sort({ level_number: 1, session_id: 1, case_number: 1 })
      .lean<Array<{ problem_id: number; title: string; difficulty: string; level_number: number; session_id: number; case_number: number }>>();

    const withGuide = new Set(
      (await Models.Solution.find({}).select('problem_id').lean<Array<{ problem_id: number }>>())
        .map((s) => s.problem_id)
    );

    // Group: level -> session -> cases[]
    const levels: Record<number, Record<number, any[]>> = {};
    for (const p of problems) {
      (levels[p.level_number] ??= {});
      (levels[p.level_number][p.session_id] ??= []);
      levels[p.level_number][p.session_id].push({
        problem_id: p.problem_id,
        title: p.title,
        difficulty: p.difficulty,
        case_number: p.case_number,
        hasGuide: withGuide.has(p.problem_id),
      });
    }
    const tree = Object.keys(levels).map((lvl) => ({
      level_number: Number(lvl),
      sessions: Object.keys(levels[Number(lvl)]).map((sid) => ({
        session_id: Number(sid),
        cases: levels[Number(lvl)][Number(sid)],
      })),
    }));
    res.json({ ageGroup, tree });
  } catch (error) {
    logger.error('Failed to build curriculum tree', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to load curriculum' });
  }
});

// GET /curriculum/problems/:problemId/guide — the full guide for one case: the Solution PLUS
// the question joined from the Problem. { available: false } when no guide exists yet.
router.get('/problems/:problemId/guide', async (req: Request, res: Response) => {
  try {
    const problemId = parseInt(req.params.problemId, 10);
    if (Number.isNaN(problemId)) return res.status(400).json({ error: 'Invalid problem id' });

    const [problem, solution] = await Promise.all([
      Models.Problem.findOne({ problem_id: problemId })
        .select('problem_id title question difficulty level_number session_id case_number')
        .lean<any>(),
      Models.Solution.findOne({ problem_id: problemId }).lean<any>(),
    ]);
    if (!problem) return res.status(404).json({ error: 'Not Found', message: 'Problem not found' });
    if (!solution) {
      return res.json({ available: false, problem_id: problemId, title: problem.title, question: problem.question });
    }
    res.json({
      available: true,
      problem_id: problemId,
      title: problem.title,
      difficulty: problem.difficulty,
      question: problem.question,
      solution_code: solution.solution_code,
      walkthrough: solution.walkthrough,
      student_explanation: solution.student_explanation,
      worked_example: solution.worked_example,
      key_concepts: solution.key_concepts,
      common_mistakes: solution.common_mistakes,
      verified: solution.verified,
    });
  } catch (error) {
    logger.error('Failed to load guide', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to load guide' });
  }
});

export default router;
```

- [ ] **Step 2: Mount it** — in `apps/api/src/index.ts`, add the import beside the other route imports:

```ts
import curriculumRoutes from './routes/curriculum.routes';
```

and mount it near `app.use('/teacher', teacherRoutes);`:

```ts
app.use('/curriculum', curriculumRoutes);
```

- [ ] **Step 3: Verify** — `cd Coderunner-Backend/apps/api && npm run typecheck` → exit 0.

- [ ] **Step 4: Commit**

```bash
git add Coderunner-Backend/apps/api/src/middleware/auth.middleware.ts Coderunner-Backend/apps/api/src/routes/curriculum.routes.ts Coderunner-Backend/apps/api/src/index.ts
git commit -m "feat(teaching-guide): staff-gated /curriculum tree + guide endpoints"
```

## Task 4: seed the L1 Session-1 guides (source of truth)

**Files:** Create `Coderunner-Backend/apps/api/scripts/seed-solutions.ts`

These 5 guides cover Level 1, Session 1 (problems 1–5), whose solutions were verified during the
content audit. This file is the version-controlled source of truth; running it upserts into the
`solutions` collection.

- [ ] **Step 1: Create the seeder**

```ts
/**
 * Source-of-truth Teaching Guides (answer keys), seeded into the `solutions` collection.
 * Idempotent upsert by problem_id. Run: npx tsx apps/api/scripts/seed-solutions.ts
 * (from Coderunner-Backend, with .env.local present).
 */
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
    await Models.Solution.updateOne({ problem_id: g.problem_id }, { $set: g }, { upsert: true });
    console.log('  - guide for problem', g.problem_id, '(L' + g.level_number + ' S' + g.session_id + ' case' + g.case_number + ')');
  }
  const count = await Models.Solution.countDocuments({});
  console.log('Done.', count, 'solution(s) in the collection.');
  process.exit(0);
}

seed().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
```

- [ ] **Step 2: Run it** (writes to the live DB — user-run, with .env.local)

Run: `cd Coderunner-Backend && npx tsx apps/api/scripts/seed-solutions.ts`
Expected: prints 5 guides seeded, "5 solution(s) in the collection."

- [ ] **Step 3: Commit**

```bash
git add Coderunner-Backend/apps/api/scripts/seed-solutions.ts
git commit -m "feat(teaching-guide): L1 Session-1 teaching guides (source of truth)"
```

## Task 5: the verifier (auto-checks every solution_code)

**Files:** Create `Coderunner-Backend/apps/api/scripts/verify-solutions.ts`

- [ ] **Step 1: Create the verifier**

```ts
/**
 * Curriculum auto-verifier: for each seeded Solution, run its solution_code against that
 * problem's test_cases (newline-normalised, Linux-runner parity) and set `verified`.
 * Run: npx tsx apps/api/scripts/verify-solutions.ts  (from Coderunner-Backend).
 */
import { connectToDatabase, Models } from '@code-runner/shared';
import { execFileSync } from 'child_process';

const PY = process.platform === 'win32' ? 'python' : 'python3';
const norm = (s: string) => String(s).replace(/\r\n/g, '\n').replace(/\s+$/, '');

async function main() {
  await connectToDatabase();
  const solutions = await Models.Solution.find({}).lean<any[]>();
  let okAll = true;
  for (const sol of solutions) {
    const tcs = await Models.TestCase.find({ problem_id: sol.problem_id }).sort({ test_case_id: 1 }).lean<any[]>();
    let pass = 0;
    let firstFail: any = null;
    for (const tc of tcs) {
      let got = '';
      try {
        got = execFileSync(PY, ['-c', sol.solution_code], {
          input: String(tc.input ?? ''), encoding: 'utf8', timeout: 10000,
          env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        });
      } catch (e: any) {
        firstFail = { input: tc.input, err: (e.stderr || e.message || '').toString().trim().split('\n').pop() };
        break;
      }
      if (norm(got) === norm(tc.expected_output)) pass++;
      else if (!firstFail) firstFail = { input: tc.input, exp: norm(tc.expected_output), got: norm(got) };
    }
    const verified = !firstFail && tcs.length > 0 && pass === tcs.length;
    await Models.Solution.updateOne({ problem_id: sol.problem_id }, { $set: { verified } });
    console.log(`P${sol.problem_id}: ${pass}/${tcs.length} ${verified ? 'VERIFIED' : 'FAIL'}`);
    if (!verified) {
      okAll = false;
      if (firstFail) console.log('    ', JSON.stringify(firstFail).slice(0, 300));
    }
  }
  console.log(okAll ? '\nALL SOLUTIONS VERIFIED' : '\nSOME SOLUTIONS FAILED');
  process.exit(okAll ? 0 : 1);
}

main().catch((e) => { console.error('Verify failed:', e); process.exit(1); });
```

- [ ] **Step 2: Run it**

Run: `cd Coderunner-Backend && npx tsx apps/api/scripts/verify-solutions.ts`
Expected: `P1..P5: n/n VERIFIED`, then `ALL SOLUTIONS VERIFIED` (exit 0). The 5 L1-S1 solutions
each reproduce their test cases.

- [ ] **Step 3: Commit**

```bash
git add Coderunner-Backend/apps/api/scripts/verify-solutions.ts
git commit -m "feat(teaching-guide): curriculum solution verifier"
```

## Task 6: frontend api-client group

**Files:** Modify `Coderunner-Frontend/web/src/lib/api-client.ts`

- [ ] **Step 1: Add the `curriculum` group** after the `teacher:` group (before `contests:`):

```ts
  // Curriculum / Answer Guide (staff-gated)
  curriculum: {
    getTree: (ageGroup: string = '11-14') => apiClient.get(`/curriculum/tree?ageGroup=${ageGroup}`),
    getGuide: (problemId: number) => apiClient.get(`/curriculum/problems/${problemId}/guide`),
  },
```

- [ ] **Step 2: Verify** — `cd Coderunner-Frontend/web && npx tsc --noEmit` → exit 0.

## Task 7: the /teacher/curriculum page (browser + guide panel)

**Files:** Create `Coderunner-Frontend/web/src/app/teacher/curriculum/page.tsx`

- [ ] **Step 1: Create the page** (inherits the teacher gate + sidebar from the teacher layout)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { BookOpen, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';

interface CaseRow { problem_id: number; title: string; difficulty: string; case_number: number; hasGuide: boolean; }
interface SessionRow { session_id: number; cases: CaseRow[]; }
interface LevelRow { level_number: number; sessions: SessionRow[]; }
interface Guide {
  available: boolean; title: string; question?: string; difficulty?: string;
  solution_code?: string;
  walkthrough?: Array<{ label: string; code_snippet: string; explanation: string }>;
  student_explanation?: string; worked_example?: string;
  key_concepts?: string[]; common_mistakes?: string[]; verified?: boolean;
}

export default function CurriculumGuide() {
  const [tree, setTree] = useState<LevelRow[]>([]);
  const [openSession, setOpenSession] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideLoading, setGuideLoading] = useState(false);

  useEffect(() => {
    api.curriculum.getTree('11-14')
      .then((d) => setTree((d as { tree?: LevelRow[] })?.tree ?? []))
      .catch(() => setTree([]))
      .finally(() => setLoading(false));
  }, []);

  const openGuide = async (problemId: number) => {
    setSelected(problemId);
    setGuideLoading(true);
    try { setGuide((await api.curriculum.getGuide(problemId)) as Guide); }
    catch { setGuide(null); }
    finally { setGuideLoading(false); }
  };

  return (
    <main className="max-w-[1600px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-orbitron font-black text-gray-900 tracking-wider flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-indigo-500" /> ANSWER GUIDE
      </h1>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Browser */}
          <div className="lg:col-span-4 space-y-4">
            {tree.map((lvl) => (
              <div key={lvl.level_number} className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="font-orbitron font-bold text-gray-900 mb-2">Level {lvl.level_number}</div>
                {lvl.sessions.map((s) => (
                  <div key={s.session_id} className="mb-1">
                    <button
                      onClick={() => setOpenSession(openSession === s.session_id ? null : s.session_id)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 text-sm font-rajdhani text-gray-700"
                    >
                      <span>Session {s.session_id}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${openSession === s.session_id ? 'rotate-90' : ''}`} />
                    </button>
                    {openSession === s.session_id && (
                      <div className="ml-3 mt-1 space-y-1">
                        {s.cases.map((c) => (
                          <button
                            key={c.problem_id}
                            onClick={() => openGuide(c.problem_id)}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-sm font-rajdhani ${selected === c.problem_id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            <span className="truncate">Case {c.case_number}: {c.title}</span>
                            {c.hasGuide && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Guide panel */}
          <div className="lg:col-span-8">
            {!selected ? (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center text-gray-400 font-rajdhani">
                Pick a case on the left to see its teaching guide.
              </div>
            ) : guideLoading ? (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
            ) : !guide || guide.available === false ? (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
                <h2 className="font-orbitron font-bold text-gray-900">{guide?.title}</h2>
                {guide?.question && <pre className="mt-3 whitespace-pre-wrap font-rajdhani text-gray-700 text-sm">{guide.question}</pre>}
                <p className="mt-4 text-gray-400 font-rajdhani">Detailed guide coming soon.</p>
              </div>
            ) : (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-6">
                <div>
                  <h2 className="font-orbitron font-black text-gray-900 text-lg flex items-center gap-2">
                    {guide.title}
                    {guide.verified && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">VERIFIED</span>}
                  </h2>
                </div>
                {/* 1. Question */}
                <section>
                  <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-1">THE QUESTION</div>
                  <pre className="whitespace-pre-wrap font-rajdhani text-gray-800 text-sm bg-gray-50 rounded-lg p-3">{guide.question}</pre>
                </section>
                {/* 2. Answer */}
                <section>
                  <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-1">THE ANSWER</div>
                  <pre className="whitespace-pre-wrap font-fira text-sm bg-[#0b1020] text-emerald-200 rounded-lg p-3 overflow-x-auto">{guide.solution_code}</pre>
                </section>
                {/* 3. Logic breakdown */}
                <section>
                  <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-2">HOW IT WORKS</div>
                  <ol className="space-y-3">
                    {(guide.walkthrough ?? []).map((w, i) => (
                      <li key={i} className="border-l-2 border-indigo-200 pl-3">
                        <div className="font-rajdhani font-bold text-gray-900 text-sm">{i + 1}. {w.label}</div>
                        {w.code_snippet && <pre className="whitespace-pre-wrap font-fira text-xs bg-gray-50 rounded p-2 mt-1 overflow-x-auto">{w.code_snippet}</pre>}
                        <div className="text-sm text-gray-700 font-rajdhani mt-1">{w.explanation}</div>
                      </li>
                    ))}
                  </ol>
                </section>
                {/* 4. Explain it simply */}
                <section>
                  <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-1">EXPLAIN IT SIMPLY</div>
                  <p className="font-rajdhani text-gray-800 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">{guide.student_explanation}</p>
                </section>
                {/* 5. Example */}
                {guide.worked_example && (
                  <section>
                    <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-1">EXAMPLE</div>
                    <pre className="whitespace-pre-wrap font-fira text-sm bg-gray-50 rounded-lg p-3">{guide.worked_example}</pre>
                  </section>
                )}
                {/* supporting */}
                {(guide.key_concepts?.length ?? 0) > 0 && (
                  <section className="flex flex-wrap gap-2">
                    {guide.key_concepts!.map((k) => (
                      <span key={k} className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-rajdhani">{k}</span>
                    ))}
                  </section>
                )}
                {(guide.common_mistakes?.length ?? 0) > 0 && (
                  <section>
                    <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-1">COMMON MISTAKES</div>
                    <ul className="list-disc ml-5 text-sm text-gray-700 font-rajdhani space-y-1">
                      {guide.common_mistakes!.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Verify** — `cd Coderunner-Frontend/web && npx tsc --noEmit` → exit 0.

## Task 8: TeacherShell nav link

**Files:** Modify `Coderunner-Frontend/web/src/components/teacher/TeacherShell.tsx`

- [ ] **Step 1: Add `BookOpen` to the lucide import**

```ts
import { GraduationCap, LayoutGrid, LogOut, Hash, BookOpen } from 'lucide-react';
```

- [ ] **Step 2: Add the nav link** right after the "My Classrooms" `<Link>`:

```tsx
          <Link href="/teacher/curriculum" className={navCls(pathname === '/teacher/curriculum')}>
            <BookOpen className="w-4 h-4" /> Answer Guide
          </Link>
```

- [ ] **Step 3: Verify** — `cd Coderunner-Frontend/web && npx tsc --noEmit` → exit 0.

## Task 9: Verify all + judge panel + commit

- [ ] **Step 1: Typecheck everything** (each exit 0):

```bash
cd Coderunner-Backend/packages/shared && npm run typecheck
cd Coderunner-Backend/apps/api && npm run typecheck
cd Coderunner-Frontend/web && npx tsc --noEmit
```

- [ ] **Step 2: Confirm security posture** — the student problem route (`problems.routes.ts`) and
test-cases route are UNCHANGED and never query `solutions`; `/curriculum/*` is behind
`authMiddleware + staffMiddleware`; a `student` token gets 403.

- [ ] **Step 3: Run the 5-judge panel** (intent: "Teaching Guide Phase 1: staff-gated /curriculum
tree + per-case guide reading from a separate solutions collection; Solution model; seeder +
verifier; /teacher/curriculum browser. Answer keys never reach students."). Security judge focus:
no student-reachable path returns Solution data. Rebuild shared dist if a shared file changes
during fixes. Zero surviving HIGHs.

- [ ] **Step 4: Commit** (after PASS):

```bash
git add Coderunner-Frontend/web/src docs/superpowers/plans
git commit -m "feat(teaching-guide): Phase 1 - staff Answer Guide (tree + per-case guide + verifier)"
```

---

## Self-Review

**Spec coverage:** §3 Solution model → Task 1; §2/§5 staff gate + /curriculum tree+guide → Tasks 2–3;
§4 source-of-truth seed + verifier → Tasks 4–5; §6 teacher portal browser (session→case, 5 parts) →
Tasks 6–8; §2 security (separate collection, never student) → Task 9 step 2 + panel. §7 rollout: L1
Session 1 here; L2–L4 + rest of L1 are content waves (separate, reuse this system).

**Placeholder scan:** none — every step has complete code; the 5 guides are real, audit-verified.

**Type consistency:** `ISolution`/`Solution` fields (solution_code, walkthrough[{label,code_snippet,
explanation}], student_explanation, worked_example, key_concepts, common_mistakes, verified) are
identical across the model (Task 1), the guide endpoint response (Task 3), the seeder (Task 4), the
verifier (Task 5), and the page's `Guide`/`CaseRow` interfaces (Task 7). `/curriculum/tree` +
`/curriculum/problems/:id/guide` match `api.curriculum.getTree/getGuide` (Task 6). `staffMiddleware`
defined in Task 2, used in Task 3.
